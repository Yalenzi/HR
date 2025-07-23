import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CongratulationsTemplate from './templates/CongratulationsTemplate';
import EmployeeWitnessTemplate from './templates/EmployeeWitnessTemplate';

export default function LetterPreview({ letterType, data }) {
  const letterRef = useRef();

  // إذا كان النوع تهنئة، استخدم المكون المخصص
  if (letterType === 'congratulations') {
    return <CongratulationsTemplate data={data} />;
  }

  // إذا كان النوع مشهد موظف، استخدم المكون المخصص
  if (letterType === 'witness') {
    return <EmployeeWitnessTemplate data={data} />;
  }

  const generatePDF = async () => {
    const element = letterRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${getLetterTitle()}-${data.employeeName}.pdf`);
  };

  const getLetterTitle = () => {
    const titles = {
      certificate: 'شهادة عمل',
      clearance: 'إخلاء طرف',
      salary: 'شهادة راتب',
      witness: 'مشهد موظف',
      congratulations: 'قالب التهنئة',
      experience: 'شهادة خبرة'
    };
    return titles[letterType];
  };

  const getLetterContent = () => {
    const hijriDate = new Date().toLocaleDateString('ar-SA-u-ca-islamic');
    
    if (letterType === 'certificate') {
      return (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-green-700">شهادة عمل</h2>
          <div className="text-right space-y-4">
            <p>نشهد نحن وزارة الصحة بالمملكة العربية السعودية أن:</p>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>الاسم:</strong> {data.employeeName}</p>
              <p><strong>رقم الهوية:</strong> {data.nationalId}</p>
              <p><strong>المسمى الوظيفي:</strong> {data.position}</p>
              <p><strong>القسم:</strong> {data.department}</p>
            </div>
            <p>يعمل لدينا منذ تاريخ {data.hireDate} وحتى تاريخه، وقد أبدى كفاءة عالية في أداء مهامه.</p>
            <p>وقد أعطيت له هذه الشهادة بناءً على طلبه دون أدنى مسؤولية علينا.</p>
          </div>
        </div>
      );
    }

    if (letterType === 'clearance') {
      return (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-green-700">شهادة إخلاء طرف</h2>
          <div className="text-right space-y-4">
            <p>نشهد نحن وزارة الصحة أن الموظف:</p>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>الاسم:</strong> {data.employeeName}</p>
              <p><strong>رقم الموظف:</strong> {data.employeeId}</p>
              <p><strong>المسمى الوظيفي:</strong> {data.position}</p>
            </div>
            <p>قد أخلى طرفه من جميع الالتزامات المالية والإدارية.</p>
            <p><strong>سبب إنهاء الخدمة:</strong> {data.reason}</p>
            <p>وعليه فإن ذمته مبرأة من أي التزامات تجاه الوزارة.</p>
          </div>
        </div>
      );
    }

    // المزيد من أنواع الخطابات...
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">معاينة الخطاب</h3>
        <button
          onClick={generatePDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          تحميل PDF
        </button>
      </div>

      <div ref={letterRef} className="bg-white p-8 border" style={{ minHeight: '297mm' }}>
        {/* رأس الخطاب */}
        <div className="text-center mb-8 border-b pb-6">
          <div className="text-green-700 text-2xl font-bold mb-2">
            وزارة الصحة
          </div>
          <div className="text-lg">المملكة العربية السعودية</div>
          <div className="text-sm text-gray-600 mt-2">
            التاريخ: {data.issueDate} - {new Date().toLocaleDateString('ar-SA-u-ca-islamic')}
          </div>
        </div>

        {/* محتوى الخطاب */}
        <div className="mb-8">
          {getLetterContent()}
        </div>

        {/* التوقيع */}
        <div className="mt-16 text-center">
          <div className="border-t pt-4 inline-block">
            <p className="font-bold">مدير الموارد البشرية</p>
            <p className="text-sm text-gray-600">وزارة الصحة</p>
          </div>
        </div>
      </div>
    </div>
  );
}