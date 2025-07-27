<?php
/**
 * إعداد سريع لنظام إدارة الموظفين
 * يقوم بفحص وإعداد جميع المتطلبات
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='ar' dir='rtl'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>إعداد سريع - نظام إدارة الموظفين</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .check { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .danger { background: #f8d7da; border-color: #f5c6cb; }
        .info { background: #d1ecf1; border-color: #bee5eb; }
        ul { margin: 10px 0; padding-right: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn:hover { background: #0056b3; }
        .progress { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-bar { height: 100%; background: #28a745; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>👥 إعداد سريع - نظام إدارة الموظفين</h1>
            <p>فحص وإعداد جميع متطلبات النظام</p>
        </div>";

$errors = [];
$warnings = [];
$success = [];
$totalSteps = 8;
$completedSteps = 0;

// الخطوة 1: فحص PHP
echo "<div class='section info'>
        <h3>🔍 الخطوة 1: فحص متطلبات PHP</h3>";

if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
    echo "<p class='check'>✅ إصدار PHP: " . PHP_VERSION . " (مدعوم)</p>";
    $completedSteps++;
} else {
    echo "<p class='error'>❌ إصدار PHP: " . PHP_VERSION . " (يتطلب 7.4 أو أحدث)</p>";
    $errors[] = "إصدار PHP غير مدعوم";
}

// فحص SQLite
if (extension_loaded('sqlite3')) {
    echo "<p class='check'>✅ SQLite3 متاح</p>";
    $completedSteps++;
} else {
    echo "<p class='error'>❌ SQLite3 غير متاح</p>";
    $errors[] = "SQLite3 غير مثبت";
}

echo "</div>";

// الخطوة 2: فحص المجلدات
echo "<div class='section info'>
        <h3>📁 الخطوة 2: فحص المجلدات المطلوبة</h3>";

$requiredDirs = ['db', 'attachments', 'output', 'backgrounds'];
$dirErrors = [];

foreach ($requiredDirs as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0755, true)) {
            echo "<p class='check'>✅ تم إنشاء مجلد: $dir</p>";
        } else {
            echo "<p class='error'>❌ فشل في إنشاء مجلد: $dir</p>";
            $dirErrors[] = $dir;
        }
    } else {
        echo "<p class='check'>✅ مجلد موجود: $dir</p>";
    }
    
    if (is_writable($dir)) {
        echo "<p class='check'>✅ أذونات الكتابة متاحة: $dir</p>";
    } else {
        echo "<p class='warning'>⚠️ أذونات الكتابة غير متاحة: $dir</p>";
        $warnings[] = "أذونات الكتابة غير متاحة للمجلد: $dir";
    }
}

if (empty($dirErrors)) {
    $completedSteps++;
}

echo "</div>";

// الخطوة 3: إعداد قاعدة البيانات
echo "<div class='section info'>
        <h3>🗄️ الخطوة 3: إعداد قاعدة البيانات</h3>";

try {
    $db = new SQLite3('db/cards.db');
    echo "<p class='check'>✅ الاتصال بقاعدة البيانات نجح</p>";
    
    // إنشاء الجداول
    $tables = [
        'employees' => "CREATE TABLE IF NOT EXISTS employees (
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
        )",
        'departments' => "CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        'employee_attachments' => "CREATE TABLE IF NOT EXISTS employee_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            attachment_name TEXT NOT NULL,
            attachment_type TEXT NOT NULL,
            file_path TEXT,
            is_default INTEGER DEFAULT 0,
            status TEXT DEFAULT 'غير موجود',
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
        )",
        'employee_templates' => "CREATE TABLE IF NOT EXISTS employee_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            template_id INTEGER NOT NULL,
            template_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
        )"
    ];
    
    foreach ($tables as $tableName => $sql) {
        if ($db->exec($sql)) {
            echo "<p class='check'>✅ جدول $tableName تم إنشاؤه/التحقق منه</p>";
        } else {
            echo "<p class='error'>❌ فشل في إنشاء جدول $tableName</p>";
            $errors[] = "فشل في إنشاء جدول $tableName";
        }
    }
    
    $completedSteps++;
    
} catch (Exception $e) {
    echo "<p class='error'>❌ خطأ في قاعدة البيانات: " . $e->getMessage() . "</p>";
    $errors[] = "خطأ في قاعدة البيانات";
}

echo "</div>";

// الخطوة 4: إدراج البيانات الافتراضية
echo "<div class='section info'>
        <h3>📋 الخطوة 4: إدراج البيانات الافتراضية</h3>";

try {
    // الإدارات الافتراضية
    $defaultDepartments = [
        'مركز الخدمات الطبية الشرعية',
        'إدارة الموارد البشرية',
        'الإدارة المالية',
        'إدارة تقنية المعلومات',
        'الإدارة القانونية',
        'إدارة الشؤون الإدارية',
        'إدارة التطوير والجودة'
    ];
    
    foreach ($defaultDepartments as $dept) {
        $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");
        $stmt->bindValue(1, $dept, SQLITE3_TEXT);
        $stmt->execute();
    }
    
    echo "<p class='check'>✅ تم إدراج الإدارات الافتراضية</p>";
    
    // قالب مشهد
    $mashhadTemplate = [
        'name' => 'مشهد',
        'description' => 'قالب مشهد للموظفين مع جدول البيانات',
        'config_data' => json_encode([
            'type' => 'mashhad',
            'fields' => [
                'employee_name', 'national_id', 'employee_number', 
                'position', 'nationality', 'department'
            ]
        ])
    ];
    
    $stmt = $db->prepare("INSERT OR IGNORE INTO templates (name, description, config_data) VALUES (?, ?, ?)");
    $stmt->bindValue(1, $mashhadTemplate['name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $mashhadTemplate['description'], SQLITE3_TEXT);
    $stmt->bindValue(3, $mashhadTemplate['config_data'], SQLITE3_TEXT);
    $stmt->execute();
    
    echo "<p class='check'>✅ تم إدراج قالب مشهد</p>";
    $completedSteps++;
    
} catch (Exception $e) {
    echo "<p class='error'>❌ خطأ في إدراج البيانات: " . $e->getMessage() . "</p>";
    $errors[] = "خطأ في إدراج البيانات الافتراضية";
}

echo "</div>";

// الخطوة 5: فحص الملفات المطلوبة
echo "<div class='section info'>
        <h3>📄 الخطوة 5: فحص الملفات المطلوبة</h3>";

$requiredFiles = [
    'employees_api.php' => 'API إدارة الموظفين',
    'mashhad_template.html' => 'قالب مشهد',
    'mashhad_script.js' => 'JavaScript قالب مشهد',
    'admin.html' => 'لوحة التحكم',
    'admin.js' => 'JavaScript لوحة التحكم'
];

$missingFiles = [];
foreach ($requiredFiles as $file => $description) {
    if (file_exists($file)) {
        echo "<p class='check'>✅ $description ($file)</p>";
    } else {
        echo "<p class='error'>❌ ملف مفقود: $description ($file)</p>";
        $missingFiles[] = $file;
    }
}

if (empty($missingFiles)) {
    $completedSteps++;
}

echo "</div>";

// شريط التقدم
$progress = ($completedSteps / $totalSteps) * 100;
echo "<div class='section'>
        <h3>📊 تقدم الإعداد</h3>
        <div class='progress'>
            <div class='progress-bar' style='width: {$progress}%'></div>
        </div>
        <p>تم إكمال $completedSteps من $totalSteps خطوات ({$progress}%)</p>
      </div>";

// النتائج النهائية
if (empty($errors)) {
    echo "<div class='section success'>
            <h3>🎉 تم الإعداد بنجاح!</h3>
            <p>نظام إدارة الموظفين جاهز للاستخدام</p>
            <ul>
                <li>✅ قاعدة البيانات تم إعدادها</li>
                <li>✅ الجداول تم إنشاؤها</li>
                <li>✅ البيانات الافتراضية تم إدراجها</li>
                <li>✅ الملفات المطلوبة موجودة</li>
            </ul>
            <div style='text-align: center; margin-top: 20px;'>
                <a href='admin.html' class='btn'>🚀 الذهاب إلى لوحة التحكم</a>
                <a href='mashhad_template.html' class='btn'>📄 تجربة قالب مشهد</a>
            </div>
          </div>";
} else {
    echo "<div class='section danger'>
            <h3>❌ يوجد أخطاء تحتاج إلى إصلاح</h3>
            <ul>";
    foreach ($errors as $error) {
        echo "<li>$error</li>";
    }
    echo "</ul>
          </div>";
}

if (!empty($warnings)) {
    echo "<div class='section warning'>
            <h3>⚠️ تحذيرات</h3>
            <ul>";
    foreach ($warnings as $warning) {
        echo "<li>$warning</li>";
    }
    echo "</ul>
          </div>";
}

// معلومات إضافية
echo "<div class='section info'>
        <h3>📚 الخطوات التالية</h3>
        <ol>
            <li><strong>إدارة الموظفين:</strong> انتقل إلى لوحة التحكم → إدارة الموظفين</li>
            <li><strong>إضافة موظف:</strong> اضغط 'إضافة موظف جديد' وأدخل البيانات</li>
            <li><strong>إدارة المرفقات:</strong> اضغط على أيقونة المرفقات بجانب اسم الموظف</li>
            <li><strong>إنشاء مشهد:</strong> افتح قالب مشهد وابحث عن الموظف</li>
            <li><strong>QR Code:</strong> اضغط على أيقونة QR Code لإنشاء رمز للموظف</li>
        </ol>
        
        <h4>🔗 روابط مفيدة:</h4>
        <ul>
            <li><a href='README_EMPLOYEES.md'>📖 دليل المستخدم الكامل</a></li>
            <li><a href='admin.html'>🎛️ لوحة التحكم</a></li>
            <li><a href='mashhad_template.html'>📄 قالب مشهد</a></li>
            <li><a href='index.html'>🏠 الصفحة الرئيسية</a></li>
        </ul>
      </div>";

echo "    </div>
</body>
</html>";
?>
