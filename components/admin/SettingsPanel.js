import { useState } from 'react';

export default function SettingsPanel({ settings, onUpdate }) {
  const [formData, setFormData] = useState(settings);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
    alert('تم حفظ الإعدادات بنجاح');
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">إعدادات المنشأة</h2>
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            حفظ التغييرات
          </button>
        </div>
      )}
    </div>
  );
}