import { useState, useRef, useEffect } from 'react';
import { initDatabase, database } from '../../lib/database';
import html2canvas from 'html2canvas';

export default function SimpleExtensionTemplateFixed({ data, onSave }) {
  const [formData, setFormData] = useState({
    employeeName: data?.employeeName || '',
    employeePhoto: data?.employeePhoto || null,
    date: data?.date || new Date().toISOString().split('T')[0],
    line1: data?.line1 || 'بكل الحب والتقدير',
    line2: data?.line2 || 'أتشرف بإعلامكم',
    line3: data?.line3 || 'بتمديد تكليفي في منصبي الحالي',
    department: data?.department || 'إدارة الموارد البشرية',
    position: data?.position || 'مدير إدارة',
    startDate: data?.startDate || 'الموافق ١٤٤٥/٠٣/١٥ هـ',
    endDate: data?.endDate || 'حتى تاريخ ١٤٤٦/٠٣/١٥ هـ',
    organization: data?.organization || 'وزارة التعليم',
    location: data?.location || 'الرياض - المملكة العربية السعودية',
    signature: data?.signature || 'مع أطيب التحيات'
  });

  // إعدادات الإحداثيات
  const [coordinates, setCoordinates] = useState({
    employeeName: {
      x: data?.coordinates?.employeeName?.x || 552,
      y: data?.coordinates?.employeeName?.y || 400, // تقليل Y من 824 إلى 400
      width: data?.coordinates?.employeeName?.width || 1248,
      height: data?.coordinates?.employeeName?.height || 168
    },
    employeePhoto: {
      x: data?.coordinates?.employeePhoto?.x || 912,
      y: data?.coordinates?.employeePhoto?.y || 650, // تقليل Y من 1328 إلى 650
      width: data?.coordinates?.employeePhoto?.width || 400, // زيادة العرض قليلاً
      height: data?.coordinates?.employeePhoto?.height || 500 // زيادة الارتفاع قليلاً
    }
  });

  // إعدادات القالب
  const [templateSettings, setTemplateSettings] = useState({
    scale: data?.templateSettings?.scale || 0.4,
    backgroundSize: data?.templateSettings?.backgroundSize || 'contain'
  });

  // إعدادات الاستجابة للشاشات
  const [screenSize, setScreenSize] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCoordinateEditor, setShowCoordinateEditor] = useState(false);
  const [isDragging, setIsDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const templateRef = useRef();
  const previewRef = useRef();

  // تحميل الإعدادات المحفوظة عند بدء التشغيل
  useEffect(() => {
    const savedCoords = localStorage.getItem('templateCoordinates');
    const savedSettings = localStorage.getItem('templateSettings');
    const savedFormData = localStorage.getItem('extensionFormData');
    const autoDownload = localStorage.getItem('autoDownload');

    if (savedCoords && !data?.coordinates) {
      try {
        setCoordinates(JSON.parse(savedCoords));
      } catch (e) {
        console.log('خطأ في تحميل الإحداثيات المحفوظة');
      }
    }

    if (savedSettings && !data?.templateSettings) {
      try {
        setTemplateSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.log('خطأ في تحميل إعدادات القالب المحفوظة');
      }
    }

    // تحميل بيانات النموذج من localStorage
    if (savedFormData && !data?.employeeName) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        localStorage.removeItem('extensionFormData'); // إزالة البيانات بعد التحميل
      } catch (e) {
        console.log('خطأ في تحميل بيانات النموذج');
      }
    }

    // تحميل تلقائي إذا كان مطلوباً
    if (autoDownload === 'true') {
      localStorage.removeItem('autoDownload');
      setTimeout(() => {
        downloadAsImage();
      }, 2000); // انتظار ثانيتين لضمان تحميل العناصر
    }
  }, []);

  // مراقبة حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newScreenSize = 'desktop';
      let newScale = 0.4;
      
      if (width < 768) {
        newScreenSize = 'mobile';
        newScale = 0.15;
        setIsMobile(true);
      } else if (width < 1024) {
        newScreenSize = 'tablet';
        newScale = 0.25;
        setIsMobile(false);
      } else if (width < 1920) {
        newScreenSize = 'laptop';
        newScale = 0.35;
        setIsMobile(false);
      } else {
        newScreenSize = 'desktop';
        newScale = 0.4;
        setIsMobile(false);
      }
      
      setScreenSize(newScreenSize);
      
      // تحديث المقياس تلقائياً إذا لم يكن محفوظاً
      if (!data?.templateSettings?.scale) {
        setTemplateSettings(prev => ({ ...prev, scale: newScale }));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // تنظيف مستمعي أحداث السحب والإفلات
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [data?.templateSettings?.scale]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoordinateChange = (element, property, value) => {
    setCoordinates(prev => ({
      ...prev,
      [element]: {
        ...prev[element],
        [property]: parseInt(value) || 0
      }
    }));
  };

  const handleTemplateSettingChange = (property, value) => {
    setTemplateSettings(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('employeePhoto', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await initDatabase();
      
      const templateData = {
        id: data?.id || Date.now().toString(),
        type: 'simple_extension_congratulations',
        title: `تهنئة تمديد تكليف - ${formData.employeeName}`,
        data: formData,
        coordinates: coordinates,
        templateSettings: templateSettings,
        createdAt: data?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (data?.id) {
        await database.updateTemplate(data.id, templateData);
      } else {
        await database.addTemplate(templateData);
      }

      if (onSave) {
        onSave(templateData);
      }
      
      alert('تم حفظ القالب بنجاح! ✅');
    } catch (error) {
      console.error('خطأ في حفظ القالب:', error);
      alert('حدث خطأ أثناء حفظ القالب');
    } finally {
      setSaving(false);
    }
  };

  const downloadAsImage = async () => {
    try {
      const element = showPreview ? previewRef.current : templateRef.current;
      if (!element) {
        alert('⚠️ لم يتم العثور على العنصر للتحميل');
        return;
      }

      // التأكد من تحميل جميع الصور قبل التحويل
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
      });

      await Promise.all(imagePromises);

      // انتظار قصير للتأكد من رسم العناصر
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // تقليل المقياس لتجنب مشاكل الذاكرة
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: true, // تفعيل السجلات للتشخيص
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // التأكد من نسخ الخطوط والأنماط
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-clone]');
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Cairo, Arial, sans-serif';
          }
        }
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas dimensions are zero');
      }

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `تهنئة-تمديد-تكليف-${formData.employeeName || 'موظف'}-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png', 0.9);
      link.click();

      alert('تم تحميل الصورة بجودة عالية! 🎉');
    } catch (error) {
      console.error('خطأ في تحميل الصورة:', error);
      alert(`حدث خطأ أثناء تحميل الصورة: ${error.message}`);
    }
  };

  const showPreviewModal = () => {
    setShowPreview(true);
  };

  const closePreviewModal = () => {
    setShowPreview(false);
  };

  // حساب مقياس المعاينة الصحيح
  const getPreviewScale = () => {
    const originalWidth = 2328;  // العرض الأصلي للقالب
    const originalHeight = 1650; // الارتفاع الجديد للقالب

    // استخدام نفس أبعاد القالب الحالي
    const currentDimensions = getTemplateDimensions();
    const previewWidth = isMobile ? 400 : currentDimensions.width * 0.5;
    const previewHeight = isMobile ? 500 : currentDimensions.height * 0.5;

    // حساب المقياس بناءً على النسبة
    const scaleX = previewWidth / originalWidth;
    const scaleY = previewHeight / originalHeight;

    // استخدام أصغر مقياس للحفاظ على النسبة
    return Math.min(scaleX, scaleY);
  };

  // وظائف السحب والإفلات المحسنة
  const handleMouseDown = (e, elementType) => {
    if (!showCoordinateEditor) return;

    e.preventDefault();
    e.stopPropagation();

    console.log(`Starting drag for: ${elementType}`);
    setIsDragging(elementType);

    const rect = e.currentTarget.getBoundingClientRect();
    const templateElement = templateRef.current;
    const templateRect = templateElement.getBoundingClientRect();

    // حساب الإزاحة النسبية داخل العنصر
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragOffset({
      x: offsetX,
      y: offsetY
    });

    console.log(`Drag offset: X=${offsetX}, Y=${offsetY}`);

    // إضافة مستمعي الأحداث للنافذة
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !showCoordinateEditor) return;

    e.preventDefault();
    const templateElement = templateRef.current;
    if (!templateElement) return;

    const templateRect = templateElement.getBoundingClientRect();
    const currentScale = getTemplateDimensions().scale;

    // حساب الموضع الجديد بناءً على موضع الماوس
    const newX = Math.round((e.clientX - templateRect.left - dragOffset.x) / currentScale);
    const newY = Math.round((e.clientY - templateRect.top - dragOffset.y) / currentScale);

    // التأكد من أن الإحداثيات داخل حدود القالب
    const templateWidth = getTemplateDimensions().width;
    const templateHeight = getTemplateDimensions().height;
    const elementWidth = coordinates[isDragging].width;
    const elementHeight = coordinates[isDragging].height;

    const maxX = templateWidth - elementWidth;
    const maxY = templateHeight - elementHeight;

    const finalX = Math.max(0, Math.min(newX, maxX));
    const finalY = Math.max(0, Math.min(newY, maxY));

    setCoordinates(prev => ({
      ...prev,
      [isDragging]: {
        ...prev[isDragging],
        x: finalX,
        y: finalY
      }
    }));

    // طباعة للتشخيص
    console.log(`Moving ${isDragging}: X=${finalX}, Y=${finalY}, Scale=${currentScale}`);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setDragOffset({ x: 0, y: 0 });

    // إزالة مستمعي الأحداث
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // التعامل مع اللمس للجوال
  const handleTouchStart = (e, elementType) => {
    if (!showCoordinateEditor) return;

    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(elementType);

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });

    // إضافة مستمعي أحداث اللمس
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !showCoordinateEditor) return;

    e.preventDefault();
    const touch = e.touches[0];
    const templateElement = templateRef.current;
    if (!templateElement) return;

    const templateRect = templateElement.getBoundingClientRect();
    const currentScale = getTemplateDimensions().scale;

    const newX = Math.round((touch.clientX - templateRect.left - dragOffset.x) / currentScale);
    const newY = Math.round((touch.clientY - templateRect.top - dragOffset.y) / currentScale);

    const maxX = getTemplateDimensions().width - coordinates[isDragging].width;
    const maxY = getTemplateDimensions().height - coordinates[isDragging].height;

    setCoordinates(prev => ({
      ...prev,
      [isDragging]: {
        ...prev[isDragging],
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(null);
    setDragOffset({ x: 0, y: 0 });

    // إزالة مستمعي أحداث اللمس
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  // حفظ الإحداثيات محلياً
  const saveCoordinates = () => {
    localStorage.setItem('templateCoordinates', JSON.stringify(coordinates));
    localStorage.setItem('templateSettings', JSON.stringify(templateSettings));
    alert('تم حفظ الإحداثيات والإعدادات محلياً! ✅');
  };

  // استعادة الإحداثيات الافتراضية
  const resetCoordinates = () => {
    const defaultCoords = {
      employeeName: {
        x: 552,
        y: 400, // محدث ليتناسب مع القالب الجديد
        width: 1248,
        height: 168
      },
      employeePhoto: {
        x: 912,
        y: 650, // محدث ليتناسب مع القالب الجديد
        width: 400, // محدث ليتناسب مع الصورة
        height: 500 // محدث ليتناسب مع الصورة
      }
    };
    setCoordinates(defaultCoords);
    alert('تم استعادة الإحداثيات الافتراضية! 🔄');
  };

  // الحصول على إعدادات الخلفية المناسبة لحجم الشاشة
  const getResponsiveBackgroundSettings = () => {
    const baseSettings = {
      backgroundImage: 'url(/images/extension-template-bg.png)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center top'
    };

    // للشاشات الصغيرة، استخدم دائماً contain للحفاظ على النسبة
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      return {
        ...baseSettings,
        backgroundSize: 'contain'
      };
    }

    // للشاشات الكبيرة، استخدم الإعداد المحدد من المستخدم
    return {
      ...baseSettings,
      backgroundSize: templateSettings.backgroundSize || 'contain'
    };
  };

  // الحصول على أبعاد القالب المناسبة
  const getTemplateDimensions = () => {
    // أبعاد أكثر تناسباً مع الصورة (أقصر وأعرض)
    const baseWidth = 2328;
    const baseHeight = 1650; // تقليل الارتفاع من 3300 إلى 1650 (النصف)

    switch (screenSize) {
      case 'mobile':
        return {
          width: Math.min(baseWidth, window.innerWidth - 40),
          height: Math.min(baseHeight, window.innerHeight * 1.2),
          scale: 0.2
        };
      case 'tablet':
        return {
          width: baseWidth,
          height: baseHeight,
          scale: 0.35
        };
      case 'laptop':
        return {
          width: baseWidth,
          height: baseHeight,
          scale: 0.5
        };
      default:
        return {
          width: baseWidth,
          height: baseHeight,
          scale: templateSettings.scale || 0.6
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Cairo, Arial, sans-serif' }}>
      {/* أزرار التحكم */}
      <div className="max-w-7xl mx-auto p-3 md:p-6 print:hidden template-container">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6 mb-3 md:mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-6 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">قالب تهنئة تمديد التكليف (محسن)</h1>
              <p className="text-sm text-gray-600 mt-1">
                حجم الشاشة: <span className="font-semibold">{screenSize}</span> | 
                المقياس: <span className="font-semibold">{templateSettings.scale}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto template-controls">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-base bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {isEditing ? (isMobile ? '🔒' : '🔒 إنهاء التحرير') : (isMobile ? '✏️' : '✏️ تحرير')}
              </button>
              <button
                onClick={() => setShowCoordinateEditor(!showCoordinateEditor)}
                className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-base bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
              >
                {showCoordinateEditor ? (isMobile ? '🔒' : '🔒 إنهاء الإحداثيات') : (isMobile ? '📐' : '📐 تحديد الإحداثيات')}
              </button>
              <button
                onClick={showPreviewModal}
                className="bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm md:text-base transition-colors"
              >
                {isMobile ? '👁️' : '👁️ معاينة'}
              </button>
              <button
                onClick={downloadAsImage}
                className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 text-sm md:text-base transition-colors"
              >
                {isMobile ? '📥' : '📥 حفظ صورة'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm md:text-base transition-colors"
              >
                {saving ? '⏳' : (isMobile ? '💾' : '💾 حفظ')}
              </button>
            </div>
          </div>

          {/* نموذج التحرير */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السطر الأول:
                </label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) => handleChange('line1', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="السطر الأول"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السطر الثاني:
                </label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) => handleChange('line2', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="السطر الثاني"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السطر الثالث:
                </label>
                <input
                  type="text"
                  value={formData.line3}
                  onChange={(e) => handleChange('line3', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="السطر الثالث"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الموظف:
                </label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="أدخل اسم الموظف"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإدارة/القسم:
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="الإدارة أو القسم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصب/الوظيفة:
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="المنصب أو الوظيفة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة الموظف:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full p-3 border rounded-lg"
                />
                {formData.employeePhoto && (
                  <div className="mt-2">
                    <img
                      src={formData.employeePhoto}
                      alt="معاينة الصورة"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* محرر الإحداثيات */}
          {showCoordinateEditor && (
            <div className="mb-6 p-3 md:p-6 bg-yellow-50 border border-yellow-200 rounded-lg coordinate-editor">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2 md:mb-0">⚙️ إعدادات الإحداثيات والقالب</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={saveCoordinates}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    💾 حفظ الإعدادات
                  </button>
                  <button
                    onClick={resetCoordinates}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    🔄 استعادة افتراضي
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 تعليمات:</strong> اسحب العناصر (النص والصورة) لتحديد موضعها. ستظهر الإحداثيات الحالية أعلى كل عنصر.
                </p>
                {isDragging && (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                    <strong>🔄 جاري السحب:</strong> {isDragging === 'employeeName' ? 'النص' : 'الصورة'}
                    <br />
                    <strong>الإحداثيات:</strong> X: {coordinates[isDragging].x}, Y: {coordinates[isDragging].y}
                  </div>
                )}
              </div>
              
              {/* إعدادات القالب */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حجم القالب (Scale):
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={templateSettings.scale}
                    onChange={(e) => handleTemplateSettingChange('scale', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{templateSettings.scale}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حجم الخلفية:
                  </label>
                  <select
                    value={templateSettings.backgroundSize}
                    onChange={(e) => handleTemplateSettingChange('backgroundSize', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="contain">احتواء (Contain) - الأفضل للجوال</option>
                    <option value="cover">تغطية (Cover) - ملء الشاشة</option>
                    <option value="100% 100%">ملء كامل - قد يشوه الصورة</option>
                    <option value="auto">تلقائي (Auto)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {templateSettings.backgroundSize === 'contain' && '✅ يحافظ على نسبة العرض إلى الارتفاع'}
                    {templateSettings.backgroundSize === 'cover' && '⚠️ قد يقطع أجزاء من الصورة'}
                    {templateSettings.backgroundSize === '100% 100%' && '❌ قد يشوه الصورة'}
                    {templateSettings.backgroundSize === 'auto' && 'ℹ️ الحجم الأصلي للصورة'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معلومات الشاشة:
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg text-sm">
                    <div>نوع الشاشة: <span className="font-semibold">{screenSize}</span></div>
                    <div>مقياس القالب: <span className="font-semibold">{getTemplateDimensions().scale}</span></div>
                    <div>عرض القالب: <span className="font-semibold">{getTemplateDimensions().width}px</span></div>
                    <div>ارتفاع القالب: <span className="font-semibold">{getTemplateDimensions().height}px</span></div>
                    <div className="mt-2 border-t pt-2">
                      <div>عرض المعاينة: <span className="font-semibold">{isMobile ? '400px' : `${getTemplateDimensions().width}px`}</span></div>
                      <div>ارتفاع المعاينة: <span className="font-semibold">{isMobile ? '500px' : `${getTemplateDimensions().height}px`}</span></div>
                      <div>مقياس المعاينة: <span className="font-semibold">{isMobile ? '0.8' : getTemplateDimensions().scale}</span></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {isMobile ? '📱 وضع الجوال نشط' : '🖥️ وضع سطح المكتب نشط'}
                    </div>
                    <div className="mt-1 text-xs text-green-600">
                      ✅ المعاينة تستخدم نفس الإحداثيات والأبعاد
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات الإحداثيات الحالية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📝 إحداثيات النص:</h4>
                  <div className="text-sm space-y-1">
                    <div>X: <span className="font-mono">{coordinates.employeeName.x}</span></div>
                    <div>Y: <span className="font-mono">{coordinates.employeeName.y}</span></div>
                    <div>العرض: <span className="font-mono">{coordinates.employeeName.width}</span></div>
                    <div>الارتفاع: <span className="font-mono">{coordinates.employeeName.height}</span></div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">📸 إحداثيات الصورة:</h4>
                  <div className="text-sm space-y-1">
                    <div>X: <span className="font-mono">{coordinates.employeePhoto.x}</span></div>
                    <div>Y: <span className="font-mono">{coordinates.employeePhoto.y}</span></div>
                    <div>العرض: <span className="font-mono">{coordinates.employeePhoto.width}</span></div>
                    <div>الارتفاع: <span className="font-mono">{coordinates.employeePhoto.height}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* القالب الرئيسي */}
      <div className="w-full mx-auto p-3 md:p-6 template-scroll-container">
        <div className="flex justify-center">
          <div
            ref={templateRef}
            className="relative bg-white shadow-2xl overflow-hidden"
            style={{
              width: `${getTemplateDimensions().width}px`,
              height: `${getTemplateDimensions().height}px`,
              transform: `scale(${getTemplateDimensions().scale})`,
              transformOrigin: 'top center',
              margin: '0 auto',
              maxWidth: '100vw',
              maxHeight: isMobile ? '80vh' : 'none'
            }}
            onMouseMove={isDragging ? handleMouseMove : undefined}
            onMouseUp={isDragging ? handleMouseUp : undefined}
            onTouchMove={isDragging ? handleTouchMove : undefined}
            onTouchEnd={isDragging ? handleTouchEnd : undefined}
          >
            {/* خلفية القالب - صورة PNG متجاوبة */}
            <div 
              className="absolute inset-0 template-background"
              style={getResponsiveBackgroundSettings()}
            >
              {/* اسم الموظف */}
              {formData.employeeName && (
                <div
                  className={`absolute flex items-center justify-center draggable-element ${
                    showCoordinateEditor ? 'border-2 border-blue-500 bg-blue-100 bg-opacity-50 cursor-move' : ''
                  } ${isDragging === 'employeeName' ? 'z-50 dragging' : ''}`}
                  style={{
                    left: `${coordinates.employeeName.x}px`,
                    top: `${coordinates.employeeName.y}px`,
                    width: `${coordinates.employeeName.width}px`,
                    height: `${coordinates.employeeName.height}px`,
                    userSelect: 'none'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'employeeName')}
                  onTouchStart={(e) => handleTouchStart(e, 'employeeName')}
                >
                  <h2
                    className="font-bold text-black text-center leading-tight pointer-events-none template-text"
                    style={{
                      fontFamily: 'Cairo, Arial, sans-serif',
                      textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                      fontSize: `${Math.min(
                        coordinates.employeeName.width / (isMobile ? 8 : 15),
                        coordinates.employeeName.height / (isMobile ? 1.5 : 2)
                      )}px`,
                      lineHeight: isMobile ? '1.2' : '1.1'
                    }}
                  >
                    {formData.employeeName}
                  </h2>
                  {showCoordinateEditor && (
                    <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
                      X: {coordinates.employeeName.x}, Y: {coordinates.employeeName.y}
                      {isDragging === 'employeeName' && <span className="ml-2">🔄 يتم السحب</span>}
                    </div>
                  )}
                </div>
              )}

              {/* صورة الموظف */}
              {formData.employeePhoto && (
                <div
                  className={`absolute overflow-hidden draggable-element ${
                    showCoordinateEditor ? 'border-2 border-green-500 bg-green-100 bg-opacity-50 cursor-move' : ''
                  } ${isDragging === 'employeePhoto' ? 'z-50 dragging' : ''}`}
                  style={{
                    left: `${coordinates.employeePhoto.x}px`,
                    top: `${coordinates.employeePhoto.y}px`,
                    width: `${coordinates.employeePhoto.width}px`,
                    height: `${coordinates.employeePhoto.height}px`,
                    userSelect: 'none'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'employeePhoto')}
                  onTouchStart={(e) => handleTouchStart(e, 'employeePhoto')}
                >
                  <img
                    src={formData.employeePhoto}
                    alt="صورة الموظف"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {showCoordinateEditor && (
                    <div className="absolute -top-8 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
                      X: {coordinates.employeePhoto.x}, Y: {coordinates.employeePhoto.y}
                      {isDragging === 'employeePhoto' && <span className="ml-2">🔄 يتم السحب</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal المعاينة */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-full overflow-auto">
            <div className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                <h3 className="text-lg md:text-xl font-bold">معاينة القالب</h3>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={downloadAsImage}
                    className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 text-sm md:text-base flex-1 md:flex-none"
                  >
                    📥 {isMobile ? 'تحميل' : 'تحميل الصورة'}
                  </button>
                  <button
                    onClick={closePreviewModal}
                    className="bg-gray-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-600 text-sm md:text-base flex-1 md:flex-none"
                  >
                    ❌ إغلاق
                  </button>
                </div>
              </div>
              <div
                ref={previewRef}
                className="relative bg-white mx-auto"
                style={{
                  width: isMobile ? '400px' : `${getTemplateDimensions().width}px`,
                  height: isMobile ? '500px' : `${getTemplateDimensions().height}px`,
                  transform: isMobile ? 'scale(0.8)' : `scale(${getTemplateDimensions().scale})`,
                  transformOrigin: 'top center',
                  maxWidth: '100%'
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={getResponsiveBackgroundSettings()}
                >
                  {/* محتوى المعاينة - نفس الإحداثيات */}
                  {formData.employeeName && (
                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `${coordinates.employeeName.x}px`,
                        top: `${coordinates.employeeName.y}px`,
                        width: `${coordinates.employeeName.width}px`,
                        height: `${coordinates.employeeName.height}px`
                      }}
                    >
                      <h2
                        className="font-bold text-black text-center leading-tight"
                        style={{
                          fontFamily: 'Cairo, Arial, sans-serif',
                          fontSize: `${Math.min(
                            coordinates.employeeName.width / (isMobile ? 8 : 15),
                            coordinates.employeeName.height / (isMobile ? 1.5 : 2)
                          )}px`,
                          textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                          lineHeight: isMobile ? '1.2' : '1.1'
                        }}
                      >
                        {formData.employeeName}
                      </h2>
                    </div>
                  )}

                  {formData.employeePhoto && (
                    <div
                      className="absolute overflow-hidden"
                      style={{
                        left: `${coordinates.employeePhoto.x}px`,
                        top: `${coordinates.employeePhoto.y}px`,
                        width: `${coordinates.employeePhoto.width}px`,
                        height: `${coordinates.employeePhoto.height}px`
                      }}
                    >
                      <img
                        src={formData.employeePhoto}
                        alt="صورة الموظف"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
