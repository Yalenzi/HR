/**
 * نظام إدارة الموظفين المتكامل - JavaScript
 * Integrated Employee Management System - JavaScript
 */

// متغيرات عامة
let currentEmployees = [];
let currentDepartments = [];
let currentAttachmentTypes = [];
let currentTab = 'dashboard';

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
});

// تهيئة النظام
async function initializeSystem() {
    try {
        showLoading('dashboard');
        
        // تحميل البيانات الأساسية
        await Promise.all([
            loadDashboardData(),
            loadDepartments(),
            loadAttachmentTypes()
        ]);
        
        hideLoading('dashboard');
        showAlert('تم تحميل النظام بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تهيئة النظام:', error);
        showAlert('حدث خطأ في تحميل النظام', 'error');
        hideLoading('dashboard');
    }
}

// عرض التبويب المحدد
function showTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إزالة الحالة النشطة من جميع أزرار التبويب
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // عرض التبويب المحدد
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    currentTab = tabName;
    
    // تحميل بيانات التبويب حسب الحاجة
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'attachments':
            loadAttachmentTypes();
            break;
        case 'qrcodes':
            loadQRCodes();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// تحميل بيانات لوحة التحكم
async function loadDashboardData() {
    try {
        const response = await fetch('enhanced_employees_api.php?action=getDashboardData');
        const data = await response.json();
        
        if (data.success) {
            updateQuickStats(data.dashboard.quick_stats);
            updateRecentEmployees(data.dashboard.recent_employees);
        } else {
            throw new Error(data.error || 'فشل في تحميل بيانات لوحة التحكم');
        }
    } catch (error) {
        console.error('خطأ في تحميل لوحة التحكم:', error);
        showAlert('فشل في تحميل بيانات لوحة التحكم', 'error');
    }
}

// تحديث الإحصائيات السريعة
function updateQuickStats(stats) {
    document.getElementById('totalEmployees').textContent = stats.employees || 0;
    document.getElementById('totalDepartments').textContent = stats.departments || 0;
    document.getElementById('totalAttachments').textContent = stats.attachments || 0;
    document.getElementById('totalQRCodes').textContent = stats.qr_codes || 0;
}

// تحديث آخر الموظفين المضافين
function updateRecentEmployees(employees) {
    const container = document.getElementById('recentEmployees');
    
    if (!employees || employees.length === 0) {
        container.innerHTML = `
            <div style="padding: 30px; text-align: center; color: #6c757d;">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>لا توجد موظفين مضافين حديثاً</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>الوظيفة</th>
                    <th>الإدارة</th>
                    <th>تاريخ الإضافة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map(emp => `
                    <tr>
                        <td>${emp.employee_name}</td>
                        <td>${emp.position}</td>
                        <td>${emp.department_name || 'غير محدد'}</td>
                        <td>${formatDate(emp.created_at)}</td>
                        <td>
                            <button class="btn btn-info btn-sm" onclick="viewEmployee(${emp.id})">
                                <i class="fas fa-eye"></i> عرض
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// تحميل قائمة الموظفين
async function loadEmployees() {
    try {
        showLoading('employees');
        
        const response = await fetch('enhanced_employees_api.php?action=getEmployees');
        const data = await response.json();
        
        if (data.success) {
            currentEmployees = data.employees;
            updateEmployeesTable(data.employees);
        } else {
            throw new Error(data.error || 'فشل في تحميل بيانات الموظفين');
        }
        
        hideLoading('employees');
    } catch (error) {
        console.error('خطأ في تحميل الموظفين:', error);
        showAlert('فشل في تحميل بيانات الموظفين', 'error');
        hideLoading('employees');
    }
}

// تحديث جدول الموظفين
function updateEmployeesTable(employees) {
    const tbody = document.getElementById('employeesTableBody');
    
    if (!employees || employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 50px; color: #6c757d;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>لا توجد موظفين مسجلين في النظام</p>
                    <button class="btn btn-success" onclick="showAddEmployeeModal()">
                        <i class="fas fa-plus"></i> إضافة أول موظف
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = employees.map(emp => {
        const completionRate = emp.total_attachments > 0 
            ? Math.round((emp.completed_attachments / emp.total_attachments) * 100) 
            : 0;
        
        return `
            <tr>
                <td>
                    ${emp.photo_path 
                        ? `<img src="${emp.photo_path}" alt="صورة الموظف" class="employee-photo">` 
                        : `<div class="employee-photo" style="background: linear-gradient(45deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${emp.employee_name.charAt(0)}</div>`
                    }
                </td>
                <td>
                    <strong>${emp.employee_name}</strong>
                    ${emp.employee_number ? `<br><small>رقم: ${emp.employee_number}</small>` : ''}
                </td>
                <td>${emp.national_id}</td>
                <td>${emp.position}</td>
                <td>${emp.department_name || 'غير محدد'}</td>
                <td>
                    <div class="attachment-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionRate}%"></div>
                        </div>
                        <small>${emp.completed_attachments}/${emp.total_attachments}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${emp.status === 'نشط' ? 'status-active' : 'status-inactive'}">
                        ${emp.status || 'نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewEmployee(${emp.id})" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editEmployee(${emp.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="generateQRCode(${emp.id})" title="إنشاء QR Code">
                        <i class="fas fa-qrcode"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// تحميل قائمة الإدارات
async function loadDepartments() {
    try {
        const response = await fetch('enhanced_employees_api.php?action=getDepartments');
        const data = await response.json();
        
        if (data.success) {
            currentDepartments = data.departments;
            updateDepartmentSelects();
        } else {
            throw new Error(data.error || 'فشل في تحميل بيانات الإدارات');
        }
    } catch (error) {
        console.error('خطأ في تحميل الإدارات:', error);
        showAlert('فشل في تحميل بيانات الإدارات', 'error');
    }
}

// تحديث قوائم الإدارات المنسدلة
function updateDepartmentSelects() {
    const selects = ['departmentFilter', 'departmentSelect'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // الاحتفاظ بالخيار الأول
            const firstOption = select.querySelector('option:first-child');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            // إضافة الإدارات
            currentDepartments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.department_name;
                select.appendChild(option);
            });
        }
    });
}

// تحميل أنواع المرفقات
async function loadAttachmentTypes() {
    try {
        const response = await fetch('enhanced_employees_api.php?action=getAttachmentTypes');
        const data = await response.json();
        
        if (data.success) {
            currentAttachmentTypes = data.attachment_types;
        } else {
            throw new Error(data.error || 'فشل في تحميل أنواع المرفقات');
        }
    } catch (error) {
        console.error('خطأ في تحميل أنواع المرفقات:', error);
        showAlert('فشل في تحميل أنواع المرفقات', 'error');
    }
}

// عرض نافذة إضافة موظف
function showAddEmployeeModal() {
    document.getElementById('addEmployeeModal').classList.add('active');
    document.getElementById('addEmployeeForm').reset();
}

// إغلاق النافذة المنبثقة
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// معالجة إضافة موظف جديد
document.getElementById('addEmployeeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const employeeData = Object.fromEntries(formData.entries());
        
        const response = await fetch('enhanced_employees_api.php?action=addEmployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('تم إضافة الموظف بنجاح', 'success');
            closeModal('addEmployeeModal');
            
            // إعادة تحميل البيانات
            if (currentTab === 'employees') {
                loadEmployees();
            }
            if (currentTab === 'dashboard') {
                loadDashboardData();
            }
        } else {
            throw new Error(data.error || 'فشل في إضافة الموظف');
        }
    } catch (error) {
        console.error('خطأ في إضافة الموظف:', error);
        showAlert('فشل في إضافة الموظف: ' + error.message, 'error');
    }
});

