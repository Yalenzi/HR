/**
 * JavaScript لقالب مشهد
 */

let currentEmployeeData = null;
let employees = [];
let employeeCombobox = null;

// تحميل قائمة الموظفين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeEmployeeCombobox();
    loadEmployeesList();
});

// تهيئة Combobox الموظفين
function initializeEmployeeCombobox() {
    employeeCombobox = new EmployeeCombobox('employeeCombobox', {
        placeholder: 'ابحث عن موظف بالاسم أو الهوية الوطنية...',
        onSelect: function(employee) {
            selectEmployeeFromCombobox(employee);
        }
    });
}

// اختيار موظف من Combobox
function selectEmployeeFromCombobox(employee) {
    // تحويل البيانات للتوافق مع الكود الموجود
    const employeeData = {
        employee_name: employee.name,
        national_id: employee.national_id,
        employee_number: employee.employee_number,
        position: employee.position,
        nationality: employee.nationality,
        department: employee.department,
        id: employee.id
    };

    // استخدام الوظيفة الموجودة
    fillEmployeeData(employeeData);
}

// تحميل قائمة الموظفين
function loadEmployeesList() {
    fetch('employees_api.php?action=getEmployees')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            employees = data.employees;
            console.log('تم تحميل', employees.length, 'موظف');
        } else {
            showNotification('خطأ في تحميل الموظفين: ' + data.error);
        }
    })
    .catch(error => {
        console.error('خطأ في تحميل الموظفين:', error);
        showNotification('خطأ في الاتصال بالخادم');
    });
}

