# 👥 نظام إدارة الموظفين المتكامل

## 📋 نظرة عامة

نظام إدارة الموظفين المتكامل هو إضافة شاملة لمولد البطاقات المتقدم، يوفر إدارة كاملة لبيانات الموظفين ومرفقاتهم مع ربط تلقائي بجميع القوالب.

## ✨ الميزات الرئيسية

### 🗃️ إدارة بيانات الموظفين
- **إضافة وتعديل الموظفين** مع جميع البيانات الأساسية
- **البحث المتقدم** بالاسم أو الهوية الوطنية أو الوظيفة
- **إدارة الإدارات** مع إضافة تلقائية للإدارات الجديدة
- **إحصائيات شاملة** لعدد الموظفين والإدارات

### 📎 نظام المرفقات المتطور
- **مرفقات افتراضية**: مباشرة الموظف، قرارات الموظف، شهادات الموظف، الجزاءات والمخالفات
- **مرفقات مخصصة** قابلة للإضافة والتعديل
- **تتبع حالة المرفقات** (موجود/غير موجود) مع أيقونات بصرية
- **رفع الملفات** بدعم PDF, DOC, DOCX, JPG, PNG

### 📱 نظام QR Code
- **إنشاء QR Code** لكل موظف يحتوي على:
  - بيانات الموظف الأساسية
  - حالة جميع المرفقات مع الأيقونات
  - تاريخ الإنشاء
- **تضمين اختياري** في القوالب

### 📄 قالب "مشهد" الجديد
- **جدول موظف منسق** (5 أعمدة × صفين)
- **تعبئة تلقائية** للبيانات عند اختيار الموظف
- **محتوى خطاب قابل للتخصيص**
- **توقيع ثابت** للمدير
- **طباعة احترافية**

### 🔗 الربط التلقائي
- **ربط مع جميع القوالب** الموجودة
- **تعبئة تلقائية** للحقول في النماذج
- **بحث بالهوية** في جميع القوالب

## 🗄️ قاعدة البيانات

### الجداول الجديدة

#### `employees` - جدول الموظفين
```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    employee_number TEXT,
    position TEXT NOT NULL,
    nationality TEXT NOT NULL DEFAULT 'سعودي',
    department TEXT NOT NULL,
    qr_code_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `departments` - جدول الإدارات
```sql
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `employee_attachments` - جدول المرفقات
```sql
CREATE TABLE employee_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    attachment_name TEXT NOT NULL,
    attachment_type TEXT NOT NULL,
    file_path TEXT,
    is_default INTEGER DEFAULT 0,
    status TEXT DEFAULT 'غير موجود',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);
```

#### `employee_templates` - جدول ربط الموظفين بالقوالب
```sql
CREATE TABLE employee_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    template_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
);
```

## 🚀 التثبيت والإعداد

### 1. إعداد قاعدة البيانات
```bash
# تشغيل ملف إعداد قاعدة البيانات
php setup_database.php
```

### 2. الملفات المطلوبة
- `employees_api.php` - API إدارة الموظفين
- `mashhad_template.html` - قالب مشهد
- `mashhad_script.js` - JavaScript لقالب مشهد
- تحديثات على `admin.html` و `admin.js`

### 3. الأذونات
```bash
# إنشاء مجلد المرفقات
mkdir attachments
chmod 755 attachments

# أذونات قاعدة البيانات
chmod 644 db/cards.db
```

## 📖 دليل الاستخدام

### إدارة الموظفين

#### إضافة موظف جديد
1. انتقل إلى قسم "إدارة الموظفين" في لوحة التحكم
2. اضغط "➕ إضافة موظف جديد"
3. املأ البيانات المطلوبة:
   - اسم الموظف (مطلوب)
   - الهوية الوطنية (مطلوب - 10 أرقام)
   - رقم الموظف (اختياري)
   - الوظيفة (مطلوب)
   - الجنسية (سعودي/غير سعودي)
   - الإدارة (مطلوب - يمكن إضافة إدارة جديدة)
4. اضغط "💾 حفظ"

