import { useState } from 'react';
import DigitalSignature from './DigitalSignature';

export default function PDFCustomizer({ onSettingsChange, currentSettings }) {
  const [settings, setSettings] = useState({
    // إعدادات الخط
    fontSize: 14,
    fontFamily: 'MOH-Regular',
    lineHeight: 1.8,
    textColor: '#000000',
    
    // إعدادات الصفحة
    pageMargins: { top: 20, right: 20, bottom: 20, left: 20 },
    headerHeight: 80,
    footerHeight: 40,
    
    // إعدادات الشعار والرأسية
    showLogo: true,
    logoSize: 'medium', // small, medium, large
    headerStyle: 'official', // official, simple, modern
    
    // إعدادات الألوان
    primaryColor: '#2d5016', // أخضر وزارة الصحة
    secondaryColor: '#f0f8e8',
    borderColor: '#2d5016',
    
    // إعدادات التوقيع
    signature: null,
    signaturePosition: 'center', // left, center, right
    
    // إعدادات إضافية
    showPageNumbers: true,
    showDate: true,
    showLetterNumber: true,
    customFooter: '',
    
    ...currentSettings
  });

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    const newSettings = {
      ...settings,
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value
      }
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const fontOptions = [
    { value: 'MOH-Regular', label: 'خط وزارة الصحة العادي' },
    { value: 'MOH-Bold', label: 'خط وزارة الصحة العريض' },
    { value: 'MOH-Light', label: 'خط وزارة الصحة الخفيف' },
    { value: 'Tajawal', label: 'خط تجوال' },
    { value: 'Arial', label: 'Arial' }
  ];

  const headerStyles = [
    { value: 'official', label: 'رسمي (مع الشعار والحدود)' },
    { value: 'simple', label: 'بسيط (نص فقط)' },
    { value: 'modern', label: 'عصري (تصميم مبسط)' }
  ];

  const logoSizes = [
    { value: 'small', label: 'صغير' },
    { value: 'medium', label: 'متوسط' },
    { value: 'large', label: 'كبير' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <h3 className="text-xl font-bold mb-6">تخصيص تنسيق PDF</h3>
      
      <div className="space-y-6">
        {/* إعدادات الخط */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3 text-green-700">إعدادات الخط</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">نوع الخط</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                حجم الخط: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="20"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                تباعد الأسطر: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.5"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">لون النص</label>
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => handleSettingChange('textColor', e.target.value)}
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
        </div>

        {/* إعدادات الصفحة */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3 text-green-700">إعدادات الصفحة</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">هامش علوي</label>
              <input
                type="number"
                value={settings.pageMargins.top}
                onChange={(e) => handleNestedSettingChange('pageMargins', 'top', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="10"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">هامش أيمن</label>
              <input
                type="number"
                value={settings.pageMargins.right}
                onChange={(e) => handleNestedSettingChange('pageMargins', 'right', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="10"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">هامش سفلي</label>
              <input
                type="number"
                value={settings.pageMargins.bottom}
                onChange={(e) => handleNestedSettingChange('pageMargins', 'bottom', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="10"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">هامش أيسر</label>
              <input
                type="number"
                value={settings.pageMargins.left}
                onChange={(e) => handleNestedSettingChange('pageMargins', 'left', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
                min="10"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* إعدادات الرأسية */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3 text-green-700">إعدادات الرأسية</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">نمط الرأسية</label>
              <select
                value={settings.headerStyle}
                onChange={(e) => handleSettingChange('headerStyle', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {headerStyles.map(style => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">حجم الشعار</label>
              <select
                value={settings.logoSize}
                onChange={(e) => handleSettingChange('logoSize', e.target.value)}
                className="w-full p-2 border rounded"
                disabled={!settings.showLogo}
              >
                {logoSizes.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showLogo}
                onChange={(e) => handleSettingChange('showLogo', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium">إظهار الشعار</span>
            </label>
          </div>
        </div>

        {/* إعدادات الألوان */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3 text-green-700">إعدادات الألوان</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اللون الأساسي</label>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">اللون الثانوي</label>
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">لون الحدود</label>
              <input
                type="color"
                value={settings.borderColor}
                onChange={(e) => handleSettingChange('borderColor', e.target.value)}
                className="w-full h-10 border rounded"
              />
            </div>
          </div>
        </div>

        {/* التوقيع الرقمي */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3 text-green-700">التوقيع الرقمي</h4>
          <DigitalSignature
            onSignatureChange={(signature) => handleSettingChange('signature', signature)}
            currentSignature={settings.signature}
          />
          
          {settings.signature && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">موضع التوقيع</label>
              <select
                value={settings.signaturePosition}
                onChange={(e) => handleSettingChange('signaturePosition', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="left">يسار</option>
                <option value="center">وسط</option>
                <option value="right">يمين</option>
              </select>
            </div>
          )}
        </div>

        {/* إعدادات إضافية */}
        <div>
          <h4 className="font-semibold mb-3 text-green-700">إعدادات إضافية</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showPageNumbers}
                onChange={(e) => handleSettingChange('showPageNumbers', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium">إظهار أرقام الصفحات</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showDate}
                onChange={(e) => handleSettingChange('showDate', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium">إظهار التاريخ</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showLetterNumber}
                onChange={(e) => handleSettingChange('showLetterNumber', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium">إظهار رقم الخطاب</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium mb-2">تذييل مخصص</label>
              <textarea
                value={settings.customFooter}
                onChange={(e) => handleSettingChange('customFooter', e.target.value)}
                className="w-full p-2 border rounded"
                rows="2"
                placeholder="نص إضافي في أسفل الصفحة"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
