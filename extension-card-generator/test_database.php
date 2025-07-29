<?php
/**
 * اختبار قاعدة البيانات
 */

header('Content-Type: text/html; charset=utf-8');

try {
    $db = new SQLite3('db/cards.db');
    
    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <title>اختبار قاعدة البيانات</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .success { color: green; }
            .error { color: red; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>اختبار قاعدة البيانات</h1>";
    
    // عرض الجداول الموجودة
    echo "<h2>الجداول الموجودة:</h2>";
    $result = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
    echo "<ul>";
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        echo "<li>" . $row['name'] . "</li>";
    }
    echo "</ul>";
    
    // اختبار جدول الإدارات
    echo "<h2>جدول الإدارات:</h2>";
    try {
        $result = $db->query("SELECT * FROM departments LIMIT 5");
        echo "<table>";
        echo "<tr><th>ID</th><th>اسم الإدارة</th><th>رمز الإدارة</th><th>المدير</th></tr>";
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            echo "<tr>";
            echo "<td>" . ($row['id'] ?? '') . "</td>";
            echo "<td>" . ($row['department_name'] ?? '') . "</td>";
            echo "<td>" . ($row['department_code'] ?? 'غير متوفر') . "</td>";
            echo "<td>" . ($row['manager_name'] ?? 'غير متوفر') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p class='error'>خطأ في جدول الإدارات: " . $e->getMessage() . "</p>";
    }
    
    // اختبار جدول الموظفين
    echo "<h2>جدول الموظفين:</h2>";
    try {
        $result = $db->query("SELECT * FROM employees LIMIT 5");
        echo "<table>";
        echo "<tr><th>ID</th><th>الاسم</th><th>الهوية الوطنية</th><th>الوظيفة</th></tr>";
        $count = 0;
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            echo "<tr>";
            echo "<td>" . ($row['id'] ?? '') . "</td>";
            echo "<td>" . ($row['employee_name'] ?? '') . "</td>";
            echo "<td>" . ($row['national_id'] ?? '') . "</td>";
            echo "<td>" . ($row['position'] ?? '') . "</td>";
            echo "</tr>";
            $count++;
        }
        if ($count == 0) {
            echo "<tr><td colspan='4'>لا توجد موظفين مسجلين</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p class='error'>خطأ في جدول الموظفين: " . $e->getMessage() . "</p>";
    }
    
    // اختبار جدول أنواع المرفقات
    echo "<h2>أنواع المرفقات:</h2>";
    try {
        $result = $db->query("SELECT * FROM attachment_types LIMIT 10");
        echo "<table>";
        echo "<tr><th>ID</th><th>النوع</th><th>الوصف</th><th>افتراضي</th></tr>";
        $count = 0;
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            echo "<tr>";
            echo "<td>" . ($row['id'] ?? '') . "</td>";
            echo "<td>" . ($row['type_name_ar'] ?? '') . "</td>";
            echo "<td>" . ($row['description'] ?? '') . "</td>";
            echo "<td>" . ($row['is_default'] ? 'نعم' : 'لا') . "</td>";
            echo "</tr>";
            $count++;
        }
        if ($count == 0) {
            echo "<tr><td colspan='4'>لا توجد أنواع مرفقات</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<p class='error'>خطأ في جدول أنواع المرفقات: " . $e->getMessage() . "</p>";
    }
    
    echo "<p class='success'>تم اختبار قاعدة البيانات بنجاح!</p>";
    echo "<p><a href='employee_management.html'>الذهاب إلى نظام إدارة الموظفين</a></p>";
    echo "</body></html>";
    
} catch (Exception $e) {
    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <title>خطأ في قاعدة البيانات</title>
    </head>
    <body>
        <h1 style='color: red;'>خطأ في الاتصال بقاعدة البيانات</h1>
        <p>" . $e->getMessage() . "</p>
    </body>
    </html>";
}
?>
