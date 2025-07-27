import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ExtensionCongratulationsTemplate from '../components/templates/ExtensionCongratulationsTemplate';

export default function ExtensionCongratulationsPage() {
  const router = useRouter();
  const [templateData, setTemplateData] = useState(null);

  useEffect(() => {
    // بيانات افتراضية للقالب
    const defaultData = {
      employeeName: '',
      employeePhoto: null,
      department: 'خدمات شؤون الوفيات',
      facilityName: 'مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية',
      managerName: 'د. فواز جمال الديدب',
      date: new Date().toISOString().split('T')[0]
    };

    setTemplateData(defaultData);
  }, []);

  const handleSave = (savedData) => {
    console.log('تم حفظ القالب:', savedData);
    // يمكن إضافة منطق إضافي هنا مثل إعادة التوجيه
  };

  const handleBack = () => {
    router.push('/');
  };

  if (!templateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل القالب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة للصفحة الرئيسية
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">قالب تهنئة تمديد التكليف</h1>
              <p className="text-sm text-gray-600">مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية</p>
            </div>
            <div className="w-32"></div> {/* للتوازن */}
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main>
        <ExtensionCongratulationsTemplate 
          data={templateData} 
          onSave={handleSave}
        />
      </main>

      {/* معلومات إضافية */}
      <div className="max-w-6xl mx-auto p-6 print:hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">📋 معلومات القالب:</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p><strong>نوع القالب:</strong> تهنئة تمديد التكليف</p>
              <p><strong>الإحداثيات المستخدمة:</strong> دقيقة حسب المواصفات</p>
              <p><strong>جودة الصورة:</strong> عالية جداً (300 DPI)</p>
            </div>
            <div>
              <p><strong>أبعاد اسم الموظف:</strong> X=552pt, Y=824pt, W=1248pt, H=168pt</p>
              <p><strong>أبعاد الصورة:</strong> X=912pt, Y=1328pt, W=504pt, H=624pt</p>
              <p><strong>التصدير:</strong> PNG عالي الجودة</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">✨ الميزات المتاحة:</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-green-700">
            <div>
              <h3 className="font-semibold mb-2">📝 التحرير:</h3>
              <ul className="space-y-1">
                <li>• تعديل اسم الموظف</li>
                <li>• تغيير القسم/الإدارة</li>
                <li>• رفع صورة شخصية</li>
                <li>• تحديد التاريخ</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">👁️ المعاينة:</h3>
              <ul className="space-y-1">
                <li>• معاينة مكبرة</li>
                <li>• عرض تفاعلي</li>
                <li>• تحديث فوري</li>
                <li>• تصميم متجاوب</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📥 التصدير:</h3>
              <ul className="space-y-1">
                <li>• صورة PNG عالية الجودة</li>
                <li>• دقة 300 DPI</li>
                <li>• جاهز للطباعة</li>
                <li>• حفظ تلقائي</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 print:hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">مركز الخدمات الطبية الشرعية</h3>
            <p className="text-gray-300">بمنطقة الحدود الشمالية</p>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm">
              © 2024 وزارة الصحة - المملكة العربية السعودية | جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
