import { useRef } from 'react';

export default function WorkCertificate({ data, settings }) {
  const letterRef = useRef();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">معاينة شهادة العمل</h3>
        <div className="space-x-2 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2">
            طباعة
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            تحميل PDF
          </button>
        </div>
      </div>

      <div 
        ref={letterRef} 
        className="official-letter bg-white p-12 border-2 border-gray-200"
        style={{ minHeight: '297mm', width: '210mm', margin: '0 auto' }}
      >
        {/* الرأسية */}
        <div className="letter-header mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-lg moh-font-bold">
              وص
            </div>
            <div className="flex-1 text-center">
              <div className="moh-font-bold text-green-700 text-2xl mb-2">
                المملكة العربية السعودية
              </div>
              <div className="moh-font-bold text-green-700 text-xl mb-1">
                وزارة الصحة
              </div>
              <div className="moh-font-regular text-lg text-gray-700">
                {settings?.facilityName}
              </div>
            </div>
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-sm moh-font-bold">
              2030
            </div>
          </div>
          <div className="border-t-4 border-green-600 mt-4"></div>
        </div>

        {/* معلومات الخطاب */}
        <div className="flex justify-between mb-8 text-sm moh-font-regular">
          <div>
            <div><strong>رقم الخطاب:</strong> {data.letterNumber}</div>
            <div><strong>التاريخ:</strong> {formatDate(data.issueDate)}</div>
          </div>
        </div>

        {/* عنوان الخطاب */}
        <div className="text-center mb-8">
          <h2 className="letter-title text-green-700">شهادة عمل</h2>
          <div className="moh-font-light text-lg text-gray-600 mt-2">
            Work Certificate
          </div>
        </div>

        {/* التوجيه */}
        <div className="mb-6 moh-font-regular">
          <p className="text-lg">
            <strong>إلى:</strong> {data.addressedTo || 'من يهمه الأمر'}
          </p>
        </div>

        {/* التحية */}
        <div className="mb-6 moh-font-regular text-lg">
          <p>السلام عليكم ورحمة الله وبركاته،،،</p>
        </div>

        {/* المحتوى */}
        <div className="mb-8 moh-font-regular text-lg leading-relaxed">
          <p className="mb-6">
            نشهد نحن <strong>{settings?.facilityName}</strong> أن الموظف المذكور بياناته أدناه 
            يعمل لدينا بصفة منتظمة:
          </p>

          <table className="employee-table mb-6">
            <tbody>
              <tr>
                <th>اسم الموظف</th>
                <td className="moh-font-regular">{data.name}</td>
                <th>رقم الهوية</th>
                <td className="moh-font-regular">{data.nationalId}</td>
              </tr>
              <tr>
                <th>رقم الموظف</th>
                <td className="moh-font-regular">{data.id}</td>
                <th>الجنسية</th>
                <td className="moh-font-regular">{data.nationality || 'سعودي'}</td>
              </tr>
              <tr>
                <th>المسمى الوظيفي</th>
                <td className="moh-font-regular">{data.position}</td>
                <th>القسم</th>
                <td className="moh-font-regular">{data.department}</td>
              </tr>
              <tr>
                <th>تاريخ التعيين</th>
                <td className="moh-font-regular">{formatDate(data.hireDate)}</td>
                <th>الدرجة</th>
                <td className="moh-font-regular">{data.grade}</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-4">
            وهو موظف منتظم في العمل ويؤدي واجباته بكفاءة عالية ولم يسبق أن وقع عليه أي جزاء تأديبي.
          </p>

          {data.purpose && (
            <p className="mb-4">
              <strong>الغرض من الشهادة:</strong> {data.purpose}
            </p>
          )}

          <p>
            وقد أعطيت له هذه الشهادة بناءً على طلبه للاستعمال فيما يخصه دون أدنى مسؤولية علينا.
          </p>
        </div>

        {/* التوقيع */}
        <div className="signature-section mt-16">
          <div className="text-center">
            <div className="mb-16"></div>
            <div className="inline-block">
              <p className="moh-font-bold text-lg mb-2">
                مدير {settings?.facilityName}
              </p>
              <p className="moh-font-bold text-lg mb-2">
                منطقة الحدود الشمالية
              </p>
              <p className="moh-font-bold text-lg mb-4">
                {settings?.centerManagerName || 'الدكتور / _______________'}
              </p>
              <div className="w-32 h-16 border border-gray-300 rounded flex items-center justify-center text-gray-500 mx-auto">
                الختم الرسمي
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}