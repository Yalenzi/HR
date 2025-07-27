<?php
/**
 * إضافة بيانات تجريبية لنظام إدارة الموظفين
 */

header('Content-Type: text/html; charset=utf-8');

try {
    $db = new SQLite3('db/cards.db');
    
    // بيانات موظفين تجريبية
    $sampleEmployees = [
        [
            'employee_name' => 'د. فواز جمال الديدب',
            'national_id' => '1234567890',
            'employee_number' => 'EMP001',
            'position' => 'مدير مركز الخدمات الطبية الشرعية',
            'nationality' => 'سعودي',
            'department' => 'مركز الخدمات الطبية الشرعية'
        ],
        [
            'employee_name' => 'أحمد محمد العتيبي',
            'national_id' => '1234567891',
            'employee_number' => 'EMP002',
            'position' => 'مدير إدارة الموارد البشرية',
            'nationality' => 'سعودي',
            'department' => 'إدارة الموارد البشرية'
        ],
        [
            'employee_name' => 'سارة عبدالله الشمري',
            'national_id' => '1234567892',
            'employee_number' => 'EMP003',
            'position' => 'أخصائية موارد بشرية',
            'nationality' => 'سعودي',
            'department' => 'إدارة الموارد البشرية'
        ],
        [
            'employee_name' => 'محمد عبدالرحمن القحطاني',
            'national_id' => '1234567893',
            'employee_number' => 'EMP004',
            'position' => 'محاسب أول',
            'nationality' => 'سعودي',
            'department' => 'الإدارة المالية'
        ],
        [
            'employee_name' => 'نورا سعد المطيري',
            'national_id' => '1234567894',
            'employee_number' => 'EMP005',
            'position' => 'مطورة نظم',
            'nationality' => 'سعودي',
            'department' => 'إدارة تقنية المعلومات'
        ],
        [
            'employee_name' => 'خالد أحمد الدوسري',
            'national_id' => '1234567895',
            'employee_number' => 'EMP006',
            'position' => 'مستشار قانوني',
            'nationality' => 'سعودي',
            'department' => 'الإدارة القانونية'
        ],
        [
            'employee_name' => 'فاطمة علي الزهراني',
            'national_id' => '1234567896',
            'employee_number' => 'EMP007',
            'position' => 'سكرتيرة تنفيذية',
            'nationality' => 'سعودي',
            'department' => 'إدارة الشؤون الإدارية'
        ],
        [
            'employee_name' => 'عبدالعزيز محمد الغامدي',
            'national_id' => '1234567897',
            'employee_number' => 'EMP008',
            'position' => 'أخصائي جودة',
            'nationality' => 'سعودي',
            'department' => 'إدارة التطوير والجودة'
        ],
        [
            'employee_name' => 'John Smith',
            'national_id' => '1234567898',
            'employee_number' => 'EMP009',
            'position' => 'مستشار تقني',
            'nationality' => 'غير سعودي',
            'department' => 'إدارة تقنية المعلومات'
        ],
        [
            'employee_name' => 'مريم عبدالله الحربي',
            'national_id' => '1234567899',
            'employee_number' => 'EMP010',
            'position' => 'محللة بيانات',
            'nationality' => 'سعودي',
            'department' => 'إدارة التطوير والجودة'
        ]
    ];
    
    echo "<!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>إضافة بيانات تجريبية</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .success { color: green; }
            .error { color: red; }
            .employee { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; }
            .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>📊 إضافة بيانات تجريبية</h1>
            <p>إضافة موظفين تجريبيين لاختبار النظام</p>";
    
    $addedCount = 0;
    $skippedCount = 0;
    
    foreach ($sampleEmployees as $employee) {
        // التحقق من عدم وجود الموظف مسبقاً
        $stmt = $db->prepare("SELECT id FROM employees WHERE national_id = ?");
        $stmt->bindValue(1, $employee['national_id'], SQLITE3_TEXT);
        $result = $stmt->execute();
        
        if ($result->fetchArray()) {
            echo "<div class='employee error'>⚠️ تم تخطي: {$employee['employee_name']} (موجود مسبقاً)</div>";
            $skippedCount++;
            continue;
        }
        
        // إضافة الموظف
        $stmt = $db->prepare("
            INSERT INTO employees (employee_name, national_id, employee_number, position, nationality, department) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bindValue(1, $employee['employee_name'], SQLITE3_TEXT);
        $stmt->bindValue(2, $employee['national_id'], SQLITE3_TEXT);
        $stmt->bindValue(3, $employee['employee_number'], SQLITE3_TEXT);
        $stmt->bindValue(4, $employee['position'], SQLITE3_TEXT);
        $stmt->bindValue(5, $employee['nationality'], SQLITE3_TEXT);
        $stmt->bindValue(6, $employee['department'], SQLITE3_TEXT);
        
        if ($stmt->execute()) {
            $employeeId = $db->lastInsertRowID();
            
            // إضافة المرفقات الافتراضية
            $defaultAttachments = [
                'مباشرة الموظف',
                'قرارات الموظف',
                'شهادات الموظف',
                'الجزاءات والمخالفات'
            ];
            
            foreach ($defaultAttachments as $attachment) {
                $stmt = $db->prepare("
                    INSERT INTO employee_attachments (employee_id, attachment_name, attachment_type, is_default, status) 
                    VALUES (?, ?, 'document', 1, ?)
                ");
                $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
                $stmt->bindValue(2, $attachment, SQLITE3_TEXT);
                // تعيين حالة عشوائية للمرفقات
                $status = (rand(1, 10) > 3) ? 'موجود' : 'غير موجود';
                $stmt->bindValue(3, $status, SQLITE3_TEXT);
                $stmt->execute();
            }
            
            echo "<div class='employee success'>✅ تم إضافة: {$employee['employee_name']} - {$employee['position']}</div>";
            $addedCount++;
        } else {
            echo "<div class='employee error'>❌ فشل في إضافة: {$employee['employee_name']}</div>";
        }
    }
    
    echo "<div style='margin-top: 30px; padding: 20px; background: #d4edda; border-radius: 5px;'>
            <h3>📊 ملخص العملية:</h3>
            <ul>
                <li><strong>تم إضافة:</strong> $addedCount موظف</li>
                <li><strong>تم تخطي:</strong> $skippedCount موظف (موجود مسبقاً)</li>
                <li><strong>إجمالي المحاولات:</strong> " . count($sampleEmployees) . " موظف</li>
            </ul>
          </div>";
    
    if ($addedCount > 0) {
        echo "<div style='text-align: center; margin-top: 20px;'>
                <a href='admin.html' class='btn'>🎛️ الذهاب إلى لوحة التحكم</a>
                <a href='mashhad_template.html' class='btn'>📄 تجربة قالب مشهد</a>
              </div>";
    }
    
    // إحصائيات إضافية
    $totalEmployees = $db->querySingle("SELECT COUNT(*) FROM employees");
    $totalDepartments = $db->querySingle("SELECT COUNT(*) FROM departments");
    $totalAttachments = $db->querySingle("SELECT COUNT(*) FROM employee_attachments");
    $completedAttachments = $db->querySingle("SELECT COUNT(*) FROM employee_attachments WHERE status = 'موجود'");
    
    echo "<div style='margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 5px;'>
            <h4>📈 إحصائيات النظام الحالية:</h4>
            <ul>
                <li><strong>إجمالي الموظفين:</strong> $totalEmployees</li>
                <li><strong>عدد الإدارات:</strong> $totalDepartments</li>
                <li><strong>إجمالي المرفقات:</strong> $totalAttachments</li>
                <li><strong>المرفقات المكتملة:</strong> $completedAttachments</li>
            </ul>
          </div>";
    
    echo "</div>
    </body>
    </html>";
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage();
}
?>
