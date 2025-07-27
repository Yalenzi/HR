# 👥 نظام إدارة الموظفين المتكامل

نظام شامل لإدارة الموظفين وإنشاء البطاقات والمشاهد الرسمية مع نظام مرفقات متطور و QR Code. مطور خصيصاً لمركز الخدمات الطبية الشرعية.

## 🚀 الميزات

- **واجهة سهلة الاستخدام**: نموذج بسيط لإدخال البيانات
- **معاينة فورية**: رؤية البطاقة قبل التحميل
- **قوالب متعددة**: 3 قوالب مختلفة للاختيار من بينها
- **رفع الصور**: إمكانية إضافة صورة الموظف
- **تحميل عالي الجودة**: بطاقات بصيغة PNG عالية الدقة
- **قاعدة بيانات**: حفظ جميع البطاقات المنشأة
- **إحصائيات**: عداد البطاقات المنشأة
- **تصميم متجاوب**: يعمل على جميع الأجهزة

## 📁 هيكل المشروع

```
extension-card-generator/
│
├── index.html         ← واجهة المستخدم الرئيسية
├── style.css          ← تنسيق الواجهة والتصميم
├── script.js          ← منطق الواجهة والتفاعل
├── generate.php       ← توليد البطاقات (الخادم)
├── README.md          ← دليل الاستخدام
│
├── db/                ← قاعدة البيانات
│   ├── .gitkeep
│   └── cards.db       ← (يتم إنشاؤها تلقائياً)
│
├── fonts/             ← الخطوط المستخدمة
│   └── .gitkeep
│
├── templates/         ← خلفيات القوالب
│   └── .gitkeep
│
└── output/            ← البطاقات الناتجة
    └── .gitkeep
```

## 🛠️ متطلبات التشغيل

### الخادم:
- **PHP 7.4+** مع دعم:
  - PDO SQLite
  - GD Library
  - JSON
- **خادم ويب** (Apache/Nginx)

### المتصفح:
- **متصفح حديث** يدعم:
  - HTML5
  - CSS3
  - JavaScript ES6+
  - FileReader API

## 📦 التثبيت

### 1. تحميل الملفات:
```bash
# نسخ المشروع
git clone [repository-url]
cd extension-card-generator
```

### 2. إعداد الخادم:
```bash
# للتطوير المحلي
php -S localhost:8000

# أو رفع على خادم ويب
# تأكد من أن PHP و GD مفعلان
```

### 3. إعداد الصلاحيات:
```bash
chmod 755 db/
chmod 755 output/
chmod 755 templates/
chmod 755 fonts/
```

## 🎯 كيفية الاستخدام

### 1. فتح الواجهة:
- افتح `http://localhost:8000` في المتصفح
- أو رابط الخادم المرفوع عليه

### 2. ملء البيانات:
- **السطور الثلاثة**: نص التهنئة
- **بيانات الموظف**: الاسم، المنصب، الإدارة
- **التواريخ**: بداية ونهاية التمديد
- **معلومات إضافية**: المؤسسة، الموقع، التوقيع
- **الصورة**: (اختيارية) صورة الموظف

### 3. اختيار القالب:
- **القالب الأزرق**: كلاسيكي ومهني
- **القالب الأخضر**: حديث وعصري
- **القالب الذهبي**: فاخر ومميز

### 4. المعاينة والتحميل:
- اضغط **"معاينة البطاقة"** لرؤية النتيجة
- اضغط **"تحميل البطاقة"** للحصول على الملف

## ⚙️ التخصيص

### إضافة قوالب جديدة:

#### 1. في `script.js`:
```javascript
// إضافة قالب جديد في دالة createPreview
case 'template4':
    // تصميم القالب الجديد
    break;
```

#### 2. في `generate.php`:
```php
// إضافة ألوان القالب الجديد
case 'template4':
    $bg_start = [255, 0, 0]; // أحمر
    $bg_end = [255, 100, 100];
    break;
```

#### 3. في `index.html`:
```html
<!-- إضافة خيار جديد -->
<option value="template4">القالب الأحمر الجديد</option>
```

### إضافة خطوط عربية:

#### 1. رفع ملف الخط:
```bash
# نسخ ملف .ttf إلى مجلد fonts/
cp font-name.ttf fonts/
```

#### 2. تحديث `generate.php`:
```php
// استخدام الخط الجديد
$font_path = $fonts_dir . 'font-name.ttf';
imagettftext($image, $font_size, 0, $x, $y, $color, $font_path, $text);
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خطأ في إنشاء البطاقة:
```bash
# تحقق من صلاحيات المجلدات
ls -la db/ output/

# تحقق من دعم GD
php -m | grep -i gd
```

#### 2. خطأ في قاعدة البيانات:
```bash
# تحقق من دعم SQLite
php -m | grep -i sqlite

# حذف قاعدة البيانات وإعادة إنشائها
rm db/cards.db
```

#### 3. مشاكل رفع الصور:
```bash
# تحقق من حجم الملف المسموح
php -i | grep upload_max_filesize
php -i | grep post_max_size
```

## 📊 قاعدة البيانات

### جدول البطاقات:
```sql
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    line1 TEXT NOT NULL,
    line2 TEXT NOT NULL,
    line3 TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    organization TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    location TEXT NOT NULL,
    signature TEXT NOT NULL,
    template TEXT NOT NULL,
    photo_path TEXT,
    output_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 التطوير

### إضافة ميزات جديدة:

#### 1. تحسين التصميم:
- تعديل `style.css` للألوان والخطوط
- إضافة animations و transitions

#### 2. تحسين الوظائف:
- إضافة المزيد من القوالب
- تحسين جودة الصور
- إضافة تصدير PDF

#### 3. تحسين الأداء:
- ضغط الصور
- تحسين قاعدة البيانات
- إضافة cache

## 📝 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام والتطوير.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد
3. إضافة التحسينات
4. إرسال Pull Request

## 📞 الدعم

للدعم والاستفسارات:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني

---

**تم تطوير هذا المشروع بـ ❤️ لخدمة المجتمع**
