/**
 * قالب مشهد - JavaScript
 * Certificate Template - JavaScript
 */

// متغيرات عامة
let employees = [];
let selectedEmployee = null;
let signatureImage = null;

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeTemplate();
    setupEventListeners();
});

// تهيئة القالب
async function initializeTemplate() {
    try {
        await loadEmployees();
        setupEmployeeSearch();
    } catch (error) {
        console.error('خطأ في تهيئة القالب:', error);
        showAlert('حدث خطأ في تحميل البيانات', 'error');
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // البحث في الموظفين
    document.getElementById('employeeSearch').addEventListener('input', function() {
        filterEmployees(this.value);
    });
    
    // رفع صورة التوقيع
    document.getElementById('signatureUpload').addEventListener('change', function(e) {
        handleSignatureUpload(e);
    });
    
    // تحديث المعاينة عند تغيير المحتوى
    document.getElementById('certificateTitle').addEventListener('input', updatePreview);
    document.getElementById('certificateContent').addEventListener('input', updatePreview);
    document.getElementById('managerName').addEventListener('input', updatePreview);
    document.getElementById('managerPosition').addEventListener('input', updatePreview);
}

// تحميل قائمة الموظفين
async function loadEmployees() {
    try {
        const response = await fetch('enhanced_employees_api.php?action=getEmployees');
        const data = await response.json();
        
        if (data.success) {
            employees = data.employees;
            displayEmployeeList(employees);
        } else {
            throw new Error(data.error || 'فشل في تحميل قائمة الموظفين');
        }
    } catch (error) {
        console.error('خطأ في تحميل الموظفين:', error);
        document.getElementById('employeeList').innerHTML = `
            <div style="padding: 20px; text-align: center; color: #dc3545;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>فشل في تحميل قائمة الموظفين</p>
                <button class="btn btn-primary" onclick="loadEmployees()">إعادة المحاولة</button>
            </div>
        `;
    }
}

// عرض قائمة الموظفين
function displayEmployeeList(employeeList) {
    const container = document.getElementById('employeeList');
    
    if (!employeeList || employeeList.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #6c757d;">
                <i class="fas fa-users"></i>
                <p>لا توجد موظفين مسجلين</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = employeeList.map(emp => `
        <div class="employee-item" onclick="selectEmployee(${emp.id})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${emp.employee_name}</strong>
                    <br>
                    <small>${emp.position} - ${emp.department_name || 'غير محدد'}</small>
                </div>
                <div style="text-align: left;">
                    <small>${emp.national_id}</small>
                    ${emp.employee_number ? `<br><small>رقم: ${emp.employee_number}</small>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// إعداد البحث في الموظفين
function setupEmployeeSearch() {
    const searchInput = document.getElementById('employeeSearch');
    
    searchInput.addEventListener('keyup', function() {
        const query = this.value.toLowerCase().trim();
        filterEmployees(query);
    });
}

// تصفية الموظفين
function filterEmployees(query) {
    if (!query) {
        displayEmployeeList(employees);
        return;
    }
    
    const filteredEmployees = employees.filter(emp => 
        emp.employee_name.toLowerCase().includes(query) ||
        emp.national_id.includes(query) ||
        (emp.employee_number && emp.employee_number.includes(query)) ||
        emp.position.toLowerCase().includes(query) ||
        (emp.department_name && emp.department_name.toLowerCase().includes(query))
    );
    
    displayEmployeeList(filteredEmployees);
}

// اختيار موظف
async function selectEmployee(employeeId) {
    try {
        // إزالة التحديد السابق
        document.querySelectorAll('.employee-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // تحديد العنصر الحالي
        event.target.closest('.employee-item').classList.add('selected');
        
        // جلب تفاصيل الموظف
        const response = await fetch(`enhanced_employees_api.php?action=getEmployee&id=${employeeId}`);
        const data = await response.json();
        
        if (data.success) {
            selectedEmployee = data.employee;
            updateEmployeeDataTable(selectedEmployee);
            showAlert('تم اختيار الموظف بنجاح', 'success');
        } else {
            throw new Error(data.error || 'فشل في جلب بيانات الموظف');
        }
    } catch (error) {
        console.error('خطأ في اختيار الموظف:', error);
        showAlert('فشل في جلب بيانات الموظف', 'error');
    }
}

// تحديث جدول بيانات الموظف
function updateEmployeeDataTable(employee) {
    document.getElementById('empName').textContent = employee.employee_name || '-';
    document.getElementById('empNationalId').textContent = employee.national_id || '-';
    document.getElementById('empNumber').textContent = employee.employee_number || '-';
    document.getElementById('empPosition').textContent = employee.position || '-';
    document.getElementById('empDepartment').textContent = employee.department_name || '-';
    document.getElementById('empNationality').textContent = employee.nationality || '-';
    document.getElementById('empHireDate').textContent = formatDate(employee.hire_date) || '-';
    document.getElementById('empPhone').textContent = employee.phone || '-';
    document.getElementById('empEmail').textContent = employee.email || '-';
    
    // تحديث المعاينة إذا كانت مفتوحة
    if (document.getElementById('previewSection').style.display !== 'none') {
        updatePreview();
    }
}

// معالجة رفع صورة التوقيع
function handleSignatureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
        showAlert('يرجى اختيار ملف صورة صحيح', 'error');
        return;
    }
    
    // التحقق من حجم الملف (2MB)
    if (file.size > 2 * 1024 * 1024) {
        showAlert('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        signatureImage = e.target.result;
        
        // عرض معاينة التوقيع
        document.getElementById('signaturePreview').innerHTML = `
            <img src="${signatureImage}" alt="التوقيع" style="max-width: 100%; max-height: 100%;">
        `;
        
        showAlert('تم رفع صورة التوقيع بنجاح', 'success');
        
        // تحديث المعاينة إذا كانت مفتوحة
        if (document.getElementById('previewSection').style.display !== 'none') {
            updatePreview();
        }
    };
    reader.readAsDataURL(file);
}

// إنشاء معاينة الشهادة
function generatePreview() {
    if (!selectedEmployee) {
        showAlert('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    updatePreview();
    document.getElementById('previewSection').style.display = 'block';
    
    // التمرير إلى المعاينة
    document.getElementById('previewSection').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// تحديث المعاينة
function updatePreview() {
    if (!selectedEmployee) return;
    
    const title = document.getElementById('certificateTitle').value || 'شهادة من يهمه الأمر';
    const content = document.getElementById('certificateContent').value || '';
    const managerName = document.getElementById('managerName').value || '';
    const managerPosition = document.getElementById('managerPosition').value || '';
    
    const currentDate = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const certificateHTML = `
        <div class="certificate-header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
                <img src="templates/template1/logo.png" alt="الشعار" style="height: 80px;" onerror="this.style.display='none'">
                <div style="text-align: center;">
                    <h2 style="color: #2c3e50; margin: 0;">مركز الخدمات الطبية الشرعية</h2>
                    <p style="color: #6c757d; margin: 5px 0;">وزارة الصحة - المملكة العربية السعودية</p>
                </div>
            </div>
            <h1 class="certificate-title">${title}</h1>
        </div>
        
        <div class="certificate-body">
            <div style="margin-bottom: 30px;">
                <table class="employee-table" style="margin: 20px 0;">
                    <tbody>
                        <tr>
                            <td><strong>الاسم</strong></td>
                            <td>${selectedEmployee.employee_name}</td>
                            <td><strong>الهوية الوطنية</strong></td>
                            <td>${selectedEmployee.national_id}</td>
                            <td><strong>رقم الموظف</strong></td>
                            <td>${selectedEmployee.employee_number || '-'}</td>
                        </tr>
                        <tr>
                            <td><strong>الوظيفة</strong></td>
                            <td>${selectedEmployee.position}</td>
                            <td><strong>الإدارة</strong></td>
                            <td>${selectedEmployee.department_name || '-'}</td>
                            <td><strong>الجنسية</strong></td>
                            <td>${selectedEmployee.nationality || 'سعودي'}</td>
                        </tr>
                        <tr>
                            <td><strong>تاريخ التعيين</strong></td>
                            <td>${formatDate(selectedEmployee.hire_date) || '-'}</td>
                            <td><strong>الهاتف</strong></td>
                            <td>${selectedEmployee.phone || '-'}</td>
                            <td><strong>البريد الإلكتروني</strong></td>
                            <td>${selectedEmployee.email || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="white-space: pre-line; text-align: justify; line-height: 2;">
                ${content}
            </div>
        </div>
        
        <div class="certificate-footer">
            <div class="date-area">
                <p><strong>التاريخ:</strong></p>
                <p>${currentDate}</p>
            </div>
            
            <div class="signature-area">
                <div class="signature-line">
                    ${signatureImage ? `<img src="${signatureImage}" alt="التوقيع" style="max-height: 50px; max-width: 150px;">` : ''}
                </div>
                <p><strong>${managerName}</strong></p>
                <p>${managerPosition}</p>
            </div>
        </div>
    `;
    
    document.getElementById('certificatePreview').innerHTML = certificateHTML;
}

// تحميل PDF
async function generatePDF() {
    if (!selectedEmployee) {
        showAlert('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    try {
        // تحديث المعاينة أولاً
        updatePreview();
        
        // استخدام html2canvas و jsPDF لإنشاء PDF
        const element = document.getElementById('certificatePreview');
        
        // إظهار رسالة التحميل
        showAlert('جاري إنشاء ملف PDF...', 'info');
        
        // استخدام html2canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // إنشاء PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // تحميل الملف
        const fileName = `شهادة_${selectedEmployee.employee_name}_${new Date().getTime()}.pdf`;
        pdf.save(fileName);
        
        showAlert('تم إنشاء ملف PDF بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        showAlert('فشل في إنشاء ملف PDF', 'error');
    }
}

// طباعة الشهادة
function printCertificate() {
    if (!selectedEmployee) {
        showAlert('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    // تحديث المعاينة أولاً
    updatePreview();
    
    // إظهار المعاينة إذا لم تكن ظاهرة
    if (document.getElementById('previewSection').style.display === 'none') {
        document.getElementById('previewSection').style.display = 'block';
    }
    
    // طباعة الصفحة
    window.print();
}

// حفظ مسودة
async function saveDraft() {
    if (!selectedEmployee) {
        showAlert('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    const draftData = {
        employee_id: selectedEmployee.id,
        title: document.getElementById('certificateTitle').value,
        content: document.getElementById('certificateContent').value,
        manager_name: document.getElementById('managerName').value,
        manager_position: document.getElementById('managerPosition').value,
        signature_image: signatureImage,
        created_at: new Date().toISOString()
    };
    
    // حفظ في التخزين المحلي
    const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '[]');
    drafts.push(draftData);
    localStorage.setItem('certificateDrafts', JSON.stringify(drafts));
    
    showAlert('تم حفظ المسودة بنجاح', 'success');
}

// دوال مساعدة
function formatDate(dateString) {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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

// تحميل مكتبات PDF عند الحاجة
function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
        if (window.jspdf && window.html2canvas) {
            resolve();
            return;
        }
        
        // تحميل html2canvas
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        
        // تحميل jsPDF
        const jsPDFScript = document.createElement('script');
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        
        let loadedCount = 0;
        const onLoad = () => {
            loadedCount++;
            if (loadedCount === 2) {
                resolve();
            }
        };
        
        html2canvasScript.onload = onLoad;
        jsPDFScript.onload = onLoad;
        
        html2canvasScript.onerror = reject;
        jsPDFScript.onerror = reject;
        
        document.head.appendChild(html2canvasScript);
        document.head.appendChild(jsPDFScript);
    });
}

// تحميل المكتبات عند تحميل الصفحة
loadPDFLibraries().catch(error => {
    console.error('فشل في تحميل مكتبات PDF:', error);
});
