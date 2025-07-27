<?php
/**
 * تشغيل تجريبي سريع للنظام
 * يقوم بإعداد النظام وإضافة بيانات تجريبية تلقائياً
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='ar' dir='rtl'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>تشغيل تجريبي - نظام إدارة الموظفين</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .step { margin: 20px 0; padding: 20px; border-radius: 10px; border-left: 4px solid #007bff; }
        .success { background: #d4edda; border-color: #28a745; }
        .error { background: #f8d7da; border-color: #dc3545; }
        .info { background: #d1ecf1; border-color: #17a2b8; }
        .warning { background: #fff3cd; border-color: #ffc107; }
        .progress { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-bar { height: 100%; background: #28a745; transition: width 0.5s ease; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #1e7e34; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    </style>
    <script>
        function updateProgress(percent) {
            document.getElementById('progressBar').style.width = percent + '%';
            document.getElementById('progressText').textContent = percent + '%';
        }
        
        function showStep(stepId) {
            document.getElementById(stepId).style.display = 'block';
        }
        
        setTimeout(() => updateProgress(20), 500);
    </script>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🚀 تشغيل تجريبي سريع</h1>
            <p>إعداد وتشغيل نظام إدارة الموظفين تلقائياً</p>
            <div class='progress'>
                <div id='progressBar' class='progress-bar' style='width: 10%'></div>
            </div>
            <p>التقدم: <span id='progressText'>10%</span></p>
        </div>
        <div class='content'>";

$steps = [];
$errors = [];
$totalSteps = 6;
$currentStep = 0;

// الخطوة 1: فحص المتطلبات
echo "<div class='step info' id='step1'>
        <h3>🔍 الخطوة 1: فحص المتطلبات</h3>";

if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
    echo "<p>✅ PHP " . PHP_VERSION . " (مدعوم)</p>";
    $currentStep++;
} else {
    echo "<p>❌ PHP " . PHP_VERSION . " (يتطلب 7.4+)</p>";
    $errors[] = "إصدار PHP غير مدعوم";
}

if (extension_loaded('sqlite3')) {
    echo "<p>✅ SQLite3 متاح</p>";
    $currentStep++;
} else {
    echo "<p>❌ SQLite3 غير متاح</p>";
    $errors[] = "SQLite3 غير مثبت";
}

echo "</div>";
echo "<script>updateProgress(" . (($currentStep / $totalSteps) * 100) . ");</script>";

// الخطوة 2: إنشاء المجلدات
echo "<div class='step info' id='step2'>
        <h3>📁 الخطوة 2: إنشاء المجلدات</h3>";

$dirs = ['db', 'attachments', 'output', 'backgrounds'];
$dirSuccess = true;

foreach ($dirs as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0755, true)) {
            echo "<p>✅ تم إنشاء: $dir</p>";
        } else {
            echo "<p>❌ فشل في إنشاء: $dir</p>";
            $dirSuccess = false;
        }
    } else {
        echo "<p>✅ موجود: $dir</p>";
    }
}

if ($dirSuccess) $currentStep++;
echo "</div>";
echo "<script>updateProgress(" . (($currentStep / $totalSteps) * 100) . ");</script>";

// الخطوة 3: إعداد قاعدة البيانات
echo "<div class='step info' id='step3'>
        <h3>🗄️ الخطوة 3: إعداد قاعدة البيانات</h3>";

try {
    $db = new SQLite3('db/cards.db');
    echo "<p>✅ اتصال قاعدة البيانات نجح</p>";
    
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
        )"
    ];
    
    foreach ($tables as $name => $sql) {
        if ($db->exec($sql)) {
            echo "<p>✅ جدول $name</p>";
        } else {
            echo "<p>❌ فشل في جدول $name</p>";
            $errors[] = "فشل في إنشاء جدول $name";
        }
    }
    
    $currentStep++;
    
} catch (Exception $e) {
    echo "<p>❌ خطأ: " . $e->getMessage() . "</p>";
    $errors[] = "خطأ في قاعدة البيانات";
}

echo "</div>";
echo "<script>updateProgress(" . (($currentStep / $totalSteps) * 100) . ");</script>";

// الخطوة 4: إدراج البيانات الافتراضية
echo "<div class='step info' id='step4'>
        <h3>📋 الخطوة 4: البيانات الافتراضية</h3>";

try {
    // الإدارات
    $departments = [
        'مركز الخدمات الطبية الشرعية',
        'إدارة الموارد البشرية',
        'الإدارة المالية',
        'إدارة تقنية المعلومات',
        'الإدارة القانونية'
    ];
    
    foreach ($departments as $dept) {
        $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");
        $stmt->bindValue(1, $dept, SQLITE3_TEXT);
        $stmt->execute();
    }
    
    echo "<p>✅ تم إدراج " . count($departments) . " إدارة</p>";
    $currentStep++;
    
} catch (Exception $e) {
    echo "<p>❌ خطأ في البيانات: " . $e->getMessage() . "</p>";
    $errors[] = "فشل في إدراج البيانات";
}

echo "</div>";
echo "<script>updateProgress(" . (($currentStep / $totalSteps) * 100) . ");</script>";

// الخطوة 5: إضافة موظفين تجريبيين
echo "<div class='step info' id='step5'>
        <h3>👥 الخطوة 5: موظفين تجريبيين</h3>";

$sampleEmployees = [
    ['د. فواز جمال الديدب', '1234567890', 'EMP001', 'مدير مركز الخدمات الطبية الشرعية', 'سعودي', 'مركز الخدمات الطبية الشرعية'],
    ['أحمد محمد العتيبي', '1234567891', 'EMP002', 'مدير إدارة الموارد البشرية', 'سعودي', 'إدارة الموارد البشرية'],
    ['سارة عبدالله الشمري', '1234567892', 'EMP003', 'أخصائية موارد بشرية', 'سعودي', 'إدارة الموارد البشرية'],
    ['محمد عبدالرحمن القحطاني', '1234567893', 'EMP004', 'محاسب أول', 'سعودي', 'الإدارة المالية'],
    ['نورا سعد المطيري', '1234567894', 'EMP005', 'مطورة نظم', 'سعودي', 'إدارة تقنية المعلومات']
];

$addedCount = 0;
foreach ($sampleEmployees as $emp) {
    try {
        $stmt = $db->prepare("INSERT OR IGNORE INTO employees (employee_name, national_id, employee_number, position, nationality, department) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bindValue(1, $emp[0], SQLITE3_TEXT);
        $stmt->bindValue(2, $emp[1], SQLITE3_TEXT);
        $stmt->bindValue(3, $emp[2], SQLITE3_TEXT);
        $stmt->bindValue(4, $emp[3], SQLITE3_TEXT);
        $stmt->bindValue(5, $emp[4], SQLITE3_TEXT);
        $stmt->bindValue(6, $emp[5], SQLITE3_TEXT);
        
        if ($stmt->execute()) {
            $employeeId = $db->lastInsertRowID();
            if ($employeeId > 0) {
                // إضافة مرفقات افتراضية
                $attachments = ['مباشرة الموظف', 'قرارات الموظف', 'شهادات الموظف', 'الجزاءات والمخالفات'];
                foreach ($attachments as $att) {
                    $stmt2 = $db->prepare("INSERT INTO employee_attachments (employee_id, attachment_name, attachment_type, is_default, status) VALUES (?, ?, 'document', 1, ?)");
                    $stmt2->bindValue(1, $employeeId, SQLITE3_INTEGER);
                    $stmt2->bindValue(2, $att, SQLITE3_TEXT);
                    $stmt2->bindValue(3, (rand(1,10) > 3) ? 'موجود' : 'غير موجود', SQLITE3_TEXT);
                    $stmt2->execute();
                }
                $addedCount++;
                echo "<p>✅ " . $emp[0] . "</p>";
            }
        }
    } catch (Exception $e) {
        echo "<p>⚠️ تخطي: " . $emp[0] . " (موجود مسبقاً)</p>";
    }
}

if ($addedCount > 0) $currentStep++;
echo "<p><strong>تم إضافة $addedCount موظف تجريبي</strong></p>";

echo "</div>";
echo "<script>updateProgress(" . (($currentStep / $totalSteps) * 100) . ");</script>";

// الخطوة 6: التحقق النهائي
echo "<div class='step info' id='step6'>
        <h3>✅ الخطوة 6: التحقق النهائي</h3>";

$totalEmployees = $db->querySingle("SELECT COUNT(*) FROM employees");
$totalDepartments = $db->querySingle("SELECT COUNT(*) FROM departments");
$totalAttachments = $db->querySingle("SELECT COUNT(*) FROM employee_attachments");

echo "<p>📊 <strong>إحصائيات النظام:</strong></p>
      <ul>
        <li>الموظفين: $totalEmployees</li>
        <li>الإدارات: $totalDepartments</li>
        <li>المرفقات: $totalAttachments</li>
      </ul>";

if ($totalEmployees > 0) $currentStep++;

echo "</div>";
echo "<script>updateProgress(100);</script>";

// النتائج النهائية
if (empty($errors) && $currentStep >= $totalSteps) {
    echo "<div class='step success'>
            <h3>🎉 تم الإعداد بنجاح!</h3>
            <p>النظام جاهز للاستخدام مع $totalEmployees موظف تجريبي</p>
            
            <div class='grid'>
                <a href='admin.html' class='btn btn-success'>🎛️ لوحة التحكم</a>
                <a href='mashhad_template.html' class='btn btn-success'>📄 قالب مشهد</a>
                <a href='index.html' class='btn'>🏠 الصفحة الرئيسية</a>
                <a href='start.html' class='btn'>🚀 صفحة البداية</a>
            </div>
          </div>";
} else {
    echo "<div class='step error'>
            <h3>❌ يوجد مشاكل تحتاج إلى حل</h3>
            <ul>";
    foreach ($errors as $error) {
        echo "<li>$error</li>";
    }
    echo "</ul>
            <p><a href='quick_setup.php' class='btn'>🔧 إعداد يدوي</a></p>
          </div>";
}

echo "        </div>
    </div>
    
    <script>
        // تحديث تلقائي للتقدم
        setTimeout(() => {
            if (document.getElementById('progressBar').style.width === '100%') {
                document.getElementById('progressText').textContent = '✅ مكتمل';
            }
        }, 2000);
    </script>
</body>
</html>";
?>
