import { useState, useRef } from 'react';

export default function DigitalSignature({ onSignatureChange, currentSignature }) {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw'); // draw, upload, text
  const [textSignature, setTextSignature] = useState('');
  const [signatureStyle, setSignatureStyle] = useState('formal');

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    onSignatureChange({
      type: 'drawn',
      data: signatureData
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSignatureChange({
          type: 'uploaded',
          data: event.target.result,
          filename: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTextSignature = () => {
    if (!textSignature.trim()) return;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    // تنسيق النص حسب النمط المختار
    const styles = {
      formal: {
        font: '24px "Times New Roman", serif',
        color: '#000',
        style: 'normal'
      },
      elegant: {
        font: '28px "Brush Script MT", cursive',
        color: '#1a365d',
        style: 'italic'
      },
      modern: {
        font: '22px "Arial", sans-serif',
        color: '#2d3748',
        style: 'bold'
      }
    };

    const style = styles[signatureStyle];
    ctx.font = style.font;
    ctx.fillStyle = style.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (style.style === 'italic') {
      ctx.save();
      ctx.transform(1, 0, -0.2, 1, 0, 0);
    }
    
    ctx.fillText(textSignature, canvas.width / 2, canvas.height / 2);
    
    if (style.style === 'italic') {
      ctx.restore();
    }

    const signatureData = canvas.toDataURL();
    onSignatureChange({
      type: 'text',
      data: signatureData,
      text: textSignature,
      style: signatureStyle
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-bold mb-4">التوقيع الرقمي</h3>
      
      {/* اختيار نوع التوقيع */}
      <div className="mb-4">
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={() => setSignatureMode('draw')}
            className={`px-4 py-2 rounded ${
              signatureMode === 'draw' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            ✏️ رسم التوقيع
          </button>
          <button
            onClick={() => setSignatureMode('upload')}
            className={`px-4 py-2 rounded ${
              signatureMode === 'upload' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            📁 رفع صورة
          </button>
          <button
            onClick={() => setSignatureMode('text')}
            className={`px-4 py-2 rounded ${
              signatureMode === 'text' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            📝 توقيع نصي
          </button>
        </div>
      </div>

      {/* رسم التوقيع */}
      {signatureMode === 'draw' && (
        <div className="mb-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="border border-gray-300 rounded cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="mt-2 text-center">
              <button
                onClick={clearSignature}
                className="bg-red-500 text-white px-4 py-1 rounded text-sm hover:bg-red-600"
              >
                مسح التوقيع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* رفع صورة التوقيع */}
      {signatureMode === 'upload' && (
        <div className="mb-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="signature-upload"
            />
            <label
              htmlFor="signature-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              <div className="text-4xl mb-2">📁</div>
              <div>اضغط لرفع صورة التوقيع</div>
              <div className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF (حد أقصى 5MB)
              </div>
            </label>
          </div>
        </div>
      )}

      {/* التوقيع النصي */}
      {signatureMode === 'text' && (
        <div className="mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">نص التوقيع</label>
              <input
                type="text"
                value={textSignature}
                onChange={(e) => setTextSignature(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="اكتب اسمك أو التوقيع المطلوب"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">نمط التوقيع</label>
              <select
                value={signatureStyle}
                onChange={(e) => setSignatureStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="formal">رسمي</option>
                <option value="elegant">أنيق</option>
                <option value="modern">عصري</option>
              </select>
            </div>
            
            <button
              onClick={generateTextSignature}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!textSignature.trim()}
            >
              إنشاء التوقيع
            </button>
          </div>
        </div>
      )}

      {/* معاينة التوقيع الحالي */}
      {currentSignature && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">التوقيع الحالي:</h4>
          <div className="border border-gray-300 rounded p-2 bg-white">
            <img
              src={currentSignature.data}
              alt="التوقيع"
              className="max-h-20 mx-auto"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            نوع التوقيع: {
              currentSignature.type === 'drawn' ? 'مرسوم' :
              currentSignature.type === 'uploaded' ? 'مرفوع' : 'نصي'
            }
          </div>
        </div>
      )}
    </div>
  );
}
