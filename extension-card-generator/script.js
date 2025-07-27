// متغيرات عامة
let cardCounter = 12847;
let currentPhotoData = null;

// عناصر DOM
const cardForm = document.getElementById('cardForm');
const previewBtn = document.getElementById('previewBtn');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const previewSection = document.getElementById('previewSection');
const cardPreview = document.getElementById('cardPreview');
const photoInput = document.getElementById('employeePhoto');
const photoPreview = document.getElementById('photoPreview');
const previewModal = document.getElementById('previewModal');
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const downloadFromModal = document.getElementById('downloadFromModal');
const modalPreview = document.getElementById('modalPreview');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const closeNotification = document.getElementById('closeNotification');
const loadingOverlay = document.getElementById('loadingOverlay');
const cardCounterElement = document.getElementById('cardCounter');

// تحديث العداد
function updateCounter() {
    cardCounter++;
    cardCounterElement.textContent = cardCounter.toLocaleString('ar-SA');
    localStorage.setItem('cardCounter', cardCounter);
}

// تحميل العداد من التخزين المحلي
function loadCounter() {
    const saved = localStorage.getItem('cardCounter');
    if (saved) {
        cardCounter = parseInt(saved);
        cardCounterElement.textContent = cardCounter.toLocaleString('ar-SA');
    }
}

// عرض التنبيه
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// إغلاق التنبيه
closeNotification.addEventListener('click', () => {
    notification.style.display = 'none';
});

// عرض شاشة التحميل
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// إخفاء شاشة التحميل
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// معالجة رفع الصورة
photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            showNotification('يرجى اختيار ملف صورة صحيح', 'error');
            return;
        }
        
        // التحقق من حجم الملف (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentPhotoData = e.target.result;
            
            // عرض معاينة الصورة
            photoPreview.innerHTML = `
                <img src="${currentPhotoData}" alt="معاينة الصورة">
                <p>تم رفع الصورة بنجاح</p>
            `;
            
            showNotification('تم رفع الصورة بنجاح');
        };
        reader.readAsDataURL(file);
    }
});

// جمع بيانات النموذج
function getFormData() {
    const formData = new FormData(cardForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // إضافة بيانات الصورة
    if (currentPhotoData) {
        data.employeePhotoData = currentPhotoData;
    }
    
    return data;
}

// إنشاء معاينة البطاقة
function createPreview(data) {
    const template = data.template || 'template1';
    
    return `
        <div class="card-template ${template}" style="
            width: 400px;
            height: 300px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 20px;
            color: white;
            position: relative;
            margin: 0 auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
        ">
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="font-size: 1.2rem; margin-bottom: 5px;">${data.line1}</h3>
                <p style="font-size: 1rem; opacity: 0.9;">${data.line2}</p>
                <p style="font-size: 1rem; opacity: 0.9;">${data.line3}</p>
            </div>
            
            <div style="display: flex; align-items: center; gap: 15px;">
                ${currentPhotoData ? `
                    <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid white;">
                        <img src="${currentPhotoData}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                ` : `
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 3px solid white; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 2rem;">👤</span>
                    </div>
                `}
                
                <div style="flex: 1;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 5px;">${data.employeeName}</h2>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${data.position}</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${data.department}</p>
                </div>
            </div>
            
            <div style="position: absolute; bottom: 15px; left: 20px; right: 20px; text-align: center;">
                <p style="font-size: 0.8rem; opacity: 0.7;">${data.organization}</p>
                <p style="font-size: 0.8rem; opacity: 0.7;">${data.signature}</p>
            </div>
            
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        </div>
    `;
}

// معاينة البطاقة
previewBtn.addEventListener('click', function() {
    const data = getFormData();
    
    // التحقق من البيانات المطلوبة
    if (!data.employeeName || !data.line1) {
        showNotification('يرجى ملء البيانات المطلوبة', 'error');
        return;
    }
    
    // إنشاء المعاينة
    const previewHTML = createPreview(data);
    cardPreview.innerHTML = previewHTML;
    
    // عرض قسم المعاينة
    previewSection.classList.add('active');
    previewSection.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('تم إنشاء المعاينة بنجاح');
});

// فتح النافذة المنبثقة للمعاينة
cardPreview.addEventListener('click', function() {
    if (cardPreview.innerHTML.trim()) {
        modalPreview.innerHTML = cardPreview.innerHTML;
        previewModal.style.display = 'block';
    }
});

// إغلاق النافذة المنبثقة
closeModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
});

closeModalBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
});

// إغلاق النافذة عند النقر خارجها
window.addEventListener('click', function(e) {
    if (e.target === previewModal) {
        previewModal.style.display = 'none';
    }
});

// تحميل البطاقة
function downloadCard(data) {
    showLoading();

    console.log('Sending data:', data); // للتشخيص

    // إرسال البيانات إلى الخادم
    fetch('generate.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response status:', response.status); // للتشخيص
        return response.text(); // استخدام text() أولاً للتشخيص
    })
    .then(responseText => {
        console.log('Response text:', responseText); // للتشخيص

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parse error:', e);
            throw new Error('استجابة غير صحيحة من الخادم');
        }

        hideLoading();

        if (result.success) {
            // تحديث العداد
            updateCounter();

            // تحميل الملف
            const link = document.createElement('a');
            link.href = result.file_url;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification('تم إنشاء البطاقة وتحميلها بنجاح');
        } else {
            showNotification(result.message || 'حدث خطأ أثناء إنشاء البطاقة', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        showNotification('حدث خطأ في الاتصال بالخادم: ' + error.message, 'error');
    });
}

// معالج تحميل البطاقة من النموذج
generateBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const data = getFormData();
    
    // التحقق من البيانات المطلوبة
    if (!data.employeeName || !data.line1) {
        showNotification('يرجى ملء البيانات المطلوبة', 'error');
        return;
    }
    
    downloadCard(data);
});

// معالج تحميل البطاقة من النافذة المنبثقة
downloadFromModal.addEventListener('click', function() {
    const data = getFormData();
    downloadCard(data);
    previewModal.style.display = 'none';
});

// إعادة تعيين النموذج
resetBtn.addEventListener('click', function() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
        cardForm.reset();
        currentPhotoData = null;
        photoPreview.innerHTML = '';
        cardPreview.innerHTML = '';
        previewSection.classList.remove('active');
        
        // إعادة تعيين القيم الافتراضية
        document.getElementById('line1').value = 'بكل الحب والتقدير';
        document.getElementById('line2').value = 'أتشرف بإعلامكم';
        document.getElementById('line3').value = 'بتمديد تكليف في';
        document.getElementById('employeeName').value = '  ';
        document.getElementById('department').value = 'إدارة الموارد البشرية';
        document.getElementById('position').value = 'مدير إدارة';
        document.getElementById('organization').value = 'وزارة الصحة';
        document.getElementById('startDate').value = 'الموافق ١٤٤٥/٠٣/١٥ هـ';
        document.getElementById('endDate').value = 'حتى تاريخ ١٤٤٦/٠٣/١٥ هـ';
        document.getElementById('location').value = ' ';
        document.getElementById('signature').value = 'مع أطيب التحيات';
        
        showNotification('تم إعادة تعيين النموذج');
    }
});

// تحديث المعاينة عند تغيير البيانات
const formInputs = cardForm.querySelectorAll('input, select');
formInputs.forEach(input => {
    input.addEventListener('input', function() {
        if (previewSection.classList.contains('active')) {
            const data = getFormData();
            const previewHTML = createPreview(data);
            cardPreview.innerHTML = previewHTML;
        }
    });
});

// تحميل العداد عند بدء التشغيل
document.addEventListener('DOMContentLoaded', function() {
    loadCounter();
    
    // تحديث العداد كل 30 ثانية (محاكاة)
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% احتمال
            cardCounter += Math.floor(Math.random() * 3) + 1;
            cardCounterElement.textContent = cardCounter.toLocaleString('ar-SA');
            localStorage.setItem('cardCounter', cardCounter);
        }
    }, 30000);
});
