export default function StatsCards() {
  const stats = [
    {
      title: 'إجمالي الخطابات',
      value: '1,247',
      change: '+12%',
      changeType: 'increase',
      icon: '📄'
    },
    {
      title: 'الخطابات هذا الشهر',
      value: '89',
      change: '+5%',
      changeType: 'increase',
      icon: '📈'
    },
    {
      title: 'النماذج النشطة',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: '✅'
    },
    {
      title: 'المستخدمين النشطين',
      value: '24',
      change: '+3',
      changeType: 'increase',
      icon: '👥'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${
              stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
          </div>
        </div>
      ))}
    </div>
  );
}