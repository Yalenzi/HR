import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ClearanceLetter({ data, settings }) {
  const letterRef = useRef();

  const generatePDF = async () => {
    const element = letterRef.current;
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`اخلاء-طرف-${data.name}-${data.letterNumber}.pdf`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHijriDate = (dateString) => {
    // محاكاة التاريخ الهجري - في التطبيق الحقيقي استخدم مكتبة تحويل التاريخ
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 622}هـ`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">معاينة خطاب إخلاء الطرف</h3>
        <div className="space-x-2 space-x-reverse">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
          >
            طباعة
          </button>
          <button
            onClick={generatePDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            تحميل PDF
          </button>
        </div>
      </div>

      <div 
        ref={letterRef} 
        className="official-letter bg-white p-12 border-2 border-gray-200"
        style={{ 
          minHeight: '297mm',
          width: '210mm',
          margin: '0 auto',
          fontSize: '16px'
        }}
      >
        {/* الرأسية الرسمية */}
        <div className="letter-header mb-8">
          <div className="flex justify-between items-start mb-6">
            {/* الشعار الأيسر */}
            <div className="w-20 h-20">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="شعار الوزارة" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-green-600 rounded-full flex items-center justify-center text-white text-lg moh-font-bold">
                  وص
                </div>
              )}
            </div>

            {/* النص المركزي */}
            <div className="flex-1 text-center">
              <div className="moh-font-bold text-green-700 text-2xl mb-2">
                المملكة العربية السعودية
              </div>
              <div className="moh-font-bold text-green-700 text-xl mb-1">
                وزارة الصحة
              </div>
              <div className="moh-font-regular text-lg text-gray-700">
                {settings?.facilityName || 'مركز الخدمات الطبية الشرعية'}
              </div>
              <div className="moh-font-light text-base text-gray-600">
                منطقة الحدود الشمالية
              </div>
            </div>

            {/* الشعار الأيمن */}
            <div className="w-20 h-20">
              <div className="w-full h-full bg-green-600 rounded-full flex items-center justify-center text-white text-sm moh-font-bold">
                2030
              </div>
            </div>
          </div>

          {/* الخط الفاصل */}
          <div className="border-t-4 border-green-600 mt-4"></div>
        </div>

        {/* معلومات الخطاب */}
        <div className="flex justify-between mb-8 text-sm moh-font-regular">
          <div className="text-right">
            <div className="mb-2">
              <strong>رقم الخطاب:</strong> {data.letterNumber}
            </div>
            <div>
              <strong>التاريخ:</strong> {formatDate(data.issueDate)}
            </div>
          </div>
          <div className="text-left">
            <div className="mb-2">
              <strong>Letter No:</strong> {data.letterNumber}
            </div>
            <div>
              <strong>Date:</strong> {formatHijriDate(data.issueDate)}
            </div>
          </div>
        </div>

        {/* عنوان الخطاب */}
        <div className="text-center mb-8">
          <h2 className="letter-title text-green-700">
            شهادة إخلاء طرف
          </h2>
          <div className="moh-font-light text-lg text-gray-600 mt-2">
            Clearance Certificate
          </div>
        </div>

        {/* التوجيه */}
        <div className="mb-6 moh-font-regular">
          <p className="text-lg">
            <strong>إلى:</strong> {data.addressedTo || 'سعادة المدير المحترم'}
          </p>
        </div>

        {/* التحية */}
        <div className="mb-6 moh-font-regular text-lg">
          <p>السلام عليكم ورحمة الله وبركاته،،،</p>
        </div>

        {/* جدول بيانات الموظف */}
        <div className="mb-8">
          <p className="moh-font-regular text-lg mb-4">
            نشهد نحن <strong>{settings?.facilityName || 'مركز الخدمات الطبية الشرعية'}</strong> 
            أن الموظف المذكور بياناته أدناه قد أخلى طرفه من جميع الالتزامات المالية والإدارية:
          </p>
          
          <table className="employee-table">
            <tbody>
              <tr>
                <th style={{ width: '25%' }}>اسم الموظف</th>
                <td style={{ width: '25%' }} className="moh-font-regular">{data.name}</td>
                <th style={{ width: '25%' }}>رقم الهوية الوطنية</th>
                <td style={{ width: '25%' }} className="moh-font-regular">{data.nationalId}</td>
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
                <th>تاريخ انتهاء الخدمة</th>
                <td className="moh-font-regular">{formatDate(data.endDate)}</td>
              </tr>
              <tr>
                <th>سبب انتهاء الخدمة</th>
                <td className="moh-font-regular" colSpan="3">
                  {data.reason === 'resignation' && 'استقالة'}
                  {data.reason === 'retirement' && 'تقاعد'}
                  {data.reason === 'transfer' && 'نقل'}
                  {data.reason === 'termination' && 'إنهاء خدمة'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* نص الخطاب */}
        <div className="mb-8 moh-font-regular text-lg leading-relaxed">
          <p className="mb-4">
            وبناءً على ذلك فإن ذمة الموظف المذكور أعلاه مبرأة من أي التزامات مالية أو إدارية 
            تجاه {settings?.facilityName || 'المركز'}.
          </p>
          
          <p className="mb-4">
            وقد أعطيت له هذه الشهادة بناءً على طلبه للاستعمال فيما يخصه دون أدنى مسؤولية علينا.
          </p>

          {data.notes && (
            <div className="p-4 bg-yellow-50 border-r-4 border-yellow-400 mb-4">
              <p><strong>ملاحظات:</strong> {data.notes}</p>
            </div>
          )}

          <p>
            نسأل الله له التوفيق والسداد في حياته العملية القادمة.
          </p>
        </div>

        {/* التوقيعات */}
        <div className="signature-section mt-16">
          <div className="grid grid-cols-2 gap-16">
            {/* توقيع مقدم الطلب */}
            <div className="text-center">
              <div className="mb-16"></div>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="moh-font-bold text-lg">{data.requestedBy || 'مقدم الطلب'}</p>
                <p className="moh-font-regular text-sm text-gray-600">التوقيع</p>
              </div>
            </div>

            {/* توقيع المدير */}
            <div className="text-center">
              <div className="mb-16"></div>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="moh-font-bold text-lg">
                  مدير {settings?.facilityName || 'مركز الخدمات الطبية الشرعية'}
                </p>
                <p className="moh-font-bold text-lg">
                  منطقة الحدود الشمالية
                </p>
                <p className="moh-font-bold text-lg">
                  {settings?.centerManagerName || 'الدكتور / _______________'}
                </p>
                <div className="mt-4 h-16 border border-gray-300 rounded flex items-center justify-center text-gray-500">
                  مكان الختم الرسمي
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* تذييل الصفحة */}
        <div className="mt-12 text-center text-sm moh-font-light text-gray-600 border-t pt-4">
          <p>{settings?.facilityAddress || 'المملكة العربية السعودية - منطقة الحدود الشمالية'}</p>
          <p>
            هاتف: {settings?.facilityPhone || '+966-XX-XXXXXXX'} | 
            بريد إلكتروني: {settings?.facilityEmail || 'info@moh.gov.sa'}
          </p>
        </div>
      </div>
    </div>
  );
}