// محاكاة قاعدة بيانات بسيطة
export const employees = [
  {
    id: "EMP001",
    name: "أحمد محمد العلي",
    nationalId: "1234567890",
    position: "طبيب أول",
    department: "قسم الطوارئ",
    hireDate: "2020-01-15",
    salary: 15000,
    grade: "الثامنة",
    status: "active"
  },
  // المزيد من الموظفين...
];

export const letterTemplates = {
  certificate: {
    title: "شهادة عمل",
    content: `نشهد نحن وزارة الصحة بالمملكة العربية السعودية أن المذكور أدناه يعمل لدينا بالبيانات التالية:`,
    fields: ["name", "nationalId", "position", "department", "hireDate"]
  },
  clearance: {
    title: "شهادة إخلاء طرف",
    content: `نشهد نحن وزارة الصحة أن الموظف المذكور أدناه قد أخلى طرفه من جميع الالتزامات:`,
    fields: ["name", "employeeId", "position", "endDate", "reason"]
  },
  salary: {
    title: "شهادة راتب",
    content: `نشهد نحن وزارة الصحة أن الموظف المذكور يتقاضى راتباً شهرياً قدره:`,
    fields: ["name", "nationalId", "position", "salary", "grade"]
  }
};