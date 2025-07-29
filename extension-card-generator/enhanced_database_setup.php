<?php
/**
 * إعداد قاعدة البيانات المحسنة لنظام إدارة الموظفين المتكامل
 * Enhanced Database Setup for Integrated Employee Management System
 */

header('Content-Type: text/html; charset=utf-8');

try {
    // إنشاء مجلد قاعدة البيانات إذا لم يكن موجوداً
    if (!file_exists('db')) {
        mkdir('db', 0755, true);
    }

    // الاتصال بقاعدة البيانات
    $db = new SQLite3('db/cards.db');

    // تفعيل المفاتيح الخارجية
    $db->exec("PRAGMA foreign_keys = ON");

    // التحقق من وجود جدول الإدارات وإنشاؤه أو تحديثه
    $result = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='departments'");
    if (!$result->fetchArray()) {
        // إنشاء جدول الإدارات الجديد
        $db->exec("
            CREATE TABLE departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                department_name TEXT UNIQUE NOT NULL,
                department_code TEXT UNIQUE,
                manager_name TEXT,
                manager_position TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
    } else {
        // إضافة الأعمدة المفقودة إذا لم تكن موجودة
        $columns = ['department_code', 'manager_name', 'manager_position', 'description', 'created_at', 'updated_at'];
        foreach ($columns as $column) {
            try {
                $db->exec("ALTER TABLE departments ADD COLUMN {$column} TEXT");
            } catch (Exception $e) {
                // العمود موجود بالفعل
            }
        }
    }

    // التحقق من وجود جدول الموظفين وتحديثه
    $result = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'");
    if (!$result->fetchArray()) {
        // إنشاء جدول الموظفين الجديد
        $db->exec("
            CREATE TABLE employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_name TEXT NOT NULL,
                national_id TEXT UNIQUE NOT NULL,
                employee_number TEXT UNIQUE,
                position TEXT NOT NULL,
                nationality TEXT NOT NULL DEFAULT 'سعودي',
                department_id INTEGER,
                hire_date DATE,
                phone TEXT,
                email TEXT,
                address TEXT,
                emergency_contact TEXT,
                emergency_phone TEXT,
                salary DECIMAL(10,2),
                status TEXT DEFAULT 'نشط',
                qr_code_data TEXT,
                photo_path TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL
            )
        ");
    } else {
        // إضافة الأعمدة المفقودة
        $newColumns = [
            'employee_number TEXT',
            'nationality TEXT DEFAULT "سعودي"',
            'hire_date DATE',
            'phone TEXT',
            'email TEXT',
            'address TEXT',
            'emergency_contact TEXT',
            'emergency_phone TEXT',
            'salary DECIMAL(10,2)',
            'status TEXT DEFAULT "نشط"',
            'qr_code_data TEXT',
            'photo_path TEXT',
            'notes TEXT',
            'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
            'updated_at DATETIME DEFAULT CURRENT_TIMESTAMP'
        ];

        foreach ($newColumns as $column) {
            try {
                $db->exec("ALTER TABLE employees ADD COLUMN {$column}");
            } catch (Exception $e) {
                // العمود موجود بالفعل
            }
        }
    }

    // إنشاء جدول أنواع المرفقات الافتراضية
    $db->exec("
        CREATE TABLE IF NOT EXISTS attachment_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT UNIQUE NOT NULL,
            type_name_ar TEXT UNIQUE NOT NULL,
            description TEXT,
            is_default INTEGER DEFAULT 1,
            is_required INTEGER DEFAULT 0,
            file_extensions TEXT DEFAULT 'pdf,doc,docx,jpg,png',
            max_file_size INTEGER DEFAULT 5242880,
            icon_class TEXT DEFAULT 'fas fa-file',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول مرفقات الموظفين المحسن
    $db->exec("
        CREATE TABLE IF NOT EXISTS employee_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            attachment_type_id INTEGER NOT NULL,
            file_name TEXT,
            file_path TEXT,
            file_size INTEGER,
            file_type TEXT,
            status TEXT DEFAULT 'غير موجود',
            upload_date DATETIME,
            expiry_date DATE,
            notes TEXT,
            uploaded_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            FOREIGN KEY (attachment_type_id) REFERENCES attachment_types (id) ON DELETE CASCADE
        )
    ");

    // إنشاء جدول QR Codes المحسن
    $db->exec("
        CREATE TABLE IF NOT EXISTS employee_qr_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            qr_code_data TEXT NOT NULL,
            qr_code_image_path TEXT,
            includes_attachments INTEGER DEFAULT 1,
            includes_contact_info INTEGER DEFAULT 1,
            access_url TEXT,
            expiry_date DATE,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
        )
    ");

    // إنشاء جدول القوالب المحسن
    $db->exec("
        CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_ar TEXT NOT NULL,
            description TEXT,
            template_type TEXT DEFAULT 'card',
            config_data TEXT,
            preview_image_path TEXT,
            is_active INTEGER DEFAULT 1,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول ربط الموظفين بالقوالب المحسن
    $db->exec("
        CREATE TABLE IF NOT EXISTS employee_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            template_id INTEGER NOT NULL,
            template_data TEXT,
            generated_file_path TEXT,
            generation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_latest INTEGER DEFAULT 1,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
        )
    ");

    // إنشاء جدول إحصائيات النظام
    $db->exec("
        CREATE TABLE IF NOT EXISTS system_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stat_name TEXT UNIQUE NOT NULL,
            stat_value TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول سجل العمليات
    $db->exec("
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            action_type TEXT NOT NULL,
            table_name TEXT,
            record_id INTEGER,
            old_values TEXT,
            new_values TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إدراج أنواع المرفقات الافتراضية
    $defaultAttachmentTypes = [
        ['employee_assignment', 'مباشرة الموظف', 'وثيقة مباشرة العمل للموظف', 1, 1, 'pdf,doc,docx', 'fas fa-user-check'],
        ['employee_decisions', 'قرارات الموظف', 'القرارات الإدارية المتعلقة بالموظف', 1, 0, 'pdf,doc,docx', 'fas fa-gavel'],
        ['employee_certificates', 'شهادات الموظف', 'الشهادات العلمية والمهنية', 1, 0, 'pdf,jpg,png', 'fas fa-certificate'],
        ['disciplinary_actions', 'الجزاءات والمخالفات', 'سجل الجزاءات والمخالفات', 1, 0, 'pdf,doc,docx', 'fas fa-exclamation-triangle'],
        ['performance_reviews', 'تقييمات الأداء', 'تقارير تقييم الأداء السنوية', 1, 0, 'pdf,doc,docx', 'fas fa-chart-line'],
        ['training_records', 'سجلات التدريب', 'شهادات وسجلات الدورات التدريبية', 1, 0, 'pdf,jpg,png', 'fas fa-graduation-cap'],
        ['medical_records', 'السجلات الطبية', 'الفحوصات الطبية وشهادات اللياقة', 1, 0, 'pdf,jpg,png', 'fas fa-heartbeat'],
        ['contracts', 'العقود', 'عقود العمل والاتفاقيات', 1, 1, 'pdf,doc,docx', 'fas fa-file-contract'],
        ['id_documents', 'وثائق الهوية', 'صور الهوية الوطنية وجواز السفر', 1, 1, 'pdf,jpg,png', 'fas fa-id-card'],
        ['bank_details', 'البيانات البنكية', 'تفاصيل الحساب البنكي', 1, 0, 'pdf,doc,docx', 'fas fa-university']
    ];

    $stmt = $db->prepare("INSERT OR IGNORE INTO attachment_types (type_name, type_name_ar, description, is_default, is_required, file_extensions, icon_class) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($defaultAttachmentTypes as $type) {
        $stmt->bindValue(1, $type[0], SQLITE3_TEXT);
        $stmt->bindValue(2, $type[1], SQLITE3_TEXT);
        $stmt->bindValue(3, $type[2], SQLITE3_TEXT);
        $stmt->bindValue(4, $type[3], SQLITE3_INTEGER);
        $stmt->bindValue(5, $type[4], SQLITE3_INTEGER);
        $stmt->bindValue(6, $type[5], SQLITE3_TEXT);
        $stmt->bindValue(7, $type[6], SQLITE3_TEXT);
        $stmt->execute();
    }

    // إدراج الإدارات الافتراضية
    $defaultDepartments = [
        ['مركز الخدمات الطبية الشرعية', 'FLMC', 'د. فواز جمال الديدب', 'مدير مركز الخدمات الطبية الشرعية'],
        ['إدارة الموارد البشرية', 'HR', '', 'مدير الموارد البشرية'],
        ['الإدارة المالية', 'FIN', '', 'المدير المالي'],
        ['إدارة تقنية المعلومات', 'IT', '', 'مدير تقنية المعلومات'],
        ['الإدارة القانونية', 'LEGAL', '', 'المستشار القانوني'],
        ['إدارة الشؤون الإدارية', 'ADMIN', '', 'مدير الشؤون الإدارية'],
        ['إدارة التطوير والجودة', 'QD', '', 'مدير التطوير والجودة'],
        ['إدارة العلاقات العامة', 'PR', '', 'مدير العلاقات العامة'],
        ['إدارة الأمن والسلامة', 'SAFETY', '', 'مدير الأمن والسلامة'],
        ['إدارة الصيانة', 'MAINT', '', 'مدير الصيانة']
    ];

    // التحقق من وجود الأعمدة قبل الإدراج
    $result = $db->query("PRAGMA table_info(departments)");
    $columns = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $columns[] = $row['name'];
    }

    if (in_array('department_code', $columns)) {
        $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name, department_code, manager_name, manager_position) VALUES (?, ?, ?, ?)");

        foreach ($defaultDepartments as $dept) {
            $stmt->bindValue(1, $dept[0], SQLITE3_TEXT);
            $stmt->bindValue(2, $dept[1], SQLITE3_TEXT);
            $stmt->bindValue(3, $dept[2], SQLITE3_TEXT);
            $stmt->bindValue(4, $dept[3], SQLITE3_TEXT);
            $stmt->execute();
        }
    } else {
        // إدراج بالأعمدة الأساسية فقط
        $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");

        foreach ($defaultDepartments as $dept) {
            $stmt->bindValue(1, $dept[0], SQLITE3_TEXT);
            $stmt->execute();
        }
    }

    // إدراج إحصائيات النظام الافتراضية
    $defaultStats = [
        ['total_employees', '0'],
        ['total_departments', '10'],
        ['total_attachments', '0'],
        ['total_cards_generated', '0'],
        ['last_backup_date', ''],
        ['system_version', '2.0.0']
    ];

    $stmt = $db->prepare("INSERT OR IGNORE INTO system_stats (stat_name, stat_value) VALUES (?, ?)");
    
    foreach ($defaultStats as $stat) {
        $stmt->bindValue(1, $stat[0], SQLITE3_TEXT);
        $stmt->bindValue(2, $stat[1], SQLITE3_TEXT);
        $stmt->execute();
    }

    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>إعداد قاعدة البيانات المحسنة</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .success { color: #27ae60; text-align: center; margin-bottom: 30px; }
            .feature-list { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .feature-item { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #667eea; }
            .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 8px; margin: 10px 5px; transition: transform 0.3s; }
            .btn:hover { transform: translateY(-2px); }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1 class='success'>✅ تم إعداد قاعدة البيانات المحسنة بنجاح!</h1>
            
            <div class='stats'>
                <div class='stat-card'>
                    <h3>الجداول المُنشأة</h3>
                    <p><strong>8</strong> جداول</p>
                </div>
                <div class='stat-card'>
                    <h3>أنواع المرفقات</h3>
                    <p><strong>10</strong> أنواع</p>
                </div>
                <div class='stat-card'>
                    <h3>الإدارات</h3>
                    <p><strong>10</strong> إدارات</p>
                </div>
            </div>

            <div class='feature-list'>
                <h3>🚀 الميزات الجديدة المُضافة:</h3>
                <div class='feature-item'>📊 <strong>نظام إدارة الموظفين المتكامل</strong> - إدارة شاملة لبيانات الموظفين</div>
                <div class='feature-item'>📎 <strong>نظام المرفقات المتقدم</strong> - 10 أنواع مرفقات افتراضية مع تتبع الحالة</div>
                <div class='feature-item'>🏢 <strong>إدارة الإدارات المحسنة</strong> - معلومات مفصلة عن الإدارات والمدراء</div>
                <div class='feature-item'>📱 <strong>نظام QR Code المتطور</strong> - رموز QR ذكية مع بيانات شاملة</div>
                <div class='feature-item'>📈 <strong>نظام الإحصائيات</strong> - تتبع شامل لاستخدام النظام</div>
                <div class='feature-item'>📝 <strong>سجل العمليات</strong> - تتبع جميع التغييرات والعمليات</div>
                <div class='feature-item'>🔗 <strong>الربط التلقائي</strong> - ربط الموظفين بالقوالب والمرفقات</div>
                <div class='feature-item'>🎨 <strong>قوالب محسنة</strong> - دعم قوالب متعددة مع معاينة</div>
            </div>
            
            <div style='text-align: center; margin-top: 40px;'>
                <a href='admin.html' class='btn'>🎛️ لوحة التحكم الإدارية</a>
                <a href='index.html' class='btn'>🏠 الصفحة الرئيسية</a>
                <a href='employee_management.html' class='btn'>👥 إدارة الموظفين</a>
            </div>
        </div>
    </body>
    </html>";

} catch (Exception $e) {
    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <title>خطأ في إعداد قاعدة البيانات</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .error { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
            .error h1 { color: #e74c3c; }
        </style>
    </head>
    <body>
        <div class='error'>
            <h1>❌ خطأ في إعداد قاعدة البيانات</h1>
            <p><strong>رسالة الخطأ:</strong> " . $e->getMessage() . "</p>
            <p>يرجى التحقق من صلاحيات الملفات والمجلدات والمحاولة مرة أخرى.</p>
        </div>
    </body>
    </html>";
}
?>
