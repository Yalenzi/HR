import { useState } from 'react';
import FileUploader from './FileUploader';

export default function TemplateEditor({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'certificate',
    content: template?.content || '',
    fileUrl: template?.fileUrl || null,
    variables: template?.variables || ['employeeName', 'nationalId', 'position'],
    isActive: template?.isActive ?? true
  });

  const templateTypes = [
    { value: 'certificate', label: 'شهادة عمل' },
    { value: 'clearance', label: 'إخلاء طرف' },
    { value: 'salary', label: 'شهادة راتب' },
    { value: 'experience', label: 'شهادة خبرة' },
    { value: 'vacation', label: 'طلب إجازة' },
    { value: 'transfer', label: 'طلب نقل' },
    { value: 'custom', label: 'نموذج مخصص' }
  ];

  const availableVariables = [
    { key: 'employeeName', label: 'اسم الموظف' },
    { key: 'nationalId', label: 'رقم الهوية' },
    { key: 'employeeId', label: 'رقم الموظف' },
    { key: 'position', label: 'المسمى الوظيفي' },
    { key: 'department', label: 'القسم' },
    { key: 'hireDate', label: 'تاريخ التعيين' },
    { key: 'salary', label: 'الراتب' },
    { key: 'grade', label: 'الدرجة' },
    { key: 'issueDate', label: 'تاريخ الإصدار' },
    { key: 'letterNumber', label: 'رقم الخطاب' },
    { key: 'centerManagerName', label: 'اسم مدير المركز' },
    { key: 'facilityName', label: 'اسم المنشأة' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + '{{' + variable + '}}' + after;
    
    handleChange('content', newText);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
    }, 0);
  };

  const handleFileUpload = (fileData) => {
    handleChange('fileUrl', fileData.url);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم النموذج');
      return;
    }
    
    if (!formData.content.trim() && !formData.fileUrl) {
      alert('يرجى إدخال محتوى النموذج أو رفع ملف');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {template ? 'تعديل النموذج' : 'إنشاء نموذج جديد'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم النموذج
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500"
                placeholder="مثال: شهادة عمل للبنك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع النموذج
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500"
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رفع ملف النموذج (PDF أو DOCX)
            </label>
            <FileUploader
              onFileUpload={handleFileUpload}
              currentFile={formData.fileUrl}
              acceptedTypes=".pdf,.docx,.doc"
            />
            {formData.fileUrl && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ تم رفع الملف بنجاح
                  <a 
                    href={formData.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 mr-2"
                  >
                    (عرض الملف)
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              محتوى النموذج
            </label>
            <textarea
              id="content-textarea"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 font-mono text-sm"
              placeholder="اكتب محتوى النموذج هنا... يمكنك استخدام المتغيرات مثل employeeName بين أقواس مزدوجة"
            />
            <p className="text-xs text-gray-500 mt-1">
              استخدم المتغيرات بين أقواس مزدوجة مثل: {"{"}{"{"} employeeName {"}"}{"}"}
            </p>
          </div>

          {/* Preview */}
          {formData.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معاينة المحتوى
              </label>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm leading-relaxed">
                {formData.content.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">
                    {line.replace(/\{\{(\w+)\}\}/g, (_, variable) => {
                      const varInfo = availableVariables.find(v => v.key === variable);
                      return `[${varInfo?.label || variable}]`;
                    })}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Variables Panel */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              المتغيرات المتاحة
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableVariables.map(variable => (
                <div
                  key={variable.key}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium">{variable.label}</div>
                    <div className="text-xs text-gray-500">{"{{" + variable.key + "}}"}</div>
                  </div>
                  <button
                    onClick={() => insertVariable(variable.key)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    إدراج
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                تفعيل النموذج
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4 space-x-reverse border-t pt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {template ? 'حفظ التغييرات' : 'إنشاء النموذج'}
        </button>
      </div>
    </div>
  );
}