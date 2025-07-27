<?php
/**
 * تحديث اسم المدير في النظام
 * تغيير من "د. محمد أحمد السعيد" إلى "د. فواز جمال الديدب"
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='ar' dir='rtl'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>تحديث اسم المدير</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        .update-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #007bff; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔄 تحديث اسم المدير</h1>
        <p>تغيير اسم المدير من 'د. محمد أحمد السعيد' إلى 'د. فواز جمال الديدب'</p>";

$oldName = "د. محمد أحمد السعيد";
$newName = "د. فواز جمال الديدب";
$updatedFiles = [];
$errors = [];

// قائمة الملفات المراد تحديثها
$filesToUpdate = [
    'mashhad_template.html',
    'admin.html',
    'index.html',
    'organization_data.json',
    'sample_data.php',
    'setup_database.php'
];

foreach ($filesToUpdate as $filename) {
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        $originalContent = $content;
        
        // استبدال الاسم القديم بالجديد
        $content = str_replace($oldName, $newName, $content);
        
        // استبدال أشكال أخرى محتملة للاسم
        $content = str_replace("محمد أحمد السعيد", "فواز جمال الديدب", $content);
        $content = str_replace("د.محمد أحمد السعيد", "د.فواز جمال الديدب", $content);
        $content = str_replace("دكتور محمد أحمد السعيد", "دكتور فواز جمال الديدب", $content);
        
        if ($content !== $originalContent) {
            if (file_put_contents($filename, $content)) {
                echo "<div class='update-item success'>✅ تم تحديث: $filename</div>";
                $updatedFiles[] = $filename;
            } else {
                echo "<div class='update-item error'>❌ فشل في تحديث: $filename</div>";
                $errors[] = $filename;
            }
        } else {
            echo "<div class='update-item info'>ℹ️ لا يحتاج تحديث: $filename</div>";
        }
    } else {
        echo "<div class='update-item error'>❌ ملف غير موجود: $filename</div>";
        $errors[] = $filename;
    }
}

// تحديث قاعدة البيانات
echo "<h3>🗄️ تحديث قاعدة البيانات</h3>";

try {
    if (file_exists('db/cards.db')) {
        $db = new SQLite3('db/cards.db');
        
        // تحديث اسم المدير في جدول الموظفين
        $stmt = $db->prepare("UPDATE employees SET employee_name = ? WHERE employee_name = ?");
        $stmt->bindValue(1, $newName, SQLITE3_TEXT);
        $stmt->bindValue(2, $oldName, SQLITE3_TEXT);
        
        if ($stmt->execute()) {
            $changes = $db->changes();
            if ($changes > 0) {
                echo "<div class='update-item success'>✅ تم تحديث $changes سجل في قاعدة البيانات</div>";
            } else {
                echo "<div class='update-item info'>ℹ️ لا توجد سجلات تحتاج تحديث في قاعدة البيانات</div>";
            }
        } else {
            echo "<div class='update-item error'>❌ فشل في تحديث قاعدة البيانات</div>";
        }
        
        // إضافة المدير الجديد إذا لم يكن موجوداً
        $stmt = $db->prepare("SELECT id FROM employees WHERE national_id = '1234567890'");
        $result = $stmt->execute();
        
        if (!$result->fetchArray()) {
            $stmt = $db->prepare("INSERT OR IGNORE INTO employees (employee_name, national_id, employee_number, position, nationality, department) VALUES (?, '1234567890', 'EMP001', 'مدير مركز الخدمات الطبية الشرعية', 'سعودي', 'مركز الخدمات الطبية الشرعية')");
            $stmt->bindValue(1, $newName, SQLITE3_TEXT);
            
            if ($stmt->execute()) {
                echo "<div class='update-item success'>✅ تم إضافة المدير الجديد إلى قاعدة البيانات</div>";
            }
        } else {
            echo "<div class='update-item info'>ℹ️ المدير موجود في قاعدة البيانات</div>";
        }
        
        $db->close();
    } else {
        echo "<div class='update-item error'>❌ قاعدة البيانات غير موجودة</div>";
    }
} catch (Exception $e) {
    echo "<div class='update-item error'>❌ خطأ في قاعدة البيانات: " . $e->getMessage() . "</div>";
}

// ملخص النتائج
echo "<div style='margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 5px;'>
        <h3>📊 ملخص التحديث:</h3>
        <ul>
            <li><strong>الملفات المحدثة:</strong> " . count($updatedFiles) . "</li>
            <li><strong>الأخطاء:</strong> " . count($errors) . "</li>
            <li><strong>الاسم القديم:</strong> $oldName</li>
            <li><strong>الاسم الجديد:</strong> $newName</li>
        </ul>
      </div>";

if (count($updatedFiles) > 0) {
    echo "<div style='margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 5px;'>
            <h4>✅ تم التحديث بنجاح!</h4>
            <p>تم تحديث اسم المدير في جميع الملفات والنظام</p>
            <div style='text-align: center; margin-top: 15px;'>
                <a href='admin.html' style='display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 5px;'>🎛️ لوحة التحكم</a>
                <a href='mashhad_template.html' style='display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px;'>📄 قالب مشهد</a>
                <a href='start.html' style='display: inline-block; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px; margin: 5px;'>🏠 الصفحة الرئيسية</a>
            </div>
          </div>";
}

if (count($errors) > 0) {
    echo "<div style='margin-top: 20px; padding: 15px; background: #f8d7da; border-radius: 5px;'>
            <h4>⚠️ تحذيرات:</h4>
            <p>بعض الملفات لم يتم تحديثها. تأكد من الأذونات والمسارات.</p>
          </div>";
}

echo "    </div>
</body>
</html>";
?>
