import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import SettingsPanel from '../../components/admin/SettingsPanel';
import TemplateManager from '../../components/admin/TemplateManager';
import EmployeeManager from '../../components/admin/EmployeeManager';
import BackupManager from '../../components/admin/BackupManager';
import CongratulationsManager from '../../components/admin/CongratulationsManager';
import StatsCards from '../../components/admin/StatsCards';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    centerManagerName: 'د. محمد أحمد السعيد',
    facilityName: 'مستشفى الملك فهد التخصصي',
    facilityAddress: 'الرياض - المملكة العربية السعودية',
    facilityPhone: '+966-11-1234567',
    facilityEmail: 'info@kfsh.med.sa',
    logoUrl: '/images/ministry-logo.png'
  });

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: '📊' },
    { id: 'employees', name: 'إدارة الموظفين', icon: '👥' },
    { id: 'templates', name: 'إدارة النماذج', icon: '📄' },
    { id: 'congratulations', name: 'قوالب التهنئة', icon: '🎉' },
    { id: 'settings', name: 'إعدادات المنشأة', icon: '⚙️' },
    { id: 'backup', name: 'النسخ الاحتياطية', icon: '💾' },
    { id: 'reports', name: 'التقارير', icon: '📈' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsCards />;
      case 'employees':
        return <EmployeeManager />;
      case 'templates':
        return <TemplateManager />;
      case 'congratulations':
        return <CongratulationsManager />;
      case 'settings':
        return <SettingsPanel settings={settings} onUpdate={setSettings} />;
      case 'backup':
        return <BackupManager />;
      case 'reports':
        return <div className="p-6">التقارير - قريباً...</div>;
      default:
        return <div className="p-6">قريباً...</div>;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-600">{settings.facilityName}</p>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-right">
                  <p className="text-sm text-gray-600">مرحباً</p>
                  <p className="font-semibold">{settings.centerManagerName}</p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  م
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 space-x-reverse">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="ml-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
}