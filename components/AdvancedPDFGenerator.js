import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdvancedPDFGenerator({ data, letterType, children }) {
  const letterRef = useRef();
  const [pdfOptions, setPdfOptions] = useState({
    quality: 'high', // high, medium, low
    format: 'a4', // a4, letter
    orientation: 'portrait', // portrait, landscape
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    watermark: false,
    watermarkText: 'وزارة الصحة - سري',
    compression: true,
    metadata: {
      title: `${getLetterTitle()}-${data.employeeName}`,
      author: 'وزارة الصحة',
      subject: getLetterTitle(),
      creator: 'نظام خطابات الموظفين'
    }
  });

  const [showOptions, setShowOptions] = useState(false);

  const getLetterTitle = () => {
    const titles = {
      certificate: 'شهادة عمل',
      clearance: 'إخلاء طرف',
      salary: 'شهادة راتب',
      experience: 'شهادة خبرة'
    };
    return titles[letterType] || 'خطاب';
  };

  const getQualitySettings = (quality) => {
    const settings = {
      high: { scale: 3, format: 'png', quality: 1.0 },
      medium: { scale: 2, format: 'png', quality: 0.8 },
      low: { scale: 1.5, format: 'jpeg', quality: 0.6 }
    };
    return settings[quality] || settings.high;
  };

  const addWatermark = (pdf, pageWidth, pageHeight) => {
    if (!pdfOptions.watermark) return;

    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(50);
    
    // حساب موضع العلامة المائية في المنتصف
    const textWidth = pdf.getTextWidth(pdfOptions.watermarkText);
    const x = (pageWidth - textWidth) / 2;
    const y = pageHeight / 2;
    
    // إضافة النص بزاوية مائلة
    pdf.text(pdfOptions.watermarkText, x, y, { angle: 45 });
    
    // إعادة تعيين الشفافية
    pdf.setGState(new pdf.GState({ opacity: 1.0 }));
  };

  const generateAdvancedPDF = async () => {
    try {
      const element = letterRef.current;
      const qualitySettings = getQualitySettings(pdfOptions.quality);
      
      // إعدادات html2canvas المتقدمة
      const canvas = await html2canvas(element, {
        scale: qualitySettings.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // إنشاء PDF مع الإعدادات المخصصة
      const pdf = new jsPDF({
        orientation: pdfOptions.orientation,
        unit: 'mm',
        format: pdfOptions.format,
        compress: pdfOptions.compression
      });

      // إضافة البيانات الوصفية
      pdf.setProperties(pdfOptions.metadata);

      // حساب أبعاد الصفحة
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // حساب أبعاد الصورة مع الهوامش
      const availableWidth = pageWidth - pdfOptions.margins.left - pdfOptions.margins.right;
      const availableHeight = pageHeight - pdfOptions.margins.top - pdfOptions.margins.bottom;
      
      const imgWidth = availableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // تحويل الصورة
      const imgData = canvas.toDataURL(`image/${qualitySettings.format}`, qualitySettings.quality);

      // إضافة العلامة المائية إذا كانت مفعلة
      addWatermark(pdf, pageWidth, pageHeight);

      // إضافة الصورة مع الهوامش
      if (imgHeight <= availableHeight) {
        // الصورة تناسب صفحة واحدة
        pdf.addImage(
          imgData, 
          qualitySettings.format.toUpperCase(), 
          pdfOptions.margins.left, 
          pdfOptions.margins.top, 
          imgWidth, 
          imgHeight
        );
      } else {
        // الصورة تحتاج لعدة صفحات
        let remainingHeight = imgHeight;
        let currentY = 0;
        let pageNumber = 1;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(remainingHeight, availableHeight);
          
          if (pageNumber > 1) {
            pdf.addPage();
            addWatermark(pdf, pageWidth, pageHeight);
          }

          // قص جزء من الصورة للصفحة الحالية
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');
          
          cropCanvas.width = canvas.width;
          cropCanvas.height = (currentPageHeight * canvas.width) / imgWidth;
          
          cropCtx.drawImage(
            canvas,
            0, (currentY * canvas.width) / imgWidth,
            canvas.width, cropCanvas.height,
            0, 0,
            canvas.width, cropCanvas.height
          );

          const cropImgData = cropCanvas.toDataURL(`image/${qualitySettings.format}`, qualitySettings.quality);
          
          pdf.addImage(
            cropImgData,
            qualitySettings.format.toUpperCase(),
            pdfOptions.margins.left,
            pdfOptions.margins.top,
            imgWidth,
            currentPageHeight
          );

          remainingHeight -= currentPageHeight;
          currentY += currentPageHeight;
          pageNumber++;
        }
      }

      // حفظ الملف
      const fileName = `${pdfOptions.metadata.title}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleOptionChange = (key, value) => {
    setPdfOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* أزرار التحكم */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">معاينة الخطاب</h3>
        <div className="space-x-2 space-x-reverse">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2"
          >
            ⚙️ خيارات PDF
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
          >
            🖨️ طباعة
          </button>
          <button
            onClick={generateAdvancedPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📄 تحميل PDF متقدم
          </button>
        </div>
      </div>

      {/* خيارات PDF المتقدمة */}
      {showOptions && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
          <h4 className="font-bold mb-4">إعدادات PDF المتقدمة</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* جودة الصورة */}
            <div>
              <label className="block text-sm font-medium mb-2">جودة الصورة</label>
              <select
                value={pdfOptions.quality}
                onChange={(e) => handleOptionChange('quality', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="high">عالية (أبطأ)</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة (أسرع)</option>
              </select>
            </div>

            {/* تنسيق الصفحة */}
            <div>
              <label className="block text-sm font-medium mb-2">تنسيق الصفحة</label>
              <select
                value={pdfOptions.format}
                onChange={(e) => handleOptionChange('format', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            {/* اتجاه الصفحة */}
            <div>
              <label className="block text-sm font-medium mb-2">اتجاه الصفحة</label>
              <select
                value={pdfOptions.orientation}
                onChange={(e) => handleOptionChange('orientation', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="portrait">عمودي</option>
                <option value="landscape">أفقي</option>
              </select>
            </div>

            {/* العلامة المائية */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pdfOptions.watermark}
                  onChange={(e) => handleOptionChange('watermark', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">إضافة علامة مائية</span>
              </label>
              {pdfOptions.watermark && (
                <input
                  type="text"
                  value={pdfOptions.watermarkText}
                  onChange={(e) => handleOptionChange('watermarkText', e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="نص العلامة المائية"
                />
              )}
            </div>

            {/* ضغط الملف */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pdfOptions.compression}
                  onChange={(e) => handleOptionChange('compression', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">ضغط الملف</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* محتوى الخطاب */}
      <div ref={letterRef}>
        {children}
      </div>
    </div>
  );
}
