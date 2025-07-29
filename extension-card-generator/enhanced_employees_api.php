<?php
/**
 * Enhanced Employee Management API
 * واجهة برمجة التطبيقات المحسنة لإدارة الموظفين
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// معالجة طلبات OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $db = new SQLite3('db/cards.db');
    $db->exec("PRAGMA foreign_keys = ON");
    
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    switch ($action) {
        // إدارة الموظفين
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
        case 'getEmployeeStats':
            getEmployeeStats($db);
            break;
            
        // إدارة الإدارات
        case 'getDepartments':
            getDepartments($db);
            break;
        case 'addDepartment':
            addDepartment($db);
            break;
        case 'updateDepartment':
            updateDepartment($db);
            break;
        case 'deleteDepartment':
            deleteDepartment($db);
            break;
            
        // إدارة المرفقات
        case 'getAttachmentTypes':
            getAttachmentTypes($db);
            break;
        case 'addAttachmentType':
            addAttachmentType($db);
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
        case 'deleteAttachment':
            deleteAttachment($db);
            break;
            
        // إدارة QR Codes
        case 'generateQRCode':
            generateQRCode($db);
            break;
        case 'getEmployeeQRCodes':
            getEmployeeQRCodes($db);
            break;
            
        // الإحصائيات والتقارير
        case 'getSystemStats':
            getSystemStats($db);
            break;
        case 'getDashboardData':
            getDashboardData($db);
            break;
            
        default:
            echo json_encode(['error' => 'إجراء غير صحيح']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

// دالة جلب جميع الموظفين مع الإحصائيات
function getEmployees($db) {
    $result = $db->query("
        SELECT 
            e.*,
            d.department_name,
            d.department_code,
            COUNT(ea.id) as total_attachments,
            SUM(CASE WHEN ea.status = 'موجود' THEN 1 ELSE 0 END) as completed_attachments,
            (SELECT COUNT(*) FROM employee_qr_codes WHERE employee_id = e.id AND is_active = 1) as active_qr_codes
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id
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

// دالة جلب موظف واحد مع تفاصيله الكاملة
function getEmployee($db) {
    $id = $_GET['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    // جلب بيانات الموظف
    $stmt = $db->prepare("
        SELECT e.*, d.department_name, d.department_code, d.manager_name
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = ?
    ");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $employee = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$employee) {
        echo json_encode(['error' => 'الموظف غير موجود']);
        return;
    }
    
    // جلب مرفقات الموظف
    $stmt = $db->prepare("
        SELECT ea.*, at.type_name_ar, at.icon_class, at.is_required
        FROM employee_attachments ea
        JOIN attachment_types at ON ea.attachment_type_id = at.id
        WHERE ea.employee_id = ?
        ORDER BY at.is_required DESC, ea.created_at DESC
    ");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $attachments = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $attachments[] = $row;
    }
    
    // جلب QR Codes الخاصة بالموظف
    $stmt = $db->prepare("
        SELECT * FROM employee_qr_codes 
        WHERE employee_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $qrCodes = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $qrCodes[] = $row;
    }
    
    $employee['attachments'] = $attachments;
    $employee['qr_codes'] = $qrCodes;
    
    echo json_encode(['success' => true, 'employee' => $employee]);
}

// دالة إضافة موظف جديد
function addEmployee($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // التحقق من البيانات المطلوبة
    $required = ['employee_name', 'national_id', 'position', 'department_id'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['error' => "الحقل {$field} مطلوب"]);
            return;
        }
    }
    
    // التحقق من عدم تكرار الهوية الوطنية
    $stmt = $db->prepare("SELECT id FROM employees WHERE national_id = ?");
    $stmt->bindValue(1, $data['national_id'], SQLITE3_TEXT);
    $result = $stmt->execute();
    
    if ($result->fetchArray()) {
        echo json_encode(['error' => 'الهوية الوطنية موجودة مسبقاً']);
        return;
    }
    
    // إضافة الموظف
    $stmt = $db->prepare("
        INSERT INTO employees (
            employee_name, national_id, employee_number, position, nationality, 
            department_id, hire_date, phone, email, address, emergency_contact, 
            emergency_phone, salary, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->bindValue(1, $data['employee_name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['national_id'], SQLITE3_TEXT);
    $stmt->bindValue(3, $data['employee_number'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(4, $data['position'], SQLITE3_TEXT);
    $stmt->bindValue(5, $data['nationality'] ?? 'سعودي', SQLITE3_TEXT);
    $stmt->bindValue(6, $data['department_id'], SQLITE3_INTEGER);
    $stmt->bindValue(7, $data['hire_date'] ?? null, SQLITE3_TEXT);
    $stmt->bindValue(8, $data['phone'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(9, $data['email'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(10, $data['address'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(11, $data['emergency_contact'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(12, $data['emergency_phone'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(13, $data['salary'] ?? null, SQLITE3_FLOAT);
    $stmt->bindValue(14, $data['notes'] ?? '', SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        $employeeId = $db->lastInsertRowID();
        
        // إنشاء مرفقات افتراضية للموظف
        createDefaultAttachments($db, $employeeId);
        
        // تسجيل العملية في سجل النشاطات
        logActivity($db, 'إضافة موظف', 'employees', $employeeId, null, $data);
        
        echo json_encode(['success' => true, 'employee_id' => $employeeId]);
    } else {
        echo json_encode(['error' => 'فشل في إضافة الموظف']);
    }
}

// دالة إنشاء المرفقات الافتراضية للموظف
function createDefaultAttachments($db, $employeeId) {
    $stmt = $db->prepare("
        INSERT INTO employee_attachments (employee_id, attachment_type_id, status)
        SELECT ?, id, 'غير موجود'
        FROM attachment_types 
        WHERE is_default = 1
    ");
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $stmt->execute();
}

// دالة تحديث بيانات الموظف
function updateEmployee($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    // جلب البيانات القديمة للمقارنة
    $stmt = $db->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $oldData = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$oldData) {
        echo json_encode(['error' => 'الموظف غير موجود']);
        return;
    }
    
    // تحديث البيانات
    $stmt = $db->prepare("
        UPDATE employees 
        SET employee_name = ?, national_id = ?, employee_number = ?, position = ?, 
            nationality = ?, department_id = ?, hire_date = ?, phone = ?, email = ?, 
            address = ?, emergency_contact = ?, emergency_phone = ?, salary = ?, 
            notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    
    $stmt->bindValue(1, $data['employee_name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['national_id'], SQLITE3_TEXT);
    $stmt->bindValue(3, $data['employee_number'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(4, $data['position'], SQLITE3_TEXT);
    $stmt->bindValue(5, $data['nationality'] ?? 'سعودي', SQLITE3_TEXT);
    $stmt->bindValue(6, $data['department_id'], SQLITE3_INTEGER);
    $stmt->bindValue(7, $data['hire_date'] ?? null, SQLITE3_TEXT);
    $stmt->bindValue(8, $data['phone'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(9, $data['email'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(10, $data['address'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(11, $data['emergency_contact'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(12, $data['emergency_phone'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(13, $data['salary'] ?? null, SQLITE3_FLOAT);
    $stmt->bindValue(14, $data['notes'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(15, $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        // تسجيل العملية في سجل النشاطات
        logActivity($db, 'تحديث موظف', 'employees', $id, $oldData, $data);
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في تحديث الموظف']);
    }
}

// دالة حذف الموظف
function deleteEmployee($db) {
    $id = $_POST['id'] ?? $_GET['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    // جلب بيانات الموظف قبل الحذف
    $stmt = $db->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $employeeData = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$employeeData) {
        echo json_encode(['error' => 'الموظف غير موجود']);
        return;
    }
    
    // حذف الموظف (سيتم حذف المرفقات تلقائياً بسبب CASCADE)
    $stmt = $db->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->bindValue(1, $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        // تسجيل العملية في سجل النشاطات
        logActivity($db, 'حذف موظف', 'employees', $id, $employeeData, null);
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في حذف الموظف']);
    }
}

// دالة البحث في الموظفين
function searchEmployees($db) {
    $query = $_GET['query'] ?? '';
    $department = $_GET['department'] ?? '';
    $status = $_GET['status'] ?? '';
    
    $sql = "
        SELECT 
            e.*,
            d.department_name,
            d.department_code,
            COUNT(ea.id) as total_attachments,
            SUM(CASE WHEN ea.status = 'موجود' THEN 1 ELSE 0 END) as completed_attachments
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN employee_attachments ea ON e.id = ea.employee_id 
        WHERE 1=1
    ";
    
    $params = [];
    $paramTypes = [];
    
    if (!empty($query)) {
        $sql .= " AND (e.employee_name LIKE ? OR e.national_id LIKE ? OR e.employee_number LIKE ? OR e.position LIKE ?)";
        $searchTerm = "%{$query}%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        $paramTypes = array_merge($paramTypes, [SQLITE3_TEXT, SQLITE3_TEXT, SQLITE3_TEXT, SQLITE3_TEXT]);
    }
    
    if (!empty($department)) {
        $sql .= " AND e.department_id = ?";
        $params[] = $department;
        $paramTypes[] = SQLITE3_INTEGER;
    }
    
    if (!empty($status)) {
        $sql .= " AND e.status = ?";
        $params[] = $status;
        $paramTypes[] = SQLITE3_TEXT;
    }
    
    $sql .= " GROUP BY e.id ORDER BY e.created_at DESC";
    
    $stmt = $db->prepare($sql);
    for ($i = 0; $i < count($params); $i++) {
        $stmt->bindValue($i + 1, $params[$i], $paramTypes[$i]);
    }
    
    $result = $stmt->execute();
    $employees = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $employees[] = $row;
    }
    
    echo json_encode(['success' => true, 'employees' => $employees]);
}

// دالة جلب إحصائيات الموظفين
function getEmployeeStats($db) {
    $stats = [];
    
    // إجمالي الموظفين
    $result = $db->query("SELECT COUNT(*) as total FROM employees");
    $stats['total_employees'] = $result->fetchArray(SQLITE3_ASSOC)['total'];
    
    // الموظفين النشطين
    $result = $db->query("SELECT COUNT(*) as active FROM employees WHERE status = 'نشط'");
    $stats['active_employees'] = $result->fetchArray(SQLITE3_ASSOC)['active'];
    
    // الموظفين حسب الإدارة
    $result = $db->query("
        SELECT d.department_name, COUNT(e.id) as count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        GROUP BY d.id, d.department_name
        ORDER BY count DESC
    ");
    
    $departmentStats = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $departmentStats[] = $row;
    }
    $stats['by_department'] = $departmentStats;
    
    // إحصائيات المرفقات
    $result = $db->query("
        SELECT 
            COUNT(*) as total_attachments,
            SUM(CASE WHEN status = 'موجود' THEN 1 ELSE 0 END) as completed_attachments
        FROM employee_attachments
    ");
    $attachmentStats = $result->fetchArray(SQLITE3_ASSOC);
    $stats['attachments'] = $attachmentStats;
    
    echo json_encode(['success' => true, 'stats' => $stats]);
}

// دالة تسجيل النشاطات
function logActivity($db, $action, $table, $recordId, $oldValues, $newValues) {
    $stmt = $db->prepare("
        INSERT INTO activity_log (action_type, table_name, record_id, old_values, new_values, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->bindValue(1, $action, SQLITE3_TEXT);
    $stmt->bindValue(2, $table, SQLITE3_TEXT);
    $stmt->bindValue(3, $recordId, SQLITE3_INTEGER);
    $stmt->bindValue(4, $oldValues ? json_encode($oldValues) : null, SQLITE3_TEXT);
    $stmt->bindValue(5, $newValues ? json_encode($newValues) : null, SQLITE3_TEXT);
    $stmt->bindValue(6, $_SERVER['REMOTE_ADDR'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(7, $_SERVER['HTTP_USER_AGENT'] ?? '', SQLITE3_TEXT);
    
    $stmt->execute();
}

// دالة جلب الإدارات
function getDepartments($db) {
    $result = $db->query("
        SELECT
            d.*,
            COUNT(e.id) as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        GROUP BY d.id
        ORDER BY d.department_name
    ");

    $departments = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $departments[] = $row;
    }

    echo json_encode(['success' => true, 'departments' => $departments]);
}

// دالة إضافة إدارة جديدة
function addDepartment($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['department_name'])) {
        echo json_encode(['error' => 'اسم الإدارة مطلوب']);
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO departments (department_name, department_code, manager_name, manager_position, description)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->bindValue(1, $data['department_name'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['department_code'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(3, $data['manager_name'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(4, $data['manager_position'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(5, $data['description'] ?? '', SQLITE3_TEXT);

    if ($stmt->execute()) {
        $departmentId = $db->lastInsertRowID();
        logActivity($db, 'إضافة إدارة', 'departments', $departmentId, null, $data);
        echo json_encode(['success' => true, 'department_id' => $departmentId]);
    } else {
        echo json_encode(['error' => 'فشل في إضافة الإدارة']);
    }
}

// دالة جلب أنواع المرفقات
function getAttachmentTypes($db) {
    $result = $db->query("
        SELECT
            at.*,
            COUNT(ea.id) as usage_count
        FROM attachment_types at
        LEFT JOIN employee_attachments ea ON at.id = ea.attachment_type_id
        GROUP BY at.id
        ORDER BY at.is_default DESC, at.type_name_ar
    ");

    $types = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $types[] = $row;
    }

    echo json_encode(['success' => true, 'attachment_types' => $types]);
}

// دالة جلب مرفقات موظف محدد
function getEmployeeAttachments($db) {
    $employeeId = $_GET['employee_id'] ?? 0;

    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }

    $result = $db->query("
        SELECT
            ea.*,
            at.type_name_ar,
            at.icon_class,
            at.is_required,
            at.file_extensions,
            at.max_file_size
        FROM employee_attachments ea
        JOIN attachment_types at ON ea.attachment_type_id = at.id
        WHERE ea.employee_id = {$employeeId}
        ORDER BY at.is_required DESC, ea.created_at DESC
    ");

    $attachments = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $attachments[] = $row;
    }

    echo json_encode(['success' => true, 'attachments' => $attachments]);
}

// دالة تحديث حالة المرفق
function updateAttachmentStatus($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $db->prepare("
        UPDATE employee_attachments
        SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");

    $stmt->bindValue(1, $data['status'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['notes'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(3, $data['id'], SQLITE3_INTEGER);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'فشل في تحديث حالة المرفق']);
    }
}

// دالة إنشاء QR Code للموظف
function generateQRCode($db) {
    $employeeId = $_POST['employee_id'] ?? 0;
    $includeAttachments = $_POST['include_attachments'] ?? 1;
    $includeContactInfo = $_POST['include_contact_info'] ?? 1;

    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }

    // جلب بيانات الموظف
    $stmt = $db->prepare("
        SELECT e.*, d.department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = ?
    ");
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $employee = $result->fetchArray(SQLITE3_ASSOC);

    if (!$employee) {
        echo json_encode(['error' => 'الموظف غير موجود']);
        return;
    }

    // إنشاء بيانات QR Code
    $qrData = [
        'employee_name' => $employee['employee_name'],
        'national_id' => $employee['national_id'],
        'position' => $employee['position'],
        'department' => $employee['department_name'],
        'generated_at' => date('Y-m-d H:i:s')
    ];

    if ($includeContactInfo) {
        $qrData['phone'] = $employee['phone'];
        $qrData['email'] = $employee['email'];
    }

    if ($includeAttachments) {
        // جلب حالة المرفقات
        $stmt = $db->prepare("
            SELECT at.type_name_ar, ea.status
            FROM employee_attachments ea
            JOIN attachment_types at ON ea.attachment_type_id = at.id
            WHERE ea.employee_id = ?
        ");
        $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
        $result = $stmt->execute();

        $attachments = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $attachments[$row['type_name_ar']] = $row['status'];
        }
        $qrData['attachments'] = $attachments;
    }

    $qrDataJson = json_encode($qrData, JSON_UNESCAPED_UNICODE);

    // حفظ QR Code في قاعدة البيانات
    $stmt = $db->prepare("
        INSERT INTO employee_qr_codes (
            employee_id, qr_code_data, includes_attachments, includes_contact_info
        ) VALUES (?, ?, ?, ?)
    ");

    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $stmt->bindValue(2, $qrDataJson, SQLITE3_TEXT);
    $stmt->bindValue(3, $includeAttachments, SQLITE3_INTEGER);
    $stmt->bindValue(4, $includeContactInfo, SQLITE3_INTEGER);

    if ($stmt->execute()) {
        $qrCodeId = $db->lastInsertRowID();
        echo json_encode([
            'success' => true,
            'qr_code_id' => $qrCodeId,
            'qr_data' => $qrDataJson
        ]);
    } else {
        echo json_encode(['error' => 'فشل في إنشاء QR Code']);
    }
}

// دالة جلب إحصائيات النظام
function getSystemStats($db) {
    $stats = [];

    // الإحصائيات الأساسية
    $queries = [
        'total_employees' => "SELECT COUNT(*) as count FROM employees",
        'active_employees' => "SELECT COUNT(*) as count FROM employees WHERE status = 'نشط'",
        'total_departments' => "SELECT COUNT(*) as count FROM departments",
        'total_attachments' => "SELECT COUNT(*) as count FROM employee_attachments",
        'completed_attachments' => "SELECT COUNT(*) as count FROM employee_attachments WHERE status = 'موجود'",
        'total_qr_codes' => "SELECT COUNT(*) as count FROM employee_qr_codes",
        'active_qr_codes' => "SELECT COUNT(*) as count FROM employee_qr_codes WHERE is_active = 1"
    ];

    foreach ($queries as $key => $query) {
        $result = $db->query($query);
        $stats[$key] = $result->fetchArray(SQLITE3_ASSOC)['count'];
    }

    // إحصائيات متقدمة
    $result = $db->query("
        SELECT
            d.department_name,
            COUNT(e.id) as employee_count,
            AVG(CASE WHEN ea.status = 'موجود' THEN 1.0 ELSE 0.0 END) * 100 as completion_rate
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN employee_attachments ea ON e.id = ea.employee_id
        GROUP BY d.id, d.department_name
        ORDER BY employee_count DESC
    ");

    $departmentStats = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $departmentStats[] = $row;
    }

    $stats['department_details'] = $departmentStats;

    echo json_encode(['success' => true, 'stats' => $stats]);
}

// دالة جلب بيانات لوحة التحكم
function getDashboardData($db) {
    $dashboard = [];

    // الإحصائيات السريعة
    $dashboard['quick_stats'] = [
        'employees' => $db->query("SELECT COUNT(*) as count FROM employees")->fetchArray(SQLITE3_ASSOC)['count'],
        'departments' => $db->query("SELECT COUNT(*) as count FROM departments")->fetchArray(SQLITE3_ASSOC)['count'],
        'attachments' => $db->query("SELECT COUNT(*) as count FROM employee_attachments WHERE status = 'موجود'")->fetchArray(SQLITE3_ASSOC)['count'],
        'qr_codes' => $db->query("SELECT COUNT(*) as count FROM employee_qr_codes WHERE is_active = 1")->fetchArray(SQLITE3_ASSOC)['count']
    ];

    // آخر الموظفين المضافين
    $result = $db->query("
        SELECT e.*, d.department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        ORDER BY e.created_at DESC
        LIMIT 5
    ");

    $recentEmployees = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $recentEmployees[] = $row;
    }
    $dashboard['recent_employees'] = $recentEmployees;

    // آخر النشاطات
    $result = $db->query("
        SELECT * FROM activity_log
        ORDER BY created_at DESC
        LIMIT 10
    ");

    $recentActivities = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $recentActivities[] = $row;
    }
    $dashboard['recent_activities'] = $recentActivities;

    echo json_encode(['success' => true, 'dashboard' => $dashboard]);
}
?>
