<?php
/**
 * API لإدارة الموظفين
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $db = new SQLite3('db/cards.db');
    $action = $_GET['action'] ?? $_POST['action'] ?? '';

    switch ($action) {
        case 'getEmployees':
            getEmployees($db);
            break;
        
        case 'getEmployee':
            getEmployee($db);
            break;
        
        case 'addEmployee':
            addEmployee($db);
            break;
        
        case 'updateEmployee':
            updateEmployee($db);
            break;
        
        case 'deleteEmployee':
            deleteEmployee($db);
            break;
        
        case 'searchEmployees':
            searchEmployees($db);
            break;
        
        case 'getDepartments':
            getDepartments($db);
            break;
        
        case 'addDepartment':
            addDepartment($db);
            break;
        
        case 'getEmployeeAttachments':
            getEmployeeAttachments($db);
            break;
        
        case 'updateAttachmentStatus':
            updateAttachmentStatus($db);
            break;
        
        case 'uploadAttachment':
            uploadAttachment($db);
            break;
        
        case 'generateQRCode':
            generateQRCode($db);
            break;
        
        default:
            echo json_encode(['error' => 'إجراء غير صحيح']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

function getEmployees($db) {
    $result = $db->query("
        SELECT e.*, 
               COUNT(ea.id) as attachments_count,
               SUM(CASE WHEN ea.status = 'موجود' THEN 1 ELSE 0 END) as completed_attachments
        FROM employees e 
        LEFT JOIN employee_attachments ea ON e.id = ea.employee_id 
        GROUP BY e.id 
        ORDER BY e.created_at DESC
    ");
    
    $employees = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $employees[] = $row;
    }
    
    echo json_encode(['success' => true, 'employees' => $employees]);
}

function getEmployee($db) {
    $id = $_GET['id'] ?? 0;
    
    $stmt = $db->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $employee = $result->fetchArray(SQLITE3_ASSOC);
    
    if ($employee) {
        echo json_encode(['success' => true, 'employee' => $employee]);
    } else {
        echo json_encode(['error' => 'الموظف غير موجود']);
    }
}

function addEmployee($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // التحقق من البيانات المطلوبة
    if (empty($data['employee_name']) || empty($data['national_id']) || empty($data['position']) || empty($data['department'])) {
        echo json_encode(['error' => 'جميع الحقول المطلوبة يجب ملؤها']);
        return;
    }
    
    // التحقق من عدم تكرار الهوية الوطنية
    $stmt = $db->prepare("SELECT id FROM employees WHERE national_id = ?");
    $stmt->bindValue(1, $data['national_id'], SQLITE3_TEXT);
    $result = $stmt->execute();
    
    if ($result->fetchArray()) {
        echo json_encode(['error' => 'الهوية الوطنية موجودة مسبقاً']);
        return;
    }
    
    // إضافة الإدارة إلى قائمة الإدارات إذا لم تكن موجودة
    $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");
    $stmt->bindValue(1, $data['department'], SQLITE3_TEXT);
    $stmt->execute();
    
    // إضافة الموظف
    $stmt = $db->prepare("
        INSERT INTO employees (employee_name, national_id, employee_number, position, nationality, department) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bindValue(1, $data['employee_name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['national_id'], SQLITE3_TEXT);
    $stmt->bindValue(3, $data['employee_number'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(4, $data['position'], SQLITE3_TEXT);
    $stmt->bindValue(5, $data['nationality'] ?? 'سعودي', SQLITE3_TEXT);
    $stmt->bindValue(6, $data['department'], SQLITE3_TEXT);
    
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
                INSERT INTO employee_attachments (employee_id, attachment_name, attachment_type, is_default) 
                VALUES (?, ?, 'document', 1)
            ");
            $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
            $stmt->bindValue(2, $attachment, SQLITE3_TEXT);
            $stmt->execute();
        }
        
        echo json_encode(['success' => true, 'employee_id' => $employeeId]);
    } else {
        echo json_encode(['error' => 'فشل في إضافة الموظف']);
    }
}

function updateEmployee($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    // إضافة الإدارة إلى قائمة الإدارات إذا لم تكن موجودة
    if (!empty($data['department'])) {
        $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");
        $stmt->bindValue(1, $data['department'], SQLITE3_TEXT);
        $stmt->execute();
    }
    
    $stmt = $db->prepare("
        UPDATE employees 
        SET employee_name = ?, national_id = ?, employee_number = ?, position = ?, nationality = ?, department = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    $stmt->bindValue(1, $data['employee_name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['national_id'], SQLITE3_TEXT);
    $stmt->bindValue(3, $data['employee_number'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(4, $data['position'], SQLITE3_TEXT);
    $stmt->bindValue(5, $data['nationality'] ?? 'سعودي', SQLITE3_TEXT);
    $stmt->bindValue(6, $data['department'], SQLITE3_TEXT);
    $stmt->bindValue(7, $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في تحديث الموظف']);
    }
}

function deleteEmployee($db) {
    $id = $_POST['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    $stmt = $db->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في حذف الموظف']);
    }
}

function searchEmployees($db) {
    $query = $_GET['query'] ?? '';
    
    if (empty($query)) {
        getEmployees($db);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT e.*, 
               COUNT(ea.id) as attachments_count,
               SUM(CASE WHEN ea.status = 'موجود' THEN 1 ELSE 0 END) as completed_attachments
        FROM employees e 
        LEFT JOIN employee_attachments ea ON e.id = ea.employee_id 
        WHERE e.employee_name LIKE ? OR e.national_id LIKE ? OR e.position LIKE ? OR e.department LIKE ?
        GROUP BY e.id 
        ORDER BY e.created_at DESC
    ");
    
    $searchTerm = "%$query%";
    $stmt->bindValue(1, $searchTerm, SQLITE3_TEXT);
    $stmt->bindValue(2, $searchTerm, SQLITE3_TEXT);
    $stmt->bindValue(3, $searchTerm, SQLITE3_TEXT);
    $stmt->bindValue(4, $searchTerm, SQLITE3_TEXT);
    
    $result = $stmt->execute();
    $employees = [];
    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $employees[] = $row;
    }
    
    echo json_encode(['success' => true, 'employees' => $employees]);
}

function getDepartments($db) {
    $result = $db->query("SELECT * FROM departments ORDER BY department_name");
    $departments = [];
    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $departments[] = $row;
    }
    
    echo json_encode(['success' => true, 'departments' => $departments]);
}

function addDepartment($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $departmentName = $data['department_name'] ?? '';

    if (empty($departmentName)) {
        echo json_encode(['error' => 'اسم الإدارة مطلوب']);
        return;
    }

    $stmt = $db->prepare("INSERT OR IGNORE INTO departments (department_name) VALUES (?)");
    $stmt->bindValue(1, $departmentName, SQLITE3_TEXT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في إضافة الإدارة']);
    }
}

function getEmployeeAttachments($db) {
    $employeeId = $_GET['employee_id'] ?? 0;

    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM employee_attachments WHERE employee_id = ? ORDER BY is_default DESC, attachment_name");
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $attachments = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $attachments[] = $row;
    }

    echo json_encode(['success' => true, 'attachments' => $attachments]);
}

function updateAttachmentStatus($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $attachmentId = $data['attachment_id'] ?? 0;
    $status = $data['status'] ?? 'غير موجود';

    if (!$attachmentId) {
        echo json_encode(['error' => 'معرف المرفق مطلوب']);
        return;
    }

    $stmt = $db->prepare("UPDATE employee_attachments SET status = ? WHERE id = ?");
    $stmt->bindValue(1, $status, SQLITE3_TEXT);
    $stmt->bindValue(2, $attachmentId, SQLITE3_INTEGER);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في تحديث حالة المرفق']);
    }
}

function uploadAttachment($db) {
    $employeeId = $_POST['employee_id'] ?? 0;
    $attachmentName = $_POST['attachment_name'] ?? '';

    if (!$employeeId || empty($attachmentName)) {
        echo json_encode(['error' => 'معرف الموظف واسم المرفق مطلوبان']);
        return;
    }

    if (!isset($_FILES['file'])) {
        echo json_encode(['error' => 'لم يتم رفع ملف']);
        return;
    }

    $file = $_FILES['file'];
    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['error' => 'نوع الملف غير مدعوم']);
        return;
    }

    // إنشاء مجلد المرفقات إذا لم يكن موجوداً
    $uploadDir = "attachments/employee_$employeeId/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $fileName = time() . '_' . basename($file['name']);
    $uploadPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // تحديث أو إضافة المرفق في قاعدة البيانات
        $stmt = $db->prepare("
            INSERT OR REPLACE INTO employee_attachments
            (employee_id, attachment_name, attachment_type, file_path, status)
            VALUES (?, ?, ?, ?, 'موجود')
        ");
        $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
        $stmt->bindValue(2, $attachmentName, SQLITE3_TEXT);
        $stmt->bindValue(3, $file['type'], SQLITE3_TEXT);
        $stmt->bindValue(4, $uploadPath, SQLITE3_TEXT);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'file_path' => $uploadPath]);
        } else {
            echo json_encode(['error' => 'فشل في حفظ معلومات المرفق']);
        }
    } else {
        echo json_encode(['error' => 'فشل في رفع الملف']);
    }
}

function generateQRCode($db) {
    $employeeId = $_GET['employee_id'] ?? 0;

    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }

    // الحصول على بيانات الموظف
    $stmt = $db->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $employee = $result->fetchArray(SQLITE3_ASSOC);

    if (!$employee) {
        echo json_encode(['error' => 'الموظف غير موجود']);
        return;
    }

    // الحصول على حالة المرفقات
    $stmt = $db->prepare("SELECT attachment_name, status FROM employee_attachments WHERE employee_id = ?");
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $attachments = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $attachments[] = [
            'name' => $row['attachment_name'],
            'status' => $row['status'] === 'موجود' ? '✓' : '✗'
        ];
    }

    // إنشاء بيانات QR Code
    $qrData = [
        'employee_name' => $employee['employee_name'],
        'national_id' => $employee['national_id'],
        'position' => $employee['position'],
        'department' => $employee['department'],
        'attachments' => $attachments,
        'generated_at' => date('Y-m-d H:i:s')
    ];

    $qrText = json_encode($qrData, JSON_UNESCAPED_UNICODE);

    // حفظ بيانات QR Code في قاعدة البيانات
    $stmt = $db->prepare("UPDATE employees SET qr_code_data = ? WHERE id = ?");
    $stmt->bindValue(1, $qrText, SQLITE3_TEXT);
    $stmt->bindValue(2, $employeeId, SQLITE3_INTEGER);
    $stmt->execute();

    echo json_encode(['success' => true, 'qr_data' => $qrText, 'qr_info' => $qrData]);
}
?>
