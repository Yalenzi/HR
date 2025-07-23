export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">نظام إدارة خطابات الموظفين</h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <a href="/" className="hover:text-green-200">
              العودة للموقع الرئيسي
            </a>
            <button className="hover:text-green-200">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}