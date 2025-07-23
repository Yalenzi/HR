import { useState } from 'react';
import EmployeeSearch from './EmployeeSearch';
import { letterTemplates } from '../lib/database';

export default function AdvancedLetterForm({ letterType, onDataChange, onBack }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [additionalData, setAdditionalData] = useState({
    purpose: '',
    requestedBy: '',
    approvedBy: '',
    notes: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    letterNumber: `MOH-${Date.now()}`
  });

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    updateFormData(employee, additionalData);
  };

  const handleAdditionalDataChange = (field, value) => {
    const newData = { ...additionalData, [field]: value };
    setAdditionalData(newData);
    if (selectedEmployee) {
      updateFormData(selectedEmployee, newData);
    }
  };

  const updateFormData = (employee, additional) => {
    const combinedData = {
      ...employee,
      ...additional,
      letterType,
      template: letterTemplates[letterType]
    };
    onDataChange(combinedData);
  };

  const getLetterSpecificFields = () => {
    switch (letterType) {
      case 'salary':
        return (
          <div className="space-y-4">
            <select
              value={additionalData.purpose}
              onChange={(e) => handleAdditionalDataChange('purpose', e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">اختر الغرض من الشهادة</option>
              <option value="bank">للبنك</option>
              <option value="loan">للحصول على قرض</option>
              <option value="visa">للحصول على تأشيرة</option>
              <option value="other">أخرى</option>
            </select>
            
            <input
              type="date"
              placeholder="تاريخ انتهاء الصلاحية"
              value={additionalData.expiryDate}
              onChange={(e) => handleAdditionalDataChange('expiryDate', e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        );

      case 'clearance':
        return (
          <div className="space-y-4">
            <select
              value={additionalData.reason}
              onChange={(e) => handleAdditionalDataChange('reason', e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">اختر سبب إنهاء الخدمة</option>
              <option value="resignation">استقالة</option>
              <option value="retirement">تقاعد</option>
              <option value="transfer">نقل</option>
              <option value="termination">إنهاء خدمة</option>
            </select>
            
            <input
              type="date"
              placeholder="تاريخ آخر يوم عمل"
              value={additionalData.endDate}
              onChange={(e) => handleAdditionalDataChange('endDate', e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        );

      default:
        return (
          <textarea
            placeholder="الغرض من الخطاب"
            value={additionalData.purpose}
            onChange={(e) => handleAdditionalDataChange('purpose', e.target.value)}
            className="w-full p-3 border rounded-lg h-24"
          />
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 ml-4">
          ← العودة
        </button>
        <h2 className="text-2xl font-bold">
          {letterTemplates[letterType]?.title}
        </h2>
      </div>

      <div className="space-y-6">
        {/* البحث عن الموظف */}
        <div>
          <label className="block text-sm font-medium mb-2">بحث الموظف</label>
          <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
        </div>

        {/* بيانات الموظف المحدد */}
        {selectedEmployee && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">بيانات الموظف المحدد:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>الاسم:</strong> {selectedEmployee.name}</div>
              <div><strong>رقم الموظف:</strong> {selectedEmployee.id}</div>
              <div><strong>المسمى:</strong> {selectedEmployee.position}</div>
              <div><strong>القسم:</strong> {selectedEmployee.department}</div>
            </div>
          </div>
        )}

        {/* الحقول الإضافية */}
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="رقم الخطاب"
                value={additionalData.letterNumber}
                onChange={(e) => handleAdditionalDataChange('letterNumber', e.target.value)}
                className="p-3 border rounded-lg"
              />
              <input
                type="date"
                value={additionalData.issueDate}
                onChange={(e) => handleAdditionalDataChange('issueDate', e.target.value)}
                className="p-3 border rounded-lg"
              />
            </div>

            {getLetterSpecificFields()}

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="مقدم الطلب"
                value={additionalData.requestedBy}
                onChange={(e) => handleAdditionalDataChange('requestedBy', e.target.value)}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="المعتمد من"
                value={additionalData.approvedBy}
                onChange={(e) => handleAdditionalDataChange('approvedBy', e.target.value)}
                className="p-3 border rounded-lg"
              />
            </div>

            <textarea
              placeholder="ملاحظات إضافية"
              value={additionalData.notes}
              onChange={(e) => handleAdditionalDataChange('notes', e.target.value)}
              className="w-full p-3 border rounded-lg h-20"
            />
          </div>
        )}
      </div>
    </div>
  );
}