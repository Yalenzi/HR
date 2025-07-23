import { useState } from 'react';
import TemplateEditor from './TemplateEditor';
import FileUploader from './FileUploader';

export default function TemplateManager() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'شهادة عمل',
      type: 'certificate',
      content: 'نشهد نحن وزارة الصحة...',
      fileUrl: null,
      createdAt: '2024-01-15',
      isActive: true
    },
    {
      id: 2,
      name: 'إخلاء طرف',
      type: 'clearance',
      content: 'نشهد نحن وزارة الصحة...',
      fileUrl: '/templates/clearance-template.pdf',
      createdAt: '2024-01-10',
      isActive: true
    }
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleSaveTemplate = (templateData) => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? { ...t, ...templateData } : t
      ));
    } else {
      const newTemplate = {
        id: Date.now(),
        ...templateData,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setShowEditor(false);
  };

  const handleToggleActive = (id) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة النماذج</h2>
        <button
          onClick={handleCreateNew}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <span className="ml-2">➕</span>
          إنشاء نموذج جديد
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {template.name}
              </h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  template.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>النوع:</strong> {template.type}</p>
              <p><strong>تاريخ الإنشاء:</strong> {template.createdAt}</p>
              {template.fileUrl && (
                <p className="flex items-center">
                  <strong>ملف مرفق:</strong>
                  <a 
                    href={template.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    📎 عرض الملف
                  </a>
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleToggleActive(template.id)}
                    className="text-yellow-600 hover:text-yellow-800 text-sm"
                  >
                    {template.isActive ? 'إلغاء تفعيل' : 'تفعيل'}
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}