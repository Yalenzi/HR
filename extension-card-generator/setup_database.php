<?php
/**
 * إعداد قاعدة البيانات لنظام إدارة الموظفين
 */

header('Content-Type: text/html; charset=utf-8');

try {
    // إنشاء مجلد قاعدة البيانات إذا لم يكن موجوداً
    if (!file_exists('db')) {
        mkdir('db', 0755, true);
    }

    // الاتصال بقاعدة البيانات
    $db = new SQLite3('db/cards.db');

    // إنشاء جدول البطاقات (موجود مسبقاً)
    $db->exec("
        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_name TEXT NOT NULL,
            position TEXT,
            department TEXT,
            organization TEXT,
            template_used TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            card_path TEXT
        )
    ");

    // إنشاء جدول الخلفيات (موجود مسبقاً)
    $db->exec("
        CREATE TABLE IF NOT EXISTS backgrounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول القوالب (موجود مسبقاً)
    $db->exec("
        CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            config_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول الموظفين
    $db->exec("
        CREATE TABLE IF NOT EXISTS employees (
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
        )
    ");

    // إنشاء جدول الإدارات
    $db->exec("
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول مرفقات الموظفين
    $db->exec("
        CREATE TABLE IF NOT EXISTS employee_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            attachment_name TEXT NOT NULL,
            attachment_type TEXT NOT NULL,
            file_path TEXT,
            is_default INTEGER DEFAULT 0,
            status TEXT DEFAULT 'غير موجود',
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
        )
    ");

    // إنشاء جدول ربط الموظفين بالقوالب
    $db->exec("
        CREATE TABLE IF NOT EXISTS employee_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            template_id INTEGER NOT NULL,
            template_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
        )
    ");

    // إدراج الإدارات الافتراضية
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

    // إنشاء قالب "مشهد" الافتراضي
    $mashhadTemplate = [
        'name' => 'مشهد',
        'description' => 'قالب مشهد للموظفين مع جدول البيانات',
        'config_data' => json_encode([
            'fields' => [
                ['id' => 'employee_name', 'name' => 'اسم الموظف', 'type' => 'text', 'required' => true],
                ['id' => 'national_id', 'name' => 'الهوية الوطنية', 'type' => 'text', 'required' => true],
                ['id' => 'employee_number', 'name' => 'رقم الموظف', 'type' => 'text', 'required' => false],
                ['id' => 'position', 'name' => 'الوظيفة', 'type' => 'text', 'required' => true],
                ['id' => 'nationality', 'name' => 'الجنسية', 'type' => 'select', 'required' => true],
                ['id' => 'department', 'name' => 'الإدارة', 'type' => 'text', 'required' => true],
                ['id' => 'letter_title', 'name' => 'عنوان الخطاب', 'type' => 'text', 'required' => false],
                ['id' => 'letter_content', 'name' => 'نص الخطاب', 'type' => 'textarea', 'required' => false],
                ['id' => 'purpose', 'name' => 'الغرض', 'type' => 'text', 'required' => false]
            ],
            'coordinates' => [
                'employee_name' => ['x' => 100, 'y' => 150, 'fontSize' => 16, 'fontWeight' => 'normal'],
                'national_id' => ['x' => 250, 'y' => 150, 'fontSize' => 16, 'fontWeight' => 'normal'],
                'employee_number' => ['x' => 400, 'y' => 150, 'fontSize' => 16, 'fontWeight' => 'normal'],
                'position' => ['x' => 550, 'y' => 150, 'fontSize' => 16, 'fontWeight' => 'normal'],
                'nationality' => ['x' => 700, 'y' => 150, 'fontSize' => 16, 'fontWeight' => 'normal'],
                'letter_title' => ['x' => 400, 'y' => 250, 'fontSize' => 18, 'fontWeight' => 'bold'],
                'letter_content' => ['x' => 100, 'y' => 300, 'fontSize' => 14, 'fontWeight' => 'normal'],
                'purpose' => ['x' => 100, 'y' => 400, 'fontSize' => 14, 'fontWeight' => 'normal'],
                'signature' => ['x' => 500, 'y' => 500, 'fontSize' => 14, 'fontWeight' => 'normal']
            ],
            'colors' => [
                'primary' => '#2c3e50',
                'secondary' => '#34495e'
            ],
            'background' => 'default'
        ])
    ];

    $stmt = $db->prepare("INSERT OR IGNORE INTO templates (name, description, config_data) VALUES (?, ?, ?)");
    $stmt->bindValue(1, $mashhadTemplate['name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $mashhadTemplate['description'], SQLITE3_TEXT);
    $stmt->bindValue(3, $mashhadTemplate['config_data'], SQLITE3_TEXT);
    $stmt->execute();

    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>إعداد قاعدة البيانات</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .success { color: green; text-align: center; }
            .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1 class='success'>✅ تم إعداد قاعدة البيانات بنجاح!</h1>
            <p>تم إنشاء جميع الجداول المطلوبة لنظام إدارة الموظفين:</p>
            <ul>
                <li>جدول الموظفين (employees)</li>
                <li>جدول الإدارات (departments)</li>
                <li>جدول مرفقات الموظفين (employee_attachments)</li>
                <li>جدول ربط الموظفين بالقوالب (employee_templates)</li>
                <li>قالب 'مشهد' الافتراضي</li>
            </ul>
            <div style='text-align: center; margin-top: 30px;'>
                <a href='admin.html' class='btn'>الذهاب إلى لوحة التحكم</a>
                <a href='index.html' class='btn'>الذهاب إلى الصفحة الرئيسية</a>
            </div>
        </div>
    </body>
    </html>";

} catch (Exception $e) {
    echo "خطأ في إعداد قاعدة البيانات: " . $e->getMessage();
}
?>
