import { useState, useEffect } from 'react';
import { initDatabase, database } from '../../lib/database';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // تحميل الموظفين من قاعدة البيانات
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const allEmployees = await database.getAllEmployees();
      setEmployees(allEmployees);
      setError(null);
    } catch (err) {
      console.error('خطأ في تحميل الموظفين:', err);
      setError('فشل في تحميل بيانات الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await database.searchEmployees(searchQuery);
        setEmployees(results);
      } catch (err) {
        console.error('خطأ في البحث:', err);
        setError('فشل في البحث');
      }
    } else {
      loadEmployees();
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (editingEmployee) {
        await database.updateEmployee({ ...editingEmployee, ...employeeData });
      } else {
        await database.addEmployee(employeeData);
      }
      await loadEmployees();
      setShowForm(false);
      setEditingEmployee(null);
      setError(null);
    } catch (err) {
      console.error('خطأ في حفظ الموظف:', err);
      setError('فشل في حفظ بيانات الموظف');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await database.deleteEmployee(id);
        await loadEmployees();
        setError(null);
      } catch (err) {
        console.error('خطأ في حذف الموظف:', err);
        setError('فشل في حذف الموظف');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الموظفين...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <EmployeeForm
        employee={editingEmployee}
        onSave={handleSaveEmployee}
        onCancel={() => {
          setShowForm(false);
          setEditingEmployee(null);
        }}
      />
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
        <h2 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h2>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={loadEmployees}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 تحديث
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            ➕ إضافة موظف
          </button>
        </div>
      </div>

      {/* البحث */}
      <div className="flex space-x-2 space-x-reverse">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث بالاسم أو رقم الهوية أو المسمى الوظيفي..."
          className="flex-1 p-3 border border-gray-300 rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          بحث
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              loadEmployees();
            }}
            className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
          >
            مسح
          </button>
        )}
      </div>

      {/* قائمة الموظفين */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهوية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المسمى الوظيفي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                القسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.nationalId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                  <button
                    onClick={() => {
                      setEditingEmployee(employee);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد بيانات موظفين</p>
          </div>
        )}
      </div>
    </div>
  );
}

// مكون نموذج الموظف
function EmployeeForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    nationalId: employee?.nationalId || '',
    position: employee?.position || '',
    department: employee?.department || '',
    hireDate: employee?.hireDate || '',
    salary: employee?.salary || '',
    grade: employee?.grade || '',
    status: employee?.status || 'active'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6">
        {employee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الموظف
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهوية
            </label>
            <input
              type="text"
              value={formData.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المسمى الوظيفي
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              القسم
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ التعيين
            </label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleChange('hireDate', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الراتب
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => handleChange('salary', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدرجة
            </label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {employee ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </form>
    </div>
  );
}