// البحث في الموظفين
async function searchEmployees() {
    try {
        const query = document.getElementById('searchInput').value;
        const department = document.getElementById('departmentFilter').value;
        const status = document.getElementById('statusFilter').value;
        
        const params = new URLSearchParams({
            action: 'searchEmployees',
            query: query,
            department: department,
            status: status
        });
        
        const response = await fetch(`enhanced_employees_api.php?${params}`);
        const data = await response.json();
        
        if (data.success) {
            updateEmployeesTable(data.employees);
        } else {
            throw new Error(data.error || 'فشل في البحث');
        }
    } catch (error) {
        console.error('خطأ في البحث:', error);
        showAlert('فشل في البحث: ' + error.message, 'error');
    }
}

// عرض تفاصيل الموظف
async function viewEmployee(employeeId) {
    try {
        const response = await fetch(`enhanced_employees_api.php?action=getEmployee&id=${employeeId}`);
        const data = await response.json();
        
        if (data.success) {
            showEmployeeDetailsModal(data.employee);
        } else {
            throw new Error(data.error || 'فشل في جلب بيانات الموظف');
        }
    } catch (error) {
        console.error('خطأ في عرض الموظف:', error);
        showAlert('فشل في عرض بيانات الموظف', 'error');
    }
}

// عرض نافذة تفاصيل الموظف
function showEmployeeDetailsModal(employee) {
    // سيتم إضافة هذه الوظيفة في الملف التالي
    console.log('عرض تفاصيل الموظف:', employee);
}

// دوال مساعدة
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loading = container.querySelector('.loading');
        if (loading) {
            loading.classList.add('active');
        }
    }
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loading = container.querySelector('.loading');
        if (loading) {
            loading.classList.remove('active');
        }
    }
}

function showAlert(message, type = 'info') {
    // إنشاء عنصر التنبيه
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // إضافة التنبيه إلى أعلى الصفحة
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    // إزالة التنبيه بعد 5 ثوان
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// دوال إضافية سيتم تطويرها
function editEmployee(employeeId) {
    console.log('تعديل الموظف:', employeeId);
    // سيتم تطوير هذه الوظيفة
}

function deleteEmployee(employeeId) {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
        console.log('حذف الموظف:', employeeId);
        // سيتم تطوير هذه الوظيفة
    }
}

function generateQRCode(employeeId) {
    console.log('إنشاء QR Code للموظف:', employeeId);
    // سيتم تطوير هذه الوظيفة
}

function loadQRCodes() {
    console.log('تحميل رموز QR');
    // سيتم تطوير هذه الوظيفة
}

function loadReports() {
    console.log('تحميل التقارير');
    // سيتم تطوير هذه الوظيفة
}
