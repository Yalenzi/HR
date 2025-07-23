// متغيرات عامة
let recipientPhotoData = null;
let customBackgroundData = null;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCurrentDate();
    updateCard();
});

// تهيئة التطبيق
function initializeApp() {
    console.log('🎉 تم تحميل مولد بطاقات التهنئة بنجاح');
    
    // تحديث التاريخ كل دقيقة
    setInterval(updateCurrentDate, 60000);
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار التحكم
    document.getElementById('updateCard').addEventListener('click', updateCard);
    document.getElementById('previewCard').addEventListener('click', showPreviewModal);
    document.getElementById('downloadCard').addEventListener('click', downloadCard);
    document.getElementById('downloadFromModal').addEventListener('click', downloadCard);
    
    // تحديث تلقائي عند تغيير المدخلات
    const inputs = ['recipientName', 'occasion', 'managementName', 'customMessage'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateCard);
            element.addEventListener('change', updateCard);
        }
    });
    
    // رفع الصور
    document.getElementById('recipientPhoto').addEventListener('change', handlePhotoUpload);
    document.getElementById('customBackgroundFile').addEventListener('change', handleBackgroundUpload);
    
    // تغيير نوع الخلفية
    document.getElementById('cardBackground').addEventListener('change', handleBackgroundChange);
    
    // إغلاق Modal
    document.querySelector('.close').addEventListener('click', closePreviewModal);
    document.getElementById('previewModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePreviewModal();
        }
    });
    
    // إغلاق Modal بمفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePreviewModal();
        }
    });
}

// تحديث التاريخ الحالي
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    const arabicDate = now.toLocaleDateString('ar-SA', options);
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = arabicDate;
    }
}

// تحديث البطاقة
function updateCard() {
    const recipientName = document.getElementById('recipientName').value || 'الزميل الكريم';
    const occasion = document.getElementById('occasion').value;
    const managementName = document.getElementById('managementName').value || 'الإدارة';
    const customMessage = document.getElementById('customMessage').value;
    
    // تحديث النص
    const congratulationText = document.getElementById('congratulationText');
    if (customMessage.trim()) {
        // استبدال النص المخصص مع تمييز الاسم
        let processedMessage = customMessage;
        
        // البحث عن الاسم في النص وتمييزه
        const namePattern = new RegExp(`(${recipientName})`, 'gi');
        processedMessage = processedMessage.replace(namePattern, `<span class="highlight-name">${recipientName}</span>`);
        
        congratulationText.innerHTML = processedMessage;
    } else {
        // النص الافتراضي
        congratulationText.innerHTML = `
            تتقدم إدارة الخدمات الطبية الشرعية بمنطقة الحدود الشمالية بالتهنئة للزميل 
            <span class="highlight-name">${recipientName}</span> 
            بمناسبة صدور قرار تمديد تكليفه مديراً ل${managementName} بمركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية متمنين للزميل دوام التوفيق والنجاح
        `;
    }
    
    // تحديث المناسبة
    document.getElementById('occasionDisplay').textContent = occasion;
    
    // تحديث الصورة الشخصية
    const photoPreview = document.getElementById('recipientPhotoPreview');
    if (recipientPhotoData) {
        photoPreview.src = recipientPhotoData;
        photoPreview.style.display = 'block';
    } else {
        photoPreview.style.display = 'none';
    }
    
    console.log('✅ تم تحديث البطاقة بنجاح');
}

// معالجة رفع الصورة الشخصية
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('⚠️ حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            recipientPhotoData = e.target.result;
            updateCard();
            console.log('📸 تم رفع الصورة الشخصية بنجاح');
        };
        reader.readAsDataURL(file);
    }
}

// معالجة رفع خلفية مخصصة
function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
            alert('⚠️ حجم صورة الخلفية كبير جداً. يرجى اختيار صورة أصغر من 10 ميجابايت.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            customBackgroundData = e.target.result;
            applyCustomBackground();
            console.log('🖼️ تم رفع الخلفية المخصصة بنجاح');
        };
        reader.readAsDataURL(file);
    }
}

