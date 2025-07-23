import { useState, useEffect } from 'react';
import { initDatabase, database } from '../../lib/database';
import CongratulationsTemplate from '../templates/CongratulationsTemplate';

export default function CongratulationsManager() {
  const [congratulations, setCongratulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCongratulation, setSelectedCongratulation] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    loadCongratulations();
  }, []);

  const loadCongratulations = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const allLetters = await database.getAllLetters();
      const congratulationLetters = allLetters.filter(letter => letter.type === 'congratulations');
      setCongratulations(congratulationLetters);
      setError(null);
    } catch (err) {
      console.error('خطأ في تحميل التهنئات:', err);
      setError('فشل في تحميل التهنئات');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCongratulation = (congratulation) => {
    setSelectedCongratulation(congratulation);
    setShowTemplate(true);
  };

  const handleCreateNew = () => {
    const defaultData = {
      employeeName: '',
      employeeId: '',
      position: '',
      department: '',
      occasionType: 'ترقية',
      occasionDate: new Date().toISOString().split('T')[0],
      congratulationMessage1: 'يسعدنا أن نتقدم لكم بأحر التهاني والتبريكات',
      congratulationMessage2: 'بمناسبة حصولكم على هذا الإنجاز المتميز',
      congratulationMessage3: 'متمنين لكم دوام التوفيق والنجاح في مسيرتكم المهنية',
      senderTitle: 'سعادة',
      senderPosition: 'مدير المركز',
      senderHonorific: 'حفظه الله',
      managerName: 'د. فواز جمال الديدب',
      employeePhoto: null,
      closingPhrase: 'هذا ولكم تحياتي'
    };
    
    setSelectedCongratulation({ data: defaultData });
    setShowTemplate(true);
  };

  const handleSave = async (data) => {
    try {
      await initDatabase();
      const congratulationData = {
        type: 'congratulations',
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        data: data,
        createdAt: new Date().toISOString()
      };
      
      await database.addLetter(congratulationData);
      await loadCongratulations();
      setShowTemplate(false);
      setSelectedCongratulation(null);
    } catch (error) {
      console.error('خطأ في حفظ التهنئة:', error);
      setError('فشل في حفظ التهنئة');
    }
  };

  const handleCancel = () => {
    setShowTemplate(false);
    setSelectedCongratulation(null);
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذه التهنئة؟')) {
      try {
        await database.deleteLetter(id);
        await loadCongratulations();
        setError(null);
      } catch (err) {
        console.error('خطأ في حذف التهنئة:', err);
        setError('فشل في حذف التهنئة');
      }
    }
  };

  if (showTemplate) {
    return (
      <CongratulationsTemplate
        data={selectedCongratulation?.data}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التهنئات...</p>
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
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة قوالب التهنئة</h2>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={loadCongratulations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 تحديث
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            🎉 إنشاء تهنئة جديدة
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي التهنئات</p>
              <p className="text-2xl font-bold text-gray-900">{congratulations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">هذا الشهر</p>
              <p className="text-2xl font-bold text-gray-900">
                {congratulations.filter(c => {
                  const createdDate = new Date(c.createdAt);
                  const currentDate = new Date();
                  return createdDate.getMonth() === currentDate.getMonth() && 
                         createdDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏆</div>
            <div>
              <p className="text-sm font-medium text-gray-600">أكثر المناسبات</p>
              <p className="text-lg font-bold text-gray-900">
                {congratulations.length > 0 ? 
                  Object.entries(
                    congratulations.reduce((acc, c) => {
                      const occasion = c.data?.occasionType || 'غير محدد';
                      acc[occasion] = (acc[occasion] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'لا يوجد'
                  : 'لا يوجد'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة التهنئات */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">التهنئات المحفوظة</h3>
        </div>

        {congratulations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-500 text-lg mb-4">لا توجد تهنئات محفوظة</p>
            <button
              onClick={handleCreateNew}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              إنشاء أول تهنئة
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {congratulations.map((congratulation) => (
              <div key={congratulation.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-2xl">🎊</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {congratulation.data?.employeeName || 'غير محدد'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {congratulation.data?.position} - {congratulation.data?.department}
                        </p>
                        <p className="text-sm text-gray-500">
                          المناسبة: {congratulation.data?.occasionType} | 
                          التاريخ: {new Date(congratulation.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleViewCongratulation(congratulation)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      👁️ عرض
                    </button>
                    <button
                      onClick={() => handleDelete(congratulation.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
