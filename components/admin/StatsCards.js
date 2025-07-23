import { useState, useEffect } from 'react';
import { initDatabase, database } from '../../lib/database';

export default function StatsCards() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      await initDatabase();
      const dbStats = await database.getStats();

      const statsData = [
        {
          title: 'إجمالي الموظفين',
          value: dbStats.totalEmployees.toString(),
          change: '',
          changeType: 'neutral',
          icon: '👥'
        },
        {
          title: 'إجمالي الخطابات',
          value: dbStats.totalLetters.toString(),
          change: '',
          changeType: 'neutral',
          icon: '📄'
        },
        {
          title: 'النماذج المتاحة',
          value: dbStats.totalTemplates.toString(),
          change: '',
          changeType: 'neutral',
          icon: '📝'
        },
        {
          title: 'المستخدمين',
          value: dbStats.totalUsers.toString(),
          change: '',
          changeType: 'neutral',
          icon: '🔐'
        }
      ];

      setStats(statsData);
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error);
      // إحصائيات افتراضية في حالة الخطأ
      setStats([
        { title: 'إجمالي الموظفين', value: '0', change: '', changeType: 'neutral', icon: '👥' },
        { title: 'إجمالي الخطابات', value: '0', change: '', changeType: 'neutral', icon: '📄' },
        { title: 'النماذج المتاحة', value: '0', change: '', changeType: 'neutral', icon: '📝' },
        { title: 'المستخدمين', value: '0', change: '', changeType: 'neutral', icon: '🔐' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

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