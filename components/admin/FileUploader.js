import { useState, useRef } from 'react';

export default function FileUploader({ onFileUpload, currentFile, acceptedTypes = ".pdf,.docx,.doc" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert(`نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedTypes}`);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload - في التطبيق الحقيقي، ارفع الملف إلى الخادم
      const formData = new FormData();
      formData.append('file', file);

      // محاكاة رفع الملف
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // إنشاء URL مؤقت للملف
      const fileUrl = URL.createObjectURL(file);
      
      onFileUpload({
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type
      });

    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      default:
        return '📎';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-600">جاري رفع الملف...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                اسحب الملف هنا أو 
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-green-600 hover:text-green-700 underline mr-1"
                >
                  اختر ملف
                </button>
              </p>
              <p className="text-sm text-gray-500">
                الأنواع المدعومة: {acceptedTypes} (حتى 10 ميجابايت)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current File Display */}
      {currentFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-2xl">
              {getFileIcon(currentFile)}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">
                ملف مرفق
              </p>
              <p className="text-xs text-gray-500">
                انقر لعرض الملف
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <a
              href={currentFile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              عرض
            </a>
            <button
              onClick={() => onFileUpload({ url: null })}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              حذف
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}