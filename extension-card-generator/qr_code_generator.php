<?php
/**
 * نظام QR Code المتقدم
 * Advanced QR Code System
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
    $db->exec("PRAGMA foreign_keys = ON");
    
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    switch ($action) {
        case 'generateQRCode':
            generateQRCode($db);
            break;
        case 'getEmployeeQRCodes':
            getEmployeeQRCodes($db);
            break;
        case 'getQRCodeData':
            getQRCodeData($db);
            break;
        case 'updateQRCodeStatus':
            updateQRCodeStatus($db);
            break;
        case 'deleteQRCode':
            deleteQRCode($db);
            break;
        case 'generateBulkQRCodes':
            generateBulkQRCodes($db);
            break;
        default:
            echo json_encode(['error' => 'إجراء غير صحيح']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

// دالة إنشاء QR Code للموظف
function generateQRCode($db) {
    $employeeId = $_POST['employee_id'] ?? 0;
    $includeAttachments = $_POST['include_attachments'] ?? 1;
    $includeContactInfo = $_POST['include_contact_info'] ?? 1;
    $accessUrl = $_POST['access_url'] ?? '';
    $expiryDate = $_POST['expiry_date'] ?? null;
    
    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    // جلب بيانات الموظف
    $stmt = $db->prepare("
        SELECT e.*, d.department_name, d.department_code
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
        'version' => '2.0',
        'type' => 'employee_card',
        'employee' => [
            'id' => $employee['id'],
            'name' => $employee['employee_name'],
            'national_id' => $employee['national_id'],
            'employee_number' => $employee['employee_number'],
            'position' => $employee['position'],
            'nationality' => $employee['nationality'],
            'department' => [
                'name' => $employee['department_name'],
                'code' => $employee['department_code']
            ],
            'hire_date' => $employee['hire_date'],
            'status' => $employee['status']
        ],
        'generated_at' => date('Y-m-d H:i:s'),
        'generated_by' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    // إضافة معلومات الاتصال إذا طُلب ذلك
    if ($includeContactInfo) {
        $qrData['contact'] = [
            'phone' => $employee['phone'],
            'email' => $employee['email'],
            'address' => $employee['address'],
            'emergency_contact' => $employee['emergency_contact'],
            'emergency_phone' => $employee['emergency_phone']
        ];
    }
    
    // إضافة حالة المرفقات إذا طُلب ذلك
    if ($includeAttachments) {
        $stmt = $db->prepare("
            SELECT 
                at.type_name_ar,
                at.type_name,
                at.icon_class,
                at.is_required,
                ea.status,
                ea.upload_date,
                ea.expiry_date
            FROM attachment_types at
            LEFT JOIN employee_attachments_new ea ON at.id = ea.attachment_type_id AND ea.employee_id = ?
            WHERE at.is_default = 1
            ORDER BY at.is_required DESC, at.type_name_ar
        ");
        $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
        $result = $stmt->execute();
        
        $attachments = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $attachments[] = [
                'type' => $row['type_name_ar'],
                'type_en' => $row['type_name'],
                'icon' => $row['icon_class'],
                'required' => (bool)$row['is_required'],
                'status' => $row['status'] ?? 'غير موجود',
                'upload_date' => $row['upload_date'],
                'expiry_date' => $row['expiry_date']
            ];
        }
        $qrData['attachments'] = $attachments;
        
        // إحصائيات المرفقات
        $totalAttachments = count($attachments);
        $completedAttachments = count(array_filter($attachments, function($att) {
            return $att['status'] === 'موجود';
        }));
        $requiredAttachments = count(array_filter($attachments, function($att) {
            return $att['required'];
        }));
        $completedRequiredAttachments = count(array_filter($attachments, function($att) {
            return $att['required'] && $att['status'] === 'موجود';
        }));
        
        $qrData['attachment_stats'] = [
            'total' => $totalAttachments,
            'completed' => $completedAttachments,
            'required' => $requiredAttachments,
            'completed_required' => $completedRequiredAttachments,
            'completion_rate' => $totalAttachments > 0 ? round(($completedAttachments / $totalAttachments) * 100, 2) : 0,
            'required_completion_rate' => $requiredAttachments > 0 ? round(($completedRequiredAttachments / $requiredAttachments) * 100, 2) : 0
        ];
    }
    
    // إضافة رابط الوصول إذا تم توفيره
    if ($accessUrl) {
        $qrData['access_url'] = $accessUrl;
    }
    
    // تحويل البيانات إلى JSON
    $qrDataJson = json_encode($qrData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    // إنشاء معرف فريد للـ QR Code
    $qrCodeHash = md5($qrDataJson . time());
    
    // حفظ QR Code في قاعدة البيانات
    $stmt = $db->prepare("
        INSERT INTO employee_qr_codes (
            employee_id, qr_code_data, includes_attachments, includes_contact_info, 
            access_url, expiry_date, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
    ");
    
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $stmt->bindValue(2, $qrDataJson, SQLITE3_TEXT);
    $stmt->bindValue(3, $includeAttachments, SQLITE3_INTEGER);
    $stmt->bindValue(4, $includeContactInfo, SQLITE3_INTEGER);
    $stmt->bindValue(5, $accessUrl, SQLITE3_TEXT);
    $stmt->bindValue(6, $expiryDate, SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        $qrCodeId = $db->lastInsertRowID();
        
        // تسجيل العملية في سجل النشاطات
        logActivity($db, 'إنشاء QR Code', 'employee_qr_codes', $qrCodeId, null, [
            'employee_id' => $employeeId,
            'includes_attachments' => $includeAttachments,
            'includes_contact_info' => $includeContactInfo
        ]);
        
        echo json_encode([
            'success' => true, 
            'qr_code_id' => $qrCodeId,
            'qr_data' => $qrDataJson,
            'qr_hash' => $qrCodeHash,
            'message' => 'تم إنشاء QR Code بنجاح'
        ]);
    } else {
        echo json_encode(['error' => 'فشل في إنشاء QR Code']);
    }
}

// دالة جلب QR Codes الخاصة بموظف
function getEmployeeQRCodes($db) {
    $employeeId = $_GET['employee_id'] ?? 0;
    
    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    $result = $db->query("
        SELECT 
            qr.*,
            e.employee_name,
            e.national_id,
            e.position
        FROM employee_qr_codes qr
        JOIN employees e ON qr.employee_id = e.id
        WHERE qr.employee_id = {$employeeId}
        ORDER BY qr.created_at DESC
    ");
    
    $qrCodes = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        // فك تشفير بيانات QR Code
        $qrData = json_decode($row['qr_code_data'], true);
        
        // التحقق من انتهاء الصلاحية
        $isExpired = false;
        if ($row['expiry_date']) {
            $isExpired = strtotime($row['expiry_date']) < time();
        }
        
        $row['is_expired'] = $isExpired;
        $row['qr_data_parsed'] = $qrData;
        $row['created_at_formatted'] = formatDate($row['created_at']);
        
        $qrCodes[] = $row;
    }
    
    echo json_encode(['success' => true, 'qr_codes' => $qrCodes]);
}

// دالة جلب بيانات QR Code محدد
function getQRCodeData($db) {
    $qrCodeId = $_GET['id'] ?? 0;
    
    if (!$qrCodeId) {
        echo json_encode(['error' => 'معرف QR Code مطلوب']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT 
            qr.*,
            e.employee_name,
            e.national_id,
            e.position,
            d.department_name
        FROM employee_qr_codes qr
        JOIN employees e ON qr.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE qr.id = ?
    ");
    $stmt->bindValue(1, $qrCodeId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $qrCode = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$qrCode) {
        echo json_encode(['error' => 'QR Code غير موجود']);
        return;
    }
    
    // فك تشفير بيانات QR Code
    $qrData = json_decode($qrCode['qr_code_data'], true);
    
    // التحقق من انتهاء الصلاحية
    $isExpired = false;
    if ($qrCode['expiry_date']) {
        $isExpired = strtotime($qrCode['expiry_date']) < time();
    }
    
    $qrCode['is_expired'] = $isExpired;
    $qrCode['qr_data_parsed'] = $qrData;
    $qrCode['created_at_formatted'] = formatDate($qrCode['created_at']);
    
    echo json_encode(['success' => true, 'qr_code' => $qrCode]);
}

// دالة تحديث حالة QR Code
function updateQRCodeStatus($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['is_active'])) {
        echo json_encode(['error' => 'بيانات غير مكتملة']);
        return;
    }
    
    $stmt = $db->prepare("
        UPDATE employee_qr_codes 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    
    $stmt->bindValue(1, $data['is_active'], SQLITE3_INTEGER);
    $stmt->bindValue(2, $data['id'], SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        logActivity($db, 'تحديث حالة QR Code', 'employee_qr_codes', $data['id'], null, $data);
        echo json_encode(['success' => true, 'message' => 'تم تحديث حالة QR Code']);
    } else {
        echo json_encode(['error' => 'فشل في تحديث حالة QR Code']);
    }
}

// دالة حذف QR Code
function deleteQRCode($db) {
    $qrCodeId = $_POST['id'] ?? $_GET['id'] ?? 0;
    
    if (!$qrCodeId) {
        echo json_encode(['error' => 'معرف QR Code مطلوب']);
        return;
    }
    
    // جلب بيانات QR Code قبل الحذف
    $stmt = $db->prepare("SELECT * FROM employee_qr_codes WHERE id = ?");
    $stmt->bindValue(1, $qrCodeId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $qrCodeData = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$qrCodeData) {
        echo json_encode(['error' => 'QR Code غير موجود']);
        return;
    }
    
    // حذف QR Code
    $stmt = $db->prepare("DELETE FROM employee_qr_codes WHERE id = ?");
    $stmt->bindValue(1, $qrCodeId, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        logActivity($db, 'حذف QR Code', 'employee_qr_codes', $qrCodeId, $qrCodeData, null);
        echo json_encode(['success' => true, 'message' => 'تم حذف QR Code']);
    } else {
        echo json_encode(['error' => 'فشل في حذف QR Code']);
    }
}

// دالة إنشاء QR Codes مجمعة
function generateBulkQRCodes($db) {
    $departmentId = $_POST['department_id'] ?? null;
    $includeAttachments = $_POST['include_attachments'] ?? 1;
    $includeContactInfo = $_POST['include_contact_info'] ?? 1;
    
    // جلب الموظفين
    $sql = "SELECT id FROM employees WHERE status = 'نشط'";
    if ($departmentId) {
        $sql .= " AND department_id = {$departmentId}";
    }
    
    $result = $db->query($sql);
    $employeeIds = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $employeeIds[] = $row['id'];
    }
    
    if (empty($employeeIds)) {
        echo json_encode(['error' => 'لا توجد موظفين للمعالجة']);
        return;
    }
    
    $successCount = 0;
    $errors = [];
    
    foreach ($employeeIds as $employeeId) {
        // محاكاة إنشاء QR Code لكل موظف
        $_POST['employee_id'] = $employeeId;
        $_POST['include_attachments'] = $includeAttachments;
        $_POST['include_contact_info'] = $includeContactInfo;
        
        ob_start();
        generateQRCode($db);
        $result = ob_get_clean();
        
        $resultData = json_decode($result, true);
        if ($resultData && $resultData['success']) {
            $successCount++;
        } else {
            $errors[] = "خطأ في الموظف ID {$employeeId}: " . ($resultData['error'] ?? 'خطأ غير معروف');
        }
    }
    
    echo json_encode([
        'success' => true,
        'processed' => count($employeeIds),
        'successful' => $successCount,
        'errors' => $errors,
        'message' => "تم إنشاء {$successCount} من أصل " . count($employeeIds) . " QR Code"
    ]);
}

// دوال مساعدة
function formatDate($dateString) {
    if (!$dateString) return 'غير محدد';
    
    $date = new DateTime($dateString);
    return $date->format('Y-m-d H:i:s');
}

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
?>
