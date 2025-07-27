// متغيرات عامة للوحة التحكم
let currentSection = 'dashboard';
let cardsData = [];
let templatesData = [];

// عرض القسم المحدد
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // إزالة الفئة النشطة من جميع الأزرار
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // عرض القسم المحدد
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // تفعيل الزر المحدد
    const clickedBtn = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    currentSection = sectionName;

    // تحميل بيانات القسم
    loadSectionData(sectionName);
}

// تحميل بيانات القسم
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'cards':
            loadCardsData();
            break;
        case 'templates':
            loadTemplatesData();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'organization':
            loadOrganizationData();
            break;
        case 'coordinates':
            loadCoordinatesEditor();
            break;
        case 'backup':
            loadBackupData();
            break;
    }
}

// تحميل بيانات لوحة المعلومات
async function loadDashboardData() {
    try {
        // تحميل الإحصائيات
        const response = await fetch('admin_api.php?action=stats');
        const stats = await response.json();
        
        if (stats.success) {
            document.getElementById('totalCards').textContent = stats.data.total_cards || 0;
            document.getElementById('todayCards').textContent = stats.data.today_cards || 0;
            document.getElementById('totalTemplates').textContent = stats.data.total_templates || 3;
            document.getElementById('systemStatus').textContent = stats.data.system_status || '✅';
        }
        
        // تحميل آخر البطاقات
        loadRecentCards();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('خطأ في تحميل بيانات لوحة المعلومات', 'error');
    }
}

// تحميل آخر البطاقات
async function loadRecentCards() {
    try {
        const response = await fetch('admin_api.php?action=recent_cards&limit=5');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            const recentCardsHtml = result.data.map(card => `
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${card.employee_name}</strong> - ${card.position}
                    <br><small>${card.created_at}</small>
                </div>
            `).join('');
            
            document.getElementById('recentCards').innerHTML = recentCardsHtml;
        } else {
            document.getElementById('recentCards').innerHTML = '<p>لا توجد بطاقات حديثة</p>';
        }
    } catch (error) {
        document.getElementById('recentCards').innerHTML = '<p>خطأ في تحميل البيانات</p>';
    }
}

