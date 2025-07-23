// نظام قاعدة البيانات المحلية باستخدام IndexedDB
class LocalDatabase {
  constructor() {
    this.dbName = 'EmployeeLettersDB';
    this.version = 1;
    this.db = null;
  }

  // تهيئة قاعدة البيانات
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // إنشاء جدول الموظفين
        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
          employeeStore.createIndex('nationalId', 'nationalId', { unique: true });
          employeeStore.createIndex('name', 'name', { unique: false });
          employeeStore.createIndex('department', 'department', { unique: false });
        }

        // إنشاء جدول النماذج
        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
          templateStore.createIndex('type', 'type', { unique: false });
          templateStore.createIndex('name', 'name', { unique: false });
        }

        // إنشاء جدول الإعدادات
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // إنشاء جدول الخطابات المُنشأة
        if (!db.objectStoreNames.contains('letters')) {
          const letterStore = db.createObjectStore('letters', { keyPath: 'id' });
          letterStore.createIndex('employeeId', 'employeeId', { unique: false });
          letterStore.createIndex('type', 'type', { unique: false });
          letterStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // إنشاء جدول المستخدمين
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('role', 'role', { unique: false });
        }
      };
    });
  }

  // عمليات الموظفين
  async addEmployee(employee) {
    const transaction = this.db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    employee.id = employee.id || 'EMP' + Date.now();
    employee.createdAt = new Date().toISOString();
    employee.updatedAt = new Date().toISOString();
    return store.add(employee);
  }

  async updateEmployee(employee) {
    const transaction = this.db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    employee.updatedAt = new Date().toISOString();
    return store.put(employee);
  }

  async deleteEmployee(id) {
    const transaction = this.db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    return store.delete(id);
  }

  async getEmployee(id) {
    const transaction = this.db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEmployees() {
    const transaction = this.db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchEmployees(query) {
    const employees = await this.getAllEmployees();
    return employees.filter(emp =>
      emp.name.includes(query) ||
      emp.nationalId.includes(query) ||
      emp.position.includes(query) ||
      emp.department.includes(query)
    );
  }

  // عمليات النماذج
  async addTemplate(template) {
    const transaction = this.db.transaction(['templates'], 'readwrite');
    const store = transaction.objectStore('templates');
    template.id = template.id || 'TPL' + Date.now();
    template.createdAt = new Date().toISOString();
    template.updatedAt = new Date().toISOString();
    return store.add(template);
  }

  async updateTemplate(template) {
    const transaction = this.db.transaction(['templates'], 'readwrite');
    const store = transaction.objectStore('templates');
    template.updatedAt = new Date().toISOString();
    return store.put(template);
  }

  async deleteTemplate(id) {
    const transaction = this.db.transaction(['templates'], 'readwrite');
    const store = transaction.objectStore('templates');
    return store.delete(id);
  }

  async getTemplate(id) {
    const transaction = this.db.transaction(['templates'], 'readonly');
    const store = transaction.objectStore('templates');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTemplates() {
    const transaction = this.db.transaction(['templates'], 'readonly');
    const store = transaction.objectStore('templates');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplatesByType(type) {
    const transaction = this.db.transaction(['templates'], 'readonly');
    const store = transaction.objectStore('templates');
    const index = store.index('type');
    return new Promise((resolve, reject) => {
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // عمليات الإعدادات
  async setSetting(key, value) {
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const setting = {
      key,
      value,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(setting);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key) {
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSettings() {
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const settings = {};
        request.result.forEach(item => {
          settings[item.key] = item.value;
        });
        resolve(settings);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // عمليات الخطابات
  async addLetter(letter) {
    const transaction = this.db.transaction(['letters'], 'readwrite');
    const store = transaction.objectStore('letters');
    letter.id = letter.id || 'LTR' + Date.now();
    letter.createdAt = new Date().toISOString();
    return store.add(letter);
  }

  async getAllLetters() {
    const transaction = this.db.transaction(['letters'], 'readonly');
    const store = transaction.objectStore('letters');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLettersByEmployee(employeeId) {
    const transaction = this.db.transaction(['letters'], 'readonly');
    const store = transaction.objectStore('letters');
    const index = store.index('employeeId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(employeeId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLettersByType(type) {
    const transaction = this.db.transaction(['letters'], 'readonly');
    const store = transaction.objectStore('letters');
    const index = store.index('type');
    return new Promise((resolve, reject) => {
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLetter(id) {
    const transaction = this.db.transaction(['letters'], 'readwrite');
    const store = transaction.objectStore('letters');
    return store.delete(id);
  }

  // عمليات المستخدمين
  async addUser(user) {
    const transaction = this.db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    user.id = user.id || 'USR' + Date.now();
    user.createdAt = new Date().toISOString();
    return store.add(user);
  }

  async getAllUsers() {
    const transaction = this.db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // عمليات النسخ الاحتياطي
  async exportData() {
    const data = {
      employees: await this.getAllEmployees(),
      templates: await this.getAllTemplates(),
      settings: await this.getAllSettings(),
      letters: await this.getAllLetters(),
      users: await this.getAllUsers(),
      exportDate: new Date().toISOString()
    };
    return data;
  }

  async importData(data) {
    const transaction = this.db.transaction(['employees', 'templates', 'settings', 'letters', 'users'], 'readwrite');

    try {
      // مسح البيانات الحالية
      await this.clearAllData();

      // استيراد البيانات الجديدة
      if (data.employees) {
        const employeeStore = transaction.objectStore('employees');
        for (const employee of data.employees) {
          await employeeStore.add(employee);
        }
      }

      if (data.templates) {
        const templateStore = transaction.objectStore('templates');
        for (const template of data.templates) {
          await templateStore.add(template);
        }
      }

      if (data.settings) {
        const settingStore = transaction.objectStore('settings');
        for (const [key, value] of Object.entries(data.settings)) {
          await settingStore.add({ key, value, updatedAt: new Date().toISOString() });
        }
      }

      if (data.letters) {
        const letterStore = transaction.objectStore('letters');
        for (const letter of data.letters) {
          await letterStore.add(letter);
        }
      }

      if (data.users) {
        const userStore = transaction.objectStore('users');
        for (const user of data.users) {
          await userStore.add(user);
        }
      }

      return true;
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      throw error;
    }
  }

  async clearAllData() {
    const transaction = this.db.transaction(['employees', 'templates', 'settings', 'letters', 'users'], 'readwrite');

    await transaction.objectStore('employees').clear();
    await transaction.objectStore('templates').clear();
    await transaction.objectStore('settings').clear();
    await transaction.objectStore('letters').clear();
    await transaction.objectStore('users').clear();
  }

  // إحصائيات
  async getStats() {
    const [employees, templates, letters, users] = await Promise.all([
      this.getAllEmployees(),
      this.getAllTemplates(),
      this.getAllLetters(),
      this.getAllUsers()
    ]);

    return {
      totalEmployees: employees.length,
      totalTemplates: templates.length,
      totalLetters: letters.length,
      totalUsers: users.length,
      lettersByType: this.groupByType(letters),
      recentLetters: letters.slice(-10).reverse()
    };
  }

  groupByType(letters) {
    return letters.reduce((acc, letter) => {
      acc[letter.type] = (acc[letter.type] || 0) + 1;
      return acc;
    }, {});
  }

  // تهيئة البيانات الافتراضية
  async initializeDefaultData() {
    const employees = await this.getAllEmployees();
    const templates = await this.getAllTemplates();
    const settings = await this.getAllSettings();

    // إضافة موظفين افتراضيين إذا لم يكونوا موجودين
    if (employees.length === 0) {
      const defaultEmployees = [
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
        {
          id: "EMP002",
          name: "فاطمة سعد الأحمد",
          nationalId: "0987654321",
          position: "ممرضة أولى",
          department: "قسم العناية المركزة",
          hireDate: "2019-03-20",
          salary: 8000,
          grade: "السادسة",
          status: "active"
        },
        {
          id: "EMP003",
          name: "محمد عبدالله الخالد",
          nationalId: "1122334455",
          position: "صيدلي",
          department: "قسم الصيدلة",
          hireDate: "2021-06-10",
          salary: 10000,
          grade: "السابعة",
          status: "active"
        }
      ];

      for (const employee of defaultEmployees) {
        await this.addEmployee(employee);
      }
    }

    // إضافة نماذج افتراضية إذا لم تكن موجودة
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          id: "TPL001",
          type: "certificate",
          name: "شهادة عمل - النموذج الأساسي",
          title: "شهادة عمل",
          content: `نشهد نحن وزارة الصحة بالمملكة العربية السعودية أن المذكور أدناه يعمل لدينا بالبيانات التالية:

الاسم: {{employeeName}}
رقم الهوية: {{nationalId}}
المسمى الوظيفي: {{position}}
القسم: {{department}}
تاريخ التعيين: {{hireDate}}

وقد أعطيت له هذه الشهادة بناءً على طلبه دون أدنى مسؤولية على الوزارة.

والله الموفق،،،`,
          variables: [
            { key: "employeeName", label: "اسم الموظف", type: "text", required: true },
            { key: "nationalId", label: "رقم الهوية", type: "text", required: true },
            { key: "position", label: "المسمى الوظيفي", type: "text", required: true },
            { key: "department", label: "القسم", type: "text", required: true },
            { key: "hireDate", label: "تاريخ التعيين", type: "date", required: true }
          ],
          isActive: true
        },
        {
          id: "TPL002",
          type: "clearance",
          name: "إخلاء طرف - النموذج الأساسي",
          title: "شهادة إخلاء طرف",
          content: `نشهد نحن وزارة الصحة أن الموظف المذكور أدناه قد أخلى طرفه من جميع الالتزامات:

الاسم: {{employeeName}}
رقم الموظف: {{employeeId}}
المسمى الوظيفي: {{position}}
تاريخ انتهاء الخدمة: {{endDate}}
سبب انتهاء الخدمة: {{reason}}

وعليه فإن ذمته بريئة من أي التزامات مالية أو إدارية تجاه الوزارة.

والله الموفق،،،`,
          variables: [
            { key: "employeeName", label: "اسم الموظف", type: "text", required: true },
            { key: "employeeId", label: "رقم الموظف", type: "text", required: true },
            { key: "position", label: "المسمى الوظيفي", type: "text", required: true },
            { key: "endDate", label: "تاريخ انتهاء الخدمة", type: "date", required: true },
            { key: "reason", label: "سبب انتهاء الخدمة", type: "text", required: true }
          ],
          isActive: true
        },
        {
          id: "TPL003",
          type: "salary",
          name: "شهادة راتب - النموذج الأساسي",
          title: "شهادة راتب",
          content: `نشهد نحن وزارة الصحة أن الموظف المذكور يتقاضى راتباً شهرياً قدره:

الاسم: {{employeeName}}
رقم الهوية: {{nationalId}}
المسمى الوظيفي: {{position}}
الراتب الأساسي: {{salary}} ريال سعودي
الدرجة: {{grade}}

وقد أعطيت له هذه الشهادة بناءً على طلبه لمن يهمه الأمر.

والله الموفق،،،`,
          variables: [
            { key: "employeeName", label: "اسم الموظف", type: "text", required: true },
            { key: "nationalId", label: "رقم الهوية", type: "text", required: true },
            { key: "position", label: "المسمى الوظيفي", type: "text", required: true },
            { key: "salary", label: "الراتب", type: "number", required: true },
            { key: "grade", label: "الدرجة", type: "text", required: true }
          ],
          isActive: true
        },
        {
          id: "TPL004",
          type: "congratulations",
          name: "قالب التهنئة - النموذج الأساسي",
          title: "مشهد تهنئة",
          content: `يسعدنا أن نتقدم لكم بأحر التهاني والتبريكات

الاسم: {{employeeName}}
رقم الموظف: {{employeeId}}
المسمى الوظيفي: {{position}}
القسم: {{department}}
نوع المناسبة: {{occasionType}}
التاريخ: {{occasionDate}}

{{congratulationMessage1}}
{{congratulationMessage2}}
{{congratulationMessage3}}

{{closingPhrase}}

مدير المركز
الدكتور {{managerName}}`,
          variables: [
            { key: "employeeName", label: "اسم الموظف", type: "text", required: true },
            { key: "employeeId", label: "رقم الموظف", type: "text", required: true },
            { key: "position", label: "المسمى الوظيفي", type: "text", required: true },
            { key: "department", label: "القسم", type: "text", required: true },
            { key: "occasionType", label: "نوع المناسبة", type: "select", required: true, options: ["ترقية", "تكريم", "إنجاز متميز", "حصول على شهادة", "تخرج", "تعيين", "نجاح في مهمة", "تميز في الأداء"] },
            { key: "occasionDate", label: "تاريخ المناسبة", type: "date", required: true },
            { key: "congratulationMessage1", label: "رسالة التهنئة الأولى", type: "textarea", required: true },
            { key: "congratulationMessage2", label: "رسالة التهنئة الثانية", type: "textarea", required: true },
            { key: "congratulationMessage3", label: "رسالة التهنئة الثالثة", type: "textarea", required: true },
            { key: "senderTitle", label: "لقب المرسل", type: "select", required: true, options: ["سعادة", "المدير", "المساعد", "الدكتور", "الأستاذ"] },
            { key: "senderPosition", label: "منصب المرسل", type: "text", required: true },
            { key: "senderHonorific", label: "صفة التبجيل", type: "select", required: true, options: ["حفظه الله", "وفقه الله", "المحترم", "الموقر"] },
            { key: "managerName", label: "اسم المدير", type: "text", required: true, default: "د. فواز جمال الديدب" },
            { key: "employeePhoto", label: "صورة الموظف", type: "file", required: false },
            { key: "closingPhrase", label: "عبارة الختام", type: "select", required: true, options: ["هذا ولكم تحياتي", "هذا ولكم شكري", "تقبلوا فائق الاحترام"] }
          ],
          isActive: true
        },
        {
          id: "TPL005",
          type: "witness",
          name: "مشهد موظف - النموذج الأساسي",
          title: "مشهد موظف",
          content: `مشهد موظف

الاسم: {{employeeName}}
الوظيفة: {{position}}
رقم الموظف: {{employeeId}}
الجنسية: {{nationality}}
معلومات إضافية: {{additionalInfo}}

{{senderTitle}} مدير عام التجمع {{senderHonorific}}

السلام عليكم ورحمة الله وبركاته

{{letterContent}}

{{closingPhrase}}

مدير المركز
الدكتور {{managerName}}`,
          variables: [
            { key: "employeeName", label: "اسم الموظف", type: "text", required: true },
            { key: "position", label: "المسمى الوظيفي", type: "text", required: true },
            { key: "employeeId", label: "رقم الموظف", type: "text", required: true },
            { key: "nationality", label: "الجنسية", type: "select", required: true, options: ["سعودي", "مصري", "سوري", "أردني", "لبناني", "فلسطيني", "عراقي", "يمني", "سوداني", "مغربي", "تونسي", "جزائري", "ليبي", "أخرى"] },
            { key: "additionalInfo", label: "معلومات إضافية", type: "text", required: false },
            { key: "senderTitle", label: "لقب المرسل", type: "select", required: true, options: ["سعادة", "المدير", "المساعد", "الدكتور", "الأستاذ"] },
            { key: "senderHonorific", label: "صفة التبجيل", type: "select", required: true, options: ["حفظه الله", "وفقه الله", "المحترم", "الموقر"] },
            { key: "letterContent", label: "نص الخطاب", type: "textarea", required: true },
            { key: "closingPhrase", label: "عبارة الختام", type: "select", required: true, options: ["هذا ولكم تحياتي", "هذا ولكم شكري", "تقبلوا فائق الاحترام"] },
            { key: "managerName", label: "اسم المدير", type: "text", required: true, default: "د. فواز جمال الديدب" },
            { key: "facilityName", label: "اسم المنشأة", type: "text", required: true, default: "مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية" },
            { key: "issueDate", label: "تاريخ الإصدار", type: "date", required: true }
          ],
          isActive: true
        }
      ];

      for (const template of defaultTemplates) {
        await this.addTemplate(template);
      }
    }

    // إضافة إعدادات افتراضية إذا لم تكن موجودة
    if (Object.keys(settings).length === 0) {
      const defaultSettings = {
        centerManagerName: 'د. فواز جمال الديدب',
        facilityName: 'مركز الخدمات الطبية الشرعية بمنطقة الحدود الشمالية',
        facilityAddress: 'الحدود الشمالية عرعر',
        facilityPhone: '+966-14-1234567',
        facilityEmail: 'aburakan4551@gmail.com',
        logoUrl: '/images/ministry-logo.png',
        letterNumberPrefix: 'MOH',
        enableLetterNumbers: true,
        enableWatermark: false,
        watermarkText: 'وزارة الصحة - سري'
      };

      for (const [key, value] of Object.entries(defaultSettings)) {
        await this.setSetting(key, value);
      }
    }
  }
}

// إنشاء مثيل واحد من قاعدة البيانات
const db = new LocalDatabase();

// تهيئة قاعدة البيانات عند تحميل الصفحة
let dbInitialized = false;

export const initDatabase = async () => {
  if (!dbInitialized) {
    await db.init();
    await db.initializeDefaultData();
    dbInitialized = true;
  }
  return db;
};

// تصدير العمليات المختلفة
export const database = {
  // عمليات الموظفين
  addEmployee: (employee) => db.addEmployee(employee),
  updateEmployee: (employee) => db.updateEmployee(employee),
  deleteEmployee: (id) => db.deleteEmployee(id),
  getEmployee: (id) => db.getEmployee(id),
  getAllEmployees: () => db.getAllEmployees(),
  searchEmployees: (query) => db.searchEmployees(query),

  // عمليات النماذج
  addTemplate: (template) => db.addTemplate(template),
  updateTemplate: (template) => db.updateTemplate(template),
  deleteTemplate: (id) => db.deleteTemplate(id),
  getTemplate: (id) => db.getTemplate(id),
  getAllTemplates: () => db.getAllTemplates(),
  getTemplatesByType: (type) => db.getTemplatesByType(type),

  // عمليات الإعدادات
  setSetting: (key, value) => db.setSetting(key, value),
  getSetting: (key) => db.getSetting(key),
  getAllSettings: () => db.getAllSettings(),

  // عمليات الخطابات
  addLetter: (letter) => db.addLetter(letter),
  getAllLetters: () => db.getAllLetters(),
  getLettersByEmployee: (employeeId) => db.getLettersByEmployee(employeeId),
  getLettersByType: (type) => db.getLettersByType(type),
  deleteLetter: (id) => db.deleteLetter(id),

  // عمليات المستخدمين
  addUser: (user) => db.addUser(user),
  getAllUsers: () => db.getAllUsers(),

  // النسخ الاحتياطي
  exportData: () => db.exportData(),
  importData: (data) => db.importData(data),
  clearAllData: () => db.clearAllData(),

  // الإحصائيات
  getStats: () => db.getStats()
};

// البيانات الافتراضية للتوافق مع الكود القديم
export const employees = [];
export const letterTemplates = {};