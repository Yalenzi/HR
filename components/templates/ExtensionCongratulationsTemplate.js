import { useState, useRef } from 'react';
import { initDatabase, database } from '../../lib/database';
import html2canvas from 'html2canvas';

export default function ExtensionCongratulationsTemplate({ data, onSave }) {
  const [formData, setFormData] = useState({
    employeeName: data?.employeeName || '',
    employeePhoto: data?.employeePhoto || null,
    department: data?.department || 'خدمات شؤون الوفيات',
    facilityName: data?.facilityName || 'مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية',
    managerName: data?.managerName || 'د. فواز جمال الديدب',
    date: data?.date || new Date().toISOString().split('T')[0]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const templateRef = useRef();
  const previewRef = useRef();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        type: 'extension_congratulations',
        title: `تهنئة تمديد تكليف - ${formData.employeeName}`,
        data: formData,
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

  const handlePrint = () => {
    window.print();
  };

  const downloadAsImage = async () => {
    try {
      const element = showPreview ? previewRef.current : templateRef.current;
      if (!element) return;

      // إخفاء أزرار التحكم مؤقتاً
      const buttons = element.querySelectorAll('.print\\:hidden');
      buttons.forEach(btn => btn.style.display = 'none');

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 3, // جودة عالية جداً
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0
      });

      // إعادة إظهار الأزرار
      buttons.forEach(btn => btn.style.display = '');

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `تهنئة-تمديد-تكليف-${formData.employeeName || 'موظف'}-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      alert('تم تحميل الصورة بجودة عالية! 🎉');
    } catch (error) {
      console.error('خطأ في تحميل الصورة:', error);
      alert('حدث خطأ أثناء تحميل الصورة');
    }
  };

  const showPreviewModal = () => {
    setShowPreview(true);
  };

  const closePreviewModal = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Cairo, Amiri, serif' }}>
      {/* أزرار التحكم */}
      <div className="max-w-6xl mx-auto p-6 print:hidden">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">قالب تهنئة تمديد التكليف</h1>
            <div className="flex space-x-2 space-x-reverse">
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
                onClick={showPreviewModal}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                👁️ معاينة
              </button>
              <button
                onClick={downloadAsImage}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                📥 حفظ صورة عالية الجودة
              </button>
              <button
                onClick={handlePrint}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                🖨️ طباعة
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? '⏳ جاري الحفظ...' : '💾 حفظ'}
              </button>
              <a
                href="/quick-guide.md"
                target="_blank"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                📖 دليل سريع
              </a>
            </div>
          </div>

          {/* نموذج التحرير */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-gray-50 rounded-lg">
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
                  القسم/الإدارة:
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="أدخل اسم القسم أو الإدارة"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ:
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* القالب الرئيسي */}
      <div className="max-w-6xl mx-auto p-6">
        <div 
          ref={templateRef}
          className="relative bg-white shadow-2xl"
          style={{
            width: '2328px', // A4 width at 300 DPI
            height: '3300px', // A4 height at 300 DPI
            transform: 'scale(0.3)',
            transformOrigin: 'top right',
            margin: '0 auto'
          }}
        >
          {/* خلفية القالب - صورة PNG */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/images/extension-template-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >

            {/* صورة الموظف */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: '912px',  // X coordinate
                top: '1328px',  // Y coordinate
                width: '504px', // Width
                height: '624px' // Height
              }}
            >
              {formData.employeePhoto && (
                <img
                  src={formData.employeePhoto}
                  alt="صورة الموظف"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* اسم الموظف */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: '552px',   // X coordinate
                top: '824px',    // Y coordinate
                width: '1248px', // Width
                height: '168px'  // Height
              }}
            >
              <h2 className="text-7xl font-bold text-black text-center leading-tight" style={{ fontFamily: 'Cairo, Arial, sans-serif' }}>
                {formData.employeeName || ''}
              </h2>
            </div>


          </div>
        </div>
      </div>

      {/* Modal المعاينة */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">معاينة القالب</h3>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={downloadAsImage}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    📥 تحميل
                  </button>
                  <button
                    onClick={closePreviewModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    ❌ إغلاق
                  </button>
                </div>
              </div>
              <div 
                ref={previewRef}
                className="relative bg-white"
                style={{
                  width: '800px',
                  height: '1131px',
                  transform: 'scale(0.8)',
                  transformOrigin: 'top center'
                }}
              >
                {/* نسخة مصغرة من القالب للمعاينة */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `
                      linear-gradient(135deg, #22c55e 0%, #16a34a 25%, #15803d 50%),
                      linear-gradient(45deg, rgba(255,255,255,0.9) 60%, rgba(240,253,244,0.8) 100%)
                    `,
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  {/* محتوى مصغر للمعاينة */}
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h1 className="text-4xl font-bold text-green-700 mb-2">تهنئة</h1>
                      <div className="bg-green-700 text-white px-4 py-2 rounded-lg inline-block">
                        <span className="text-xl font-bold">تمديد تكليف</span>
                      </div>
                    </div>
                    
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-green-800 mb-4">
                        {formData.employeeName || 'اسم الموظف'}
                      </h2>
                      
                      {formData.employeePhoto && (
                        <div className="flex justify-center mb-6">
                          <img
                            src={formData.employeePhoto}
                            alt="صورة الموظف"
                            className="w-32 h-40 object-cover rounded-lg border-4 border-green-600"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-white bg-opacity-95 p-8 rounded-xl border-2 border-green-600 mb-8">
                      <p className="text-lg leading-relaxed text-center text-gray-800">
                        تتقدم إدارة الخدمات الطبية الشرعية بمنطقة الحدود الشمالية بالتهنئة للزميل
                        <br />
                        <span className="font-bold text-green-700 text-xl">
                          {formData.employeeName || 'اسم الموظف'}
                        </span>
                        <br />
                        بمناسبة صدور قرار تمديد تكليفه مديراً لـ
                        <span className="font-bold text-blue-700"> {formData.department} </span>
                        بمركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية
                        <br />
                        <span className="text-amber-600 font-bold">
                          متمنين له دوام التوفيق والنجاح
                        </span>
                      </p>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                      <p>🌐 moh.gov.sa | ☎️ 937 | 🐦 @SaudiMOH</p>
                      <p className="mt-2">التاريخ: {new Date(formData.date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS للطباعة */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
        }
        
        @font-face {
          font-family: 'Cairo';
          src: url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        }
      `}</style>
    </div>
  );
}