// البحث عن موظف
function searchEmployee() {
    const query = document.getElementById('employeeSearchInput').value.trim();
    
    if (!query) {
        clearEmployeeData();
        return;
    }
    
    // البحث في القائمة المحلية أولاً
    const localResult = employees.find(emp => 
        emp.national_id === query || 
        emp.employee_name.includes(query) ||
        emp.employee_number === query
    );
    
    if (localResult) {
        fillEmployeeData(localResult);
        return;
    }
    
    // البحث في الخادم
    fetch(`employees_api.php?action=searchEmployees&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.employees.length > 0) {
            const employee = data.employees[0]; // أخذ أول نتيجة
            fillEmployeeData(employee);
        } else {
            showNotification('لم يتم العثور على الموظف');
            clearEmployeeData();
        }
    })
    .catch(error => {
        console.error('خطأ في البحث:', error);
        showNotification('خطأ في البحث');
    });
}

// ملء بيانات الموظف
function fillEmployeeData(employee) {
    currentEmployeeData = employee;
    
    // ملء الجدول
    document.getElementById('displayEmployeeName').textContent = employee.employee_name;
    document.getElementById('displayNationalId').textContent = employee.national_id;
    document.getElementById('displayEmployeeNumber').textContent = employee.employee_number || '-';
    document.getElementById('displayPosition').textContent = employee.position;
    document.getElementById('displayNationality').textContent = employee.nationality;
    
    // تحديث نص الخطاب
    updateLetterContent();
    
    // تحديث QR Code إذا كان مفعلاً
    if (document.getElementById('includeQR').checked) {
        document.getElementById('qrSection').style.display = 'block';
        generateQRCode();
    }
    
    showNotification('تم تحميل بيانات الموظف: ' + employee.employee_name);
}

// مسح بيانات الموظف
function clearEmployeeData() {
    currentEmployeeData = null;
    
    // مسح الجدول
    document.getElementById('displayEmployeeName').textContent = '-';
    document.getElementById('displayNationalId').textContent = '-';
    document.getElementById('displayEmployeeNumber').textContent = '-';
    document.getElementById('displayPosition').textContent = '-';
    document.getElementById('displayNationality').textContent = '-';
    
    // إخفاء قسم QR Code
    document.getElementById('qrSection').style.display = 'none';
    
    // مسح Combobox
    if (employeeCombobox) {
        employeeCombobox.clearSelection();
    }
    
    // تحديث نص الخطاب
    updateLetterContent();
}

// تحديث عنوان الخطاب
function updateLetterTitle() {
    const title = document.getElementById('letterTitle').value;
    document.getElementById('displayLetterTitle').textContent = title;
}

// تحديث نص الخطاب
function updateLetterContent() {
    let content = document.getElementById('letterContent').value;
    
    // استبدال المتغيرات
    if (currentEmployeeData) {
        content = content.replace(/\[اسم الإدارة\]/g, currentEmployeeData.department);
        content = content.replace(/\[اسم الموظف\]/g, currentEmployeeData.employee_name);
        content = content.replace(/\[الوظيفة\]/g, currentEmployeeData.position);
    } else {
        content = content.replace(/\[اسم الإدارة\]/g, '[اسم الإدارة]');
        content = content.replace(/\[اسم الموظف\]/g, '[اسم الموظف]');
        content = content.replace(/\[الوظيفة\]/g, '[الوظيفة]');
    }
    
    document.getElementById('displayLetterContent').textContent = content;
}

// تحديث الغرض
function updatePurpose() {
    const purpose = document.getElementById('purpose').value;
    document.getElementById('displayPurpose').textContent = purpose;
}

// تبديل عرض QR Code
function toggleQRCode() {
    const includeQR = document.getElementById('includeQR').checked;
    const qrSection = document.getElementById('qrSection');
    const qrCode = document.getElementById('qrCode');

    if (includeQR && currentEmployeeData) {
        // إظهار قسم QR Code
        qrSection.style.display = 'block';
        qrCode.style.display = 'block';

        // إنشاء QR Code
        generateQRCode();

        showNotification('تم تفعيل QR Code', 'success');
    } else {
        // إخفاء قسم QR Code
        qrSection.style.display = 'none';
        qrCode.style.display = 'none';

        if (!currentEmployeeData) {
            showNotification('يرجى اختيار موظف أولاً', 'warning');
        } else {
            showNotification('تم إخفاء QR Code', 'info');
        }
    }
}

// إنشاء QR Code
function generateQRCode() {
    if (!currentEmployeeData) return;

    // إنشاء محتوى QR Code
    const qrData = createQRData(currentEmployeeData);

    // إنشاء QR Code باستخدام مكتبة QRCode
    const canvas = document.getElementById('qrCode');

    // تنظيف Canvas السابق
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // إنشاء QR Code جديد
    QRCode.toCanvas(canvas, qrData, {
        width: 80,
        height: 80,
        margin: 1,
        color: {
            dark: '#2c3e50',
            light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
    }, function (error) {
        if (error) {
            console.error('خطأ في إنشاء QR Code:', error);
            // عرض رسالة خطأ في Canvas
            context.fillStyle = '#dc3545';
            context.font = '10px Arial';
            context.textAlign = 'center';
            context.fillText('خطأ في QR', 40, 35);
            context.fillText('Code', 40, 50);
        } else {
            console.log('تم إنشاء QR Code بنجاح');
        }
    });
}

// إنشاء محتوى QR Code
function createQRData(employee) {
    const qrData = {
        name: employee.employee_name || employee.name,
        national_id: employee.national_id,
        employee_number: employee.employee_number || '-',
        position: employee.position,
        department: employee.department || '-',
        nationality: employee.nationality,
        generated_at: new Date().toISOString(),
        generated_by: 'مركز الخدمات الطبية الشرعية'
    };

    // تحويل إلى JSON مع تنسيق جميل
    return JSON.stringify(qrData, null, 2);
}

// إنشاء المشهد
function generateMashhad() {
    if (!currentEmployeeData) {
        showNotification('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    // تحديث جميع البيانات
    updateLetterTitle();
    updateLetterContent();
    updatePurpose();
    
    showNotification('تم إنشاء المشهد بنجاح');
    
    // حفظ في قاعدة البيانات
    saveMashhadToDatabase();
}

// طباعة المشهد
function printMashhad() {
    if (!currentEmployeeData) {
        showNotification('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    // تحديث البيانات قبل الطباعة
    generateMashhad();
    
    // طباعة
    setTimeout(() => {
        window.print();
    }, 500);
}

// حفظ المشهد
function saveMashhad() {
    if (!currentEmployeeData) {
        showNotification('يرجى اختيار موظف أولاً', 'error');
        return;
    }
    
    // إنشاء اسم الملف
    const fileName = `mashhad_${currentEmployeeData.employee_name}_${new Date().toISOString().split('T')[0]}.html`;
    
    // الحصول على محتوى HTML
    const mashhadContent = document.getElementById('mashhadContainer').outerHTML;
    
    // إنشاء ملف HTML كامل
    const fullHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مشهد - ${currentEmployeeData.employee_name}</title>
    <style>
        ${document.querySelector('style').innerHTML}
    </style>
</head>
<body>
    ${mashhadContent}
</body>
</html>`;
    
    // تحميل الملف
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('تم حفظ المشهد: ' + fileName);
}

// حفظ المشهد في قاعدة البيانات
function saveMashhadToDatabase() {
    const mashhadData = {
        employee_id: currentEmployeeData.id,
        template_type: 'mashhad',
        letter_title: document.getElementById('letterTitle').value,
        letter_content: document.getElementById('letterContent').value,
        purpose: document.getElementById('purpose').value,
        include_qr: document.getElementById('includeQR').checked,
        created_at: new Date().toISOString()
    };
    
    // هنا يمكن إرسال البيانات للخادم لحفظها
    console.log('بيانات المشهد للحفظ:', mashhadData);
}

// عرض إشعار
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // تحديد لون الإشعار حسب النوع
    switch(type) {
        case 'success':
            notification.style.background = '#28a745';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'warning':
            notification.style.background = '#ffc107';
            notification.style.color = '#000';
            break;
        default:
            notification.style.background = '#17a2b8';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// إضافة مستمع لمفتاح Enter في حقل البحث
document.getElementById('employeeSearchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchEmployee();
    }
});
