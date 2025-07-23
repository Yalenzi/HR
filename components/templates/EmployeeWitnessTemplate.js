import { useState, useRef } from 'react';
import { initDatabase, database } from '../../lib/database';

export default function EmployeeWitnessTemplate({ data, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employeeName: data?.employeeName || '',
    position: data?.position || '',
    employeeId: data?.employeeId || '',
    nationality: data?.nationality || 'سعودي',
    additionalInfo: data?.additionalInfo || '',
    senderTitle: data?.senderTitle || 'سعادة',
    senderHonorific: data?.senderHonorific || 'حفظه الله',
    letterContent: data?.letterContent || 'تشهد إدارة الخدمات الشرعية بمركز الخدمات الشرعية أن الموظف المذكور أعلاه يعمل لدينا ويؤدي مهامه بكفاءة عالية ونزاهة تامة.',
    closingPhrase: data?.closingPhrase || 'هذا ولكم تحياتي',
    managerName: data?.managerName || 'د. محمد أحمد السعيد',
    facilityName: data?.facilityName || 'مركز الخدمات الشرعية',
    issueDate: data?.issueDate || new Date().toISOString().split('T')[0]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const templateRef = useRef();

  const senderTitles = ['سعادة', 'المدير', 'المساعد', 'الدكتور', 'الأستاذ'];
  const honorifics = ['حفظه الله', 'وفقه الله', 'المحترم', 'الموقر'];
  const closingPhrases = ['هذا ولكم تحياتي', 'هذا ولكم شكري', 'تقبلوا فائق الاحترام'];
  const nationalities = ['سعودي', 'مصري', 'سوري', 'أردني', 'لبناني', 'فلسطيني', 'عراقي', 'يمني', 'سوداني', 'مغربي', 'تونسي', 'جزائري', 'ليبي', 'أخرى'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await initDatabase();
      const witnessData = {
        type: 'witness',
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        data: formData,
        createdAt: new Date().toISOString()
      };
      
      await database.addLetter(witnessData);
      
      if (onSave) {
        onSave(formData);
      }
      
      alert('تم حفظ مشهد الموظف بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ مشهد الموظف:', error);
      alert('حدث خطأ أثناء حفظ مشهد الموظف');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" style={{ fontFamily: 'Amiri, serif' }}>
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

      {/* مشهد الموظف */}
      <div 
        ref={templateRef}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
      >
        {/* الرأسية */}
        <div className="text-center p-8 border-b-2 border-green-600">
          {/* شعار الإدارة */}
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/images/ministry-logo.png" 
              alt="شعار الإدارة" 
              className="h-20 w-20 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* عنوان الصفحة */}
          <h1 className="text-4xl font-bold text-green-700 mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            مشهد موظف
          </h1>
          
          <div className="text-lg text-gray-600">
            {isEditing ? (
              <input
                type="text"
                value={formData.facilityName}
                onChange={(e) => handleChange('facilityName', e.target.value)}
                className="text-center border-b-2 border-gray-300 bg-transparent text-lg"
                placeholder="اسم المنشأة"
              />
            ) : (
              formData.facilityName
            )}
          </div>
        </div>

        {/* محتوى المشهد */}
        <div className="p-8 space-y-8">
          {/* جدول بيانات الموظف */}
          <div className="bg-gray-50 rounded-lg p-6">
            <table className="w-full border-collapse border-2 border-green-600">
              <tbody>
                <tr className="border-b-2 border-green-600">
                  <td className="py-4 px-6 font-bold text-lg bg-green-100 border-l-2 border-green-600 w-1/3">
                    الاسم:
                  </td>
                  <td className="py-4 px-6 text-lg">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) => handleChange('employeeName', e.target.value)}
                        className="w-full p-2 border rounded text-right"
                        placeholder="اسم الموظف"
                      />
                    ) : (
                      <span className="font-semibold text-green-700">{formData.employeeName}</span>
                    )}
                  </td>
                </tr>
                
                <tr className="border-b-2 border-green-600">
                  <td className="py-4 px-6 font-bold text-lg bg-green-100 border-l-2 border-green-600">
                    الوظيفة:
                  </td>
                  <td className="py-4 px-6 text-lg">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="w-full p-2 border rounded text-right"
                        placeholder="المسمى الوظيفي"
                      />
                    ) : (
                      formData.position
                    )}
                  </td>
                </tr>
                
                <tr className="border-b-2 border-green-600">
                  <td className="py-4 px-6 font-bold text-lg bg-green-100 border-l-2 border-green-600">
                    رقم الموظف:
                  </td>
                  <td className="py-4 px-6 text-lg">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => handleChange('employeeId', e.target.value)}
                        className="w-full p-2 border rounded text-right"
                        placeholder="رقم الموظف"
                      />
                    ) : (
                      formData.employeeId
                    )}
                  </td>
                </tr>
                
                <tr className="border-b-2 border-green-600">
                  <td className="py-4 px-6 font-bold text-lg bg-green-100 border-l-2 border-green-600">
                    الجنسية:
                  </td>
                  <td className="py-4 px-6 text-lg">
                    {isEditing ? (
                      <select
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                        className="w-full p-2 border rounded text-right"
                      >
                        {nationalities.map(nat => (
                          <option key={nat} value={nat}>{nat}</option>
                        ))}
                      </select>
                    ) : (
                      formData.nationality
                    )}
                  </td>
                </tr>
                
                {/* صف إضافي فارغ */}
                <tr>
                  <td className="py-4 px-6 font-bold text-lg bg-green-100 border-l-2 border-green-600">
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="حقل إضافي"
                        className="w-full p-2 border rounded text-right bg-green-50"
                      />
                    ) : (
                      'معلومات إضافية:'
                    )}
                  </td>
                  <td className="py-4 px-6 text-lg">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.additionalInfo}
                        onChange={(e) => handleChange('additionalInfo', e.target.value)}
                        className="w-full p-2 border rounded text-right"
                        placeholder="معلومات إضافية"
                      />
                    ) : (
                      formData.additionalInfo || '_______________'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* بيانات المرسل */}
          <div className="text-right">
            <div className="inline-flex items-center space-x-3 space-x-reverse text-lg">
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
                  <span>مدير عام التجمع</span>
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
                <span className="font-semibold">
                  {formData.senderTitle} مدير عام التجمع {formData.senderHonorific}
                </span>
              )}
            </div>
          </div>

          {/* التحية */}
          <div className="text-center bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <p className="text-xl font-bold text-green-700">
              السلام عليكم ورحمة الله وبركاته
            </p>
          </div>

          {/* نص الخطاب */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-lg leading-relaxed">
              {isEditing ? (
                <textarea
                  value={formData.letterContent}
                  onChange={(e) => handleChange('letterContent', e.target.value)}
                  className="w-full p-4 border rounded-lg text-right h-32"
                  placeholder="تشهد إدارة كذا..."
                />
              ) : (
                <p className="text-justify">
                  {formData.letterContent}
                </p>
              )}
            </div>
          </div>

          {/* عبارة الختام */}
          <div className="text-center">
            {isEditing ? (
              <select
                value={formData.closingPhrase}
                onChange={(e) => handleChange('closingPhrase', e.target.value)}
                className="p-3 border rounded text-lg"
              >
                {closingPhrases.map(phrase => (
                  <option key={phrase} value={phrase}>{phrase}</option>
                ))}
              </select>
            ) : (
              <p className="text-xl font-semibold text-green-700">
                {formData.closingPhrase}
              </p>
            )}
          </div>

          {/* التوقيع */}
          <div className="flex justify-between items-end mt-12">
            <div className="text-left">
              <div className="space-y-2">
                <p className="font-bold text-lg">مدير المركز</p>
                <p className="text-gray-600">الدكتور</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    className="p-2 border rounded font-bold text-lg"
                    placeholder="اسم المدير"
                  />
                ) : (
                  <p className="font-bold text-green-700 text-lg">{formData.managerName}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-gray-600">التاريخ:</p>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                  className="p-2 border rounded"
                />
              ) : (
                <p className="font-semibold">
                  {new Date(formData.issueDate).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* التذييل */}
        <div className="bg-green-600 text-white p-4 text-center">
          <p className="text-sm">
            {formData.facilityName} - المملكة العربية السعودية
          </p>
        </div>
      </div>

      {/* CSS للطباعة والخطوط */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        
        @media print {
          body { margin: 0; font-family: 'Amiri', serif; }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { max-width: none; margin: 0; }
          .shadow-2xl { box-shadow: none; }
          .rounded-lg { border-radius: 0; }
          .bg-gray-50 { background: white; }
        }
        
        * {
          font-family: 'Amiri', serif;
        }
        
        @media (max-width: 768px) {
          .max-w-4xl {
            margin: 0;
            border-radius: 0;
          }
          
          table {
            font-size: 0.9rem;
          }
          
          .text-4xl {
            font-size: 2rem;
          }
          
          .text-xl {
            font-size: 1.1rem;
          }
          
          .text-lg {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
