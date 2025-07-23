import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AdvancedTemplateEditor({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'congratulations',
    title: template?.title || '',
    content: template?.content || '',
    backgroundColor: template?.backgroundColor || '#ffffff',
    textColor: template?.textColor || '#000000',
    backgroundImage: template?.backgroundImage || null,
    textPosition: template?.textPosition || 'center',
    fontSize: template?.fontSize || '18',
    fontFamily: template?.fontFamily || 'Amiri',
    borderStyle: template?.borderStyle || 'none',
    borderColor: template?.borderColor || '#000000',
    borderWidth: template?.borderWidth || '1',
    padding: template?.padding || '20',
    isActive: template?.isActive ?? true
  });

  const [previewMode, setPreviewMode] = useState(false);
  const previewRef = useRef();

  const templateTypes = [
    { value: 'certificate', label: 'شهادة عمل' },
    { value: 'clearance', label: 'إخلاء طرف' },
    { value: 'salary', label: 'شهادة راتب' },
    { value: 'witness', label: 'مشهد موظف' },
    { value: 'congratulations', label: 'قالب التهنئة' },
    { value: 'experience', label: 'شهادة خبرة' }
  ];

  const textPositions = [
    { value: 'top', label: 'أعلى' },
    { value: 'center', label: 'وسط' },
    { value: 'bottom', label: 'أسفل' },
    { value: 'overlay', label: 'فوق الخلفية' }
  ];

  const fontFamilies = [
    { value: 'Amiri', label: 'Amiri' },
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Tajawal', label: 'Tajawal' },
    { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' }
  ];

  const borderStyles = [
    { value: 'none', label: 'بدون حدود' },
    { value: 'solid', label: 'خط مستقيم' },
    { value: 'dashed', label: 'خط متقطع' },
    { value: 'dotted', label: 'نقاط' },
    { value: 'double', label: 'خط مزدوج' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('backgroundImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const downloadAsImage = async () => {
    if (!previewRef.current) return;
    
    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: formData.backgroundColor,
      scale: 2,
      useCORS: true
    });
    
    const link = document.createElement('a');
    link.download = `template-${formData.name || 'preview'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadAsPDF = async () => {
    if (!previewRef.current) return;
    
    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: formData.backgroundColor,
      scale: 2,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`template-${formData.name || 'preview'}.pdf`);
  };

  const getPreviewStyle = () => ({
    backgroundColor: formData.backgroundColor,
    color: formData.textColor,
    backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontSize: `${formData.fontSize}px`,
    fontFamily: formData.fontFamily,
    border: formData.borderStyle !== 'none' ? `${formData.borderWidth}px ${formData.borderStyle} ${formData.borderColor}` : 'none',
    padding: `${formData.padding}px`,
    minHeight: '400px',
    position: 'relative'
  });

  const getContentPositionClass = () => {
    switch (formData.textPosition) {
      case 'top':
        return 'flex flex-col justify-start items-center pt-8';
      case 'bottom':
        return 'flex flex-col justify-end items-center pb-8';
      case 'overlay':
        return 'absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white';
      default:
        return 'flex flex-col justify-center items-center min-h-full';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {template ? 'تعديل القالب' : 'إنشاء قالب جديد'}
            </h2>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg ${
                  previewMode 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {previewMode ? '📝 تحرير' : '👁️ معاينة'}
              </button>
              {previewMode && (
                <>
                  <button
                    onClick={downloadAsImage}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    🖼️ صورة
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    📄 PDF
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                💾 حفظ
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                ❌ إلغاء
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Panel التحرير */}
          {!previewMode && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">إعدادات القالب</h3>
              
              {/* معلومات أساسية */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم القالب
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="اسم القالب"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع القالب
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان القالب
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="عنوان القالب"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محتوى القالب
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-32"
                    placeholder="محتوى القالب..."
                  />
                </div>
              </div>

              {/* إعدادات التصميم */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">إعدادات التصميم</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لون الخلفية
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => handleChange('backgroundColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لون النص
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => handleChange('textColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حجم الخط
                    </label>
                    <input
                      type="number"
                      value={formData.fontSize}
                      onChange={(e) => handleChange('fontSize', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="12"
                      max="48"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الخط
                    </label>
                    <select
                      value={formData.fontFamily}
                      onChange={(e) => handleChange('fontFamily', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {fontFamilies.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موضع النص
                    </label>
                    <select
                      value={formData.textPosition}
                      onChange={(e) => handleChange('textPosition', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {textPositions.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نمط الحدود
                    </label>
                    <select
                      value={formData.borderStyle}
                      onChange={(e) => handleChange('borderStyle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {borderStyles.map(style => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الخلفية
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {formData.backgroundImage && (
                    <button
                      onClick={() => handleChange('backgroundImage', null)}
                      className="mt-2 text-red-600 text-sm hover:underline"
                    >
                      إزالة الخلفية
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* المعاينة */}
          <div className={previewMode ? 'col-span-2' : ''}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعاينة</h3>
            <div
              ref={previewRef}
              className="border border-gray-300 rounded-lg overflow-hidden"
              style={getPreviewStyle()}
            >
              <div className={getContentPositionClass()}>
                <div className="text-center space-y-4 p-4">
                  {formData.title && (
                    <h1 className="text-2xl font-bold">{formData.title}</h1>
                  )}
                  {formData.content && (
                    <div className="whitespace-pre-wrap">{formData.content}</div>
                  )}
                  {!formData.content && (
                    <p className="text-gray-500">محتوى القالب سيظهر هنا...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
