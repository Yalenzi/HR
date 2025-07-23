import { useState } from 'react';
import { initDatabase, database } from '../../lib/database';

export default function BackupManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // تصدير البيانات
  const handleExportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await initDatabase();
      const data = await database.exportData();
      
      // إنشاء ملف JSON للتحميل
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hr-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('تم تصدير البيانات بنجاح');
    } catch (err) {
      console.error('خطأ في تصدير البيانات:', err);
      setError('فشل في تصدير البيانات');
    } finally {
      setLoading(false);
    }
  };

  // استيراد البيانات
  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const text = await file.text();
      const data = JSON.parse(text);
      
      // التحقق من صحة البيانات
      if (!data.employees && !data.templates && !data.settings) {
        throw new Error('ملف النسخة الاحتياطية غير صحيح');
      }
      
      await initDatabase();
      await database.importData(data);
      
      setSuccess('تم استيراد البيانات بنجاح');
      
      // إعادة تحميل الصفحة بعد 2 ثانية
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error('خطأ في استيراد البيانات:', err);
      setError('فشل في استيراد البيانات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // مسح جميع البيانات
  const handleClearAllData = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }
    
    if (!confirm('تأكيد أخير: سيتم حذف جميع الموظفين والنماذج والإعدادات والخطابات. هل تريد المتابعة؟')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await initDatabase();
      await database.clearAllData();
      
      setSuccess('تم حذف جميع البيانات بنجاح');
      
      // إعادة تحميل الصفحة بعد 2 ثانية
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error('خطأ في حذف البيانات:', err);
      setError('فشل في حذف البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">إدارة النسخ الاحتياطية</h2>
      
      {/* رسائل النجاح والخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">خطأ: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">نجح: </strong>
          <span className="block sm:inline">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* تصدير البيانات */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تصدير البيانات</h3>
          <p className="text-gray-600 mb-4">
            قم بتصدير جميع البيانات (الموظفين، النماذج، الإعدادات، الخطابات) إلى ملف JSON.
          </p>
          <button
            onClick={handleExportData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            )}
            📥 تصدير البيانات
          </button>
        </div>

        {/* استيراد البيانات */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">استيراد البيانات</h3>
          <p className="text-gray-600 mb-4">
            قم باستيراد البيانات من ملف نسخة احتياطية. سيتم استبدال جميع البيانات الحالية.
          </p>
          <div className="flex items-center space-x-4 space-x-reverse">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>
          <div className="mt-2 text-sm text-yellow-600">
            ⚠️ تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة.
          </div>
        </div>

        {/* مسح جميع البيانات */}
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-4">منطقة الخطر</h3>
          <p className="text-red-700 mb-4">
            حذف جميع البيانات من النظام. هذا الإجراء لا يمكن التراجع عنه!
          </p>
          <button
            onClick={handleClearAllData}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            )}
            🗑️ حذف جميع البيانات
          </button>
        </div>

        {/* معلومات إضافية */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات مهمة</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>يتم حفظ البيانات محلياً في متصفحك باستخدام IndexedDB</li>
            <li>النسخ الاحتياطية تشمل جميع البيانات: الموظفين، النماذج، الإعدادات، والخطابات</li>
            <li>يُنصح بعمل نسخة احتياطية بانتظام لحماية البيانات</li>
            <li>عند استيراد البيانات، سيتم إعادة تشغيل النظام تلقائياً</li>
            <li>البيانات المحذوفة لا يمكن استرجاعها إلا من النسخ الاحتياطية</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
