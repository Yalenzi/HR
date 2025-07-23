import { useState, useRef } from 'react';
import { initDatabase, database } from '../../lib/database';

export default function CongratulationsTemplate({ data, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employeeName: data?.employeeName || '',
    employeeId: data?.employeeId || '',
    position: data?.position || '',
    department: data?.department || '',
    occasionType: data?.occasionType || 'ترقية',
    occasionDate: data?.occasionDate || new Date().toISOString().split('T')[0],
    congratulationMessage1: data?.congratulationMessage1 || 'يسعدنا أن نتقدم لكم بأحر التهاني والتبريكات',
    congratulationMessage2: data?.congratulationMessage2 || 'بمناسبة حصولكم على هذا الإنجاز المتميز',
    congratulationMessage3: data?.congratulationMessage3 || 'متمنين لكم دوام التوفيق والنجاح في مسيرتكم المهنية',
    senderTitle: data?.senderTitle || 'سعادة',
    senderPosition: data?.senderPosition || 'مدير المركز',
    senderHonorific: data?.senderHonorific || 'حفظه الله',
    managerName: data?.managerName || 'د. فواز جمال الديدب',
    employeePhoto: data?.employeePhoto || null,
    closingPhrase: data?.closingPhrase || 'هذا ولكم تحياتي'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const templateRef = useRef();

  const occasionTypes = [
    'ترقية', 'تكريم', 'إنجاز متميز', 'حصول على شهادة', 
    'تخرج', 'تعيين', 'نجاح في مهمة', 'تميز في الأداء'
  ];

  const senderTitles = ['سعادة', 'المدير', 'المساعد', 'الدكتور', 'الأستاذ'];
  const honorifics = ['حفظه الله', 'وفقه الله', 'المحترم', 'الموقر'];
  const closingPhrases = ['هذا ولكم تحياتي', 'هذا ولكم شكري', 'تقبلوا فائق الاحترام'];

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* أزرار التحكم */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="space-x-2 space-x-reverse">
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
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ fontFamily: 'MOH-Regular, Amiri, serif' }}
      >
        {/* الرأسية */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
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
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'MOH-Bold' }}>
            وزارة الصحة
          </h1>
          <h2 className="text-xl">المملكة العربية السعودية</h2>
        </div>

        {/* محتوى التهنئة */}
        <div className="p-8 space-y-6">
          {/* عنوان التهنئة */}
          <div className="text-center border-b-2 border-green-600 pb-4">
            <h2 className="text-2xl font-bold text-green-700" style={{ fontFamily: 'MOH-Bold' }}>
              🎉 مشهد تهنئة 🎉
            </h2>
          </div>

          {/* جدول بيانات الموظف */}
          <div className="bg-gray-50 rounded-lg p-6">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100">الاسم:</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) => handleChange('employeeName', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <span className="font-semibold text-green-700">{formData.employeeName}</span>
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100">الوظيفة:</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      formData.position
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100">رقم الموظف:</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => handleChange('employeeId', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      formData.employeeId
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100">القسم:</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      formData.department
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100">نوع المناسبة:</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <select
                        value={formData.occasionType}
                        onChange={(e) => handleChange('occasionType', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        {occasionTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-semibold text-blue-600">{formData.occasionType}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-100">التاريخ:</td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.occasionDate}
                        onChange={(e) => handleChange('occasionDate', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      new Date(formData.occasionDate).toLocaleDateString('ar-SA')
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* صورة الموظف */}
          {(formData.employeePhoto || isEditing) && (
            <div className="text-center">
              {formData.employeePhoto && (
                <img
                  src={formData.employeePhoto}
                  alt="صورة الموظف"
                  className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-green-600 shadow-lg"
                />
              )}
              {isEditing && (
                <div className="mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* رسالة المرسل */}
          <div className="text-right">
            <div className="inline-flex items-center space-x-2 space-x-reverse">
              {isEditing ? (
                <>
                  <select
                    value={formData.senderTitle}
                    onChange={(e) => handleChange('senderTitle', e.target.value)}
                    className="p-2 border rounded"
                  >
                    {senderTitles.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.senderPosition}
                    onChange={(e) => handleChange('senderPosition', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <select
                    value={formData.senderHonorific}
                    onChange={(e) => handleChange('senderHonorific', e.target.value)}
                    className="p-2 border rounded"
                  >
                    {honorifics.map(honor => (
                      <option key={honor} value={honor}>{honor}</option>
                    ))}
                  </select>
                </>
              ) : (
                <span className="text-lg">
                  {formData.senderTitle} {formData.senderPosition} {formData.senderHonorific}
                </span>
              )}
            </div>
          </div>

          {/* التحية */}
          <div className="text-center bg-green-50 p-4 rounded-lg">
            <p className="text-lg font-semibold text-green-700">
              السلام عليكم ورحمة الله وبركاته
            </p>
          </div>

          {/* رسائل التهنئة */}
          <div className="space-y-4 text-lg leading-relaxed">
            {[1, 2, 3].map(num => (
              <div key={num} className="text-center">
                {isEditing ? (
                  <textarea
                    value={formData[`congratulationMessage${num}`]}
                    onChange={(e) => handleChange(`congratulationMessage${num}`, e.target.value)}
                    className="w-full p-3 border rounded-lg text-center"
                    rows="2"
                  />
                ) : (
                  <p className="text-gray-700">
                    {formData[`congratulationMessage${num}`]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* الخاتمة */}
          <div className="text-center">
            {isEditing ? (
              <select
                value={formData.closingPhrase}
                onChange={(e) => handleChange('closingPhrase', e.target.value)}
                className="p-2 border rounded"
              >
                {closingPhrases.map(phrase => (
                  <option key={phrase} value={phrase}>{phrase}</option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-semibold text-green-700">
                {formData.closingPhrase}
              </p>
            )}
          </div>

          {/* التوقيع */}
          <div className="text-left mt-8">
            <div className="inline-block">
              <p className="font-semibold">مدير المركز</p>
              <p className="text-gray-600">الدكتور</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => handleChange('managerName', e.target.value)}
                  className="p-2 border rounded font-semibold"
                />
              ) : (
                <p className="font-bold text-green-700">{formData.managerName}</p>
              )}
            </div>
          </div>
        </div>

        {/* التذييل */}
        <div className="bg-green-600 text-white p-4 text-center">
          <p className="text-sm">
            وزارة الصحة - المملكة العربية السعودية
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
