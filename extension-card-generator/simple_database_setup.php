<?php
/**
 * إعداد قاعدة البيانات المبسط
 */

header('Content-Type: text/html; charset=utf-8');

try {
    // إنشاء مجلد قاعدة البيانات إذا لم يكن موجوداً
    if (!file_exists('db')) {
        mkdir('db', 0755, true);
    }

    // الاتصال بقاعدة البيانات
    $db = new SQLite3('db/cards.db');
    $db->exec("PRAGMA foreign_keys = ON");

    // إنشاء جدول أنواع المرفقات
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
        CREATE TABLE IF NOT EXISTS employee_attachments_new (
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
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // إنشاء جدول QR Codes
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
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    // إدراج إحصائيات النظام الافتراضية
    $defaultStats = [
        ['total_employees', '0'],
        ['total_departments', '0'],
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

    // التحقق من عدد الإدارات وإضافة الافتراضية إذا لزم الأمر
    $result = $db->query("SELECT COUNT(*) as count FROM departments");
    $deptCount = $result->fetchArray(SQLITE3_ASSOC)['count'];
    
    if ($deptCount == 0) {
        $defaultDepartments = [
            'مركز الخدمات الطبية الشرعية',
            'إدارة الموارد البشرية',
            'الإدارة المالية',
            'إدارة تقنية المعلومات',
            'الإدارة القانونية',
            'إدارة الشؤون الإدارية',
            'إدارة التطوير والجودة',
            'إدارة العلاقات العامة',
            'إدارة الأمن والسلامة',
            'إدارة الصيانة'
        ];

        $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");
        
        foreach ($defaultDepartments as $dept) {
            $stmt->bindValue(1, $dept, SQLITE3_TEXT);
            $stmt->execute();
        }
    }

    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>إعداد قاعدة البيانات</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                min-height: 100vh; 
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container { 
                max-width: 800px; 
                background: white; 
                padding: 40px; 
                border-radius: 20px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                text-align: center;
            }
            .success { 
                color: #27ae60; 
                font-size: 2rem; 
                margin-bottom: 30px; 
            }
            .stats { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin: 30px 0; 
            }
            .stat-card { 
                background: linear-gradient(45deg, #667eea, #764ba2); 
                color: white; 
                padding: 20px; 
                border-radius: 15px; 
                text-align: center; 
            }
            .btn { 
                display: inline-block; 
                padding: 15px 30px; 
                background: linear-gradient(45deg, #667eea, #764ba2); 
                color: white; 
                text-decoration: none; 
                border-radius: 10px; 
                margin: 10px; 
                transition: transform 0.3s; 
            }
            .btn:hover { 
                transform: translateY(-2px); 
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1 class='success'>✅ تم إعداد قاعدة البيانات بنجاح!</h1>
            
            <div class='stats'>
                <div class='stat-card'>
                    <h3>الجداول المُنشأة</h3>
                    <p><strong>6</strong> جداول</p>
                </div>
                <div class='stat-card'>
                    <h3>أنواع المرفقات</h3>
                    <p><strong>10</strong> أنواع</p>
                </div>
                <div class='stat-card'>
                    <h3>الإدارات</h3>
                    <p><strong>{$deptCount}</strong> إدارات</p>
                </div>
            </div>
            
            <div style='margin-top: 40px;'>
                <a href='employee_management.html' class='btn'>👥 نظام إدارة الموظفين</a>
                <a href='test_database.php' class='btn'>🔍 اختبار قاعدة البيانات</a>
                <a href='admin.html' class='btn'>⚙️ لوحة التحكم</a>
                <a href='index.html' class='btn'>🏠 الصفحة الرئيسية</a>
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