#### البحث عن موظف
- استخدم مربع البحث للبحث بالاسم أو الهوية أو الوظيفة
- النتائج تظهر فورياً مع تمييز النص المطابق

#### إدارة المرفقات
1. اضغط "📎" بجانب اسم الموظف
2. عرض حالة المرفقات الافتراضية
3. تغيير حالة المرفق (موجود/غير موجود)
4. إضافة مرفقات مخصصة جديدة
5. رفع ملفات للمرفقات

### استخدام قالب مشهد

#### إنشاء مشهد جديد
1. افتح `mashhad_template.html`
2. ابحث عن الموظف بالهوية أو الاسم
3. سيتم ملء الجدول تلقائياً
4. عدّل عنوان ونص الخطاب حسب الحاجة
5. اختر تضمين QR Code (اختياري)
6. اضغط "📄 إنشاء المشهد"

#### طباعة المشهد
- اضغط "🖨️ طباعة" للطباعة المباشرة
- أو "💾 حفظ" لحفظ ملف HTML

## 🔧 API المتاح

### نقاط النهاية الرئيسية

#### الموظفين
- `GET employees_api.php?action=getEmployees` - جلب جميع الموظفين
- `GET employees_api.php?action=getEmployee&id={id}` - جلب موظف محدد
- `POST employees_api.php?action=addEmployee` - إضافة موظف جديد
- `POST employees_api.php?action=updateEmployee` - تحديث موظف
- `POST employees_api.php?action=deleteEmployee` - حذف موظف
- `GET employees_api.php?action=searchEmployees&query={query}` - البحث

#### الإدارات
- `GET employees_api.php?action=getDepartments` - جلب الإدارات
- `POST employees_api.php?action=addDepartment` - إضافة إدارة

#### المرفقات
- `GET employees_api.php?action=getEmployeeAttachments&employee_id={id}` - جلب مرفقات موظف
- `POST employees_api.php?action=updateAttachmentStatus` - تحديث حالة مرفق
- `POST employees_api.php?action=uploadAttachment` - رفع مرفق

#### QR Code
- `GET employees_api.php?action=generateQRCode&employee_id={id}` - إنشاء QR Code

## 🎨 التخصيص

### تخصيص قالب مشهد
يمكن تعديل `mashhad_template.html` لتخصيص:
- تصميم الجدول
- محتوى الخطاب الافتراضي
- موضع التوقيع
- ألوان وخطوط

### إضافة مرفقات افتراضية جديدة
عدّل المصفوفة في `setup_database.php`:
```php
$defaultAttachments = [
    'مباشرة الموظف',
    'قرارات الموظف',
    'شهادات الموظف',
    'الجزاءات والمخالفات',
    'مرفق جديد' // إضافة هنا
];
```

## 🔒 الأمان

### حماية البيانات
- التحقق من صحة البيانات المدخلة
- حماية من SQL Injection
- تشفير كلمات المرور (إذا أُضيفت)
- تقييد أنواع الملفات المرفوعة

### النسخ الاحتياطي
- نسخ احتياطي تلقائي لقاعدة البيانات
- حفظ المرفقات في مجلدات منفصلة
- إمكانية تصدير واستيراد البيانات

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

#### خطأ في الاتصال بقاعدة البيانات
```bash
# التحقق من أذونات قاعدة البيانات
ls -la db/cards.db
chmod 644 db/cards.db
```

#### فشل رفع المرفقات
```bash
# التحقق من مجلد المرفقات
mkdir -p attachments
chmod 755 attachments
```

#### عدم ظهور البيانات
- تأكد من تشغيل `setup_database.php`
- تحقق من وجود البيانات في قاعدة البيانات
- راجع console المتصفح للأخطاء

## 📞 الدعم

للحصول على المساعدة:
1. راجع هذا الدليل أولاً
2. تحقق من ملفات السجل (logs)
3. تأكد من إعدادات الخادم
4. اتصل بفريق التطوير

---

**تم تطوير نظام إدارة الموظفين كجزء من مولد البطاقات المتقدم**
**© 2024 - مركز الخدمات الطبية الشرعية**
