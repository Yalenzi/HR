import { useState, useRef } from 'react';
import { initDatabase, database } from '../../lib/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function CongratulationsTemplate({ data, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employeeName: data?.employeeName || '',
    employeeId: data?.employeeId || '',
    position: data?.position || '',
    department: data?.department || '',
    managementName: data?.managementName || '',
    occasionType: data?.occasionType || 'تكليف',
    occasionDate: data?.occasionDate || new Date().toISOString().split('T')[0],
    customMessage: data?.customMessage || 'تتقدم إدارة الخدمات الطبية الشرعية بمنطقة الحدود الشمالية بالتهنئة للزميل [اسم الزميل] بمناسبة صدور قرار تمديد تكليفه مديراً ل[اسم الإدارة] بمركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية متمنين للزميل دوام التوفيق والنجاح',
    managerName: data?.managerName || 'د. فواز جمال الديدب',
    employeePhoto: data?.employeePhoto || null,
    backgroundImage: data?.backgroundImage || null,
    textPosition: data?.textPosition || 'center',
    backgroundColor: data?.backgroundColor || '#ffffff',
    textColor: data?.textColor || '#000000'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const templateRef = useRef();

  const occasionTypes = [
    'تكليف', 'تمديد تكليف', 'ترقية', 'تكريم', 'إنجاز متميز',
    'حصول على شهادة', 'تخرج', 'تعيين', 'نجاح في مهمة', 'تميز في الأداء'
  ];

  const textPositions = [
    { value: 'top', label: 'أعلى الصورة' },
    { value: 'center', label: 'في المنتصف' },
    { value: 'bottom', label: 'أسفل الصورة' },
    { value: 'overlay', label: 'فوق الصورة' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('employeePhoto', e.target.result);
      };
      reader.readAsDataURL(file);
    }
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

  const downloadAsImage = async () => {
    const element = templateRef.current;
    const canvas = await html2canvas(element, {
      backgroundColor: formData.backgroundColor,
      scale: 2,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `تهنئة-${formData.employeeName || 'موظف'}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadAsPDF = async () => {
    const element = templateRef.current;
    const canvas = await html2canvas(element, {
      backgroundColor: formData.backgroundColor,
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
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

    pdf.save(`تهنئة-${formData.employeeName || 'موظف'}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // حفظ في قاعدة البيانات
      await initDatabase();
      const congratulationData = {
        type: 'congratulations',
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        data: formData,
        createdAt: new Date().toISOString()
      };
      
      await database.addLetter(congratulationData);
      
      if (onSave) {
        onSave(formData);
      }
      
      alert('تم حفظ التهنئة بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ التهنئة:', error);
      alert('حدث خطأ أثناء حفظ التهنئة');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getContentPositionClass = () => {
    switch (formData.textPosition) {
      case 'top':
        return 'flex flex-col justify-start items-center pt-8';
      case 'bottom':
        return 'flex flex-col justify-end items-center pb-8';
      case 'overlay':
        return 'absolute inset-0 flex flex-col justify-center items-center';
      default:
        return 'flex flex-col justify-center items-center min-h-full';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* أزرار التحكم */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="space-x-2 space-x-reverse flex flex-wrap gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg ${
              isEditing
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? '🔒 إنهاء التحرير' : '✏️ تحرير'}
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            🖨️ طباعة
          </button>
          <button
            onClick={downloadAsImage}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            🖼️ تحميل صورة
          </button>
          <button
            onClick={downloadAsPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            📄 تحميل PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? '⏳ جاري الحفظ...' : '💾 حفظ'}
          </button>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            ❌ إلغاء
          </button>
        )}
      </div>

      {/* قالب التهنئة */}
      <div
        ref={templateRef}
        className="max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden relative"
        style={{
          fontFamily: 'MOH-Regular, Amiri, serif',
          backgroundColor: formData.backgroundColor,
          color: formData.textColor,
          backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '600px'
        }}
      >
        {/* طبقة شفافة للخلفية إذا كانت موجودة */}
        {formData.backgroundImage && (
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        )}

        {/* المحتوى الرئيسي */}
        <div className={`relative z-10 ${getContentPositionClass()}`}>
          {/* الرأسية */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center rounded-t-lg">
            <div className="flex justify-center items-center mb-4">
              <img
                src="/images/ministry-logo.png"
                alt="شعار وزارة الصحة"
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'MOH-Bold' }}>
              مركز الخدمات الطبية الشرعية
            </h1>
            <h2 className="text-lg">بمنطقة الحدود الشمالية</h2>
          </div>

          {/* محتوى التهنئة */}
          <div className="bg-white bg-opacity-95 p-8 space-y-6 rounded-b-lg">
            {/* عنوان التهنئة */}
            <div className="text-center border-b-2 border-green-600 pb-4">
              <h2 className="text-3xl font-bold text-green-700" style={{ fontFamily: 'MOH-Bold' }}>
                🎉 تهنئة 🎉
              </h2>
            </div>

            {/* صورة الموظف */}
            {(formData.employeePhoto || isEditing) && (
              <div className="text-center mb-6">
                {formData.employeePhoto && (
                  <img
                    src={formData.employeePhoto}
                    alt="صورة الموظف"
                    className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-green-600 shadow-lg"
                  />
                )}
                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الصورة الشخصية:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="block mx-auto"
                    />
                    <p className="text-xs text-gray-500 mt-1">أو أدخل رابط الصورة:</p>
                    <input
                      type="url"
                      value={formData.employeePhoto || ''}
                      onChange={(e) => handleChange('employeePhoto', e.target.value)}
                      placeholder="رابط الصورة"
                      className="mt-1 p-2 border rounded w-full max-w-md"
                    />
                  </div>
                )}
              </div>
            )}

            {/* النص المخصص */}
            <div className="text-center space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الزميل:
                    </label>
                    <input
                      type="text"
                      value={formData.employeeName}
                      onChange={(e) => handleChange('employeeName', e.target.value)}
                      className="w-full p-3 border rounded-lg text-center"
                      placeholder="اسم الزميل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الإدارة:
                    </label>
                    <input
                      type="text"
                      value={formData.managementName}
                      onChange={(e) => handleChange('managementName', e.target.value)}
                      className="w-full p-3 border rounded-lg text-center"
                      placeholder="اسم الإدارة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مناسبة التهنئة:
                    </label>
                    <select
                      value={formData.occasionType}
                      onChange={(e) => handleChange('occasionType', e.target.value)}
                      className="w-full p-3 border rounded-lg text-center"
                    >
                      {occasionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      النص المخصص:
                    </label>
                    <textarea
                      value={formData.customMessage}
                      onChange={(e) => handleChange('customMessage', e.target.value)}
                      className="w-full p-3 border rounded-lg text-center h-32"
                      placeholder="النص المخصص للتهنئة"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-xl leading-relaxed">
                    {formData.customMessage.split('[اسم الزميل]').map((part, index, array) => (
                      <span key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <span className="font-bold text-green-700 text-2xl">
                            {formData.employeeName}
                          </span>
                        )}
                      </span>
                    )).map((element, index, array) => {
                      if (typeof element === 'string') {
                        return element.split('[اسم الإدارة]').map((part, partIndex, partArray) => (
                          <span key={`${index}-${partIndex}`}>
                            {part}
                            {partIndex < partArray.length - 1 && (
                              <span className="font-bold text-blue-700">
                                {formData.managementName}
                              </span>
                            )}
                          </span>
                        ));
                      }
                      return element;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* خيارات التصميم في وضع التحرير */}
            {isEditing && (
              <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">خيارات التصميم:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موضع النص:
                    </label>
                    <select
                      value={formData.textPosition}
                      onChange={(e) => handleChange('textPosition', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {textPositions.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لون الخلفية:
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => handleChange('backgroundColor', e.target.value)}
                      className="w-full p-2 border rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لون النص:
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => handleChange('textColor', e.target.value)}
                      className="w-full p-2 border rounded h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الخلفية:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="w-full p-2 border rounded"
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

            {/* التوقيع */}
            <div className="text-center mt-8 pt-6 border-t-2 border-green-600">
              <p className="font-bold text-lg">مدير المركز</p>
              <p className="text-gray-600">الدكتور</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => handleChange('managerName', e.target.value)}
                  className="p-2 border rounded font-bold text-lg text-center"
                  placeholder="اسم المدير"
                />
              ) : (
                <p className="font-bold text-green-700 text-lg">{formData.managerName}</p>
              )}
            </div>
          </div>
        </div>

        {/* التذييل */}
        <div className="bg-green-600 text-white p-4 text-center">
          <p className="text-sm">
            مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية
          </p>
          <p className="text-xs mt-1">
            تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}
          </p>
        </div>
      </div>

      {/* CSS للطباعة */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { max-width: none; margin: 0; }
          .shadow-2xl { box-shadow: none; }
          .rounded-lg { border-radius: 0; }
        }

        @font-face {
          font-family: 'MOH-Regular';
          src: url('/fonts/MOH-Regular.ttf') format('truetype');
        }

        @font-face {
          font-family: 'MOH-Bold';
          src: url('/fonts/MOH-Bold.otf') format('opentype');
        }
      `}</style>
    </div>
  );
}
