import { useState, useEffect } from 'react';
import { initDatabase, database } from '../lib/database';

export default function LetterForm({ letterType, onDataChange, onBack }) {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    nationalId: '',
    position: '',
    department: '',
    hireDate: '',
    salary: '',
    reason: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    onDataChange(newData);
  };

  // حفظ الخطاب في قاعدة البيانات
  const saveLetter = async (letterData) => {
    try {
      await initDatabase();
      const letter = {
        type: letterType,
        employeeId: letterData.employeeId || letterData.nationalId,
        employeeName: letterData.employeeName,
        data: letterData,
        createdAt: new Date().toISOString()
      };
      await database.addLetter(letter);
      console.log('تم حفظ الخطاب بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الخطاب:', error);
    }
  };

  // حفظ الخطاب عند تغيير البيانات (مع تأخير لتجنب الحفظ المتكرر)
  useEffect(() => {
    if (formData.employeeName && formData.nationalId) {
      const timeoutId = setTimeout(() => {
        saveLetter(formData);
      }, 2000); // حفظ بعد ثانيتين من آخر تعديل

      return () => clearTimeout(timeoutId);
    }
  }, [formData, letterType]);

  const getFormFields = () => {
    const commonFields = (
      <>
        <input
          name="employeeName"
          placeholder="اسم الموظف"
          value={formData.employeeName}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          name="employeeId"
          placeholder="رقم الموظف"
          value={formData.employeeId}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          name="nationalId"
          placeholder="رقم الهوية"
          value={formData.nationalId}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          name="position"
          placeholder="المسمى الوظيفي"
          value={formData.position}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          name="department"
          placeholder="القسم"
          value={formData.department}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
      </>
    );

    if (letterType === 'salary') {
      return (
        <>
          {commonFields}
          <input
            name="salary"
            placeholder="الراتب الأساسي"
            value={formData.salary}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </>
      );
    }

    if (letterType === 'clearance') {
      return (
        <>
          {commonFields}
          <textarea
            name="reason"
            placeholder="سبب إنهاء الخدمة"
            value={formData.reason}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg h-24"
            required
          />
        </>
      );
    }

    if (letterType === 'congratulations') {
      return (
        <>
          {commonFields}
          <select
            name="occasionType"
            value={formData.occasionType || 'ترقية'}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">اختر نوع المناسبة</option>
            <option value="ترقية">ترقية</option>
            <option value="تكريم">تكريم</option>
            <option value="إنجاز متميز">إنجاز متميز</option>
            <option value="حصول على شهادة">حصول على شهادة</option>
            <option value="تخرج">تخرج</option>
            <option value="تعيين">تعيين</option>
            <option value="نجاح في مهمة">نجاح في مهمة</option>
            <option value="تميز في الأداء">تميز في الأداء</option>
          </select>
          <input
            name="occasionDate"
            type="date"
            placeholder="تاريخ المناسبة"
            value={formData.occasionDate || new Date().toISOString().split('T')[0]}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </>
      );
    }

    return (
      <>
        {commonFields}
        <input
          name="hireDate"
          type="date"
          placeholder="تاريخ التعيين"
          value={formData.hireDate}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800">
          ← العودة
        </button>
        <h2 className="text-2xl font-bold mr-4">بيانات الخطاب</h2>
      </div>
      
      <form className="space-y-4">
        {getFormFields()}
        <input
          name="issueDate"
          type="date"
          value={formData.issueDate}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
      </form>
    </div>
  );
}