import { useState } from 'react';
import Link from 'next/link';
import CongratulationsTemplate from '../components/templates/CongratulationsTemplate';

export default function CongratulationsPage() {
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateData, setTemplateData] = useState(null);

  const handleCreateCongratulation = () => {
    const defaultData = {
      employeeName: '',
      employeeId: '',
      position: '',
      department: '',
      occasionType: 'ترقية',
      occasionDate: new Date().toISOString().split('T')[0],
      congratulationMessage1: 'يسعدنا أن نتقدم لكم بأحر التهاني والتبريكات',
      congratulationMessage2: 'بمناسبة حصولكم على هذا الإنجاز المتميز',
      congratulationMessage3: 'متمنين لكم دوام التوفيق والنجاح في مسيرتكم المهنية',
      senderTitle: 'سعادة',
      senderPosition: 'مدير عام التجمع',
      senderHonorific: 'حفظه الله',
      managerName: 'د. محمد أحمد السعيد',
      employeePhoto: null,
      closingPhrase: 'هذا ولكم تحياتي'
    };
    
    setTemplateData(defaultData);
    setShowTemplate(true);
  };

  const handleSaveTemplate = (data) => {
    console.log('تم حفظ قالب التهنئة:', data);
    // يمكن إضافة المزيد من المعالجة هنا
  };

  const handleCancel = () => {
    setShowTemplate(false);
    setTemplateData(null);
  };

  if (showTemplate) {
    return (
      <CongratulationsTemplate
        data={templateData}
        onSave={handleSaveTemplate}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-green-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold">نظام قوالب التهنئة</h1>
            <p className="mt-2">وزارة الصحة - المملكة العربية السعودية</p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <Link 
              href="/"
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <span>🏠</span>
              <span>الرئيسية</span>
            </Link>
            <Link 
              href="/admin/dashboard"
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <span>⚙️</span>
              <span>لوحة التحكم</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* بطاقة الترحيب */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              مرحباً بك في نظام قوالب التهنئة
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              أنشئ قوالب تهنئة احترافية للموظفين بمناسبة إنجازاتهم وترقياتهم
            </p>
            <button
              onClick={handleCreateCongratulation}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              🎊 إنشاء قالب تهنئة جديد
            </button>
          </div>

          {/* الميزات */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">تخصيص كامل</h3>
              <p className="text-gray-600">
                قم بتخصيص رسائل التهنئة والبيانات حسب المناسبة
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">إضافة الصور</h3>
              <p className="text-gray-600">
                أضف صورة الموظف لجعل التهنئة أكثر شخصية
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">🖨️</div>
              <h3 className="text-xl font-semibold mb-2">طباعة احترافية</h3>
              <p className="text-gray-600">
                اطبع التهنئة بتصميم احترافي يليق بوزارة الصحة
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-2">حفظ تلقائي</h3>
              <p className="text-gray-600">
                يتم حفظ جميع التهنئات تلقائياً في قاعدة البيانات
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">متجاوب</h3>
              <p className="text-gray-600">
                يعمل بشكل مثالي على جميع الأجهزة والشاشات
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">تصميم أنيق</h3>
              <p className="text-gray-600">
                تصميم يتماشى مع هوية وزارة الصحة الرسمية
              </p>
            </div>
          </div>

          {/* أنواع المناسبات */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
              أنواع المناسبات المدعومة
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'ترقية', icon: '📈' },
                { name: 'تكريم', icon: '🏆' },
                { name: 'إنجاز متميز', icon: '⭐' },
                { name: 'حصول على شهادة', icon: '🎓' },
                { name: 'تخرج', icon: '🎓' },
                { name: 'تعيين', icon: '💼' },
                { name: 'نجاح في مهمة', icon: '✅' },
                { name: 'تميز في الأداء', icon: '🌟' }
              ].map((occasion, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{occasion.icon}</div>
                  <p className="font-semibold text-gray-700">{occasion.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* التذييل */}
      <footer className="bg-green-600 text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-lg font-semibold mb-2">
            وزارة الصحة - المملكة العربية السعودية
          </p>
          <p className="text-sm opacity-90">
            نظام إدارة خطابات الموظفين - قوالب التهنئة
          </p>
        </div>
      </footer>
    </div>
  );
}
