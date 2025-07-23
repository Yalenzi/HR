import { useState, useEffect } from 'react';
import { initDatabase, database } from '../../lib/database';

export default function SettingsPanel({ settings: initialSettings, onUpdate }) {
  const [formData, setFormData] = useState(initialSettings || {});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // تحميل الإعدادات من قاعدة البيانات
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const allSettings = await database.getAllSettings();
      setFormData(allSettings);
      setError(null);
    } catch (err) {
      console.error('خطأ في تحميل الإعدادات:', err);
      setError('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // حفظ كل إعداد في قاعدة البيانات
      for (const [key, value] of Object.entries(formData)) {
        await database.setSetting(key, value);
      }

      setIsEditing(false);
      if (onUpdate) {
        onUpdate(formData);
      }
      alert('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      console.error('خطأ في حفظ الإعدادات:', err);
      setError('فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('logoUrl', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إعدادات المنشأة</h2>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={loadSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            <span className="ml-2">🔄</span>
            تحديث
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg ${
              isEditing
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isEditing ? 'إلغاء' : 'تعديل'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* معلومات أساسية */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            المعلومات الأساسية
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم مدير المركز
            </label>
            <input
              type="text"
              value={formData.centerManagerName}
              onChange={(e) => handleChange('centerManagerName', e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg ${
                isEditing ? 'border-gray-300 focus:border-green-500' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المنشأة
            </label>
            <input
              type="text"
              value={formData.facilityName}
              onChange={(e) => handleChange('facilityName', e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg ${
                isEditing ? 'border-gray-300 focus:border-green-500' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان المنشأة
            </label>
            <textarea
              value={formData.facilityAddress}
              onChange={(e) => handleChange('facilityAddress', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={`w-full p-3 border rounded-lg ${
                isEditing ? 'border-gray-300 focus:border-green-500' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>
        </div>

        {/* معلومات الاتصال والشعار */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            معلومات الاتصال والهوية
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={formData.facilityPhone}
              onChange={(e) => handleChange('facilityPhone', e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg ${
                isEditing ? 'border-gray-300 focus:border-green-500' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.facilityEmail}
              onChange={(e) => handleChange('facilityEmail', e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg ${
                isEditing ? 'border-gray-300 focus:border-green-500' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شعار المنشأة
            </label>
            <div className="flex items-center space-x-4 space-x-reverse">
              {formData.logoUrl && (
                <img 
                  src={formData.logoUrl} 
                  alt="شعار المنشأة" 
                  className="w-16 h-16 object-contain border rounded"
                />
              )}
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1 p-2 border rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            )}
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      )}
    </div>
  );
}