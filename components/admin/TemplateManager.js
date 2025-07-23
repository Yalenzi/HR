import { useState, useEffect } from 'react';
import TemplateEditor from './TemplateEditor';
import FileUploader from './FileUploader';
import { initDatabase, database } from '../../lib/database';

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل النماذج من قاعدة البيانات
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const allTemplates = await database.getAllTemplates();
      setTemplates(allTemplates);
      setError(null);
    } catch (err) {
      console.error('خطأ في تحميل النماذج:', err);
      setError('فشل في تحميل النماذج');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        // تحديث نموذج موجود
        const updatedTemplate = { ...editingTemplate, ...templateData };
        await database.updateTemplate(updatedTemplate);
        setTemplates(prev => prev.map(t =>
          t.id === editingTemplate.id ? updatedTemplate : t
        ));
      } else {
        // إنشاء نموذج جديد
        const newTemplate = {
          ...templateData,
          isActive: true
        };
        await database.addTemplate(newTemplate);
        // إعادة تحميل النماذج للحصول على ID الجديد
        await loadTemplates();
      }
      setShowEditor(false);
      setError(null);
    } catch (err) {
      console.error('خطأ في حفظ النموذج:', err);
      setError('فشل في حفظ النموذج');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const template = templates.find(t => t.id === id);
      if (template) {
        const updatedTemplate = { ...template, isActive: !template.isActive };
        await database.updateTemplate(updatedTemplate);
        setTemplates(prev => prev.map(t =>
          t.id === id ? updatedTemplate : t
        ));
      }
    } catch (err) {
      console.error('خطأ في تحديث حالة النموذج:', err);
      setError('فشل في تحديث حالة النموذج');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
      try {
        await database.deleteTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
        setError(null);
      } catch (err) {
        console.error('خطأ في حذف النموذج:', err);
        setError('فشل في حذف النموذج');
      }
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

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل النماذج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">خطأ: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">إغلاق</span>
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة النماذج</h2>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={loadTemplates}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="ml-2">🔄</span>
            تحديث
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <span className="ml-2">➕</span>
            إنشاء نموذج جديد
          </button>
        </div>
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