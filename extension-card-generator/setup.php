<?php
/**
 * ملف الإعداد السريع لمولد بطاقات التهنئة
 * يقوم بفحص المتطلبات وإعداد النظام
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='ar' dir='rtl'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>إعداد مولد بطاقات التهنئة</title>
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
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 إعداد مولد بطاقات التهنئة</h1>
            <p>فحص المتطلبات وإعداد النظام</p>
        </div>";

$errors = [];
$warnings = [];
$success = [];

// فحص إصدار PHP
echo "<div class='section'>";
echo "<h3>📋 فحص إصدار PHP</h3>";
$php_version = phpversion();
if (version_compare($php_version, '7.4.0', '>=')) {
    echo "<p class='check'>✅ إصدار PHP: $php_version (مدعوم)</p>";
    $success[] = "إصدار PHP مناسب";
} else {
    echo "<p class='error'>❌ إصدار PHP: $php_version (غير مدعوم - يتطلب 7.4+)</p>";
    $errors[] = "إصدار PHP قديم";
}
echo "</div>";

// فحص الإضافات المطلوبة
echo "<div class='section'>";
echo "<h3>🔧 فحص الإضافات المطلوبة</h3>";

$required_extensions = [
    'gd' => 'مكتبة GD لمعالجة الصور',
    'pdo' => 'PDO لقاعدة البيانات',
    'pdo_sqlite' => 'SQLite لقاعدة البيانات',
    'json' => 'JSON لمعالجة البيانات'
];

foreach ($required_extensions as $ext => $desc) {
    if (extension_loaded($ext)) {
        echo "<p class='check'>✅ $desc ($ext)</p>";
        $success[] = "$desc متوفر";
    } else {
        echo "<p class='error'>❌ $desc ($ext) - غير متوفر</p>";
        $errors[] = "$desc غير متوفر";
    }
}
echo "</div>";

// فحص المجلدات والصلاحيات
echo "<div class='section'>";
echo "<h3>📁 فحص المجلدات والصلاحيات</h3>";

$directories = ['db', 'output', 'templates', 'fonts'];

foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0755, true)) {
            echo "<p class='check'>✅ تم إنشاء مجلد: $dir</p>";
            $success[] = "مجلد $dir تم إنشاؤه";
        } else {
            echo "<p class='error'>❌ فشل في إنشاء مجلد: $dir</p>";
            $errors[] = "فشل في إنشاء مجلد $dir";
        }
    } else {
        echo "<p class='check'>✅ مجلد موجود: $dir</p>";
    }
    
    if (is_writable($dir)) {
        echo "<p class='check'>✅ صلاحيات الكتابة متوفرة: $dir</p>";
        $success[] = "صلاحيات $dir صحيحة";
    } else {
        echo "<p class='error'>❌ صلاحيات الكتابة غير متوفرة: $dir</p>";
        $errors[] = "صلاحيات $dir غير صحيحة";
    }
}
echo "</div>";

// فحص قاعدة البيانات
echo "<div class='section'>";
echo "<h3>🗄️ فحص قاعدة البيانات</h3>";

try {
    $db_path = 'db/cards.db';
    $pdo = new PDO("sqlite:$db_path");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // إنشاء الجدول
    $sql = "CREATE TABLE IF NOT EXISTS cards (
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
    )";
    
    $pdo->exec($sql);
    echo "<p class='check'>✅ قاعدة البيانات تعمل بشكل صحيح</p>";
    echo "<p class='check'>✅ تم إنشاء جدول البطاقات</p>";
    $success[] = "قاعدة البيانات جاهزة";
    
} catch (Exception $e) {
    echo "<p class='error'>❌ خطأ في قاعدة البيانات: " . $e->getMessage() . "</p>";
    $errors[] = "مشكلة في قاعدة البيانات";
}
echo "</div>";

// فحص إعدادات PHP
echo "<div class='section'>";
echo "<h3>⚙️ فحص إعدادات PHP</h3>";

$upload_max = ini_get('upload_max_filesize');
$post_max = ini_get('post_max_size');
$memory_limit = ini_get('memory_limit');

echo "<p>📤 حد رفع الملفات: <strong>$upload_max</strong></p>";
echo "<p>📮 حد POST: <strong>$post_max</strong></p>";
echo "<p>🧠 حد الذاكرة: <strong>$memory_limit</strong></p>";

if (intval($upload_max) >= 5) {
    echo "<p class='check'>✅ حد رفع الملفات مناسب</p>";
} else {
    echo "<p class='warning'>⚠️ حد رفع الملفات قد يكون صغيراً للصور الكبيرة</p>";
    $warnings[] = "حد رفع الملفات صغير";
}
echo "</div>";

// النتيجة النهائية
echo "<div class='section'>";
if (empty($errors)) {
    echo "<div class='success'>";
    echo "<h3>🎉 التهاني! النظام جاهز للعمل</h3>";
    echo "<p>تم فحص جميع المتطلبات بنجاح. يمكنك الآن استخدام مولد البطاقات.</p>";
    echo "<a href='index.html' class='btn'>🚀 بدء استخدام النظام</a>";
    echo "</div>";
} else {
    echo "<div class='danger'>";
    echo "<h3>❌ يوجد مشاكل تحتاج إلى حل</h3>";
    echo "<p>يرجى حل المشاكل التالية قبل استخدام النظام:</p>";
    echo "<ul>";
    foreach ($errors as $error) {
        echo "<li>$error</li>";
    }
    echo "</ul>";
    echo "</div>";
}

if (!empty($warnings)) {
    echo "<div class='info'>";
    echo "<h3>⚠️ تحذيرات</h3>";
    echo "<ul>";
    foreach ($warnings as $warning) {
        echo "<li>$warning</li>";
    }
    echo "</ul>";
    echo "</div>";
}
echo "</div>";

// معلومات إضافية
echo "<div class='section'>";
echo "<h3>📚 معلومات مفيدة</h3>";
echo "<ul>";
echo "<li><strong>مسار المشروع:</strong> " . __DIR__ . "</li>";
echo "<li><strong>رابط النظام:</strong> <a href='index.html'>index.html</a></li>";
echo "<li><strong>ملف التوليد:</strong> <a href='generate.php'>generate.php</a></li>";
echo "<li><strong>دليل الاستخدام:</strong> <a href='README.md'>README.md</a></li>";
echo "</ul>";

echo "<h4>🔧 أوامر مفيدة:</h4>";
echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px;'>";
echo "# تشغيل خادم PHP المحلي\n";
echo "php -S localhost:8000\n\n";
echo "# إعداد الصلاحيات (Linux/Mac)\n";
echo "chmod 755 db/ output/ templates/ fonts/\n\n";
echo "# فحص إضافات PHP\n";
echo "php -m | grep -E '(gd|pdo|sqlite|json)'\n";
echo "</pre>";
echo "</div>";

echo "    </div>
</body>
</html>";
?>
