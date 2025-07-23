import { useState } from 'react';
import ClearanceLetter from '../templates/ClearanceLetter';
import WorkCertificate from '../templates/WorkCertificate';

export default function EnhancedTemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState({
    name: 'أحمد محمد العلي',
    nationalId: '1234567890',
    id: 'EMP001',
    nationality: 'سعودي',
    position: 'طبيب أول',
    department: 'قسم الطوارئ',
    hireDate: '2020-01-15',
    endDate: '2024-12-31',
    reason: 'resignation',
    letterNumber: 'MOH-2024-001',
    issueDate: new Date().toISOString().split('T')[0],
    addressedTo: 'سعادة المدير المحترم',
    requestedBy: 'أحمد محمد العلي'
  });

  const [settings, setSettings] = useState({
    centerManagerName: 'الدكتور / محمد أحمد السعيد',
    facilityName: 'مركز الخدمات الطبية الشرعية',
    facilityAddress: 'منطقة الحدود الشمالية - المملكة العربية السعودية',
    facilityPhone: '+966-14-1234567',
    facilityEmail: 'info@forensic.moh.gov.sa'
  });

  const templates = [
    {
      id: 'clearance',
      name: 'خطاب إخلاء طرف',
      description: 'خطاب رسمي لإخلاء طرف الموظف',
      component: ClearanceLetter,
      fields: ['name', 'nationalId', 'id', 'nationality', 'position', 'department', 'endDate', 'reason']
    },
    {
      id: 'certificate',
      name: 'شهادة عمل',
      description: 'شهادة تثبت عمل الموظف',
      component: WorkCertificate,
      fields: ['name', 'nationalId', 'id', 'nationality', 'position', 'department', 'hireDate', 'grade']
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;

    const TemplateComponent = selectedTemplate.component;
    return (
      <div className="mt-8">
        <TemplateComponent data={previewData} settings={settings} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">إدارة القوالب المحسنة</h2>
        
        {/* اختيار القالب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              <div className="flex flex-wrap gap-2">
                {template.fields.map(field => (
                  <span
                    key={field}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* إعدادات البيانات التجريبية */}
        {selectedTemplate && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">بيانات تجريبية للمعاينة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="اسم الموظف"
                value={previewData.name}
                onChange={(e) => setPreviewData(prev => ({ ...prev, name: e.target.value }))}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="رقم الهوية"
                value={previewData.nationalId}
                onChange={(e) => setPreviewData(prev => ({ ...prev, nationalId: e.target.value }))}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="رقم الموظف"
                value={previewData.id}
                onChange={(e) => setPreviewData(prev => ({ ...prev, id: e.target.value }))}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="المسمى الوظيفي"
                value={previewData.position}
                onChange={(e) => setPreviewData(prev => ({ ...prev, position: e.target.value }))}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="القسم"
                value={previewData.department}
                onChange={(e) => setPreviewData(prev => ({ ...prev, department: e.target.value }))}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="اسم المدير"
                value={settings.centerManagerName}
                onChange={(e) => setSettings(prev => ({ ...prev, centerManagerName: e.target.value }))}
                className="p-2 border rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* معاينة القالب */}
      {renderTemplatePreview()}
    </div>
  );
}