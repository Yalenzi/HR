import { useState } from 'react';
import Link from 'next/link';
import EmployeeWitnessTemplate from '../components/templates/EmployeeWitnessTemplate';

export default function WitnessPage() {
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateData, setTemplateData] = useState(null);

  const handleCreateWitness = () => {
    const defaultData = {
      employeeName: '',
      position: '',
      employeeId: '',
      nationality: 'سعودي',
      additionalInfo: '',
      senderTitle: 'سعادة',
      senderHonorific: 'حفظه الله',
      letterContent: 'تشهد إدارة مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية أن الموظف المذكور أعلاه يعمل لدينا ويؤدي مهامه بكفاءة عالية ونزاهة تامة.',
      closingPhrase: 'هذا ولكم تحياتي',
      managerName: 'د. فواز جمال الديدب',
      facilityName: 'مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية',
      issueDate: new Date().toISOString().split('T')[0]
    };
    
    setTemplateData(defaultData);
    setShowTemplate(true);
  };

  const handleSaveTemplate = (data) => {
    console.log('تم حفظ مشهد الموظف:', data);
    // يمكن إضافة المزيد من المعالجة هنا
  };

  const handleCancel = () => {
    setShowTemplate(false);
    setTemplateData(null);
  };

  if (showTemplate) {
    return (
      <EmployeeWitnessTemplate
        data={templateData}
        onSave={handleSaveTemplate}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" style={{ fontFamily: 'Amiri, serif' }}>
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold">نظام مشهد الموظف</h1>
            <p className="mt-2">وزارة الصحة - المملكة العربية السعودية</p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <Link 
              href="/"
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <span>🏠</span>
              <span>الرئيسية</span>
            </Link>
            <Link 
              href="/admin/dashboard"
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
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
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              مرحباً بك في نظام مشهد الموظف
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              أنشئ مشاهد رسمية للموظفين بتصميم احترافي يتماشى مع معايير وزارة الصحة
            </p>
            <button
              onClick={handleCreateWitness}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              📋 إنشاء مشهد موظف جديد
            </button>
          </div>

          {/* الميزات */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">تخصيص كامل</h3>
              <p className="text-gray-600">
                قم بتخصيص جميع بيانات الموظف ونص الخطاب حسب الحاجة
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-2">تصميم رسمي</h3>
              <p className="text-gray-600">
                تصميم يتماشى مع المعايير الرسمية للمؤسسات الحكومية
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">🖨️</div>
              <h3 className="text-xl font-semibold mb-2">طباعة احترافية</h3>
              <p className="text-gray-600">
                اطبع المشهد بجودة عالية مع تنسيق مثالي للطباعة
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-2">حفظ تلقائي</h3>
              <p className="text-gray-600">
                يتم حفظ جميع المشاهد تلقائياً في قاعدة البيانات
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
              <h3 className="text-xl font-semibold mb-2">خطوط أنيقة</h3>
              <p className="text-gray-600">
                استخدام خط Amiri الأنيق للنصوص العربية
              </p>
            </div>
          </div>

          {/* مكونات المشهد */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
              مكونات مشهد الموظف
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="text-2xl">🏢</div>
                  <div>
                    <h4 className="font-semibold">شعار الإدارة</h4>
                    <p className="text-gray-600 text-sm">شعار وزارة الصحة في أعلى الصفحة</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="text-2xl">📋</div>
                  <div>
                    <h4 className="font-semibold">جدول البيانات</h4>
                    <p className="text-gray-600 text-sm">الاسم، الوظيفة، رقم الموظف، الجنسية</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="text-2xl">👔</div>
                  <div>
                    <h4 className="font-semibold">بيانات المرسل</h4>
                    <p className="text-gray-600 text-sm">لقب وصفة المرسل مع خيارات متعددة</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="text-2xl">🕊️</div>
                  <div>
                    <h4 className="font-semibold">التحية الرسمية</h4>
                    <p className="text-gray-600 text-sm">السلام عليكم ورحمة الله وبركاته</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="text-2xl">📝</div>
                  <div>
                    <h4 className="font-semibold">نص الخطاب</h4>
                    <p className="text-gray-600 text-sm">فقرة مخصصة قابلة للتعديل</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="text-2xl">✍️</div>
                  <div>
                    <h4 className="font-semibold">التوقيع</h4>
                    <p className="text-gray-600 text-sm">توقيع المدير مع التاريخ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* خيارات التخصيص */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
              خيارات التخصيص المتاحة
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">👤</div>
                <p className="font-semibold text-gray-700">ألقاب المرسل</p>
                <p className="text-sm text-gray-600">سعادة، المدير، المساعد، الدكتور، الأستاذ</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🙏</div>
                <p className="font-semibold text-gray-700">صفات التبجيل</p>
                <p className="text-sm text-gray-600">حفظه الله، وفقه الله، المحترم، الموقر</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🌍</div>
                <p className="font-semibold text-gray-700">الجنسيات</p>
                <p className="text-sm text-gray-600">جميع الجنسيات العربية والأخرى</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">💬</div>
                <p className="font-semibold text-gray-700">عبارات الختام</p>
                <p className="text-sm text-gray-600">تحياتي، شكري، فائق الاحترام</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* التذييل */}
      <footer className="bg-blue-600 text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-lg font-semibold mb-2">
            وزارة الصحة - المملكة العربية السعودية
          </p>
          <p className="text-sm opacity-90">
            نظام إدارة خطابات الموظفين - مشهد الموظف
          </p>
        </div>
      </footer>

      {/* تحميل خط Amiri */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        
        * {
          font-family: 'Amiri', serif;
        }
      `}</style>
    </div>
  );
}