// عرض قسم فرعي في إدارة البطاقات
function showCardsSubSection(sectionName) {
    // إخفاء جميع الأقسام الفرعية
    document.querySelectorAll('.cards-sub-section').forEach(section => {
        section.classList.remove('active');
    });

    // إزالة الفئة النشطة من جميع الأزرار
    document.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // عرض القسم المحدد
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // تفعيل الزر المحدد
    const clickedBtn = document.querySelector(`[onclick="showCardsSubSection('${sectionName}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    currentCardsSubSection = sectionName;

    // تحميل بيانات القسم الفرعي
    loadCardsSubSectionData(sectionName);
}

// تحميل بيانات القسم الفرعي
function loadCardsSubSectionData(sectionName) {
    switch(sectionName) {
        case 'cards-list':
            loadCardsData();
            break;
        case 'custom-fields':
            loadCustomFields();
            break;
        case 'backgrounds':
            loadBackgroundLibrary();
            break;
        case 'preview':
            loadAdvancedPreview();
            break;
        case 'templates':
            loadTemplateConfigurations();
            break;
    }
}

// تحميل بيانات البطاقات
async function loadCardsData() {
    try {
        const response = await fetch('admin_api.php?action=all_cards');
        const result = await response.json();

        if (result.success) {
            cardsData = result.data;
            displayCardsTable();
        } else {
            showNotification('خطأ في تحميل بيانات البطاقات', 'error');
        }
    } catch (error) {
        console.error('Error loading cards data:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// عرض جدول البطاقات
function displayCardsTable() {
    const tbody = document.getElementById('cardsTableBody');
    
    if (cardsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا توجد بطاقات</td></tr>';
        return;
    }
    
    const tableHtml = cardsData.map(card => `
        <tr>
            <td>${card.id}</td>
            <td>${card.employee_name}</td>
            <td>${card.position}</td>
            <td>${card.department}</td>
            <td>${card.template}</td>
            <td>${new Date(card.created_at).toLocaleDateString('ar-SA')}</td>
            <td>
                <button class="action-btn btn-view" onclick="viewCard(${card.id})">👁️</button>
                <button class="action-btn btn-download" onclick="downloadCard(${card.id})">📥</button>
                <button class="action-btn btn-delete" onclick="deleteCard(${card.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = tableHtml;
}

// عرض بطاقة
function viewCard(cardId) {
    const card = cardsData.find(c => c.id === cardId);
    if (!card) return;
    
    // إنشاء نافذة منبثقة لعرض البطاقة
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <h3>تفاصيل البطاقة #${card.id}</h3>
            <p><strong>الموظف:</strong> ${card.employee_name}</p>
            <p><strong>المنصب:</strong> ${card.position}</p>
            <p><strong>الإدارة:</strong> ${card.department}</p>
            <p><strong>المؤسسة:</strong> ${card.organization}</p>
            <p><strong>القالب:</strong> ${card.template}</p>
            <p><strong>تاريخ الإنشاء:</strong> ${new Date(card.created_at).toLocaleString('ar-SA')}</p>
            ${card.output_file ? `<p><strong>الملف:</strong> <a href="output/${card.output_file}" target="_blank">${card.output_file}</a></p>` : ''}
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    إغلاق
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// تحميل بطاقة
function downloadCard(cardId) {
    const card = cardsData.find(c => c.id === cardId);
    if (!card || !card.output_file) {
        showNotification('الملف غير متوفر', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = `output/${card.output_file}`;
    link.download = card.output_file;
    link.click();
    
    showNotification('تم بدء التحميل');
}

// حذف بطاقة
async function deleteCard(cardId) {
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) return;
    
    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_card', card_id: cardId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف البطاقة بنجاح');
            loadCardsData(); // إعادة تحميل البيانات
        } else {
            showNotification(result.message || 'خطأ في حذف البطاقة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// تحديث البطاقات
function refreshCards() {
    loadCardsData();
    showNotification('تم تحديث البيانات');
}

// تصدير البطاقات
async function exportCards() {
    try {
        const response = await fetch('admin_api.php?action=export_cards');
        const blob = await response.blob();
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cards_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showNotification('تم تصدير البيانات بنجاح');
    } catch (error) {
        showNotification('خطأ في تصدير البيانات', 'error');
    }
}

// حذف جميع البطاقات
async function deleteAllCards() {
    if (!confirm('هل أنت متأكد من حذف جميع البطاقات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    
    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_all_cards' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف جميع البطاقات');
            loadCardsData();
        } else {
            showNotification(result.message || 'خطأ في حذف البطاقات', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// تحميل بيانات القوالب
function loadTemplatesData() {
    // تهيئة نموذج القالب
    initializeTemplateForm();

    // إزالة المستمعين السابقين لتجنب التكرار
    const startColorEl = document.getElementById('startColor');
    const endColorEl = document.getElementById('endColor');
    const templateNameEl = document.getElementById('templateName');
    const cardSizeEl = document.getElementById('cardSize');

    if (startColorEl && endColorEl && templateNameEl) {
        // إزالة المستمعين القدامى
        startColorEl.removeEventListener('change', updateTemplatePreview);
        endColorEl.removeEventListener('change', updateTemplatePreview);
        templateNameEl.removeEventListener('input', updateTemplatePreview);

        // إضافة المستمعين الجدد
        startColorEl.addEventListener('change', updateTemplatePreview);
        endColorEl.addEventListener('change', updateTemplatePreview);
        templateNameEl.addEventListener('input', updateTemplatePreview);

        if (cardSizeEl) {
            cardSizeEl.removeEventListener('change', updateTemplatePreview);
            cardSizeEl.addEventListener('change', updateTemplatePreview);
        }

        // تحديث المعاينة الأولية
        updateTemplatePreview();
    }

    // تحميل قائمة القوالب الحالية
    updateCurrentTemplatesList();
}

// تحديث معاينة القالب
function updateTemplatePreview() {
    const startColorEl = document.getElementById('startColor');
    const endColorEl = document.getElementById('endColor');
    const templateNameEl = document.getElementById('templateName');
    const cardSizeEl = document.getElementById('cardSize');
    const previewEl = document.getElementById('templatePreview');

    if (!startColorEl || !endColorEl || !templateNameEl || !previewEl) {
        console.log('بعض العناصر غير موجودة');
        return;
    }

    const startColor = startColorEl.value || '#667eea';
    const endColor = endColorEl.value || '#764ba2';
    const templateName = templateNameEl.value || 'معاينة القالب';
    const cardSize = cardSizeEl ? cardSizeEl.value : 'standard';

    // تحديد أبعاد المعاينة حسب حجم البطاقة
    let previewWidth = 250;
    let previewHeight = 150;

    switch(cardSize) {
        case 'a4':
            previewWidth = 210;
            previewHeight = 297;
            break;
        case 'a2':
            previewWidth = 170;
            previewHeight = 220;
            break;
        case 'a6':
            previewWidth = 180;
            previewHeight = 250;
            break;
        case '5x7':
            previewWidth = 200;
            previewHeight = 280;
            break;
        default:
            previewWidth = 250;
            previewHeight = 150;
    }

    // تصغير الأبعاد للمعاينة
    const scale = 0.6;
    previewWidth *= scale;
    previewHeight *= scale;

    previewEl.innerHTML = `
        <div style="
            width: ${previewWidth}px; height: ${previewHeight}px; margin: 0 auto;
            background: linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%);
            border-radius: 10px; padding: 15px; color: white;
            display: flex; flex-direction: column; justify-content: center;
            text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            position: relative; overflow: hidden;
        ">
            <h4 style="margin: 0 0 10px 0; font-size: 1rem;">${templateName}</h4>
            <p style="margin: 0; opacity: 0.9; font-size: 0.8rem;">معاينة التصميم</p>
            <div style="margin-top: 10px; font-size: 0.7rem; opacity: 0.7;">
                ${startColor} → ${endColor}
            </div>
            <div style="position: absolute; bottom: 5px; right: 5px; font-size: 0.6rem; opacity: 0.6;">
                ${cardSize.toUpperCase()}
            </div>

            <!-- عناصر تزيينية -->
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        </div>
    `;
}

// إضافة قالب جديد
function initializeTemplateForm() {
    const form = document.getElementById('newTemplateForm');
    if (!form) return;

    // إزالة المستمع السابق إن وجد
    form.removeEventListener('submit', handleTemplateSubmit);

    // إضافة المستمع الجديد
    form.addEventListener('submit', handleTemplateSubmit);

    // إضافة مستمع لحجم البطاقة
    const cardSizeEl = document.getElementById('cardSize');
    if (cardSizeEl) {
        cardSizeEl.addEventListener('change', updateTemplatePreview);
    }
}

// معالج إرسال نموذج القالب
async function handleTemplateSubmit(e) {
    e.preventDefault();

    const templateName = document.getElementById('templateName').value.trim();
    const templateId = document.getElementById('templateId').value.trim();
    const startColor = document.getElementById('startColor').value;
    const endColor = document.getElementById('endColor').value;
    const cardSize = document.getElementById('cardSize').value;

    // التحقق من البيانات
    if (!templateName || !templateId) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }

    // التحقق من صحة معرف القالب
    if (!/^[a-zA-Z0-9_]+$/.test(templateId)) {
        showNotification('معرف القالب يجب أن يحتوي على أحرف وأرقام فقط', 'error');
        return;
    }

    const formData = {
        action: 'add_template',
        name: templateName,
        id: templateId,
        start_color: startColor,
        end_color: endColor,
        card_size: cardSize
    };

    try {
        showNotification('جاري إضافة القالب...', 'info');

        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('تم إضافة القالب بنجاح');

            // إعادة تعيين النموذج
            document.getElementById('newTemplateForm').reset();
            document.getElementById('cardSize').value = 'standard';
            updateTemplatePreview();

            // تحديث قائمة القوالب
            updateCurrentTemplatesList();
            updateMainPageTemplates();
        } else {
            showNotification(result.message || 'خطأ في إضافة القالب', 'error');
        }
    } catch (error) {
        console.error('Error adding template:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// تحديث قائمة القوالب الحالية
async function updateCurrentTemplatesList() {
    try {
        const response = await fetch('admin_api.php?action=get_templates');
        const result = await response.json();

        if (result.success) {
            const templatesContainer = document.getElementById('currentTemplates');
            if (!templatesContainer) return;

            let templatesHtml = '';

            for (const [id, template] of Object.entries(result.data)) {
                templatesHtml += `
                    <div class="template-item">
                        <h4>${template.name} (${id})</h4>
                        <p>الألوان: ${template.start_color || 'افتراضي'} → ${template.end_color || 'افتراضي'}</p>
                        ${template.card_size ? `<p>الحجم: ${template.card_size}</p>` : ''}
                        <div class="template-actions">
                            <button class="action-btn btn-view" onclick="previewTemplate('${id}')">👁️ معاينة</button>
                            <button class="action-btn btn-download" onclick="downloadTemplate('${id}')">📥 تحميل</button>
                            <button class="action-btn btn-delete" onclick="deleteTemplate('${id}')">🗑️ حذف</button>
                        </div>
                    </div>
                `;
            }

            templatesContainer.innerHTML = templatesHtml;
        }
    } catch (error) {
        console.error('Error updating templates list:', error);
    }
}

// معاينة قالب
function previewTemplate(templateId) {
    // إنشاء نافذة معاينة للقالب
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        align-items: center; justify-content: center;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h3>معاينة القالب: ${templateId}</h3>
            <div id="templatePreviewModal" style="margin: 20px 0;"></div>
            <button onclick="this.parentElement.parentElement.remove()"
                    style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                إغلاق
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// تحميل قالب
function downloadTemplate(templateId) {
    showNotification('ميزة تحميل القالب قيد التطوير', 'info');
}

// حذف قالب
async function deleteTemplate(templateId) {
    if (!confirm(`هل أنت متأكد من حذف القالب: ${templateId}؟`)) return;

    try {
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_template', template_id: templateId })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('تم حذف القالب بنجاح');
            updateCurrentTemplatesList();
        } else {
            showNotification(result.message || 'خطأ في حذف القالب', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// تحديث قوالب الصفحة الرئيسية
async function updateMainPageTemplates() {
    try {
        showNotification('جاري تحديث القوالب في الصفحة الرئيسية...', 'info');

        const response = await fetch('update_templates.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            console.log('Templates updated:', result);
            showNotification('تم تحديث القوالب في الصفحة الرئيسية بنجاح', 'success');

            // عرض تفاصيل التحديث
            if (result.updates) {
                let updateDetails = 'تم تحديث: ';
                if (result.updates.html) updateDetails += 'HTML ';
                if (result.updates.js) updateDetails += 'JavaScript ';
                if (result.updates.php) updateDetails += 'PHP ';

                setTimeout(() => {
                    showNotification(updateDetails, 'info');
                }, 2000);
            }
        } else {
            showNotification(result.message || 'خطأ في تحديث القوالب', 'error');
        }
    } catch (error) {
        console.error('Error updating templates:', error);
        showNotification('خطأ في الاتصال بخادم التحديث', 'error');
    }
}

// تحميل الإعدادات
function loadSettings() {
    // تحميل الإعدادات المحفوظة من localStorage أو الخادم
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    document.getElementById('defaultCardSize').value = settings.defaultCardSize || '800x600';
    document.getElementById('imageQuality').value = settings.imageQuality || '90';
    document.getElementById('defaultFont').value = settings.defaultFont || 'cairo';
    document.getElementById('uploadLimit').value = settings.uploadLimit || '5';
    document.getElementById('retentionDays').value = settings.retentionDays || '30';
    document.getElementById('autoBackup').checked = settings.autoBackup !== false;
}

// حفظ الإعدادات
function saveSettings() {
    const settings = {
        defaultCardSize: document.getElementById('defaultCardSize').value,
        imageQuality: document.getElementById('imageQuality').value,
        defaultFont: document.getElementById('defaultFont').value,
        uploadLimit: document.getElementById('uploadLimit').value,
        retentionDays: document.getElementById('retentionDays').value,
        autoBackup: document.getElementById('autoBackup').checked
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('تم حفظ الإعدادات بنجاح');
}

// استعادة الإعدادات الافتراضية
function resetSettings() {
    if (!confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) return;
    
    localStorage.removeItem('adminSettings');
    loadSettings();
    showNotification('تم استعادة الإعدادات الافتراضية');
}

// تحميل بيانات النسخ الاحتياطي
function loadBackupData() {
    // تحميل قائمة النسخ الاحتياطية المتاحة
    console.log('Loading backup data...');
}

// إنشاء نسخة احتياطية
async function createBackup() {
    try {
        showNotification('جاري إنشاء النسخة الاحتياطية...', 'info');
        
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create_backup' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم إنشاء النسخة الاحتياطية بنجاح');
            
            // تحميل الملف
            const link = document.createElement('a');
            link.href = result.backup_url;
            link.download = result.filename;
            link.click();
        } else {
            showNotification(result.message || 'خطأ في إنشاء النسخة الاحتياطية', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// استعادة نسخة احتياطية
function restoreBackup() {
    const fileInput = document.getElementById('backupFile');
    if (!fileInput.files[0]) {
        showNotification('يرجى اختيار ملف النسخة الاحتياطية', 'error');
        return;
    }
    
    if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية!')) return;
    
    // رفع الملف واستعادة النسخة
    const formData = new FormData();
    formData.append('backup_file', fileInput.files[0]);
    formData.append('action', 'restore_backup');
    
    fetch('admin_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('تم استعادة النسخة الاحتياطية بنجاح');
            location.reload(); // إعادة تحميل الصفحة
        } else {
            showNotification(result.message || 'خطأ في استعادة النسخة الاحتياطية', 'error');
        }
    })
    .catch(error => {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    });
}

// عرض الإشعارات
function showNotification(message, type = 'success') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1001;
        padding: 15px 20px; border-radius: 8px; color: white;
        background: ${type === 'error' ? '#e74c3c' : type === 'info' ? '#3498db' : '#27ae60'};
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        max-width: 400px; word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 5 ثوان
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// متغيرات إدارة المنشأة
let organizationData = {};
let currentCoordinates = {};
let selectedElement = null;
let isDragging = false;

// متغيرات إدارة البطاقات المتقدمة
let customFields = [];
let backgroundLibrary = [];
let currentBackground = 'default';
let templateConfigurations = [];
let currentCardsSubSection = 'cards-list';
let hiddenDefaultFields = [];
let defaultFieldsConfig = {};

// تحميل بيانات المنشأة
function loadOrganizationData() {
    // تحميل البيانات المحفوظة
    const savedData = localStorage.getItem('organizationData');
    if (savedData) {
        organizationData = JSON.parse(savedData);
        populateOrganizationForm();
    }

    // تهيئة نموذج المنشأة
    initializeOrganizationForm();

    // تحديث المعاينة
    updateOrganizationPreview();
}

// تهيئة نموذج المنشأة
function initializeOrganizationForm() {
    const form = document.getElementById('organizationForm');
    if (!form) return;

    form.addEventListener('submit', handleOrganizationSubmit);

    // إضافة مستمعين للتحديث الفوري
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateOrganizationPreview);
    });

    // معالجة رفع الشعار
    const logoInput = document.getElementById('organizationLogo');
    if (logoInput) {
        logoInput.addEventListener('change', handleLogoUpload);
    }
}

// ملء نموذج المنشأة بالبيانات المحفوظة
function populateOrganizationForm() {
    const fields = ['organizationName', 'managerName', 'managerPosition'];

    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && organizationData[field]) {
            element.value = organizationData[field];
        }
    });

    // عرض الشعار إذا كان موجوداً
    if (organizationData.logo) {
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.innerHTML = `
                <img src="${organizationData.logo}" alt="شعار المنشأة"
                     style="max-width: 100px; max-height: 100px; border-radius: 8px;">
            `;
        }
    }
}

// معالجة إرسال نموذج المنشأة
async function handleOrganizationSubmit(e) {
    e.preventDefault();

    const formData = {
        organizationName: document.getElementById('organizationName').value,
        managerName: document.getElementById('managerName').value,
        managerPosition: document.getElementById('managerPosition').value,
        logo: organizationData.logo || null
    };

    try {
        // حفظ في localStorage
        organizationData = formData;
        localStorage.setItem('organizationData', JSON.stringify(organizationData));

        // إرسال للخادم
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_organization', data: formData })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('تم حفظ معلومات المنشأة بنجاح');
            updateOrganizationPreview();
        } else {
            showNotification(result.message || 'خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// معالجة رفع الشعار
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('يرجى اختيار ملف صورة صحيح', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showNotification('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        organizationData.logo = e.target.result;

        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.innerHTML = `
                <img src="${organizationData.logo}" alt="شعار المنشأة"
                     style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                <p style="margin-top: 5px; font-size: 0.8rem; color: #6c757d;">تم رفع الشعار بنجاح</p>
            `;
        }

        updateOrganizationPreview();
        showNotification('تم رفع الشعار بنجاح');
    };
    reader.readAsDataURL(file);
}

// تحديث معاينة المنشأة
function updateOrganizationPreview() {
    const orgName = document.getElementById('organizationName')?.value || 'مركز الخدمات الطبية الشرعية';
    const managerName = document.getElementById('managerName')?.value || 'د. فواز جمال الديدب';
    const managerPosition = document.getElementById('managerPosition')?.value || 'مدير مركز الخدمات الطبية الشرعية';

    // تحديث المعاينة
    const previewElements = {
        'previewOrgName': orgName,
        'previewManagerName': managerName,
        'previewManagerPosition': managerPosition
    };

    Object.entries(previewElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    // تحديث الشعار في المعاينة
    const previewLogo = document.getElementById('previewLogo');
    if (previewLogo && organizationData.logo) {
        previewLogo.innerHTML = `
            <img src="${organizationData.logo}" alt="شعار المنشأة"
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; background: rgba(255,255,255,0.2);">
        `;
    } else if (previewLogo) {
        previewLogo.innerHTML = `
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                🏢
            </div>
        `;
    }
}

// إعادة تعيين نموذج المنشأة
function resetOrganizationForm() {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) return;

    document.getElementById('organizationForm').reset();
    organizationData = {};
    localStorage.removeItem('organizationData');

    document.getElementById('logoPreview').innerHTML = '';
    updateOrganizationPreview();

    showNotification('تم إعادة تعيين البيانات');
}

// معاينة النماذج الإدارية
function previewAdminTemplate(templateType) {
    const templates = {
        'decision': 'نموذج قرار إداري',
        'assignment': 'نموذج تكليف',
        'certificate': 'نموذج شهادة تقدير',
        'extension': 'نموذج تمديد تكليف'
    };

    // إنشاء نافذة معاينة
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(5px);
    `;

    const previewContent = generateAdminTemplatePreview(templateType);

    modal.innerHTML = `
        <div style="background: white; padding: 0; border-radius: 15px; max-width: 800px; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.5rem;">معاينة ${templates[templateType]}</h3>
                <span style="font-size: 2rem; cursor: pointer; line-height: 1;" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 30px; max-height: 60vh; overflow-y: auto;">
                ${previewContent}
            </div>
            <div style="padding: 20px 30px; background: #f8f9fa; display: flex; gap: 15px; justify-content: center;">
                <button onclick="createAdminTemplate('${templateType}')" class="btn btn-success">📥 إنشاء النموذج</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">إغلاق</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// إنشاء محتوى معاينة النموذج الإداري
function generateAdminTemplatePreview(templateType) {
    const orgData = organizationData.organizationName ? organizationData : {
        organizationName: 'مركز الخدمات الطبية الشرعية',
        managerName: 'د. فواز جمال الديدب',
        managerPosition: 'مدير مركز الخدمات الطبية الشرعية'
    };

    const currentDate = new Date().toLocaleDateString('ar-SA');

    switch(templateType) {
        case 'decision':
            return `
                <div style="font-family: 'Cairo', Arial, sans-serif; line-height: 1.8; color: #333;">
                    <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #2c3e50; margin: 0;">قرار إداري</h2>
                        <p style="color: #6c757d; margin: 5px 0;">رقم: 001/2024</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #007bff;">${orgData.organizationName}</h3>
                    </div>

                    <div style="margin: 20px 0;">
                        <p><strong>بناءً على الصلاحيات المخولة لي،</strong></p>
                        <p><strong>وبعد الاطلاع على اللوائح والأنظمة المعمول بها،</strong></p>
                        <p style="margin-top: 20px;"><strong>أقرر ما يلي:</strong></p>
                    </div>

                    <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <p><strong>1.</strong> محتوى القرار الإداري</p>
                        <p><strong>2.</strong> يعمل بهذا القرار من تاريخ صدوره</p>
                        <p><strong>3.</strong> على الجهات المختصة تنفيذ هذا القرار</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                        <p><strong>${orgData.managerPosition}</strong></p>
                        <p><strong>${orgData.managerName}</strong></p>
                        <p style="color: #6c757d;">التاريخ: ${currentDate}</p>
                    </div>
                </div>
            `;

        case 'assignment':
            return `
                <div style="font-family: 'Cairo', Arial, sans-serif; line-height: 1.8; color: #333;">
                    <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #2c3e50; margin: 0;">قرار تكليف</h2>
                        <p style="color: #6c757d; margin: 5px 0;">رقم: 001/2024</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #007bff;">${orgData.organizationName}</h3>
                    </div>

                    <div style="margin: 20px 0;">
                        <p><strong>بناءً على احتياجات العمل ومتطلبات الخدمة،</strong></p>
                    </div>

                    <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                        <p><strong>يكلف السيد/ة:</strong> [اسم الموظف]</p>
                        <p><strong>المنصب:</strong> [المنصب الحالي]</p>
                        <p><strong>بالقيام بمهام:</strong> [المهام الجديدة]</p>
                        <p><strong>لمدة:</strong> [المدة المحددة]</p>
                        <p><strong>اعتباراً من تاريخ:</strong> ${currentDate}</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                        <p><strong>${orgData.managerPosition}</strong></p>
                        <p><strong>${orgData.managerName}</strong></p>
                        <p style="color: #6c757d;">التاريخ: ${currentDate}</p>
                    </div>
                </div>
            `;

        case 'certificate':
            return `
                <div style="font-family: 'Cairo', Arial, sans-serif; line-height: 1.8; color: #333;">
                    <div style="text-align: center; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 2rem;">شهادة تقدير وعرفان</h2>
                    </div>

                    <div style="margin-bottom: 20px; text-align: center;">
                        <h3 style="color: #007bff;">${orgData.organizationName}</h3>
                    </div>

                    <div style="margin: 30px 0; text-align: center; padding: 20px; background: #fff3cd; border-radius: 10px;">
                        <p style="font-size: 1.2rem;"><strong>تتقدم إدارة ${orgData.organizationName}</strong></p>
                        <p style="font-size: 1.2rem;"><strong>بالشكر والتقدير للسيد/ة: [اسم الموظف]</strong></p>
                        <p style="margin: 20px 0;"><strong>وذلك لـ: [سبب التقدير]</strong></p>
                        <p>نظراً لجهوده المتميزة وإخلاصه في العمل</p>
                        <p>وحرصه على تطوير الأداء وتحقيق الأهداف</p>
                        <p style="margin-top: 20px; font-style: italic;">مع أطيب التمنيات بالتوفيق والنجاح</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                        <p><strong>${orgData.managerPosition}</strong></p>
                        <p><strong>${orgData.managerName}</strong></p>
                        <p style="color: #6c757d;">التاريخ: ${currentDate}</p>
                    </div>
                </div>
            `;

        case 'extension':
            return `
                <div style="font-family: 'Cairo', Arial, sans-serif; line-height: 1.8; color: #333;">
                    <div style="text-align: center; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: white; margin: 0;">قرار تمديد تكليف</h2>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0;">رقم: 001/2024</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #007bff;">${orgData.organizationName}</h3>
                    </div>

                    <div style="margin: 20px 0;">
                        <p><strong>بناءً على حسن الأداء ونجاح التكليف السابق،</strong></p>
                    </div>

                    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 8px;">
                        <p><strong>يمدد تكليف السيد/ة:</strong> [اسم الموظف]</p>
                        <p><strong>في منصب:</strong> [المنصب]</p>
                        <p><strong>لمدة إضافية:</strong> [فترة التمديد]</p>
                        <p><strong>من تاريخ:</strong> ${currentDate}</p>
                        <p><strong>حتى تاريخ:</strong> [تاريخ الانتهاء]</p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                        <p><strong>${orgData.managerPosition}</strong></p>
                        <p><strong>${orgData.managerName}</strong></p>
                        <p style="color: #6c757d;">التاريخ: ${currentDate}</p>
                    </div>
                </div>
            `;

        default:
            return '<p>نموذج غير متوفر</p>';
    }
}

// إنشاء نموذج إداري
async function createAdminTemplate(templateType) {
    if (!organizationData.organizationName) {
        showNotification('يرجى حفظ معلومات المنشأة أولاً', 'error');
        return;
    }

    showNotification('جاري إنشاء النموذج الإداري...', 'info');

    // بيانات النموذج الأساسية
    const templateData = {
        templateType: templateType,
        organizationName: organizationData.organizationName,
        managerName: organizationData.managerName,
        managerPosition: organizationData.managerPosition
    };

    // إضافة بيانات إضافية حسب نوع النموذج
    switch(templateType) {
        case 'decision':
            templateData.decisionNumber = prompt('رقم القرار:') || '001/2024';
            templateData.content = prompt('محتوى القرار:') || 'محتوى القرار الإداري';
            break;
        case 'assignment':
            templateData.employeeName = prompt('اسم الموظف:') || 'اسم الموظف';
            templateData.currentPosition = prompt('المنصب الحالي:') || 'المنصب الحالي';
            templateData.newAssignment = prompt('المهام الجديدة:') || 'المهام الجديدة';
            templateData.duration = prompt('مدة التكليف:') || 'سنة واحدة';
            break;
        case 'certificate':
            templateData.employeeName = prompt('اسم الموظف:') || 'اسم الموظف';
            templateData.reason = prompt('سبب التقدير:') || 'الأداء المتميز';
            break;
        case 'extension':
            templateData.employeeName = prompt('اسم الموظف:') || 'اسم الموظف';
            templateData.position = prompt('المنصب:') || 'المنصب';
            templateData.extensionPeriod = prompt('فترة التمديد:') || 'سنة واحدة';
            templateData.fromDate = prompt('من تاريخ:') || new Date().toLocaleDateString('ar-SA');
            templateData.toDate = prompt('حتى تاريخ:') || 'تاريخ الانتهاء';
            break;
    }

    try {
        const response = await fetch('generate_admin_template.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('تم إنشاء النموذج الإداري بنجاح');

            // تحميل الملف
            const link = document.createElement('a');
            link.href = result.file_url;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showNotification(result.message || 'خطأ في إنشاء النموذج', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// إضافة نموذج إداري جديد
function addNewAdminTemplate() {
    const templateName = prompt('أدخل اسم النموذج الإداري الجديد:');
    if (!templateName) return;

    const templateId = templateName.replace(/\s+/g, '_').toLowerCase();

    const newTemplate = document.createElement('div');
    newTemplate.className = 'template-item';
    newTemplate.innerHTML = `
        <h5>📄 ${templateName}</h5>
        <p>نموذج إداري مخصص</p>
        <div class="template-actions">
            <button class="action-btn btn-view" onclick="previewAdminTemplate('${templateId}')">👁️ معاينة</button>
            <button class="action-btn btn-download" onclick="createAdminTemplate('${templateId}')">📥 إنشاء</button>
            <button class="action-btn btn-delete" onclick="deleteAdminTemplate('${templateId}')">🗑️ حذف</button>
        </div>
    `;

    document.getElementById('adminTemplatesList').appendChild(newTemplate);
    showNotification(`تم إضافة النموذج: ${templateName}`);
}

// حذف نموذج إداري
function deleteAdminTemplate(templateId) {
    if (!confirm('هل أنت متأكد من حذف هذا النموذج؟')) return;

    const templateElement = event.target.closest('.template-item');
    if (templateElement) {
        templateElement.remove();
        showNotification('تم حذف النموذج');
    }
}

// تحميل محرر الإحداثيات
function loadCoordinatesEditor() {
    // تحميل الإحداثيات المحفوظة
    const savedCoordinates = localStorage.getItem('templateCoordinates');
    if (savedCoordinates) {
        currentCoordinates = JSON.parse(savedCoordinates);
    }

    // تهيئة العناصر القابلة للسحب
    initializeDraggableElements();

    // تهيئة نوع القالب
    updateTemplateType();

    // تحديث الإحصائيات
    updateCoordinatesStats();
}

// تهيئة العناصر القابلة للسحب
function initializeDraggableElements() {
    const draggableElements = document.querySelectorAll('.draggable-text');

    draggableElements.forEach(element => {
        // إضافة مستمعي الأحداث
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('click', selectElement);

        // تطبيق الإحداثيات المحفوظة
        const field = element.dataset.field;
        if (currentCoordinates[field]) {
            const coords = currentCoordinates[field];
            element.style.left = coords.x + 'px';
            element.style.top = coords.y + 'px';
            if (coords.fontSize) element.style.fontSize = coords.fontSize + 'px';
            if (coords.fontWeight) element.style.fontWeight = coords.fontWeight;
            if (coords.textAlign) element.style.textAlign = coords.textAlign;
        }
    });

    // إضافة مستمعي الأحداث العامة
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
}

// بدء السحب
function startDrag(e) {
    e.preventDefault();
    selectedElement = e.target;
    isDragging = true;

    selectedElement.classList.add('dragging');
    selectElement(e);

    const rect = selectedElement.getBoundingClientRect();
    const canvasRect = document.getElementById('templateCanvas').getBoundingClientRect();

    selectedElement.offsetX = e.clientX - rect.left;
    selectedElement.offsetY = e.clientY - rect.top;
}

// السحب
function drag(e) {
    if (!isDragging || !selectedElement) return;

    e.preventDefault();

    const canvasRect = document.getElementById('templateCanvas').getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - selectedElement.offsetX;
    const newY = e.clientY - canvasRect.top - selectedElement.offsetY;

    // التأكد من البقاء داخل الحدود
    const maxX = 800 - selectedElement.offsetWidth;
    const maxY = 600 - selectedElement.offsetHeight;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    selectedElement.style.left = constrainedX + 'px';
    selectedElement.style.top = constrainedY + 'px';

    // تحديث لوحة التحكم
    updatePositionControls(constrainedX, constrainedY);
}

// إنهاء السحب
function endDrag() {
    if (selectedElement) {
        selectedElement.classList.remove('dragging');

        // حفظ الموضع الجديد
        if (isDragging) {
            saveElementPosition();
        }
    }

    isDragging = false;
}

// تحديد عنصر
function selectElement(e) {
    // إزالة التحديد من جميع العناصر
    document.querySelectorAll('.draggable-text').forEach(el => {
        el.classList.remove('selected');
    });

    // تحديد العنصر الحالي
    const element = e.target;
    element.classList.add('selected');
    selectedElement = element;

    // تحديث لوحة التحكم
    updateSelectedElementInfo();
}

// تحديث معلومات العنصر المحدد
function updateSelectedElementInfo() {
    if (!selectedElement) return;

    const field = selectedElement.dataset.field;
    const fieldNames = {
        // عناصر البطاقات
        'line1': 'السطر الأول',
        'line2': 'السطر الثاني',
        'line3': 'السطر الثالث',
        'employeeName': 'اسم الموظف',
        'position': 'المنصب',
        'department': 'الإدارة',
        'organization': 'المؤسسة',
        'signature': 'التوقيع',
        'photo': 'صورة الموظف',
        // عناصر النماذج الإدارية
        'admin_header': 'عنوان النموذج',
        'admin_organization': 'اسم المنشأة',
        'admin_number': 'رقم النموذج',
        'admin_content': 'المحتوى الرئيسي',
        'admin_employee': 'بيانات الموظف',
        'admin_manager_position': 'منصب المدير',
        'admin_manager_name': 'اسم المدير',
        'admin_date': 'التاريخ',
        'admin_logo': 'شعار المنشأة'
    };

    const elementName = document.getElementById('selectedElementName');
    if (elementName) {
        elementName.textContent = fieldNames[field] || field;
    }

    // إظهار عناصر التحكم
    const positionControls = document.getElementById('positionControls');
    if (positionControls) {
        positionControls.style.display = 'block';
    }

    // تحديث القيم
    const rect = selectedElement.getBoundingClientRect();
    const canvasRect = document.getElementById('templateCanvas').getBoundingClientRect();

    const x = parseInt(selectedElement.style.left) || 0;
    const y = parseInt(selectedElement.style.top) || 0;

    document.getElementById('elementX').value = x;
    document.getElementById('elementY').value = y;
    document.getElementById('elementFontSize').value = parseInt(getComputedStyle(selectedElement).fontSize);
    document.getElementById('elementFontWeight').value = getComputedStyle(selectedElement).fontWeight;
    document.getElementById('elementTextAlign').value = getComputedStyle(selectedElement).textAlign;
}

// تحديث موضع العنصر من لوحة التحكم
function updateElementPosition() {
    if (!selectedElement) return;

    const x = parseInt(document.getElementById('elementX').value);
    const y = parseInt(document.getElementById('elementY').value);

    selectedElement.style.left = x + 'px';
    selectedElement.style.top = y + 'px';

    saveElementPosition();
}

// تحديث نمط العنصر
function updateElementStyle() {
    if (!selectedElement) return;

    const fontSize = document.getElementById('elementFontSize').value;
    const fontWeight = document.getElementById('elementFontWeight').value;
    const textAlign = document.getElementById('elementTextAlign').value;

    selectedElement.style.fontSize = fontSize + 'px';
    selectedElement.style.fontWeight = fontWeight;
    selectedElement.style.textAlign = textAlign;

    saveElementPosition();
}

// حفظ موضع العنصر
function saveElementPosition() {
    if (!selectedElement) return;

    const field = selectedElement.dataset.field;
    const x = parseInt(selectedElement.style.left) || 0;
    const y = parseInt(selectedElement.style.top) || 0;
    const fontSize = parseInt(selectedElement.style.fontSize) || 16;
    const fontWeight = selectedElement.style.fontWeight || 'normal';
    const textAlign = selectedElement.style.textAlign || 'right';

    currentCoordinates[field] = { x, y, fontSize, fontWeight, textAlign };

    // تحديث الإحصائيات
    updateCoordinatesStats();
}

// تحديث لوحة التحكم بالموضع
function updatePositionControls(x, y) {
    document.getElementById('elementX').value = Math.round(x);
    document.getElementById('elementY').value = Math.round(y);
}

// تحديث الإحصائيات
function updateCoordinatesStats() {
    const elementsCount = document.getElementById('elementsCount');
    const lastUpdate = document.getElementById('lastUpdate');
    const templateType = document.getElementById('templateType');

    if (elementsCount) {
        elementsCount.textContent = Object.keys(currentCoordinates).length;
    }

    if (lastUpdate) {
        lastUpdate.textContent = new Date().toLocaleString('ar-SA');
    }

    if (templateType) {
        const templateSelect = document.getElementById('coordinateTemplate');
        const selectedTemplate = templateSelect?.value || '';

        if (selectedTemplate.startsWith('admin_')) {
            templateType.textContent = 'نموذج إداري';
        } else {
            templateType.textContent = 'بطاقة تهنئة';
        }
    }
}

// تحديث نوع القالب
function updateTemplateType() {
    const templateSelect = document.getElementById('coordinateTemplate');
    const selectedTemplate = templateSelect.value;

    const templateCanvas = document.getElementById('templateCanvas');
    const adminCanvas = document.getElementById('adminCanvas');

    if (selectedTemplate.startsWith('admin_')) {
        // إخفاء قالب البطاقات وإظهار قالب النماذج الإدارية
        templateCanvas.style.display = 'none';
        adminCanvas.style.display = 'block';

        // تحديث محتوى النموذج الإداري حسب النوع
        updateAdminTemplateContent(selectedTemplate);
    } else {
        // إظهار قالب البطاقات وإخفاء قالب النماذج الإدارية
        templateCanvas.style.display = 'block';
        adminCanvas.style.display = 'none';
    }
}

// تحديث محتوى النموذج الإداري
function updateAdminTemplateContent(templateType) {
    const adminCanvas = document.getElementById('adminCanvas');
    const headerElement = adminCanvas.querySelector('[data-field="admin_header"]');
    const contentElement = adminCanvas.querySelector('[data-field="admin_content"]');

    const templates = {
        'admin_decision': {
            header: 'قرار إداري',
            content: 'بناءً على الصلاحيات المخولة لي،<br>وبعد الاطلاع على اللوائح والأنظمة المعمول بها،<br><br>أقرر ما يلي:<br>1. محتوى القرار<br>2. يعمل بهذا القرار من تاريخ صدوره'
        },
        'admin_assignment': {
            header: 'قرار تكليف',
            content: 'بناءً على احتياجات العمل ومتطلبات الخدمة،<br><br>يكلف السيد/ة: [اسم الموظف]<br>المنصب: [المنصب الحالي]<br>بالقيام بمهام: [المهام الجديدة]'
        },
        'admin_certificate': {
            header: 'شهادة تقدير وعرفان',
            content: 'تتقدم إدارة المركز<br>بالشكر والتقدير للسيد/ة: [اسم الموظف]<br><br>وذلك لجهوده المتميزة وإخلاصه في العمل<br>مع أطيب التمنيات بالتوفيق والنجاح'
        },
        'admin_extension': {
            header: 'قرار تمديد تكليف',
            content: 'بناءً على حسن الأداء ونجاح التكليف السابق،<br><br>يمدد تكليف السيد/ة: [اسم الموظف]<br>في منصب: [المنصب]<br>لمدة إضافية: [فترة التمديد]'
        }
    };

    const template = templates[templateType];
    if (template) {
        headerElement.innerHTML = template.header;
        contentElement.innerHTML = template.content;

        // تحديث لون الهيدر حسب النوع
        const colors = {
            'admin_decision': '#007bff',
            'admin_assignment': '#28a745',
            'admin_certificate': '#ffc107',
            'admin_extension': '#17a2b8'
        };
        headerElement.style.background = colors[templateType] || '#007bff';
    }
}

// تحميل قالب للتحرير
function loadTemplateForEditing() {
    const templateSelect = document.getElementById('coordinateTemplate');
    const selectedTemplate = templateSelect.value;

    if (selectedTemplate.startsWith('admin_')) {
        // تحميل النموذج الإداري
        updateTemplateType();

        // تحميل الإحداثيات المحفوظة للنموذج الإداري
        const savedCoordinates = localStorage.getItem(`coordinates_${selectedTemplate}`);
        if (savedCoordinates) {
            currentCoordinates = JSON.parse(savedCoordinates);
            applyCoordinatesToElements();
        } else {
            // إحداثيات افتراضية للنماذج الإدارية
            currentCoordinates = getDefaultAdminCoordinates();
            applyCoordinatesToElements();
        }
    } else {
        // تحميل قالب البطاقات
        updateTemplateType();

        const templateCanvas = document.getElementById('templateCanvas');
        const colors = {
            'template1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'template2': 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
            'template3': 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
        };

        templateCanvas.style.background = colors[selectedTemplate] || colors['template1'];

        // تحميل الإحداثيات المحفوظة للقالب
        const savedCoordinates = localStorage.getItem(`coordinates_${selectedTemplate}`);
        if (savedCoordinates) {
            currentCoordinates = JSON.parse(savedCoordinates);
            applyCoordinatesToElements();
        }
    }

    showNotification(`تم تحميل ${templateSelect.options[templateSelect.selectedIndex].text}`);
}

// الحصول على الإحداثيات الافتراضية للنماذج الإدارية
function getDefaultAdminCoordinates() {
    return {
        'admin_header': { x: 300, y: 20, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
        'admin_organization': { x: 50, y: 120, fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
        'admin_number': { x: 50, y: 180, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'admin_content': { x: 50, y: 250, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'admin_employee': { x: 50, y: 500, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'admin_manager_position': { x: 50, y: 850, fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
        'admin_manager_name': { x: 50, y: 890, fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
        'admin_date': { x: 650, y: 930, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
        'admin_logo': { x: 720, y: 120, fontSize: 16, fontWeight: 'normal', textAlign: 'center' }
    };
}

// تطبيق الإحداثيات على العناصر
function applyCoordinatesToElements() {
    document.querySelectorAll('.draggable-text').forEach(element => {
        const field = element.dataset.field;
        if (currentCoordinates[field]) {
            const coords = currentCoordinates[field];
            element.style.left = coords.x + 'px';
            element.style.top = coords.y + 'px';
            element.style.fontSize = (coords.fontSize || 16) + 'px';
            element.style.fontWeight = coords.fontWeight || 'normal';
            element.style.textAlign = coords.textAlign || 'right';
        }
    });
}

// حفظ الإحداثيات
async function saveCoordinates() {
    const templateSelect = document.getElementById('coordinateTemplate');
    const selectedTemplate = templateSelect.value;

    try {
        // حفظ في localStorage
        localStorage.setItem(`coordinates_${selectedTemplate}`, JSON.stringify(currentCoordinates));
        localStorage.setItem('templateCoordinates', JSON.stringify(currentCoordinates));

        // إرسال للخادم
        const response = await fetch('admin_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'save_coordinates',
                template: selectedTemplate,
                coordinates: currentCoordinates
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('تم حفظ الإحداثيات بنجاح');
            updateCoordinatesStats();
        } else {
            showNotification(result.message || 'خطأ في حفظ الإحداثيات', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// إعادة تعيين الإحداثيات
function resetCoordinates() {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإحداثيات؟')) return;

    currentCoordinates = {};

    // إعادة تعيين مواضع العناصر للافتراضي
    resetToDefault();

    showNotification('تم إعادة تعيين الإحداثيات');
}

// توسيط جميع العناصر
function centerAllElements() {
    document.querySelectorAll('.draggable-text').forEach(element => {
        const field = element.dataset.field;

        // حساب الموضع المتوسط
        const centerX = (800 - element.offsetWidth) / 2;
        let centerY;

        // توزيع العناصر عمودياً
        const index = Array.from(element.parentNode.children).indexOf(element);
        centerY = 50 + (index * 60);

        element.style.left = centerX + 'px';
        element.style.top = centerY + 'px';

        currentCoordinates[field] = {
            x: centerX,
            y: centerY,
            fontSize: parseInt(element.style.fontSize) || 16,
            fontWeight: element.style.fontWeight || 'normal',
            textAlign: 'center'
        };

        element.style.textAlign = 'center';
    });

    updateCoordinatesStats();
    showNotification('تم توسيط جميع العناصر');
}

// العودة للافتراضي
function resetToDefault() {
    const templateSelect = document.getElementById('coordinateTemplate');
    const selectedTemplate = templateSelect.value;

    if (selectedTemplate.startsWith('admin_')) {
        // إحداثيات افتراضية للنماذج الإدارية
        currentCoordinates = getDefaultAdminCoordinates();
    } else {
        // إحداثيات افتراضية للبطاقات
        currentCoordinates = {
            'line1': { x: 300, y: 50, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
            'line2': { x: 300, y: 90, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
            'line3': { x: 300, y: 130, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
            'employeeName': { x: 50, y: 200, fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
            'position': { x: 50, y: 240, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
            'department': { x: 50, y: 270, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
            'organization': { x: 300, y: 480, fontSize: 14, fontWeight: 'normal', textAlign: 'center' },
            'signature': { x: 325, y: 520, fontSize: 16, fontWeight: 'normal', textAlign: 'center' },
            'photo': { x: 630, y: 180, fontSize: 16, fontWeight: 'normal', textAlign: 'center' }
        };
    }

    applyCoordinatesToElements();
    updateCoordinatesStats();
}

// تصدير الإحداثيات
function exportCoordinates() {
    const templateSelect = document.getElementById('coordinateTemplate');
    const selectedTemplate = templateSelect.value;

    const exportData = {
        template: selectedTemplate,
        coordinates: currentCoordinates,
        exported_at: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `coordinates_${selectedTemplate}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('تم تصدير الإحداثيات');
}

// ===== وظائف إدارة الحقول المخصصة =====

// تحميل الحقول المخصصة
function loadCustomFields() {
    const savedFields = localStorage.getItem('customFields');
    if (savedFields) {
        customFields = JSON.parse(savedFields);
    }

    // تحميل إعدادات الحقول الافتراضية
    loadDefaultFieldsConfig();

    displayCustomFields();
    setupFieldsSorting();
}

// عرض الحقول المخصصة
function displayCustomFields() {
    const container = document.getElementById('currentFields');
    if (!container) return;

    // إضافة الحقول المخصصة بعد الحقول الافتراضية
    customFields.forEach(field => {
        const fieldElement = createFieldElement(field, true);
        container.appendChild(fieldElement);
    });
}

// إنشاء عنصر حقل
function createFieldElement(field, isCustom = false) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = `field-item ${isCustom ? 'custom-field' : 'default-field'}`;
    fieldDiv.dataset.field = field.id || field.name;

    const typeLabels = {
        'text': 'نص',
        'number': 'رقم',
        'date': 'تاريخ',
        'select': 'قائمة',
        'textarea': 'نص طويل',
        'email': 'بريد',
        'phone': 'هاتف'
    };

    fieldDiv.innerHTML = `
        <div class="field-header">
            <span class="drag-handle">⋮⋮</span>
            <span class="field-name">${field.name}</span>
            <span class="field-type">${typeLabels[field.type] || field.type}</span>
        </div>
        <div class="field-actions">
            ${isCustom ? `
                <button class="action-btn btn-edit" onclick="editCustomField('${field.id}')">✏️</button>
                <button class="action-btn btn-delete" onclick="deleteCustomField('${field.id}')">🗑️</button>
            ` : `
                <span class="field-status">افتراضي</span>
            `}
        </div>
    `;

    return fieldDiv;
}

// تحديث خيارات الحقل
function updateFieldOptions() {
    const fieldType = document.getElementById('fieldType').value;
    const selectOptions = document.getElementById('selectOptions');

    if (fieldType === 'select') {
        selectOptions.style.display = 'block';
    } else {
        selectOptions.style.display = 'none';
    }
}

// إضافة حقل مخصص
function addCustomField() {
    const fieldName = document.getElementById('fieldName').value.trim();
    const fieldType = document.getElementById('fieldType').value;
    const fieldOptions = document.getElementById('fieldOptions').value;
    const fieldRequired = document.getElementById('fieldRequired').checked;
    const fieldHelp = document.getElementById('fieldHelp').value.trim();

    if (!fieldName) {
        showNotification('يرجى إدخال اسم الحقل', 'error');
        return;
    }

    // التحقق من عدم تكرار الاسم
    const existingField = customFields.find(field => field.name === fieldName);
    if (existingField) {
        showNotification('اسم الحقل موجود بالفعل', 'error');
        return;
    }

    const newField = {
        id: 'custom_' + Date.now(),
        name: fieldName,
        type: fieldType,
        required: fieldRequired,
        help: fieldHelp,
        options: fieldType === 'select' ? fieldOptions.split('\n').filter(opt => opt.trim()) : null,
        created_at: new Date().toISOString()
    };

    customFields.push(newField);
    saveCustomFields();

    // إضافة الحقل للعرض
    const container = document.getElementById('currentFields');
    const fieldElement = createFieldElement(newField, true);
    container.appendChild(fieldElement);

    // إعادة تعيين النموذج
    document.getElementById('customFieldForm').reset();
    updateFieldOptions();

    showNotification('تم إضافة الحقل بنجاح');
}

// حفظ الحقول المخصصة
function saveCustomFields() {
    localStorage.setItem('customFields', JSON.stringify(customFields));
}

// تحرير حقل مخصص
function editCustomField(fieldId) {
    const field = customFields.find(f => f.id === fieldId);
    if (!field) return;

    // ملء النموذج ببيانات الحقل
    document.getElementById('fieldName').value = field.name;
    document.getElementById('fieldType').value = field.type;
    document.getElementById('fieldRequired').checked = field.required;
    document.getElementById('fieldHelp').value = field.help || '';

    if (field.type === 'select' && field.options) {
        document.getElementById('fieldOptions').value = field.options.join('\n');
    }

    updateFieldOptions();

    // تغيير زر الإرسال
    const submitBtn = document.querySelector('#customFieldForm button[type="submit"]');
    submitBtn.textContent = '✅ تحديث الحقل';
    submitBtn.onclick = function() {
        updateCustomField(fieldId);
        return false;
    };
}

// تحديث حقل مخصص
function updateCustomField(fieldId) {
    const fieldIndex = customFields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const fieldName = document.getElementById('fieldName').value.trim();
    const fieldType = document.getElementById('fieldType').value;
    const fieldOptions = document.getElementById('fieldOptions').value;
    const fieldRequired = document.getElementById('fieldRequired').checked;
    const fieldHelp = document.getElementById('fieldHelp').value.trim();

    if (!fieldName) {
        showNotification('يرجى إدخال اسم الحقل', 'error');
        return;
    }

    // تحديث الحقل
    customFields[fieldIndex] = {
        ...customFields[fieldIndex],
        name: fieldName,
        type: fieldType,
        required: fieldRequired,
        help: fieldHelp,
        options: fieldType === 'select' ? fieldOptions.split('\n').filter(opt => opt.trim()) : null,
        updated_at: new Date().toISOString()
    };

    saveCustomFields();

    // إعادة تحميل العرض
    loadCustomFields();

    // إعادة تعيين النموذج
    document.getElementById('customFieldForm').reset();
    updateFieldOptions();

    const submitBtn = document.querySelector('#customFieldForm button[type="submit"]');
    submitBtn.textContent = '✅ إضافة الحقل';
    submitBtn.onclick = null;

    showNotification('تم تحديث الحقل بنجاح');
}

// حذف حقل مخصص
function deleteCustomField(fieldId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحقل؟')) return;

    customFields = customFields.filter(f => f.id !== fieldId);
    saveCustomFields();

    // إزالة العنصر من العرض
    const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
    if (fieldElement) {
        fieldElement.remove();
    }

    showNotification('تم حذف الحقل');
}

// إعداد ترتيب الحقول بالسحب والإفلات
function setupFieldsSorting() {
    // يمكن إضافة مكتبة Sortable.js هنا للسحب والإفلات
    // أو تنفيذ السحب والإفلات يدوياً
}

// حفظ ترتيب الحقول
function saveFieldsConfiguration() {
    const container = document.getElementById('currentFields');
    const fieldElements = container.querySelectorAll('.field-item');

    const fieldsOrder = Array.from(fieldElements).map((element, index) => ({
        field: element.dataset.field,
        order: index,
        isCustom: element.classList.contains('custom-field')
    }));

    localStorage.setItem('fieldsOrder', JSON.stringify(fieldsOrder));
    showNotification('تم حفظ ترتيب الحقول');
}

// استعادة الترتيب الافتراضي للحقول
function resetFieldsToDefault() {
    if (!confirm('هل أنت متأكد من استعادة الترتيب الافتراضي؟')) return;

    localStorage.removeItem('fieldsOrder');

    // إعادة تحميل الحقول
    const container = document.getElementById('currentFields');
    const customFieldElements = container.querySelectorAll('.custom-field');
    customFieldElements.forEach(el => el.remove());

    loadCustomFields();
    showNotification('تم استعادة الترتيب الافتراضي');
}

// ===== وظائف إدارة الحقول الافتراضية =====

// تحميل إعدادات الحقول الافتراضية
function loadDefaultFieldsConfig() {
    const savedConfig = localStorage.getItem('defaultFieldsConfig');
    if (savedConfig) {
        defaultFieldsConfig = JSON.parse(savedConfig);
    }

    const savedHidden = localStorage.getItem('hiddenDefaultFields');
    if (savedHidden) {
        hiddenDefaultFields = JSON.parse(savedHidden);
    }

    // تطبيق الحالة المحفوظة على العناصر
    applyDefaultFieldsState();
}

// تطبيق حالة الحقول الافتراضية
function applyDefaultFieldsState() {
    hiddenDefaultFields.forEach(fieldId => {
        const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
        if (fieldElement) {
            fieldElement.classList.add('hidden');
            const statusSpan = fieldElement.querySelector('.field-status');
            const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

            if (statusSpan) {
                statusSpan.textContent = 'مخفي';
                statusSpan.classList.add('hidden');
            }

            if (toggleBtn) {
                toggleBtn.classList.add('hidden-field');
                toggleBtn.title = 'إظهار الحقل';
                toggleBtn.textContent = '👁️‍🗨️';
            }
        }
    });

    // تطبيق التخصيصات المحفوظة
    Object.entries(defaultFieldsConfig).forEach(([fieldId, config]) => {
        const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
        if (fieldElement && config.customName) {
            const nameSpan = fieldElement.querySelector('.field-name');
            if (nameSpan) {
                nameSpan.textContent = config.customName;
            }
        }
    });
}

// تعديل حقل افتراضي
function editDefaultField(fieldId) {
    const defaultNames = {
        'line1': 'السطر الأول',
        'line2': 'السطر الثاني',
        'line3': 'السطر الثالث',
        'employeeName': 'اسم الموظف',
        'position': 'المنصب',
        'department': 'الإدارة',
        'organization': 'المؤسسة',
        'signature': 'التوقيع',
        'photo': 'صورة الموظف'
    };

    const currentConfig = defaultFieldsConfig[fieldId] || {};
    const currentName = currentConfig.customName || defaultNames[fieldId];

    // إنشاء نافذة تعديل
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(5px);
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 0; border-radius: 15px; max-width: 500px; width: 90%; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 20px 25px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.3rem;">✏️ تعديل الحقل الافتراضي</h3>
                <span style="font-size: 1.8rem; cursor: pointer; line-height: 1;" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 25px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">اسم الحقل المخصص:</label>
                    <input type="text" id="customFieldName" value="${currentName}"
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;"
                           placeholder="أدخل الاسم المخصص للحقل">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">نص المساعدة:</label>
                    <textarea id="customFieldHelp" rows="3"
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.9rem; resize: vertical;"
                              placeholder="نص توضيحي يظهر للمستخدم (اختياري)">${currentConfig.help || ''}</textarea>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">إعدادات إضافية:</label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="fieldRequired" ${currentConfig.required ? 'checked' : ''}>
                            <span>حقل مطلوب</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="fieldVisible" ${!hiddenDefaultFields.includes(fieldId) ? 'checked' : ''}>
                            <span>مرئي في النماذج</span>
                        </label>
                    </div>
                </div>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 0.85rem; color: #6c757d;">
                        <strong>ملاحظة:</strong> تعديل الحقول الافتراضية يؤثر على جميع النماذج الجديدة.
                        الحقول المخفية لن تظهر في نماذج إنشاء البطاقات.
                    </p>
                </div>
            </div>
            <div style="padding: 20px 25px; background: #f8f9fa; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #dee2e6;">
                <button onclick="saveDefaultFieldEdit('${fieldId}')" class="btn btn-success" style="padding: 8px 20px;">💾 حفظ التغييرات</button>
                <button onclick="resetDefaultField('${fieldId}')" class="btn btn-warning" style="padding: 8px 20px;">🔄 استعادة الافتراضي</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary" style="padding: 8px 20px;">إلغاء</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // التركيز على حقل الاسم
    setTimeout(() => {
        const nameInput = document.getElementById('customFieldName');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }, 100);

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// حفظ تعديل الحقل الافتراضي
function saveDefaultFieldEdit(fieldId) {
    const customName = document.getElementById('customFieldName').value.trim();
    const customHelp = document.getElementById('customFieldHelp').value.trim();
    const isRequired = document.getElementById('fieldRequired').checked;
    const isVisible = document.getElementById('fieldVisible').checked;

    if (!customName) {
        showNotification('يرجى إدخال اسم للحقل', 'error');
        return;
    }

    // حفظ التكوين
    defaultFieldsConfig[fieldId] = {
        customName: customName,
        help: customHelp,
        required: isRequired,
        updated_at: new Date().toISOString()
    };

    // تحديث حالة الإخفاء/الإظهار
    if (isVisible) {
        hiddenDefaultFields = hiddenDefaultFields.filter(id => id !== fieldId);
    } else {
        if (!hiddenDefaultFields.includes(fieldId)) {
            hiddenDefaultFields.push(fieldId);
        }
    }

    // حفظ في localStorage
    localStorage.setItem('defaultFieldsConfig', JSON.stringify(defaultFieldsConfig));
    localStorage.setItem('hiddenDefaultFields', JSON.stringify(hiddenDefaultFields));

    // تطبيق التغييرات على العنصر
    const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
    if (fieldElement) {
        const nameSpan = fieldElement.querySelector('.field-name');
        if (nameSpan) {
            nameSpan.textContent = customName;
        }

        // تحديث حالة الإخفاء/الإظهار
        if (isVisible) {
            fieldElement.classList.remove('hidden');
            const statusSpan = fieldElement.querySelector('.field-status');
            const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

            if (statusSpan) {
                statusSpan.textContent = 'افتراضي';
                statusSpan.classList.remove('hidden');
            }

            if (toggleBtn) {
                toggleBtn.classList.remove('hidden-field');
                toggleBtn.title = 'إخفاء الحقل';
                toggleBtn.textContent = '👁️';
            }
        } else {
            fieldElement.classList.add('hidden');
            const statusSpan = fieldElement.querySelector('.field-status');
            const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

            if (statusSpan) {
                statusSpan.textContent = 'مخفي';
                statusSpan.classList.add('hidden');
            }

            if (toggleBtn) {
                toggleBtn.classList.add('hidden-field');
                toggleBtn.title = 'إظهار الحقل';
                toggleBtn.textContent = '👁️‍🗨️';
            }
        }
    }

    showNotification(`تم حفظ تعديلات "${customName}" بنجاح`);

    // إغلاق النافذة
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
}

// استعادة الحقل الافتراضي
function resetDefaultField(fieldId) {
    if (!confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية لهذا الحقل؟')) return;

    const defaultNames = {
        'line1': 'السطر الأول',
        'line2': 'السطر الثاني',
        'line3': 'السطر الثالث',
        'employeeName': 'اسم الموظف',
        'position': 'المنصب',
        'department': 'الإدارة',
        'organization': 'المؤسسة',
        'signature': 'التوقيع',
        'photo': 'صورة الموظف'
    };

    // حذف التكوين المخصص
    delete defaultFieldsConfig[fieldId];
    hiddenDefaultFields = hiddenDefaultFields.filter(id => id !== fieldId);

    // حفظ التغييرات
    localStorage.setItem('defaultFieldsConfig', JSON.stringify(defaultFieldsConfig));
    localStorage.setItem('hiddenDefaultFields', JSON.stringify(hiddenDefaultFields));

    // تطبيق الاستعادة على العنصر
    const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
    if (fieldElement) {
        const nameSpan = fieldElement.querySelector('.field-name');
        if (nameSpan) {
            nameSpan.textContent = defaultNames[fieldId];
        }

        fieldElement.classList.remove('hidden');
        const statusSpan = fieldElement.querySelector('.field-status');
        const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

        if (statusSpan) {
            statusSpan.textContent = 'افتراضي';
            statusSpan.classList.remove('hidden');
        }

        if (toggleBtn) {
            toggleBtn.classList.remove('hidden-field');
            toggleBtn.title = 'إخفاء الحقل';
            toggleBtn.textContent = '👁️';
        }
    }

    showNotification(`تم استعادة "${defaultNames[fieldId]}" للإعدادات الافتراضية`);

    // إغلاق النافذة
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
}

// إخفاء/إظهار حقل افتراضي
function toggleDefaultField(fieldId) {
    const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
    if (!fieldElement) return;

    const isHidden = hiddenDefaultFields.includes(fieldId);
    const statusSpan = fieldElement.querySelector('.field-status');
    const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

    if (isHidden) {
        // إظهار الحقل
        hiddenDefaultFields = hiddenDefaultFields.filter(id => id !== fieldId);
        fieldElement.classList.remove('hidden');

        if (statusSpan) {
            statusSpan.textContent = 'افتراضي';
            statusSpan.classList.remove('hidden');
        }

        if (toggleBtn) {
            toggleBtn.classList.remove('hidden-field');
            toggleBtn.title = 'إخفاء الحقل';
            toggleBtn.textContent = '👁️';
        }

        showNotification('تم إظهار الحقل');
    } else {
        // إخفاء الحقل
        hiddenDefaultFields.push(fieldId);
        fieldElement.classList.add('hidden');

        if (statusSpan) {
            statusSpan.textContent = 'مخفي';
            statusSpan.classList.add('hidden');
        }

        if (toggleBtn) {
            toggleBtn.classList.add('hidden-field');
            toggleBtn.title = 'إظهار الحقل';
            toggleBtn.textContent = '👁️‍🗨️';
        }

        showNotification('تم إخفاء الحقل');
    }

    // حفظ التغييرات
    localStorage.setItem('hiddenDefaultFields', JSON.stringify(hiddenDefaultFields));
}

// إظهار جميع الحقول الافتراضية
function showAllDefaultFields() {
    if (hiddenDefaultFields.length === 0) {
        showNotification('جميع الحقول مرئية بالفعل', 'info');
        return;
    }

    const hiddenCount = hiddenDefaultFields.length;
    hiddenDefaultFields = [];
    localStorage.setItem('hiddenDefaultFields', JSON.stringify(hiddenDefaultFields));

    // تطبيق التغييرات على جميع العناصر
    document.querySelectorAll('.field-item.default-field').forEach(fieldElement => {
        fieldElement.classList.remove('hidden');

        const statusSpan = fieldElement.querySelector('.field-status');
        const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

        if (statusSpan) {
            statusSpan.textContent = 'افتراضي';
            statusSpan.classList.remove('hidden');
        }

        if (toggleBtn) {
            toggleBtn.classList.remove('hidden-field');
            toggleBtn.title = 'إخفاء الحقل';
            toggleBtn.textContent = '👁️';
        }
    });

    showNotification(`تم إظهار ${hiddenCount} حقل مخفي`);
}

// استعادة جميع الحقول الافتراضية
function resetAllDefaultFields() {
    if (!confirm('هل أنت متأكد من استعادة جميع الحقول الافتراضية لإعداداتها الأصلية؟ سيتم فقدان جميع التخصيصات!')) return;

    const defaultNames = {
        'line1': 'السطر الأول',
        'line2': 'السطر الثاني',
        'line3': 'السطر الثالث',
        'employeeName': 'اسم الموظف',
        'position': 'المنصب',
        'department': 'الإدارة',
        'organization': 'المؤسسة',
        'signature': 'التوقيع',
        'photo': 'صورة الموظف'
    };

    // مسح جميع التخصيصات
    defaultFieldsConfig = {};
    hiddenDefaultFields = [];

    // حفظ التغييرات
    localStorage.setItem('defaultFieldsConfig', JSON.stringify(defaultFieldsConfig));
    localStorage.setItem('hiddenDefaultFields', JSON.stringify(hiddenDefaultFields));

    // تطبيق الاستعادة على جميع العناصر
    Object.entries(defaultNames).forEach(([fieldId, defaultName]) => {
        const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
        if (fieldElement) {
            const nameSpan = fieldElement.querySelector('.field-name');
            if (nameSpan) {
                nameSpan.textContent = defaultName;
            }

            fieldElement.classList.remove('hidden');
            const statusSpan = fieldElement.querySelector('.field-status');
            const toggleBtn = fieldElement.querySelector('.action-btn.btn-delete');

            if (statusSpan) {
                statusSpan.textContent = 'افتراضي';
                statusSpan.classList.remove('hidden');
            }

            if (toggleBtn) {
                toggleBtn.classList.remove('hidden-field');
                toggleBtn.title = 'إخفاء الحقل';
                toggleBtn.textContent = '👁️';
            }
        }
    });

    showNotification('تم استعادة جميع الحقول الافتراضية بنجاح');
}

// تصدير إعدادات الحقول
function exportFieldsConfiguration() {
    const fieldsConfig = {
        defaultFields: defaultFieldsConfig,
        hiddenFields: hiddenDefaultFields,
        customFields: customFields,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(fieldsConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `fields_configuration_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('تم تصدير إعدادات الحقول');
}

// استيراد إعدادات الحقول
function importFieldsConfiguration() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);

                if (!config.defaultFields && !config.customFields) {
                    showNotification('ملف الإعدادات غير صحيح', 'error');
                    return;
                }

                if (!confirm('هل أنت متأكد من استيراد هذه الإعدادات؟ سيتم استبدال الإعدادات الحالية.')) return;

                // تطبيق الإعدادات المستوردة
                if (config.defaultFields) {
                    defaultFieldsConfig = config.defaultFields;
                    localStorage.setItem('defaultFieldsConfig', JSON.stringify(defaultFieldsConfig));
                }

                if (config.hiddenFields) {
                    hiddenDefaultFields = config.hiddenFields;
                    localStorage.setItem('hiddenDefaultFields', JSON.stringify(hiddenDefaultFields));
                }

                if (config.customFields) {
                    customFields = config.customFields;
                    localStorage.setItem('customFields', JSON.stringify(customFields));
                }

                // إعادة تحميل العرض
                loadCustomFields();

                showNotification('تم استيراد إعدادات الحقول بنجاح');

            } catch (error) {
                showNotification('خطأ في قراءة ملف الإعدادات', 'error');
            }
        };

        reader.readAsText(file);
    };

    fileInput.click();
}

// ===== وظائف تعديل القوالب الشاملة =====

// تعديل تكوين قالب شامل
function editTemplateConfig(configId) {
    let config;

    if (configId === 'default') {
        // إنشاء تكوين افتراضي للتعديل
        config = {
            id: 'default',
            name: 'القالب الافتراضي',
            description: 'القالب الأساسي لبطاقات الموارد البشرية',
            fields: getDefaultFields(),
            coordinates: getDefaultCoordinates(),
            colors: getDefaultColors(),
            background: 'default'
        };
    } else {
        config = templateConfigurations.find(c => c.id === configId);
        if (!config) {
            showNotification('القالب غير موجود', 'error');
            return;
        }
    }

    // إنشاء نافذة التعديل الشاملة
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 1000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div class="modal-content" style="width: 95vw; max-width: 1400px; height: 95vh;">
            <div class="modal-header" style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);">
                <div>
                    <h2 style="margin: 0; font-size: 1.6rem;">✏️ تعديل القالب الشامل</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.85rem;">${config.name} - تعديل جميع المكونات</p>
                </div>
                <span style="font-size: 2rem; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.3s; padding: 5px;"
                      onclick="closeTemplateEditor()"
                      onmouseover="this.style.opacity='1'"
                      onmouseout="this.style.opacity='0.8'">&times;</span>
            </div>
            <div class="modal-body" style="padding: 0;">
                ${generateTemplateEditor(config)}
            </div>
            <div class="modal-footer">
                <button onclick="saveTemplateChanges('${config.id}')" class="btn btn-success">💾 حفظ جميع التغييرات</button>
                <button onclick="previewTemplateChanges()" class="btn btn-info">👁️ معاينة التغييرات</button>
                <button onclick="resetTemplateChanges()" class="btn btn-warning">🔄 إعادة تعيين</button>
                <button onclick="closeTemplateEditor()" class="btn btn-secondary">إلغاء</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // حفظ مرجع للنافذة
    window.currentTemplateEditor = modal;
    window.currentEditingConfig = config;

    // تهيئة محرر القالب
    initializeTemplateEditor(config);
}

// إنشاء محرر القالب
function generateTemplateEditor(config) {
    return `
        <div style="display: grid; grid-template-columns: 300px 1fr 350px; height: 100%; gap: 0;">
            <!-- لوحة الأدوات اليسرى -->
            <div style="background: #f8f9fa; border-right: 1px solid #dee2e6; overflow-y: auto;">
                <div style="padding: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px;">⚙️ إعدادات القالب</h4>

                    <!-- معلومات أساسية -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">اسم القالب:</label>
                        <input type="text" id="templateName" value="${config.name}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">الوصف:</label>
                        <textarea id="templateDescription" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${config.description || ''}</textarea>
                    </div>

                    <!-- ألوان القالب -->
                    <h5 style="margin: 20px 0 10px 0; color: #2c3e50;">🎨 ألوان القالب</h5>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">اللون الأساسي:</label>
                        <input type="color" id="primaryColor" value="${config.colors?.primary || '#007bff'}" style="width: 100%; height: 40px; border: none; border-radius: 4px;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">اللون الثانوي:</label>
                        <input type="color" id="secondaryColor" value="${config.colors?.secondary || '#6c757d'}" style="width: 100%; height: 40px; border: none; border-radius: 4px;">
                    </div>

                    <!-- خلفية القالب -->
                    <h5 style="margin: 20px 0 10px 0; color: #2c3e50;">🖼️ خلفية القالب</h5>
                    <select id="templateBackground" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="default" ${config.background === 'default' ? 'selected' : ''}>افتراضي</option>
                        <option value="gradient1">تدرج أزرق</option>
                        <option value="gradient2">تدرج أخضر</option>
                        <option value="gradient3">تدرج ذهبي</option>
                    </select>

                    <!-- أدوات سريعة -->
                    <h5 style="margin: 20px 0 10px 0; color: #2c3e50;">⚡ أدوات سريعة</h5>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button onclick="addNewField()" class="btn btn-sm btn-primary">➕ إضافة حقل</button>
                        <button onclick="resetCoordinates()" class="btn btn-sm btn-warning">📍 إعادة تعيين المواضع</button>
                        <button onclick="autoArrangeFields()" class="btn btn-sm btn-info">🔄 ترتيب تلقائي</button>
                    </div>
                </div>
            </div>

            <!-- منطقة التحرير الوسطى -->
            <div style="background: #ffffff; position: relative; overflow: hidden;">
                <div style="padding: 20px; height: 100%; overflow: auto;">
                    <h4 style="margin: 0 0 15px 0; text-align: center; color: #2c3e50;">🎨 منطقة التحرير المرئي</h4>
                    <div id="visualEditor" style="
                        width: 800px; height: 600px; margin: 0 auto;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 15px; position: relative; transform: scale(0.8);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden;
                    ">
                        <!-- العناصر القابلة للسحب ستضاف هنا -->
                    </div>
                </div>
            </div>

            <!-- لوحة الحقول اليمنى -->
            <div style="background: #f8f9fa; border-left: 1px solid #dee2e6; overflow-y: auto;">
                <div style="padding: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 8px;">📋 إدارة الحقول</h4>

                    <!-- قائمة الحقول -->
                    <div id="fieldsManager">
                        <!-- الحقول ستضاف هنا ديناميكياً -->
                    </div>

                    <!-- إضافة حقل جديد -->
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #dee2e6;">
                        <h6 style="margin: 0 0 10px 0; color: #2c3e50;">➕ إضافة حقل جديد</h6>
                        <input type="text" id="newFieldName" placeholder="اسم الحقل" style="width: 100%; padding: 6px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <select id="newFieldType" style="width: 100%; padding: 6px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="text">نص</option>
                            <option value="number">رقم</option>
                            <option value="date">تاريخ</option>
                            <option value="select">قائمة</option>
                            <option value="textarea">نص طويل</option>
                        </select>
                        <button onclick="addFieldToTemplate()" class="btn btn-sm btn-success" style="width: 100%;">إضافة</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// الحصول على الحقول الافتراضية
function getDefaultFields() {
    return [
        { id: 'line1', name: 'السطر الأول', type: 'text', required: false },
        { id: 'line2', name: 'السطر الثاني', type: 'text', required: false },
        { id: 'line3', name: 'السطر الثالث', type: 'text', required: false },
        { id: 'employeeName', name: 'اسم الموظف', type: 'text', required: true },
        { id: 'position', name: 'المنصب', type: 'text', required: true },
        { id: 'department', name: 'الإدارة', type: 'text', required: true },
        { id: 'organization', name: 'المؤسسة', type: 'text', required: false },
        { id: 'signature', name: 'التوقيع', type: 'text', required: false },
        { id: 'photo', name: 'صورة الموظف', type: 'file', required: false }
    ];
}

// الحصول على الإحداثيات الافتراضية
function getDefaultCoordinates() {
    return {
        'line1': { x: 300, y: 50, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
        'line2': { x: 300, y: 90, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
        'line3': { x: 300, y: 130, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
        'employeeName': { x: 50, y: 200, fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
        'position': { x: 50, y: 240, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'department': { x: 50, y: 270, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'organization': { x: 300, y: 480, fontSize: 14, fontWeight: 'normal', textAlign: 'center' },
        'signature': { x: 325, y: 520, fontSize: 16, fontWeight: 'normal', textAlign: 'center' },
        'photo': { x: 630, y: 180, fontSize: 16, fontWeight: 'normal', textAlign: 'center' }
    };
}

// الحصول على الألوان الافتراضية
function getDefaultColors() {
    return {
        primary: '#007bff',
        secondary: '#6c757d',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
}

// تهيئة محرر القالب
function initializeTemplateEditor(config) {
    // تحديث المحرر المرئي
    updateVisualEditor(config);

    // تحديث مدير الحقول
    updateFieldsManager(config);

    // تهيئة السحب والإفلات
    initializeDragAndDrop();

    // تهيئة مراقبة التغييرات
    setupChangeListeners();
}

// تحديث المحرر المرئي
function updateVisualEditor(config) {
    const visualEditor = document.getElementById('visualEditor');
    if (!visualEditor) return;

    // مسح المحتوى الحالي
    visualEditor.innerHTML = '';

    // تطبيق الخلفية
    updateEditorBackground(config.background);

    // إضافة العناصر القابلة للسحب
    if (config.fields) {
        config.fields.forEach(field => {
            const element = createDraggableElement(field, config.coordinates);
            visualEditor.appendChild(element);
        });
    }
}

// إنشاء عنصر قابل للسحب
function createDraggableElement(field, coordinates) {
    const coord = coordinates?.[field.id] || { x: 50, y: 50, fontSize: 16, fontWeight: 'normal', textAlign: 'right' };

    const element = document.createElement('div');
    element.className = 'draggable-element';
    element.dataset.fieldId = field.id;
    element.style.cssText = `
        position: absolute;
        left: ${coord.x}px;
        top: ${coord.y}px;
        font-size: ${coord.fontSize}px;
        font-weight: ${coord.fontWeight};
        text-align: ${coord.textAlign};
        color: white;
        padding: 5px 10px;
        border: 2px dashed transparent;
        border-radius: 4px;
        cursor: move;
        user-select: none;
        min-width: 100px;
        background: rgba(0,0,0,0.1);
    `;

    element.textContent = field.name;

    // إضافة أحداث السحب والإفلات
    element.addEventListener('mousedown', startDragging);
    element.addEventListener('click', selectElement);

    return element;
}

// تحديث خلفية المحرر
function updateEditorBackground(backgroundType) {
    const visualEditor = document.getElementById('visualEditor');
    if (!visualEditor) return;

    const backgrounds = {
        'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient1': 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        'gradient2': 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
        'gradient3': 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
    };

    visualEditor.style.background = backgrounds[backgroundType] || backgrounds['default'];
}

// تحديث مدير الحقول
function updateFieldsManager(config) {
    const fieldsManager = document.getElementById('fieldsManager');
    if (!fieldsManager) return;

    fieldsManager.innerHTML = '';

    if (config.fields) {
        config.fields.forEach((field, index) => {
            const fieldElement = createFieldManagerItem(field, index);
            fieldsManager.appendChild(fieldElement);
        });
    }
}

// إنشاء عنصر إدارة حقل
function createFieldManagerItem(field, index) {
    const div = document.createElement('div');
    div.className = 'field-manager-item';
    div.style.cssText = `
        background: white; border: 1px solid #dee2e6; border-radius: 6px;
        padding: 10px; margin-bottom: 8px; position: relative;
    `;

    const typeLabels = {
        'text': 'نص', 'number': 'رقم', 'date': 'تاريخ',
        'select': 'قائمة', 'textarea': 'نص طويل', 'file': 'ملف'
    };

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #2c3e50;">${field.name}</strong>
            <span style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">
                ${typeLabels[field.type] || field.type}
            </span>
        </div>
        <div style="display: flex; gap: 5px;">
            <button onclick="editFieldInTemplate('${field.id}')" class="btn btn-sm btn-outline-primary" style="flex: 1;">✏️ تعديل</button>
            <button onclick="removeFieldFromTemplate('${field.id}')" class="btn btn-sm btn-outline-danger">🗑️ حذف</button>
            <button onclick="moveFieldUp(${index})" class="btn btn-sm btn-outline-secondary" ${index === 0 ? 'disabled' : ''}>⬆️</button>
            <button onclick="moveFieldDown(${index})" class="btn btn-sm btn-outline-secondary">⬇️</button>
        </div>
    `;

    return div;
}

// متغيرات السحب والإفلات
let isDragging = false;
let dragElement = null;
let dragOffset = { x: 0, y: 0 };

// بدء السحب
function startDragging(e) {
    isDragging = true;
    dragElement = e.target;

    const rect = dragElement.getBoundingClientRect();
    const editorRect = document.getElementById('visualEditor').getBoundingClientRect();

    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    dragElement.style.border = '2px dashed #007bff';
    dragElement.style.zIndex = '1000';

    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', stopDragging);

    e.preventDefault();
}

// معالجة السحب
function handleDragging(e) {
    if (!isDragging || !dragElement) return;

    const editorRect = document.getElementById('visualEditor').getBoundingClientRect();
    const scale = 0.8; // مقياس التحويل

    let x = (e.clientX - editorRect.left - dragOffset.x) / scale;
    let y = (e.clientY - editorRect.top - dragOffset.y) / scale;

    // تقييد الحركة داخل المحرر
    x = Math.max(0, Math.min(x, 800 - dragElement.offsetWidth));
    y = Math.max(0, Math.min(y, 600 - dragElement.offsetHeight));

    dragElement.style.left = x + 'px';
    dragElement.style.top = y + 'px';
}

// إيقاف السحب
function stopDragging() {
    if (dragElement) {
        dragElement.style.border = '2px dashed transparent';
        dragElement.style.zIndex = 'auto';

        // حفظ الموضع الجديد
        const fieldId = dragElement.dataset.fieldId;
        if (fieldId && window.currentEditingConfig) {
            if (!window.currentEditingConfig.coordinates) {
                window.currentEditingConfig.coordinates = {};
            }

            window.currentEditingConfig.coordinates[fieldId] = {
                ...window.currentEditingConfig.coordinates[fieldId],
                x: parseInt(dragElement.style.left),
                y: parseInt(dragElement.style.top)
            };
        }
    }

    isDragging = false;
    dragElement = null;

    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', stopDragging);
}

// تحديد عنصر
function selectElement(e) {
    // إزالة التحديد من جميع العناصر
    document.querySelectorAll('.draggable-element').forEach(el => {
        el.style.border = '2px dashed transparent';
    });

    // تحديد العنصر الحالي
    e.target.style.border = '2px dashed #28a745';

    // عرض خصائص العنصر
    showElementProperties(e.target.dataset.fieldId);
}

// عرض خصائص العنصر
function showElementProperties(fieldId) {
    // يمكن إضافة لوحة خصائص هنا
    console.log('عرض خصائص العنصر:', fieldId);
}

// إضافة حقل جديد للقالب
function addFieldToTemplate() {
    const name = document.getElementById('newFieldName').value.trim();
    const type = document.getElementById('newFieldType').value;

    if (!name) {
        showNotification('يرجى إدخال اسم الحقل', 'error');
        return;
    }

    const newField = {
        id: 'field_' + Date.now(),
        name: name,
        type: type,
        required: false
    };

    if (!window.currentEditingConfig.fields) {
        window.currentEditingConfig.fields = [];
    }

    window.currentEditingConfig.fields.push(newField);

    // تحديث المحرر
    updateVisualEditor(window.currentEditingConfig);
    updateFieldsManager(window.currentEditingConfig);

    // مسح النموذج
    document.getElementById('newFieldName').value = '';
    document.getElementById('newFieldType').value = 'text';

    showNotification('تم إضافة الحقل بنجاح');
}

// حذف حقل من القالب
function removeFieldFromTemplate(fieldId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحقل؟')) return;

    if (window.currentEditingConfig.fields) {
        window.currentEditingConfig.fields = window.currentEditingConfig.fields.filter(f => f.id !== fieldId);
    }

    // حذف الإحداثيات أيضاً
    if (window.currentEditingConfig.coordinates) {
        delete window.currentEditingConfig.coordinates[fieldId];
    }

    // تحديث المحرر
    updateVisualEditor(window.currentEditingConfig);
    updateFieldsManager(window.currentEditingConfig);

    showNotification('تم حذف الحقل');
}

// تحريك حقل لأعلى
function moveFieldUp(index) {
    if (index <= 0 || !window.currentEditingConfig.fields) return;

    const fields = window.currentEditingConfig.fields;
    [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];

    updateFieldsManager(window.currentEditingConfig);
    showNotification('تم تحريك الحقل لأعلى');
}

// تحريك حقل لأسفل
function moveFieldDown(index) {
    if (!window.currentEditingConfig.fields || index >= window.currentEditingConfig.fields.length - 1) return;

    const fields = window.currentEditingConfig.fields;
    [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];

    updateFieldsManager(window.currentEditingConfig);
    showNotification('تم تحريك الحقل لأسفل');
}

// إعادة تعيين الإحداثيات
function resetCoordinates() {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع مواضع العناصر؟')) return;

    window.currentEditingConfig.coordinates = getDefaultCoordinates();
    updateVisualEditor(window.currentEditingConfig);

    showNotification('تم إعادة تعيين المواضع');
}

// ترتيب تلقائي للحقول
function autoArrangeFields() {
    if (!window.currentEditingConfig.fields) return;

    const startY = 50;
    const spacing = 40;

    window.currentEditingConfig.fields.forEach((field, index) => {
        if (!window.currentEditingConfig.coordinates) {
            window.currentEditingConfig.coordinates = {};
        }

        window.currentEditingConfig.coordinates[field.id] = {
            x: 50,
            y: startY + (index * spacing),
            fontSize: 16,
            fontWeight: 'normal',
            textAlign: 'right'
        };
    });

    updateVisualEditor(window.currentEditingConfig);
    showNotification('تم ترتيب الحقول تلقائياً');
}

// حفظ تغييرات القالب
function saveTemplateChanges(configId) {
    const name = document.getElementById('templateName').value.trim();
    const description = document.getElementById('templateDescription').value.trim();
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    const background = document.getElementById('templateBackground').value;

    if (!name) {
        showNotification('يرجى إدخال اسم القالب', 'error');
        return;
    }

    // تحديث التكوين
    window.currentEditingConfig.name = name;
    window.currentEditingConfig.description = description;
    window.currentEditingConfig.colors = {
        primary: primaryColor,
        secondary: secondaryColor
    };
    window.currentEditingConfig.background = background;
    window.currentEditingConfig.updated_at = new Date().toISOString();

    if (configId === 'default') {
        // حفظ كقالب جديد
        const newConfig = {
            ...window.currentEditingConfig,
            id: 'template_' + Date.now(),
            created_at: new Date().toISOString()
        };

        templateConfigurations.push(newConfig);
        localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

        showNotification(`تم حفظ القالب الجديد "${name}" بنجاح`);
    } else {
        // تحديث القالب الموجود
        const index = templateConfigurations.findIndex(c => c.id === configId);
        if (index !== -1) {
            templateConfigurations[index] = window.currentEditingConfig;
            localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));
            showNotification(`تم تحديث القالب "${name}" بنجاح`);
        }
    }

    // تحديث العرض
    loadTemplateConfigurations();
    closeTemplateEditor();
}

// معاينة التغييرات
function previewTemplateChanges() {
    // تحديث التكوين المؤقت
    const name = document.getElementById('templateName').value.trim();
    const description = document.getElementById('templateDescription').value.trim();
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    const background = document.getElementById('templateBackground').value;

    const tempConfig = {
        ...window.currentEditingConfig,
        name: name || 'معاينة القالب',
        description: description,
        colors: {
            primary: primaryColor,
            secondary: secondaryColor
        },
        background: background
    };

    // عرض المعاينة
    showTemplateConfigPreview(tempConfig);
}

// إعادة تعيين التغييرات
function resetTemplateChanges() {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع التغييرات؟')) return;

    // إعادة تحميل التكوين الأصلي
    if (window.currentEditingConfig.id === 'default') {
        window.currentEditingConfig = {
            id: 'default',
            name: 'القالب الافتراضي',
            description: 'القالب الأساسي لبطاقات الموارد البشرية',
            fields: getDefaultFields(),
            coordinates: getDefaultCoordinates(),
            colors: getDefaultColors(),
            background: 'default'
        };
    } else {
        const originalConfig = templateConfigurations.find(c => c.id === window.currentEditingConfig.id);
        if (originalConfig) {
            window.currentEditingConfig = JSON.parse(JSON.stringify(originalConfig));
        }
    }

    // تحديث المحرر
    initializeTemplateEditor(window.currentEditingConfig);

    showNotification('تم إعادة تعيين التغييرات');
}

// إغلاق محرر القالب
function closeTemplateEditor() {
    if (window.currentTemplateEditor) {
        window.currentTemplateEditor.remove();
        window.currentTemplateEditor = null;
        window.currentEditingConfig = null;
    }
}

// تهيئة مراقبة التغييرات
function setupChangeListeners() {
    // مراقبة تغيير الخلفية
    const backgroundSelect = document.getElementById('templateBackground');
    if (backgroundSelect) {
        backgroundSelect.addEventListener('change', (e) => {
            updateEditorBackground(e.target.value);
        });
    }

    // مراقبة تغيير الألوان
    const primaryColor = document.getElementById('primaryColor');
    const secondaryColor = document.getElementById('secondaryColor');

    if (primaryColor) {
        primaryColor.addEventListener('change', updateEditorColors);
    }

    if (secondaryColor) {
        secondaryColor.addEventListener('change', updateEditorColors);
    }
}

// تحديث ألوان المحرر
function updateEditorColors() {
    const primaryColor = document.getElementById('primaryColor')?.value;
    const secondaryColor = document.getElementById('secondaryColor')?.value;

    // تطبيق الألوان على العناصر
    document.querySelectorAll('.draggable-element').forEach(element => {
        element.style.borderColor = primaryColor;
    });
}

// تهيئة السحب والإفلات
function initializeDragAndDrop() {
    // تم تنفيذها في الوظائف السابقة
}

// ===== وظائف إدارة الخلفيات =====

// تحميل مكتبة الخلفيات
function loadBackgroundLibrary() {
    const savedBackgrounds = localStorage.getItem('backgroundLibrary');
    if (savedBackgrounds) {
        backgroundLibrary = JSON.parse(savedBackgrounds);
    }

    displayBackgroundLibrary();
    setupBackgroundUpload();
}

// عرض مكتبة الخلفيات
function displayBackgroundLibrary() {
    const container = document.getElementById('backgroundLibrary');
    if (!container) return;

    // إضافة الخلفيات المخصصة
    backgroundLibrary.forEach(bg => {
        const bgElement = createBackgroundElement(bg);
        container.appendChild(bgElement);
    });
}

// إنشاء عنصر خلفية
function createBackgroundElement(background) {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'background-item';
    bgDiv.dataset.bg = background.id;

    if (background.id === currentBackground) {
        bgDiv.classList.add('active');
    }

    bgDiv.innerHTML = `
        <div class="bg-preview" style="background-image: url('${background.url}'); background-size: cover; background-position: center;">
            <span style="background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">
                ${background.name}
            </span>
        </div>
        <div class="bg-actions">
            <button class="action-btn btn-view" onclick="selectBackground('${background.id}')">✓ اختيار</button>
            <button class="action-btn btn-delete" onclick="deleteBackground('${background.id}')">🗑️</button>
        </div>
    `;

    return bgDiv;
}

// إعداد رفع الخلفيات
function setupBackgroundUpload() {
    const fileInput = document.getElementById('backgroundFile');
    if (!fileInput) return;

    fileInput.addEventListener('change', handleBackgroundUpload);
}

// معالجة رفع خلفية جديدة
function handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('نوع الملف غير مدعوم. يرجى اختيار PNG, JPG, SVG, أو PDF', 'error');
        return;
    }

    // التحقق من حجم الملف (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const backgroundData = {
            id: 'bg_' + Date.now(),
            name: file.name.split('.')[0],
            url: e.target.result,
            type: file.type,
            size: file.size,
            created_at: new Date().toISOString()
        };

        // عرض معاينة الخلفية
        displayBackgroundPreview(backgroundData);

        // إظهار عناصر التحكم
        document.getElementById('backgroundSettings').style.display = 'block';
        document.getElementById('backgroundPosition').style.display = 'block';
        document.getElementById('saveBackgroundBtn').style.display = 'block';

        // حفظ البيانات مؤقتاً
        window.tempBackgroundData = backgroundData;
    };

    reader.readAsDataURL(file);
}

// عرض معاينة الخلفية
function displayBackgroundPreview(backgroundData) {
    const previewContainer = document.getElementById('backgroundPreview');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
        <div style="
            width: 200px; height: 120px; margin: 0 auto;
            background-image: url('${backgroundData.url}');
            background-size: cover; background-position: center;
            border-radius: 8px; border: 2px solid #ddd;
            position: relative; overflow: hidden;
        ">
            <div style="
                position: absolute; bottom: 5px; left: 5px;
                background: rgba(0,0,0,0.7); color: white;
                padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;
            ">
                ${backgroundData.name}
            </div>
        </div>
        <p style="margin-top: 10px; font-size: 0.8rem; color: #6c757d;">
            ${(backgroundData.size / 1024 / 1024).toFixed(2)} MB
        </p>
    `;
}

// تحديث معاينة الخلفية
function updateBackgroundPreview() {
    const opacity = document.getElementById('backgroundOpacity').value;
    const position = document.getElementById('backgroundPos').value;

    document.getElementById('opacityValue').textContent = opacity + '%';

    const previewDiv = document.querySelector('#backgroundPreview > div');
    if (previewDiv) {
        previewDiv.style.opacity = opacity / 100;

        switch(position) {
            case 'top':
                previewDiv.style.backgroundPosition = 'center top';
                break;
            case 'bottom':
                previewDiv.style.backgroundPosition = 'center bottom';
                break;
            case 'left':
                previewDiv.style.backgroundPosition = 'left center';
                break;
            case 'right':
                previewDiv.style.backgroundPosition = 'right center';
                break;
            case 'stretch':
                previewDiv.style.backgroundSize = '100% 100%';
                break;
            default:
                previewDiv.style.backgroundPosition = 'center';
                previewDiv.style.backgroundSize = 'cover';
        }
    }
}

// حفظ الخلفية
function saveBackground() {
    if (!window.tempBackgroundData) {
        showNotification('لا توجد خلفية للحفظ', 'error');
        return;
    }

    const opacity = document.getElementById('backgroundOpacity').value;
    const position = document.getElementById('backgroundPos').value;

    const backgroundData = {
        ...window.tempBackgroundData,
        opacity: opacity,
        position: position
    };

    backgroundLibrary.push(backgroundData);
    localStorage.setItem('backgroundLibrary', JSON.stringify(backgroundLibrary));

    // إضافة للعرض
    const container = document.getElementById('backgroundLibrary');
    const bgElement = createBackgroundElement(backgroundData);
    container.appendChild(bgElement);

    // إعادة تعيين النموذج
    document.getElementById('backgroundFile').value = '';
    document.getElementById('backgroundPreview').innerHTML = '';
    document.getElementById('backgroundSettings').style.display = 'none';
    document.getElementById('backgroundPosition').style.display = 'none';
    document.getElementById('saveBackgroundBtn').style.display = 'none';

    delete window.tempBackgroundData;

    showNotification('تم حفظ الخلفية بنجاح');
}

// اختيار خلفية
function selectBackground(backgroundId) {
    // إزالة التحديد من جميع الخلفيات
    document.querySelectorAll('.background-item').forEach(item => {
        item.classList.remove('active');
    });

    // تحديد الخلفية الجديدة
    const selectedBg = document.querySelector(`[data-bg="${backgroundId}"]`);
    if (selectedBg) {
        selectedBg.classList.add('active');
    }

    currentBackground = backgroundId;
    localStorage.setItem('currentBackground', backgroundId);

    showNotification('تم اختيار الخلفية');
}

// حذف خلفية
function deleteBackground(backgroundId) {
    if (!confirm('هل أنت متأكد من حذف هذه الخلفية؟')) return;

    backgroundLibrary = backgroundLibrary.filter(bg => bg.id !== backgroundId);
    localStorage.setItem('backgroundLibrary', JSON.stringify(backgroundLibrary));

    // إزالة من العرض
    const bgElement = document.querySelector(`[data-bg="${backgroundId}"]`);
    if (bgElement) {
        bgElement.remove();
    }

    // إذا كانت الخلفية المحذوفة هي المحددة، اختر الافتراضي
    if (currentBackground === backgroundId) {
        selectBackground('default');
    }

    showNotification('تم حذف الخلفية');
}

// حذف الخلفية المحددة
function deleteSelectedBackground() {
    if (currentBackground === 'default') {
        showNotification('لا يمكن حذف الخلفية الافتراضية', 'error');
        return;
    }

    deleteBackground(currentBackground);
}

// تحديث مكتبة الخلفيات
function refreshBackgroundLibrary() {
    loadBackgroundLibrary();
    showNotification('تم تحديث مكتبة الخلفيات');
}

// ===== وظائف المعاينة المتقدمة =====

// تحميل المعاينة المتقدمة
function loadAdvancedPreview() {
    // تحميل قائمة الخلفيات في المعاينة
    updatePreviewBackgroundsList();

    // تحديث حقول المعاينة بناءً على الحقول المخصصة
    updatePreviewFields();

    // تحديث المعاينة الأولية
    updateAdvancedPreview();
}

// تحديث قائمة خلفيات المعاينة
function updatePreviewBackgroundsList() {
    const select = document.getElementById('previewBackground');
    if (!select) return;

    // مسح الخيارات الحالية (عدا الافتراضي)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // إضافة الخلفيات المخصصة
    backgroundLibrary.forEach(bg => {
        const option = document.createElement('option');
        option.value = bg.id;
        option.textContent = bg.name;
        select.appendChild(option);
    });
}

// تحديث حقول المعاينة
function updatePreviewFields() {
    const container = document.getElementById('previewFields');
    if (!container) return;

    // إضافة الحقول المخصصة
    customFields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-group';

        let inputElement = '';
        switch(field.type) {
            case 'textarea':
                inputElement = `<textarea id="preview_${field.id}" rows="3" onchange="updateAdvancedPreview()">${field.name} تجريبي</textarea>`;
                break;
            case 'select':
                const options = field.options ? field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('') : '';
                inputElement = `<select id="preview_${field.id}" onchange="updateAdvancedPreview()">${options}</select>`;
                break;
            case 'date':
                inputElement = `<input type="date" id="preview_${field.id}" value="${new Date().toISOString().split('T')[0]}" onchange="updateAdvancedPreview()">`;
                break;
            default:
                inputElement = `<input type="${field.type}" id="preview_${field.id}" value="${field.name} تجريبي" onchange="updateAdvancedPreview()">`;
        }

        fieldDiv.innerHTML = `
            <label>${field.name}:</label>
            ${inputElement}
        `;

        container.appendChild(fieldDiv);
    });
}

// تحديث المعاينة المتقدمة
function updateAdvancedPreview() {
    // يمكن إضافة منطق تحديث المعاينة هنا
    console.log('تحديث المعاينة المتقدمة...');
}

// إنشاء بطاقة معاينة
async function generatePreviewCard() {
    const previewData = {
        size: document.getElementById('previewSize').value,
        template: document.getElementById('previewTemplate').value,
        background: document.getElementById('previewBackground').value,
        fields: {}
    };

    // جمع بيانات الحقول
    const fieldInputs = document.querySelectorAll('#previewFields input, #previewFields textarea, #previewFields select');
    fieldInputs.forEach(input => {
        const fieldName = input.id.replace('preview_', '');
        previewData.fields[fieldName] = input.value;
    });

    try {
        showNotification('جاري إنشاء المعاينة...', 'info');

        const response = await fetch('generate_preview.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(previewData)
        });

        const result = await response.json();

        if (result.success) {
            const previewArea = document.getElementById('advancedPreviewArea');
            previewArea.innerHTML = `
                <img src="${result.preview_url}" alt="معاينة البطاقة" style="max-width: 100%; height: auto;">
            `;
            showNotification('تم إنشاء المعاينة بنجاح');
        } else {
            showNotification(result.message || 'خطأ في إنشاء المعاينة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// تحميل بطاقة المعاينة
function downloadPreviewCard() {
    const img = document.querySelector('#advancedPreviewArea img');
    if (!img) {
        showNotification('لا توجد معاينة للتحميل', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = img.src;
    link.download = `preview_card_${new Date().toISOString().split('T')[0]}.png`;
    link.click();

    showNotification('تم تحميل المعاينة');
}

// تكبير/تصغير المعاينة
function zoomPreview(action) {
    const img = document.querySelector('#advancedPreviewArea img');
    if (!img) return;

    let currentScale = parseFloat(img.dataset.scale || '1');

    switch(action) {
        case 'in':
            currentScale = Math.min(currentScale * 1.2, 3);
            break;
        case 'out':
            currentScale = Math.max(currentScale / 1.2, 0.3);
            break;
        case 'reset':
            currentScale = 1;
            break;
    }

    img.style.transform = `scale(${currentScale})`;
    img.dataset.scale = currentScale;
}

// ===== وظائف إدارة قوالب التكوين =====

// تحميل قوالب التكوين
function loadTemplateConfigurations() {
    const savedConfigs = localStorage.getItem('templateConfigurations');
    if (savedConfigs) {
        templateConfigurations = JSON.parse(savedConfigs);
    }

    displayTemplateConfigurations();
}

// عرض تكوينات القوالب في قسم إدارة القوالب
function displayTemplateConfigurations() {
    const container = document.getElementById('templatesList');
    if (!container) return;

    container.innerHTML = '';

    // إضافة القالب الافتراضي
    const defaultTemplate = createTemplateCard({
        id: 'default',
        name: 'القالب الافتراضي',
        description: 'القالب الأساسي لإدارة الموارد البشرية',
        fields: getDefaultFields(),
        coordinates: getDefaultCoordinates(),
        colors: getDefaultColors(),
        background: 'default',
        created_at: new Date().toISOString(),
        isDefault: true
    });

    container.appendChild(defaultTemplate);

    // إضافة القوالب المحفوظة
    templateConfigurations.forEach(config => {
        const templateCard = createTemplateCard(config);
        container.appendChild(templateCard);
    });

    // إضافة رسالة إذا لم توجد قوالب
    if (templateConfigurations.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `
            text-align: center; padding: 40px; background: #f8f9fa;
            border-radius: 10px; border: 2px dashed #dee2e6; margin-top: 20px;
        `;
        emptyMessage.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;">📋</div>
            <h4 style="color: #6c757d; margin: 0 0 10px 0;">لا توجد قوالب مخصصة</h4>
            <p style="color: #6c757d; margin: 0;">ابدأ بإنشاء قالب جديد أو تعديل القالب الافتراضي</p>
        `;
        container.appendChild(emptyMessage);
    }
}

// إنشاء بطاقة قالب
function createTemplateCard(config) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.style.cssText = `
        background: white; border: 1px solid #dee2e6; border-radius: 10px;
        padding: 20px; margin-bottom: 15px; transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const fieldsCount = config.fields ? config.fields.length : 0;
    const hasCoordinates = config.coordinates && Object.keys(config.coordinates).length > 0;
    const hasColors = config.colors && (config.colors.primary || config.colors.secondary);
    const createdDate = config.created_at ? new Date(config.created_at).toLocaleDateString('ar-SA') : 'غير محدد';

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 8px 0; color: #2c3e50; display: flex; align-items: center; gap: 8px;">
                    ${config.isDefault ? '⭐' : '📋'} ${config.name}
                    ${config.isDefault ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">افتراضي</span>' : ''}
                </h4>
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 0.9rem;">${config.description || 'لا يوجد وصف'}</p>
                <div style="display: flex; gap: 15px; font-size: 0.8rem; color: #6c757d;">
                    <span>📅 ${createdDate}</span>
                    <span>🔧 ${fieldsCount} حقل</span>
                    <span>${hasCoordinates ? '📍 مواضع مخصصة' : '📍 مواضع افتراضية'}</span>
                    <span>${hasColors ? '🎨 ألوان مخصصة' : '🎨 ألوان افتراضية'}</span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h6 style="margin: 0 0 8px 0; color: #2c3e50;">📊 المكونات</h6>
                <div style="display: flex; flex-direction: column; gap: 5px; font-size: 0.8rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${fieldsCount > 0 ? '#28a745' : '#6c757d'};">${fieldsCount > 0 ? '✅' : '❌'}</span>
                        <span>الحقول المخصصة (${fieldsCount})</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${hasCoordinates ? '#28a745' : '#6c757d'};">${hasCoordinates ? '✅' : '❌'}</span>
                        <span>إحداثيات العناصر</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${hasColors ? '#28a745' : '#6c757d'};">${hasColors ? '✅' : '❌'}</span>
                        <span>ألوان القالب</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${config.background && config.background !== 'default' ? '#28a745' : '#6c757d'};">${config.background && config.background !== 'default' ? '✅' : '❌'}</span>
                        <span>خلفية مخصصة</span>
                    </div>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h6 style="margin: 0 0 8px 0; color: #2c3e50;">🔧 الحقول المتاحة</h6>
                <div style="max-height: 100px; overflow-y: auto;">
                    ${config.fields ? config.fields.map(field => `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; font-size: 0.8rem;">
                            <span>${field.name}</span>
                            <span style="background: #e9ecef; padding: 1px 4px; border-radius: 2px;">${getFieldTypeLabel(field.type)}</span>
                        </div>
                    `).join('') : '<span style="color: #6c757d; font-size: 0.8rem;">لا توجد حقول</span>'}
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button onclick="previewTemplateConfig('${config.id}')" class="btn btn-info btn-sm">👁️ معاينة</button>
            <button onclick="editTemplateConfig('${config.id}')" class="btn btn-primary btn-sm">✏️ تعديل شامل</button>
            <button onclick="applyTemplateConfig('${config.id}')" class="btn btn-success btn-sm">✅ تطبيق</button>
            <button onclick="exportTemplateConfig('${config.id}')" class="btn btn-secondary btn-sm">📤 تصدير</button>
            <button onclick="duplicateTemplateConfig('${config.id}')" class="btn btn-outline-primary btn-sm">📋 نسخ</button>
            ${!config.isDefault ? `<button onclick="deleteTemplateConfig('${config.id}')" class="btn btn-danger btn-sm">🗑️ حذف</button>` : ''}
        </div>
    `;

    // إضافة تأثير hover
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });

    return card;
}

// الحصول على تسمية نوع الحقل
function getFieldTypeLabel(type) {
    const labels = {
        'text': 'نص',
        'number': 'رقم',
        'date': 'تاريخ',
        'select': 'قائمة',
        'textarea': 'نص طويل',
        'file': 'ملف'
    };
    return labels[type] || type;
}

// حذف تكوين قالب
function deleteTemplateConfig(configId) {
    const config = templateConfigurations.find(c => c.id === configId);
    if (!config) return;

    if (!confirm(`هل أنت متأكد من حذف القالب "${config.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

    templateConfigurations = templateConfigurations.filter(c => c.id !== configId);
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    displayTemplateConfigurations();
    showNotification(`تم حذف القالب "${config.name}" بنجاح`);
}

// عرض قوالب التكوين
function displayTemplateConfigurations() {
    const container = document.getElementById('savedTemplates');
    if (!container) return;

    // مسح القوالب الحالية (عدا الافتراضي)
    const defaultTemplate = container.querySelector('.template-config-item');
    container.innerHTML = '';
    if (defaultTemplate) {
        container.appendChild(defaultTemplate);
    }

    // إضافة القوالب المحفوظة
    templateConfigurations.forEach(config => {
        const configElement = createTemplateConfigElement(config);
        container.appendChild(configElement);
    });
}

// إنشاء عنصر قالب تكوين
function createTemplateConfigElement(config) {
    const configDiv = document.createElement('div');
    configDiv.className = 'template-config-item';

    const elementsCount = (config.fields ? config.fields.length : 0) +
                         (config.coordinates ? Object.keys(config.coordinates).length : 0);

    configDiv.innerHTML = `
        <h5>${config.name}</h5>
        <p>${config.description || 'لا يوجد وصف'}</p>
        <div class="template-meta">
            <span>📅 تاريخ الإنشاء: ${new Date(config.created_at).toLocaleDateString('ar-SA')}</span>
            <span>🔧 العناصر: ${elementsCount}</span>
        </div>
        <div class="template-actions">
            <button class="action-btn btn-view" onclick="previewTemplateConfig('${config.id}')">👁️ معاينة</button>
            <button class="action-btn btn-download" onclick="applyTemplateConfig('${config.id}')">✅ تطبيق</button>
            <button class="action-btn btn-download" onclick="exportTemplateConfig('${config.id}')">📤 تصدير</button>
            <button class="action-btn btn-secondary" onclick="duplicateTemplateConfig('${config.id}')">📋 نسخ</button>
            <button class="action-btn btn-delete" onclick="deleteTemplateConfig('${config.id}')">🗑️ حذف</button>
        </div>
    `;

    return configDiv;
}

// حفظ تكوين قالب
function saveTemplateConfiguration() {
    const name = document.getElementById('templateConfigName').value.trim();
    const description = document.getElementById('templateConfigDescription').value.trim();

    if (!name) {
        showNotification('يرجى إدخال اسم القالب', 'error');
        return;
    }

    const includeFields = document.getElementById('includeFields').checked;
    const includeBackground = document.getElementById('includeBackground').checked;
    const includeCoordinates = document.getElementById('includeCoordinates').checked;
    const includeColors = document.getElementById('includeColors').checked;

    const config = {
        id: 'config_' + Date.now(),
        name: name,
        description: description,
        created_at: new Date().toISOString(),
        fields: includeFields ? customFields : null,
        background: includeBackground ? currentBackground : null,
        coordinates: includeCoordinates ? currentCoordinates : null,
        colors: includeColors ? getTemplateColors() : null
    };

    templateConfigurations.push(config);
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    // إضافة للعرض
    const container = document.getElementById('savedTemplates');
    const configElement = createTemplateConfigElement(config);
    container.appendChild(configElement);

    // إعادة تعيين النموذج
    document.getElementById('templateConfigName').value = '';
    document.getElementById('templateConfigDescription').value = '';

    showNotification('تم حفظ تكوين القالب بنجاح');
}

// الحصول على ألوان القالب الحالي
function getTemplateColors() {
    // يمكن تحسين هذه الوظيفة لاستخراج الألوان من القالب الحالي
    return {
        primary: '#007bff',
        secondary: '#6c757d',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
}

// معاينة تكوين قالب
function previewTemplateConfig(configId) {
    const config = templateConfigurations.find(c => c.id === configId);
    if (!config) {
        // إذا كان القالب الافتراضي، أنشئ معاينة افتراضية
        if (configId === 'default') {
            previewDefaultHRTemplate();
            return;
        }
        showNotification('القالب غير موجود', 'error');
        return;
    }

    // إنشاء نافذة معاينة متقدمة
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 1000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(10px);
    `;

    const previewContent = generateTemplateConfigPreview(config);

    modal.innerHTML = `
        <div style="
            background: white; padding: 0; border-radius: 20px;
            width: 90vw; max-width: 1200px; height: 90vh; max-height: 800px;
            display: flex; flex-direction: column;
            box-shadow: 0 25px 80px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px 30px;
                display: flex; justify-content: space-between; align-items: center;
                flex-shrink: 0;
            ">
                <div>
                    <h2 style="margin: 0; font-size: 1.6rem;">معاينة ${config.name}</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.85rem;">${config.description || 'قالب تكوين مخصص'}</p>
                </div>
                <span style="
                    font-size: 2rem; cursor: pointer; line-height: 1;
                    opacity: 0.8; transition: opacity 0.3s; padding: 5px;
                "
                      onclick="this.parentElement.parentElement.parentElement.remove()"
                      onmouseover="this.style.opacity='1'"
                      onmouseout="this.style.opacity='0.8'">&times;</span>
            </div>
            <div style="
                padding: 25px 30px;
                flex: 1;
                overflow-y: auto;
                min-height: 0;
            ">
                ${previewContent}
            </div>
            <div style="
                padding: 20px 30px;
                background: #f8f9fa;
                display: flex; gap: 12px; justify-content: center;
                border-top: 1px solid #dee2e6;
                flex-shrink: 0;
                flex-wrap: wrap;
            ">
                <button onclick="applyTemplateConfig('${config.id}')" class="btn btn-success" style="padding: 10px 20px; font-size: 0.9rem; min-width: 120px;">✅ تطبيق القالب</button>
                <button onclick="exportTemplateConfig('${config.id}')" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem; min-width: 100px;">📤 تصدير</button>
                <button onclick="duplicateTemplateConfig('${config.id}')" class="btn btn-info" style="padding: 10px 20px; font-size: 0.9rem; min-width: 80px;">📋 نسخ</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary" style="padding: 10px 20px; font-size: 0.9rem; min-width: 80px;">إغلاق</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// معاينة قالب الموارد البشرية الافتراضي
function previewDefaultHRTemplate() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 1000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div style="
            background: white; padding: 0; border-radius: 20px;
            width: 90vw; max-width: 1200px; height: 90vh; max-height: 800px;
            display: flex; flex-direction: column;
            box-shadow: 0 25px 80px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                color: white; padding: 20px 30px;
                display: flex; justify-content: space-between; align-items: center;
                flex-shrink: 0;
            ">
                <div>
                    <h2 style="margin: 0; font-size: 1.6rem;">🏢 قالب الموارد البشرية</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.85rem;">القالب الافتراضي لإدارة الموارد البشرية</p>
                </div>
                <span style="
                    font-size: 2rem; cursor: pointer; line-height: 1;
                    opacity: 0.8; transition: opacity 0.3s; padding: 5px;
                "
                      onclick="this.parentElement.parentElement.parentElement.remove()"
                      onmouseover="this.style.opacity='1'"
                      onmouseout="this.style.opacity='0.8'">&times;</span>
            </div>
            <div style="
                padding: 25px 30px;
                flex: 1;
                overflow-y: auto;
                min-height: 0;
            ">
                ${generateDefaultHRTemplatePreview()}
            </div>
            <div style="
                padding: 20px 30px;
                background: #f8f9fa;
                display: flex; gap: 12px; justify-content: center;
                border-top: 1px solid #dee2e6;
                flex-shrink: 0;
                flex-wrap: wrap;
            ">
                <button onclick="createHRTemplate()" class="btn btn-success" style="padding: 10px 20px; font-size: 0.9rem; min-width: 140px;">🎨 إنشاء قالب جديد</button>
                <button onclick="exportDefaultHRTemplate()" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem; min-width: 120px;">📤 تصدير القالب</button>
                <button onclick="applyDefaultHRTemplate()" class="btn btn-info" style="padding: 10px 20px; font-size: 0.9rem; min-width: 100px;">✅ تطبيق</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary" style="padding: 10px 20px; font-size: 0.9rem; min-width: 80px;">إغلاق</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// إنشاء محتوى معاينة قالب التكوين
function generateTemplateConfigPreview(config) {
    const createdDate = new Date(config.created_at).toLocaleDateString('ar-SA');
    const elementsCount = (config.fields ? config.fields.length : 0) +
                         (config.coordinates ? Object.keys(config.coordinates).length : 0);

    let content = `
        <div style="font-family: 'Cairo', Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div>
                    <h3 style="color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 8px;">📊 معلومات القالب</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <p><strong>📅 تاريخ الإنشاء:</strong> ${createdDate}</p>
                        <p><strong>🔧 عدد العناصر:</strong> ${elementsCount}</p>
                        <p><strong>📝 الوصف:</strong> ${config.description || 'لا يوجد وصف'}</p>
                        ${config.imported_at ? `<p><strong>📥 تاريخ الاستيراد:</strong> ${new Date(config.imported_at).toLocaleDateString('ar-SA')}</p>` : ''}
                    </div>
                </div>

                <div>
                    <h3 style="color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #e74c3c; padding-bottom: 8px;">⚙️ المكونات المضمنة</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: ${config.fields ? '#27ae60' : '#95a5a6'};">${config.fields ? '✅' : '❌'}</span>
                                <span>الحقول المخصصة (${config.fields ? config.fields.length : 0})</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: ${config.background ? '#27ae60' : '#95a5a6'};">${config.background ? '✅' : '❌'}</span>
                                <span>الخلفية المخصصة</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: ${config.coordinates ? '#27ae60' : '#95a5a6'};">${config.coordinates ? '✅' : '❌'}</span>
                                <span>إحداثيات العناصر (${config.coordinates ? Object.keys(config.coordinates).length : 0})</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: ${config.colors ? '#27ae60' : '#95a5a6'};">${config.colors ? '✅' : '❌'}</span>
                                <span>ألوان القالب</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `;

    // عرض الحقول المخصصة إذا كانت موجودة
    if (config.fields && config.fields.length > 0) {
        content += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #f39c12; padding-bottom: 8px;">🔧 الحقول المخصصة</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
        `;

        config.fields.forEach(field => {
            const typeLabels = {
                'text': 'نص',
                'number': 'رقم',
                'date': 'تاريخ',
                'select': 'قائمة منسدلة',
                'textarea': 'نص طويل',
                'email': 'بريد إلكتروني',
                'phone': 'رقم هاتف'
            };

            content += `
                <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px;">
                    <h4 style="margin: 0 0 8px 0; color: #3498db;">${field.name}</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">
                        <span style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">${typeLabels[field.type] || field.type}</span>
                        ${field.required ? '<span style="color: #e74c3c; margin-right: 5px;">*</span>' : ''}
                    </p>
                    ${field.help ? `<p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #6c757d; font-style: italic;">${field.help}</p>` : ''}
                    ${field.options ? `<p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #6c757d;">خيارات: ${field.options.slice(0, 3).join(', ')}${field.options.length > 3 ? '...' : ''}</p>` : ''}
                </div>
            `;
        });

        content += `
                </div>
            </div>
        `;
    }

    // عرض معاينة الإحداثيات إذا كانت موجودة
    if (config.coordinates && Object.keys(config.coordinates).length > 0) {
        content += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #9b59b6; padding-bottom: 8px;">📍 إحداثيات العناصر</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; max-height: 300px; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        `;

        Object.entries(config.coordinates).forEach(([field, coords]) => {
            const fieldNames = {
                'line1': 'السطر الأول',
                'line2': 'السطر الثاني',
                'line3': 'السطر الثالث',
                'employeeName': 'اسم الموظف',
                'position': 'المنصب',
                'department': 'الإدارة',
                'organization': 'المؤسسة',
                'signature': 'التوقيع',
                'photo': 'صورة الموظف'
            };

            content += `
                <div style="background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #9b59b6;">
                    <strong style="color: #2c3e50;">${fieldNames[field] || field}</strong><br>
                    <small style="color: #6c757d;">
                        X: ${coords.x}, Y: ${coords.y}<br>
                        حجم: ${coords.fontSize || 16}px
                    </small>
                </div>
            `;
        });

        content += `
                    </div>
                </div>
            </div>
        `;
    }

    content += `
        </div>
    `;

    return content;
}

// إنشاء محتوى معاينة قالب الموارد البشرية الافتراضي
function generateDefaultHRTemplatePreview() {
    const orgData = organizationData.organizationName ? organizationData : {
        organizationName: 'مركز الخدمات الطبية الشرعية',
        managerName: 'د. فواز جمال الديدب',
        managerPosition: 'مدير مركز الخدمات الطبية الشرعية'
    };

    return `
        <div style="font-family: 'Cairo', Arial, sans-serif; line-height: 1.6; color: #333;">
            <!-- معاينة البطاقة -->
            <div style="text-align: center; margin-bottom: 40px;">
                <div style="
                    width: 400px; height: 250px; margin: 0 auto;
                    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                    border-radius: 15px; padding: 20px; color: white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    position: relative; overflow: hidden;
                ">
                    <!-- عناصر تزيينية -->
                    <div style="position: absolute; top: -30px; right: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -20px; left: -20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

                    <!-- محتوى البطاقة -->
                    <div style="text-align: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 1.2rem;">بكل الحب والتقدير</h3>
                        <p style="margin: 5px 0; opacity: 0.9; font-size: 0.9rem;">أتشرف بإعلامكم</p>
                        <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">بتمديد تكليفي في منصبي الحالي</p>
                    </div>

                    <div style="text-align: right; margin: 15px 0;">
                        <p style="margin: 3px 0; font-weight: bold;">د. فواز جمال الديدب</p>
                        <p style="margin: 3px 0; font-size: 0.8rem; opacity: 0.9;">مدير مركز الخدمات الطبية الشرعية</p>
                        <p style="margin: 3px 0; font-size: 0.8rem; opacity: 0.9;">وزارة الصحة</p>
                    </div>

                    <div style="position: absolute; bottom: 10px; left: 20px; font-size: 0.7rem; opacity: 0.8;">
                        <p style="margin: 0;">${orgData.managerPosition}</p>
                        <p style="margin: 0;">${orgData.managerName}</p>
                    </div>

                    <!-- صورة الموظف -->
                    <div style="position: absolute; top: 60px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        👤
                    </div>
                </div>
            </div>

            <!-- مميزات القالب -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🎨</div>
                    <h4 style="margin: 0 0 8px 0;">تصميم احترافي</h4>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">تدرجات لونية جذابة ومناسبة للموارد البشرية</p>
                </div>

                <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🔧</div>
                    <h4 style="margin: 0 0 8px 0;">قابل للتخصيص</h4>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">إمكانية تعديل جميع العناصر والألوان</p>
                </div>

                <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📱</div>
                    <h4 style="margin: 0 0 8px 0;">متجاوب</h4>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">يتكيف مع جميع أحجام الشاشات والطباعة</p>
                </div>
            </div>

            <!-- الحقول المتضمنة -->
            <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 8px;">📋 الحقول المتضمنة</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <h5 style="margin: 0 0 5px 0; color: #2c3e50;">السطر الأول</h5>
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">عنوان البطاقة الرئيسي</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <h5 style="margin: 0 0 5px 0; color: #2c3e50;">اسم الموظف</h5>
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">الاسم الكامل للموظف</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <h5 style="margin: 0 0 5px 0; color: #2c3e50;">المنصب</h5>
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">المسمى الوظيفي</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <h5 style="margin: 0 0 5px 0; color: #2c3e50;">الإدارة</h5>
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">القسم التابع له</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <h5 style="margin: 0 0 5px 0; color: #2c3e50;">صورة الموظف</h5>
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">صورة شخصية اختيارية</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <h5 style="margin: 0 0 5px 0; color: #2c3e50;">توقيع المدير</h5>
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">يضاف تلقائياً من إعدادات المنشأة</p>
                    </div>
                </div>
            </div>

            <!-- الإحصائيات -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                <h3 style="margin: 0 0 20px 0;">📊 إحصائيات القالب</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">9</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">عناصر قابلة للتخصيص</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">3</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">أحجام مدعومة</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">∞</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">إمكانيات التخصيص</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// إنشاء قالب موارد بشرية جديد
function createHRTemplate() {
    const templateName = prompt('أدخل اسم القالب الجديد:', 'قالب الموارد البشرية المخصص');
    if (!templateName) return;

    const hrTemplate = {
        id: 'hr_' + Date.now(),
        name: templateName,
        description: 'قالب مخصص لإدارة الموارد البشرية',
        created_at: new Date().toISOString(),
        type: 'hr_template',
        fields: [
            {
                id: 'employee_id',
                name: 'رقم الموظف',
                type: 'text',
                required: true,
                help: 'الرقم الوظيفي للموظف'
            },
            {
                id: 'hire_date',
                name: 'تاريخ التعيين',
                type: 'date',
                required: true,
                help: 'تاريخ بداية العمل'
            },
            {
                id: 'salary_grade',
                name: 'الدرجة الوظيفية',
                type: 'select',
                required: false,
                options: ['الدرجة الأولى', 'الدرجة الثانية', 'الدرجة الثالثة', 'الدرجة الرابعة'],
                help: 'التصنيف الوظيفي للموظف'
            },
            {
                id: 'direct_manager',
                name: 'المدير المباشر',
                type: 'text',
                required: false,
                help: 'اسم المدير المباشر'
            },
            {
                id: 'work_location',
                name: 'مقر العمل',
                type: 'text',
                required: false,
                help: 'الموقع الجغرافي للعمل'
            }
        ],
        coordinates: {
            'employee_id': { x: 50, y: 300, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
            'hire_date': { x: 50, y: 330, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
            'salary_grade': { x: 50, y: 360, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
            'direct_manager': { x: 50, y: 390, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
            'work_location': { x: 50, y: 420, fontSize: 14, fontWeight: 'normal', textAlign: 'right' }
        },
        colors: {
            primary: '#2c3e50',
            secondary: '#3498db',
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
        }
    };

    // إضافة القالب للقائمة
    templateConfigurations.push(hrTemplate);
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    // إضافة للعرض
    const container = document.getElementById('savedTemplates');
    const configElement = createTemplateConfigElement(hrTemplate);
    container.appendChild(configElement);

    showNotification(`تم إنشاء قالب "${templateName}" بنجاح`);

    // إغلاق النافذة الحالية
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
}

// تصدير قالب الموارد البشرية الافتراضي
function exportDefaultHRTemplate() {
    const defaultHRTemplate = {
        name: 'قالب الموارد البشرية الافتراضي',
        description: 'القالب الأساسي لبطاقات الموارد البشرية',
        created_at: new Date().toISOString(),
        type: 'hr_template',
        version: '1.0',
        fields: [
            { id: 'line1', name: 'السطر الأول', type: 'text', required: true },
            { id: 'line2', name: 'السطر الثاني', type: 'text', required: false },
            { id: 'line3', name: 'السطر الثالث', type: 'text', required: false },
            { id: 'employeeName', name: 'اسم الموظف', type: 'text', required: true },
            { id: 'position', name: 'المنصب', type: 'text', required: true },
            { id: 'department', name: 'الإدارة', type: 'text', required: true },
            { id: 'organization', name: 'المؤسسة', type: 'text', required: false },
            { id: 'signature', name: 'التوقيع', type: 'text', required: false },
            { id: 'photo', name: 'صورة الموظف', type: 'file', required: false }
        ],
        coordinates: {
            'line1': { x: 300, y: 50, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
            'line2': { x: 300, y: 90, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
            'line3': { x: 300, y: 130, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
            'employeeName': { x: 50, y: 200, fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
            'position': { x: 50, y: 240, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
            'department': { x: 50, y: 270, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
            'organization': { x: 300, y: 480, fontSize: 14, fontWeight: 'normal', textAlign: 'center' },
            'signature': { x: 325, y: 520, fontSize: 16, fontWeight: 'normal', textAlign: 'center' },
            'photo': { x: 630, y: 180, fontSize: 16, fontWeight: 'normal', textAlign: 'center' }
        },
        colors: {
            primary: '#2c3e50',
            secondary: '#3498db',
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
        }
    };

    const dataStr = JSON.stringify(defaultHRTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `hr_template_default_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('تم تصدير قالب الموارد البشرية الافتراضي');

    // إغلاق النافذة الحالية
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
}

// تطبيق قالب الموارد البشرية الافتراضي
function applyDefaultHRTemplate() {
    if (!confirm('هل أنت متأكد من تطبيق قالب الموارد البشرية الافتراضي؟ سيتم استبدال الإعدادات الحالية.')) return;

    // تطبيق الحقول الافتراضية للموارد البشرية
    const hrFields = [
        {
            id: 'employee_id',
            name: 'رقم الموظف',
            type: 'text',
            required: true,
            help: 'الرقم الوظيفي للموظف'
        },
        {
            id: 'hire_date',
            name: 'تاريخ التعيين',
            type: 'date',
            required: true,
            help: 'تاريخ بداية العمل'
        },
        {
            id: 'salary_grade',
            name: 'الدرجة الوظيفية',
            type: 'select',
            required: false,
            options: ['الدرجة الأولى', 'الدرجة الثانية', 'الدرجة الثالثة', 'الدرجة الرابعة'],
            help: 'التصنيف الوظيفي للموظف'
        }
    ];

    // تطبيق الإحداثيات الافتراضية
    const hrCoordinates = {
        'line1': { x: 300, y: 50, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
        'line2': { x: 300, y: 90, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
        'line3': { x: 300, y: 130, fontSize: 18, fontWeight: 'normal', textAlign: 'center' },
        'employeeName': { x: 50, y: 200, fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
        'position': { x: 50, y: 240, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'department': { x: 50, y: 270, fontSize: 16, fontWeight: 'normal', textAlign: 'right' },
        'employee_id': { x: 50, y: 300, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
        'hire_date': { x: 50, y: 330, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
        'salary_grade': { x: 50, y: 360, fontSize: 14, fontWeight: 'normal', textAlign: 'right' },
        'organization': { x: 300, y: 480, fontSize: 14, fontWeight: 'normal', textAlign: 'center' },
        'signature': { x: 325, y: 520, fontSize: 16, fontWeight: 'normal', textAlign: 'center' },
        'photo': { x: 630, y: 180, fontSize: 16, fontWeight: 'normal', textAlign: 'center' }
    };

    // تطبيق الخلفية (ألوان الموارد البشرية)
    currentBackground = 'hr_default';

    // حفظ التطبيق
    customFields = [...customFields, ...hrFields];
    currentCoordinates = hrCoordinates;

    saveCustomFields();
    localStorage.setItem('templateCoordinates', JSON.stringify(currentCoordinates));
    localStorage.setItem('currentBackground', currentBackground);

    showNotification('تم تطبيق قالب الموارد البشرية الافتراضي بنجاح');

    // إعادة تحميل الأقسام المتأثرة
    loadCustomFields();
    loadCoordinatesEditor();

    // إغلاق النافذة الحالية
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
}

// ===== وظائف إضافية لتحسين النظام =====

// إنشاء قوالب سريعة
function createQuickTemplate(type) {
    const templates = {
        'basic': {
            name: 'القالب الأساسي',
            description: 'قالب بسيط للاستخدام العام',
            fields: [
                { id: 'title', name: 'العنوان', type: 'text', required: true },
                { id: 'name', name: 'الاسم', type: 'text', required: true },
                { id: 'description', name: 'الوصف', type: 'textarea', required: false }
            ]
        },
        'certificate': {
            name: 'قالب الشهادات',
            description: 'مخصص لشهادات التقدير والإنجاز',
            fields: [
                { id: 'certificate_title', name: 'عنوان الشهادة', type: 'text', required: true },
                { id: 'recipient_name', name: 'اسم المستلم', type: 'text', required: true },
                { id: 'achievement', name: 'الإنجاز', type: 'textarea', required: true },
                { id: 'date_issued', name: 'تاريخ الإصدار', type: 'date', required: true }
            ]
        },
        'invitation': {
            name: 'قالب الدعوات',
            description: 'للمناسبات والفعاليات',
            fields: [
                { id: 'event_title', name: 'عنوان الفعالية', type: 'text', required: true },
                { id: 'event_date', name: 'تاريخ الفعالية', type: 'date', required: true },
                { id: 'event_time', name: 'وقت الفعالية', type: 'text', required: true },
                { id: 'event_location', name: 'مكان الفعالية', type: 'text', required: true },
                { id: 'dress_code', name: 'اللباس المطلوب', type: 'select', options: ['رسمي', 'شبه رسمي', 'كاجوال'], required: false }
            ]
        }
    };

    const template = templates[type];
    if (!template) return;

    const newTemplate = {
        id: type + '_' + Date.now(),
        ...template,
        created_at: new Date().toISOString(),
        type: 'quick_template'
    };

    templateConfigurations.push(newTemplate);
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    // إضافة للعرض
    const container = document.getElementById('savedTemplates');
    const configElement = createTemplateConfigElement(newTemplate);
    container.appendChild(configElement);

    showNotification(`تم إنشاء ${template.name} بنجاح`);
}

// نسخ تكوين قالب
function duplicateTemplateConfig(configId) {
    const config = templateConfigurations.find(c => c.id === configId);
    if (!config) return;

    const newName = prompt('أدخل اسم النسخة الجديدة:', config.name + ' - نسخة');
    if (!newName) return;

    const duplicatedConfig = {
        ...config,
        id: 'copy_' + Date.now(),
        name: newName,
        created_at: new Date().toISOString(),
        copied_from: config.id
    };

    templateConfigurations.push(duplicatedConfig);
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    // إضافة للعرض
    const container = document.getElementById('savedTemplates');
    const configElement = createTemplateConfigElement(duplicatedConfig);
    container.appendChild(configElement);

    showNotification(`تم نسخ القالب باسم "${newName}"`);
}

// البحث في القوالب
function searchTemplateConfigs() {
    const searchTerm = prompt('أدخل كلمة البحث:');
    if (!searchTerm) return;

    const results = templateConfigurations.filter(config =>
        config.name.includes(searchTerm) ||
        (config.description && config.description.includes(searchTerm))
    );

    if (results.length === 0) {
        showNotification('لم يتم العثور على نتائج', 'warning');
        return;
    }

    // إخفاء جميع القوالب
    document.querySelectorAll('.template-config-item').forEach(item => {
        item.style.display = 'none';
    });

    // إظهار النتائج فقط
    results.forEach(config => {
        const element = document.querySelector(`[onclick*="${config.id}"]`)?.closest('.template-config-item');
        if (element) {
            element.style.display = 'block';
        }
    });

    showNotification(`تم العثور على ${results.length} نتيجة`);
}

// إعادة تعيين البحث
function resetTemplateSearch() {
    document.querySelectorAll('.template-config-item').forEach(item => {
        item.style.display = 'block';
    });
    showNotification('تم إعادة تعيين البحث');
}

// تصدير جميع القوالب
function exportAllTemplateConfigs() {
    if (templateConfigurations.length === 0) {
        showNotification('لا توجد قوالب للتصدير', 'warning');
        return;
    }

    const exportData = {
        export_date: new Date().toISOString(),
        version: '1.0',
        total_templates: templateConfigurations.length,
        templates: templateConfigurations
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `all_templates_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('تم تصدير جميع القوالب');
}

// استيراد متعدد للقوالب
function importMultipleTemplates() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.multiple = true;

    fileInput.onchange = function(e) {
        const files = Array.from(e.target.files);
        let importedCount = 0;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);

                    // التحقق من نوع الملف
                    if (data.templates && Array.isArray(data.templates)) {
                        // ملف يحتوي على عدة قوالب
                        data.templates.forEach(template => {
                            template.id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                            template.imported_at = new Date().toISOString();
                            templateConfigurations.push(template);
                        });
                        importedCount += data.templates.length;
                    } else if (data.name) {
                        // ملف قالب واحد
                        data.id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        data.imported_at = new Date().toISOString();
                        templateConfigurations.push(data);
                        importedCount++;
                    }
                } catch (error) {
                    console.error('خطأ في قراءة ملف:', file.name, error);
                }
            };
            reader.readAsText(file);
        });

        // حفظ وتحديث العرض بعد معالجة جميع الملفات
        setTimeout(() => {
            localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));
            displayTemplateConfigurations();
            showNotification(`تم استيراد ${importedCount} قالب بنجاح`);
        }, 1000);
    };

    fileInput.click();
}

// إحصائيات القوالب
function showTemplateStatistics() {
    const totalTemplates = templateConfigurations.length;
    const hrTemplates = templateConfigurations.filter(t => t.type === 'hr_template').length;
    const quickTemplates = templateConfigurations.filter(t => t.type === 'quick_template').length;
    const importedTemplates = templateConfigurations.filter(t => t.imported_at).length;

    const avgFields = templateConfigurations.reduce((sum, t) => sum + (t.fields ? t.fields.length : 0), 0) / totalTemplates || 0;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(5px);
    `;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h2 style="margin: 0; font-size: 1.6rem;">📊 إحصائيات القوالب</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.85rem;">تحليل شامل لجميع القوالب المحفوظة</p>
                </div>
                <span style="font-size: 2rem; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.3s; padding: 5px;"
                      onclick="this.parentElement.parentElement.parentElement.remove()"
                      onmouseover="this.style.opacity='1'"
                      onmouseout="this.style.opacity='0.8'">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(52,152,219,0.3);">
                        <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${totalTemplates}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">إجمالي القوالب</div>
                    </div>
                    <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(231,76,60,0.3);">
                        <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${hrTemplates}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">قوالب الموارد البشرية</div>
                    </div>
                    <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #27ae60, #229954); color: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(39,174,96,0.3);">
                        <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${quickTemplates}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">القوالب السريعة</div>
                    </div>
                    <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(243,156,18,0.3);">
                        <div style="font-size: 3rem; font-weight: bold; margin-bottom: 10px;">${importedTemplates}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">قوالب مستوردة</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; border-radius: 15px;">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${avgFields.toFixed(1)}</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">متوسط الحقول لكل قالب</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #1abc9c, #16a085); color: white; border-radius: 15px;">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${templateConfigurations.filter(t => t.coordinates).length}</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">قوالب بإحداثيات مخصصة</div>
                    </div>
                </div>

                ${totalTemplates > 0 ? `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; border: 1px solid #dee2e6;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; text-align: center;">📈 تفاصيل إضافية</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">${templateConfigurations.filter(t => t.background).length}</div>
                            <div style="font-size: 0.8rem; color: #6c757d;">قوالب بخلفيات مخصصة</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">${templateConfigurations.filter(t => t.colors).length}</div>
                            <div style="font-size: 0.8rem; color: #6c757d;">قوالب بألوان مخصصة</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 10px;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60;">${templateConfigurations.filter(t => new Date(t.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}</div>
                            <div style="font-size: 0.8rem; color: #6c757d;">قوالب منشأة هذا الأسبوع</div>
                        </div>
                    </div>
                </div>
                ` : `
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 15px; border: 2px dashed #dee2e6;">
                    <div style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;">📋</div>
                    <h4 style="color: #6c757d; margin: 0;">لا توجد قوالب محفوظة بعد</h4>
                    <p style="color: #6c757d; margin: 10px 0 0 0;">ابدأ بإنشاء قالب جديد لرؤية الإحصائيات</p>
                </div>
                `}
            </div>
            <div class="modal-footer">
                <button onclick="exportAllTemplateConfigs()" class="btn btn-primary">📤 تصدير جميع القوالب</button>
                <button onclick="refreshTemplateConfigs()" class="btn btn-success">🔄 تحديث البيانات</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">إغلاق</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// تطبيق تكوين قالب
function applyTemplateConfig(configId) {
    const config = templateConfigurations.find(c => c.id === configId);
    if (!config) return;

    if (!confirm(`هل أنت متأكد من تطبيق تكوين "${config.name}"؟ سيتم استبدال الإعدادات الحالية.`)) return;

    // تطبيق الحقول المخصصة
    if (config.fields) {
        customFields = [...config.fields];
        saveCustomFields();
    }

    // تطبيق الخلفية
    if (config.background) {
        currentBackground = config.background;
        localStorage.setItem('currentBackground', currentBackground);
    }

    // تطبيق الإحداثيات
    if (config.coordinates) {
        currentCoordinates = {...config.coordinates};
        localStorage.setItem('templateCoordinates', JSON.stringify(currentCoordinates));
    }

    showNotification(`تم تطبيق تكوين "${config.name}" بنجاح`);

    // إعادة تحميل الأقسام المتأثرة
    loadCustomFields();
    loadBackgroundLibrary();
    loadCoordinatesEditor();
}

// تصدير تكوين قالب
function exportTemplateConfig(configId) {
    const config = templateConfigurations.find(c => c.id === configId);
    if (!config) return;

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `template_config_${config.name}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('تم تصدير تكوين القالب');
}

// تصدير التكوين الحالي
function exportTemplateConfiguration() {
    const currentConfig = {
        name: 'التكوين الحالي',
        description: 'تصدير للتكوين الحالي للنظام',
        created_at: new Date().toISOString(),
        fields: customFields,
        background: currentBackground,
        coordinates: currentCoordinates,
        colors: getTemplateColors()
    };

    const dataStr = JSON.stringify(currentConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `current_template_config_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showNotification('تم تصدير التكوين الحالي');
}

// استيراد تكوين قالب
function importTemplateConfiguration() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);

            // التحقق من صحة البيانات
            if (!config.name) {
                showNotification('ملف التكوين غير صحيح', 'error');
                return;
            }

            // إضافة معرف جديد
            config.id = 'imported_' + Date.now();
            config.imported_at = new Date().toISOString();

            templateConfigurations.push(config);
            localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

            // إضافة للعرض
            const container = document.getElementById('savedTemplates');
            const configElement = createTemplateConfigElement(config);
            container.appendChild(configElement);

            showNotification(`تم استيراد تكوين "${config.name}" بنجاح`);

        } catch (error) {
            showNotification('خطأ في قراءة ملف التكوين', 'error');
        }
    };

    reader.readAsText(file);
    fileInput.value = ''; // إعادة تعيين المدخل
}

// حذف تكوين قالب
function deleteTemplateConfig(configId) {
    if (!confirm('هل أنت متأكد من حذف هذا التكوين؟')) return;

    templateConfigurations = templateConfigurations.filter(c => c.id !== configId);
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    // إعادة تحميل العرض
    displayTemplateConfigurations();

    showNotification('تم حذف التكوين');
}

// تحديث قائمة قوالب التكوين
function refreshTemplateConfigs() {
    loadTemplateConfigurations();
    showNotification('تم تحديث قائمة القوالب');
}

// حذف جميع قوالب التكوين
function deleteAllTemplateConfigs() {
    if (!confirm('هل أنت متأكد من حذف جميع قوالب التكوين؟ هذا الإجراء لا يمكن التراجع عنه!')) return;

    templateConfigurations = [];
    localStorage.setItem('templateConfigurations', JSON.stringify(templateConfigurations));

    displayTemplateConfigurations();
    showNotification('تم حذف جميع قوالب التكوين');
}

// تهيئة نموذج الحقول المخصصة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const customFieldForm = document.getElementById('customFieldForm');
    if (customFieldForm) {
        customFieldForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCustomField();
        });
    }
});

// تحميل البيانات عند بدء التشغيل
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded');

    // تحميل بيانات لوحة المعلومات
    loadDashboardData();

    // تهيئة نموذج القالب إذا كان موجوداً
    setTimeout(() => {
        initializeTemplateForm();
    }, 100);
});
