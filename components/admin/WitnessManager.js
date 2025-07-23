import { useState, useEffect } from 'react';
import { initDatabase, database } from '../../lib/database';
import EmployeeWitnessTemplate from '../templates/EmployeeWitnessTemplate';

export default function WitnessManager() {
  const [witnesses, setWitnesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWitness, setSelectedWitness] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    loadWitnesses();
  }, []);

  const loadWitnesses = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const allLetters = await database.getAllLetters();
      const witnessLetters = allLetters.filter(letter => letter.type === 'witness');
      setWitnesses(witnessLetters);
      setError(null);
    } catch (err) {
      console.error('خطأ في تحميل مشاهد الموظفين:', err);
      setError('فشل في تحميل مشاهد الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWitness = (witness) => {
    setSelectedWitness(witness);
    setShowTemplate(true);
  };

  const handleCreateNew = () => {
    const defaultData = {
      employeeName: '',
      position: '',
      employeeId: '',
      nationality: 'سعودي',
      additionalInfo: '',
      senderTitle: 'سعادة',
      senderHonorific: 'حفظه الله',
      letterContent: 'تشهد إدارة مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية أن الموظف المذكور أعلاه يعمل لدينا ويؤدي مهامه بكفاءة عالية ونزاهة تامة.',
      closingPhrase: 'هذا ولكم تحياتي',
      managerName: 'د. فواز جمال الديدب',
      facilityName: 'مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية',
      issueDate: new Date().toISOString().split('T')[0]
    };
    
    setSelectedWitness({ data: defaultData });
    setShowTemplate(true);
  };

  const handleSave = async (data) => {
    try {
      await initDatabase();
      const witnessData = {
        type: 'witness',
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        data: data,
        createdAt: new Date().toISOString()
      };
      
      await database.addLetter(witnessData);
      await loadWitnesses();
      setShowTemplate(false);
      setSelectedWitness(null);
    } catch (error) {
      console.error('خطأ في حفظ مشهد الموظف:', error);
      setError('فشل في حفظ مشهد الموظف');
    }
  };

  const handleCancel = () => {
    setShowTemplate(false);
    setSelectedWitness(null);
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف مشهد الموظف هذا؟')) {
      try {
        await database.deleteLetter(id);
        await loadWitnesses();
        setError(null);
      } catch (err) {
        console.error('خطأ في حذف مشهد الموظف:', err);
        setError('فشل في حذف مشهد الموظف');
      }
    }
  };

  if (showTemplate) {
    return (
      <EmployeeWitnessTemplate
        data={selectedWitness?.data}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل مشاهد الموظفين...</p>
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
        <h2 className="text-2xl font-bold text-gray-900">إدارة مشاهد الموظفين</h2>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={loadWitnesses}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 تحديث
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            👤 إنشاء مشهد جديد
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📋</div>
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المشاهد</p>
              <p className="text-2xl font-bold text-gray-900">{witnesses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">هذا الشهر</p>
              <p className="text-2xl font-bold text-gray-900">
                {witnesses.filter(w => {
                  const createdDate = new Date(w.createdAt);
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
            <div className="text-3xl mr-4">🌍</div>
            <div>
              <p className="text-sm font-medium text-gray-600">أكثر الجنسيات</p>
              <p className="text-lg font-bold text-gray-900">
                {witnesses.length > 0 ? 
                  Object.entries(
                    witnesses.reduce((acc, w) => {
                      const nationality = w.data?.nationality || 'غير محدد';
                      acc[nationality] = (acc[nationality] || 0) + 1;
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

      {/* قائمة المشاهد */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">مشاهد الموظفين المحفوظة</h3>
        </div>

        {witnesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-500 text-lg mb-4">لا توجد مشاهد محفوظة</p>
            <button
              onClick={handleCreateNew}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              إنشاء أول مشهد
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {witnesses.map((witness) => (
              <div key={witness.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-2xl">📋</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {witness.data?.employeeName || 'غير محدد'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {witness.data?.position} - رقم الموظف: {witness.data?.employeeId}
                        </p>
                        <p className="text-sm text-gray-500">
                          الجنسية: {witness.data?.nationality} | 
                          التاريخ: {new Date(witness.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                        {witness.data?.additionalInfo && (
                          <p className="text-sm text-blue-600">
                            معلومات إضافية: {witness.data.additionalInfo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleViewWitness(witness)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      👁️ عرض
                    </button>
                    <button
                      onClick={() => handleDelete(witness.id)}
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
