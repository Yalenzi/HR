import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ClientOnly from '../components/ClientOnly';

export default function ExtensionForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    line1: 'بكل الحب والتقدير',
    line2: 'أتشرف بإعلامكم',
    line3: 'بتمديد تكليفي في منصبي الحالي',
    employeeName: 'محمد إبراهيم العلي',
    department: 'إدارة الموارد البشرية',
    position: 'مدير إدارة',
    startDate: 'الموافق ١٤٤٥/٠٣/١٥ هـ',
    endDate: 'حتى تاريخ ١٤٤٦/٠٣/١٥ هـ',
    organization: 'وزارة التعليم',
    location: 'الرياض - المملكة العربية السعودية',
    signature: 'مع أطيب التحيات'
  });

  const [counter, setCounter] = useState(12847); // عداد البطاقات المطبوعة

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    // حفظ البيانات في localStorage للوصول إليها في الصفحة الأخرى
    localStorage.setItem('extensionFormData', JSON.stringify(formData));
    // فتح صفحة المعاينة في نافذة جديدة
    window.open('/simple-extension', '_blank');
  };

  const handleDownload = () => {
    // حفظ البيانات وتوجيه للتحميل
    localStorage.setItem('extensionFormData', JSON.stringify(formData));
    localStorage.setItem('autoDownload', 'true');
    window.open('/simple-extension', '_blank');
    
    // زيادة العداد
    setCounter(prev => prev + 1);
  };

  return (
    <>
      <Head>
        <title>قالب تهنئة تمديد التكليف</title>
        <meta name="description" content="قالب تهنئة تمديد التكليف قابل للتعديل - تصميم وبرمجة احترافي" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50" style={{ fontFamily: 'Cairo, Arial, sans-serif' }}>
        <div className="container mx-auto px-4 py-8">
          {/* الهيدر */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img 
                src="/images/logo.png" 
                alt="الشعار" 
                className="mx-auto h-20 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              قالب تهنئة تمديد التكليف
            </h1>
            <h2 className="text-lg md:text-xl text-gray-600">
              فقط عدل النصوص واحصل على بطاقة تهنئة احترافية
            </h2>
          </div>

          {/* النموذج */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
            <form className="space-y-4">
              {/* السطر الأول */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السطر الأول
                </label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) => handleChange('line1', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="السطر الأول"
                />
              </div>

              {/* السطر الثاني */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السطر الثاني
                </label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) => handleChange('line2', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="السطر الثاني"
                />
              </div>

              {/* السطر الثالث */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السطر الثالث
                </label>
                <input
                  type="text"
                  value={formData.line3}
                  onChange={(e) => handleChange('line3', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="السطر الثالث"
                />
              </div>

              {/* اسم الموظف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الموظف/المكلف
                </label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم الموظف"
                />
              </div>

              {/* الإدارة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإدارة/القسم
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الإدارة أو القسم"
                />
              </div>

              {/* المنصب */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصب/الوظيفة
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="المنصب أو الوظيفة"
                />
              </div>

              {/* تاريخ البداية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ بداية التمديد
                </label>
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="تاريخ البداية"
                />
              </div>

              {/* تاريخ النهاية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ نهاية التمديد
                </label>
                <input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="تاريخ النهاية"
                />
              </div>

              {/* المؤسسة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المؤسسة/الجهة
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم المؤسسة أو الجهة"
                />
              </div>

              {/* الموقع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الموقع أو العنوان"
                />
              </div>

              {/* التوقيع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التوقيع/الخاتمة
                </label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => handleChange('signature', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="التوقيع أو الخاتمة"
                />
              </div>

              {/* الأزرار */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  👁️ عرض المعاينة
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📥 تحميل البطاقة
                </button>
              </div>
            </form>

            {/* العداد والمعلومات */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <div className="text-sm text-gray-600 mb-2">
                <a href="https://github.com/your-repo" className="text-blue-600 hover:text-blue-800">
                  برمجة وتصميم البطاقة
                </a>
              </div>
              <div className="text-sm text-gray-500">
                عدد البطاقات المطبوعة: <span className="font-semibold text-green-600">
                  <ClientOnly fallback="12,847">
                    {counter.toLocaleString('ar-SA')}
                  </ClientOnly>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
