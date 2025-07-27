import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SimpleExtensionTemplate from '../components/templates/SimpleExtensionTemplate';

export default function SimpleExtensionPage() {
  const router = useRouter();
  const [templateData, setTemplateData] = useState(null);

  useEffect(() => {
    // بيانات افتراضية للقالب
    const defaultData = {
      employeeName: '',
      employeePhoto: null,
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
              <h1 className="text-xl font-bold text-gray-900">قالب تهنئة تمديد التكليف (مبسط)</h1>
              <p className="text-sm text-gray-600">استخدم صورة PNG كخلفية مع إحداثيات دقيقة</p>
            </div>
            <div className="w-32"></div> {/* للتوازن */}
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main>
        <SimpleExtensionTemplate
          data={templateData}
          onSave={handleSave}
        />
      </main>

      {/* معلومات إضافية */}
      <div className="max-w-6xl mx-auto p-6 print:hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">📋 تعليمات الاستخدام:</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h3 className="font-semibold mb-2">📁 ملف الخلفية:</h3>
              <p>ضع ملف PNG في: <code className="bg-blue-100 px-2 py-1 rounded">public/images/extension-template-bg.png</code></p>
              <p className="mt-2">الملف الحالي: <strong>قالب تهنئة الخدمات الشرعيـــة.png</strong></p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📐 الإحداثيات:</h3>
              <p><strong>اسم الموظف:</strong> X=552pt, Y=824pt, W=1248pt, H=168pt</p>
              <p><strong>صورة الموظف:</strong> X=912pt, Y=1328pt, W=504pt, H=624pt</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">✨ المميزات:</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-green-700">
            <div>
              <h3 className="font-semibold mb-2">🖼️ صورة الخلفية:</h3>
              <ul className="space-y-1">
                <li>• استخدام ملف PNG كخلفية</li>
                <li>• لا توجد عناصر إضافية</li>
                <li>• تطابق دقيق مع التصميم</li>
                <li>• جودة عالية للطباعة</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📍 الإحداثيات:</h3>
              <ul className="space-y-1">
                <li>• دقة بوحدة النقطة (pt)</li>
                <li>• موضع ثابت للنصوص</li>
                <li>• موضع ثابت للصورة</li>
                <li>• تطابق مع المواصفات</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📥 التصدير:</h3>
              <ul className="space-y-1">
                <li>• PNG عالي الجودة</li>
                <li>• دقة 300 DPI</li>
                <li>• جاهز للطباعة</li>
                <li>• حفظ فوري</li>
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
