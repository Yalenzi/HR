<?php
/**
 * نقطة الدخول الرئيسية لنظام إدارة الموظفين المتكامل
 * يقوم بفحص حالة النظام وتوجيه المستخدم للصفحة المناسبة
 */

// فحص وجود قاعدة البيانات
$dbExists = file_exists('db/cards.db');
$setupNeeded = false;

if ($dbExists) {
    try {
        $db = new SQLite3('db/cards.db');
        
        // فحص وجود جدول الموظفين
        $result = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'");
        if (!$result->fetchArray()) {
            $setupNeeded = true;
        } else {
            // فحص وجود بيانات
            $employeeCount = $db->querySingle("SELECT COUNT(*) FROM employees");
            if ($employeeCount == 0) {
                $setupNeeded = true;
            }
        }
        $db->close();
    } catch (Exception $e) {
        $setupNeeded = true;
    }
} else {
    $setupNeeded = true;
}

// إعادة التوجيه حسب حالة النظام
if ($setupNeeded) {
    // النظام يحتاج إعداد - توجيه لصفحة الإعداد السريع
    header('Location: run_demo.php');
    exit;
} else {
    // النظام جاهز - توجيه لصفحة البداية
    header('Location: start.html');
    exit;
}
?>
