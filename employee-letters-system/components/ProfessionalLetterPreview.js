import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ProfessionalLetterPreview({ data }) {
  const letterRef = useRef();

  const generatePDF = async () => {
    const element = letterRef.current;
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      allowTaint: true 
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${data.template.title}-${data.name}-${data.letterNumber}.pdf`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  const getLetterContent = () => {
    switch (data.letterType) {
      case 'certificate':
        return (
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              {data.template.content}
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border-r-4 border-green-500">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>الاسم الكامل:</strong> {data.name}</div>
                <div><strong>رقم الهوية الوطنية:</strong> {data.nationalId}</div>
                <div><strong>رقم الموظف:</strong> {data.id}</div>
                <div><strong>المسمى الوظيفي:</strong> {data.position}</div>
                <div><strong>القسم:</strong> {data.department}</div>
                <div><strong>تاريخ التعيين:</strong> {formatDate(data.hireDate)}</div>
              </div>
            </div>
            <p className="text-lg leading-relaxed">
              وهو موظف منتظم في العمل ويؤدي واجباته بكفاءة عالية.
            </p>
            {data.purpose && (
              <p className="text-lg leading-relaxed">
                <strong>الغرض من الشهادة:</strong> {data.purpose}
              </p>
            )}
            <p className="text-lg leading-relaxed">
              وقد أعطيت له هذه الشهادة بناءً على طلبه للاستعمال فيما يخصه دون أدنى مسؤولية علينا.
            </p>
          </div>
        );

      case 'salary':
        return (
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              {data.template.content}
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border-r-4 border-green-500">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>الاسم:</strong> {data.name}</div>
                <div><strong>رقم الهوية:</strong> {data.nationalId}</div>
                <div><strong>المسمى الوظيفي:</strong> {data.position}</div>
                <div><strong>الدرجة:</strong> {data.grade}</div>
                <div className="col-span-2 text-center bg-green-100 p-4 rounded">
                  <strong className="text-xl">الراتب الشهري: {data.salary?.toLocaleString()} ريال سعودي</strong>
                </div>
              </div>
            </div>
            {data.expiryDate && (
              <p className="text-sm text-red-600">
                <strong>تنتهي صلاحية هذه الشهادة في:</strong> {formatDate(data.expiryDate)}
              </p>
            )}
          </div>
        );

      case 'clearance':
        return (
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              {data.template.content}
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border-r-4 border-green-500">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>الاسم:</strong> {data.name}</div>
                <div><strong>رقم الموظف:</strong> {data.id}</div>
                <div><strong>المسمى الوظيفي:</strong> {data.position}</div>
                <div><strong>سبب إنهاء الخدمة:</strong> {data.reason}</div>
                {data.endDate && (
                  <div className="col-span-2">
                    <strong>تاريخ آخر يوم عمل:</strong> {formatDate(data.endDate)}
                  </div>
                )}
              </div>
            </div>
            <p className="text-lg leading-relaxed">
              وعليه فإن ذمته مبرأة من أي التزامات مالية أو إدارية تجاه الوزارة.
            </p>
          </div>
        );

      default:
        return <div>نوع خطاب غير معروف</div>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">معاينة الخطاب</h3>
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

      <div ref={letterRef} className="bg-white p-8 border-2 border-gray-200" style={{ minHeight: '297mm' }}>
        {/* الرأسية الرسمية */}
        <div className="text-center mb-8 border-b-2 border-green-600 pb-6">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              وص
            </div>
          </div>
          <div className="text-green-700 text-3xl font-bold mb-2">
            وزارة الصحة
          </div>
          <div className="text-xl text-gray-700">المملكة العربية السعودية</div>
          <div className="text-lg text-gray-600 mt-2">Ministry of Health</div>
        </div>

        {/* معلومات الخطاب */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <strong>رقم الخطاب:</strong> {data.letterNumber}
          </div>
          <div>
            <strong>التاريخ:</strong> {formatDate(data.issueDate)}
          </div>
        </div>

        {/* عنوان الخطاب */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 border-b-2 border-green-200 pb-2 inline-block">
            {data.template.title}
          </h2>
        </div>

        {/* محتوى الخطاب */}
        <div className="mb-12 leading-relaxed">
          {getLetterContent()}
        </div>

        {/* الملاحظات */}
        {data.notes && (
          <div className="mb-8 p-4 bg-yellow-50 border-r-4 border-yellow-400">
            <strong>ملاحظات:</strong> {data.notes}
          </div>
        )}

        {/* التوقيعات */}
        <div className="grid grid-cols-2 gap-8 mt-16">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-16">
              <p className="font-bold">{data.requestedBy || 'مقدم الطلب'}</p>
              <p className="text-sm text-gray-600">التوقيع</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 mt-16">
              <p className="font-bold">{data.approvedBy || 'مدير الموارد البشرية'}</p>
              <p className="text-sm text-gray-600">المعتمد</p>
            </div>
          </div>
        </div>

        {/* الختم الرسمي */}
        <div className="text-center mt-8">
          <div className="inline-block border-2 border-green-600 rounded-full p-4">
            <div className="text-green-600 font-bold">ختم وزارة الصحة</div>
          </div>
        </div>
      </div>
    </div>
  );
}