// تطبيق الخلفية المخصصة
function applyCustomBackground() {
    const cardBackground = document.querySelector('.card-background');
    if (customBackgroundData) {
        cardBackground.style.backgroundImage = `url(${customBackgroundData})`;
        cardBackground.style.backgroundSize = 'cover';
        cardBackground.style.backgroundPosition = 'center';
        cardBackground.style.backgroundRepeat = 'no-repeat';
    }
}

// معالجة تغيير نوع الخلفية
function handleBackgroundChange(event) {
    const backgroundType = event.target.value;
    const cardBackground = document.querySelector('.card-background');
    const customGroup = document.getElementById('customBackgroundGroup');
    
    // إزالة جميع فئات الخلفية
    cardBackground.className = 'card-background';
    cardBackground.style.backgroundImage = '';
    
    // إخفاء/إظهار خيار الخلفية المخصصة
    if (backgroundType === 'custom') {
        customGroup.style.display = 'block';
        if (customBackgroundData) {
            applyCustomBackground();
        }
    } else {
        customGroup.style.display = 'none';
        if (backgroundType !== 'default') {
            cardBackground.classList.add(backgroundType);
        }
    }
    
    console.log(`🎨 تم تغيير نوع الخلفية إلى: ${backgroundType}`);
}

// عرض modal المعاينة
function showPreviewModal() {
    const modal = document.getElementById('previewModal');
    const fullPreview = document.getElementById('fullPreview');
    const cardPreview = document.getElementById('cardPreview');
    
    // نسخ محتوى البطاقة إلى المعاينة المكبرة
    fullPreview.innerHTML = cardPreview.innerHTML;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('👁️ تم فتح معاينة البطاقة');
}

// إغلاق modal المعاينة
function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    console.log('❌ تم إغلاق معاينة البطاقة');
}

// تحميل البطاقة كصورة
async function downloadCard() {
    try {
        console.log('📥 بدء عملية تحميل البطاقة...');
        
        // إظهار مؤشر التحميل
        const downloadBtn = document.getElementById('downloadCard');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '⏳ جاري التحميل...';
        downloadBtn.disabled = true;
        
        // تحديد العنصر المراد تحويله
        const cardElement = document.querySelector('.card-background');
        
        if (!cardElement) {
            throw new Error('لم يتم العثور على البطاقة');
        }
        
        // إعدادات html2canvas
        const options = {
            backgroundColor: null,
            scale: 2, // جودة عالية
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            logging: false,
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            scrollX: 0,
            scrollY: 0
        };
        
        // تحويل العنصر إلى canvas
        const canvas = await html2canvas(cardElement, options);
        
        // إنشاء رابط التحميل
        const link = document.createElement('a');
        const recipientName = document.getElementById('recipientName').value || 'بطاقة-تهنئة';
        const occasion = document.getElementById('occasion').value;
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.download = `بطاقة-تهنئة-${recipientName}-${occasion}-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        
        // تحميل الصورة
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ تم تحميل البطاقة بنجاح');
        
        // إظهار رسالة نجاح
        showSuccessMessage('تم تحميل البطاقة بنجاح! 🎉');
        
    } catch (error) {
        console.error('❌ خطأ في تحميل البطاقة:', error);
        alert('حدث خطأ أثناء تحميل البطاقة. يرجى المحاولة مرة أخرى.');
    } finally {
        // استعادة النص الأصلي للزر
        const downloadBtn = document.getElementById('downloadCard');
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

// إظهار رسالة نجاح
function showSuccessMessage(message) {
    // إنشاء عنصر الرسالة
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    successDiv.textContent = message;
    
    // إضافة الرسالة إلى الصفحة
    document.body.appendChild(successDiv);
    
    // إزالة الرسالة بعد 3 ثوان
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
}

// إضافة CSS للرسائل المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// معالجة الأخطاء العامة
window.addEventListener('error', function(e) {
    console.error('❌ خطأ في التطبيق:', e.error);
});

// تسجيل تحميل التطبيق
console.log('🚀 تم تحميل مولد بطاقات التهنئة - وزارة الصحة');
console.log('📱 النسخة: 1.0.0');
console.log('🏥 مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية');
