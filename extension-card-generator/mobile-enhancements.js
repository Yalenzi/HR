/**
 * تحسينات JavaScript للأجهزة المحمولة
 * وظائف مساعدة لتحسين تجربة المستخدم على الأجهزة المحمولة
 */

// ===== كشف نوع الجهاز =====

const DeviceDetector = {
    isMobile: () => window.innerWidth <= 768,
    isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: () => window.innerWidth > 1024,
    isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: () => /Android/.test(navigator.userAgent)
};

// ===== تحسينات الأداء للأجهزة المحمولة =====

class MobileOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupViewport();
        this.optimizeScrolling();
        this.setupTouchEvents();
        this.optimizeImages();
        this.setupResponsiveNavigation();
    }

    // تحسين viewport للأجهزة المحمولة
    setupViewport() {
        if (DeviceDetector.isMobile()) {
            // منع التكبير في iOS
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
            }
        }
    }

    // تحسين التمرير للأجهزة المحمولة
    optimizeScrolling() {
        if (DeviceDetector.isTouchDevice()) {
            // تحسين التمرير السلس
            document.documentElement.style.scrollBehavior = 'smooth';
            
            // تحسين التمرير في الحاويات
            const scrollContainers = document.querySelectorAll('.table-container, .modal-body');
            scrollContainers.forEach(container => {
                container.style.webkitOverflowScrolling = 'touch';
            });
        }
    }

    // إعداد أحداث اللمس
    setupTouchEvents() {
        if (DeviceDetector.isTouchDevice()) {
            // إضافة فئة للأجهزة التي تدعم اللمس
            document.body.classList.add('touch-device');
            
            // تحسين النقر للأزرار
            this.optimizeButtonTaps();
        }
    }

    // تحسين النقر للأزرار
    optimizeButtonTaps() {
        const buttons = document.querySelectorAll('.btn, button, .nav-btn');
        buttons.forEach(button => {
            // إضافة تأثير اللمس
            button.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });
    }

    // تحسين الصور للأجهزة المحمولة
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // تحميل كسول للصور
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }
            
            // تحسين جودة الصور للشاشات عالية الكثافة
            if (window.devicePixelRatio > 1) {
                const src = img.src;
                if (src && !src.includes('@2x')) {
                    const highResSrc = src.replace(/\.(jpg|jpeg|png)$/, '@2x.$1');
                    // فحص وجود الصورة عالية الجودة
                    const testImg = new Image();
                    testImg.onload = () => {
                        img.src = highResSrc;
                    };
                    testImg.src = highResSrc;
                }
            }
        });
    }

    // إعداد التنقل المتجاوب
    setupResponsiveNavigation() {
        const nav = document.querySelector('.admin-nav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (nav && mobileMenuBtn) {
            this.handleResponsiveNav(nav, mobileMenuBtn);
        }
    }

    // التعامل مع التنقل المتجاوب
    handleResponsiveNav(nav, mobileMenuBtn) {
        const updateNavDisplay = () => {
            if (DeviceDetector.isMobile()) {
                nav.style.display = nav.classList.contains('show') ? 'flex' : 'none';
                mobileMenuBtn.style.display = 'flex';
            } else {
                nav.style.display = 'flex';
                mobileMenuBtn.style.display = 'none';
                nav.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
            }
        };

        // تحديث عند تغيير حجم الشاشة
        window.addEventListener('resize', updateNavDisplay);
        updateNavDisplay();
    }
}

// ===== تحسينات النماذج للأجهزة المحمولة =====

class MobileFormEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeInputs();
        this.setupVirtualKeyboard();
        this.improveFormValidation();
    }

    // تحسين حقول الإدخال
    optimizeInputs() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // منع التكبير في iOS
            if (DeviceDetector.isIOS()) {
                if (input.type !== 'file') {
                    input.style.fontSize = '16px';
                }
            }

            // تحسين لوحة المفاتيح
            this.setOptimalKeyboard(input);
        });
    }

    // تعيين لوحة المفاتيح المناسبة
    setOptimalKeyboard(input) {
        if (DeviceDetector.isMobile()) {
            switch (input.type) {
                case 'email':
                    input.inputMode = 'email';
                    break;
                case 'tel':
                    input.inputMode = 'tel';
                    break;
                case 'number':
                    input.inputMode = 'numeric';
                    break;
                case 'url':
                    input.inputMode = 'url';
                    break;
                default:
                    if (input.name && input.name.includes('search')) {
                        input.inputMode = 'search';
                    }
            }
        }
    }

    // إعداد لوحة المفاتيح الافتراضية
    setupVirtualKeyboard() {
        if (DeviceDetector.isMobile()) {
            // تحسين التمرير عند ظهور لوحة المفاتيح
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    setTimeout(() => {
                        input.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                });
            });
        }
    }

    // تحسين التحقق من صحة النماذج
    improveFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showMobileValidationErrors(form);
                }
            });
        });
    }

    // التحقق من صحة النموذج
    validateForm(form) {
        const requiredInputs = form.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    // عرض أخطاء التحقق للأجهزة المحمولة
    showMobileValidationErrors(form) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // إظهار رسالة خطأ مخصصة
            this.showMobileAlert('يرجى ملء جميع الحقول المطلوبة');
        }
    }

    // عرض تنبيه مخصص للأجهزة المحمولة
    showMobileAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'mobile-alert';
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

// ===== تحسينات الجداول للأجهزة المحمولة =====

class MobileTableEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.makeTablesResponsive();
        this.addSwipeGestures();
    }

    // جعل الجداول متجاوبة
    makeTablesResponsive() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.closest('.table-container')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-container responsive-table';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }

            // إضافة تسميات للخلايا في الشاشات الصغيرة
            this.addCellLabels(table);
        });
    }

    // إضافة تسميات للخلايا
    addCellLabels(table) {
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index].textContent);
                }
            });
        });
    }

    // إضافة إيماءات التمرير
    addSwipeGestures() {
        if (DeviceDetector.isTouchDevice()) {
            const tableContainers = document.querySelectorAll('.table-container');
            tableContainers.forEach(container => {
                this.setupSwipeGesture(container);
            });
        }
    }

    // إعداد إيماءة التمرير
    setupSwipeGesture(container) {
        let startX = 0;
        let scrollLeft = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('touchmove', (e) => {
            if (!startX) return;
            e.preventDefault();
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('touchend', () => {
            startX = 0;
        });
    }
}

// ===== تهيئة التحسينات =====

document.addEventListener('DOMContentLoaded', () => {
    // تهيئة جميع التحسينات
    new MobileOptimizer();
    new MobileFormEnhancer();
    new MobileTableEnhancer();

    // إضافة فئات CSS حسب نوع الجهاز
    if (DeviceDetector.isMobile()) {
        document.body.classList.add('mobile-device');
    }
    if (DeviceDetector.isTablet()) {
        document.body.classList.add('tablet-device');
    }
    if (DeviceDetector.isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
    if (DeviceDetector.isIOS()) {
        document.body.classList.add('ios-device');
    }
    if (DeviceDetector.isAndroid()) {
        document.body.classList.add('android-device');
    }
});

// تحديث عند تغيير اتجاه الشاشة
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // إعادة حساب الأبعاد
        window.dispatchEvent(new Event('resize'));
    }, 100);
});

// تصدير الوظائف للاستخدام الخارجي
window.MobileEnhancements = {
    DeviceDetector,
    MobileOptimizer,
    MobileFormEnhancer,
    MobileTableEnhancer
};
