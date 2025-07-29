<?php
/**
 * نظام إدارة المرفقات المتقدم
 * Advanced Attachment Management System
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
        case 'uploadAttachment':
            uploadAttachment($db);
            break;
        case 'getEmployeeAttachments':
            getEmployeeAttachments($db);
            break;
        case 'updateAttachmentStatus':
            updateAttachmentStatus($db);
            break;
        case 'deleteAttachment':
            deleteAttachment($db);
            break;
        case 'downloadAttachment':
            downloadAttachment($db);
            break;
        case 'getAttachmentStats':
            getAttachmentStats($db);
            break;
        default:
            echo json_encode(['error' => 'إجراء غير صحيح']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

// دالة رفع المرفق
function uploadAttachment($db) {
    if (!isset($_FILES['attachment']) || !isset($_POST['employee_id']) || !isset($_POST['attachment_type_id'])) {
        echo json_encode(['error' => 'بيانات غير مكتملة']);
        return;
    }
    
    $employeeId = $_POST['employee_id'];
    $attachmentTypeId = $_POST['attachment_type_id'];
    $file = $_FILES['attachment'];
    $notes = $_POST['notes'] ?? '';
    
    // التحقق من الملف
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['error' => 'خطأ في رفع الملف']);
        return;
    }
    
    // جلب معلومات نوع المرفق
    $stmt = $db->prepare("SELECT * FROM attachment_types WHERE id = ?");
    $stmt->bindValue(1, $attachmentTypeId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $attachmentType = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$attachmentType) {
        echo json_encode(['error' => 'نوع المرفق غير موجود']);
        return;
    }
    
    // التحقق من نوع الملف
    $allowedExtensions = explode(',', $attachmentType['file_extensions']);
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($fileExtension, $allowedExtensions)) {
        echo json_encode(['error' => 'نوع الملف غير مسموح. الأنواع المسموحة: ' . $attachmentType['file_extensions']]);
        return;
    }
    
    // التحقق من حجم الملف
    if ($file['size'] > $attachmentType['max_file_size']) {
        $maxSizeMB = round($attachmentType['max_file_size'] / 1024 / 1024, 2);
        echo json_encode(['error' => "حجم الملف كبير جداً. الحد الأقصى: {$maxSizeMB} ميجابايت"]);
        return;
    }
    
    // إنشاء مجلد المرفقات إذا لم يكن موجوداً
    $uploadDir = "attachments/employee_{$employeeId}/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // إنشاء اسم ملف فريد
    $fileName = time() . '_' . $attachmentTypeId . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // رفع الملف
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        // حفظ معلومات المرفق في قاعدة البيانات
        $stmt = $db->prepare("
            INSERT OR REPLACE INTO employee_attachments_new 
            (employee_id, attachment_type_id, file_name, file_path, file_size, file_type, status, upload_date, notes, uploaded_by) 
            VALUES (?, ?, ?, ?, ?, ?, 'موجود', CURRENT_TIMESTAMP, ?, ?)
        ");
        
        $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
        $stmt->bindValue(2, $attachmentTypeId, SQLITE3_INTEGER);
        $stmt->bindValue(3, $file['name'], SQLITE3_TEXT);
        $stmt->bindValue(4, $filePath, SQLITE3_TEXT);
        $stmt->bindValue(5, $file['size'], SQLITE3_INTEGER);
        $stmt->bindValue(6, $file['type'], SQLITE3_TEXT);
        $stmt->bindValue(7, $notes, SQLITE3_TEXT);
        $stmt->bindValue(8, $_SERVER['REMOTE_ADDR'] ?? 'unknown', SQLITE3_TEXT);
        
        if ($stmt->execute()) {
            $attachmentId = $db->lastInsertRowID();
            
            // تسجيل العملية في سجل النشاطات
            logActivity($db, 'رفع مرفق', 'employee_attachments_new', $attachmentId, null, [
                'employee_id' => $employeeId,
                'attachment_type_id' => $attachmentTypeId,
                'file_name' => $file['name']
            ]);
            
            echo json_encode([
                'success' => true, 
                'attachment_id' => $attachmentId,
                'message' => 'تم رفع المرفق بنجاح'
            ]);
        } else {
            // حذف الملف في حالة فشل حفظ البيانات
            unlink($filePath);
            echo json_encode(['error' => 'فشل في حفظ معلومات المرفق']);
        }
    } else {
        echo json_encode(['error' => 'فشل في رفع الملف']);
    }
}

// دالة جلب مرفقات الموظف
function getEmployeeAttachments($db) {
    $employeeId = $_GET['employee_id'] ?? 0;
    
    if (!$employeeId) {
        echo json_encode(['error' => 'معرف الموظف مطلوب']);
        return;
    }
    
    // جلب المرفقات من الجدول الجديد أولاً
    $result = $db->query("
        SELECT 
            ea.*,
            at.type_name_ar,
            at.icon_class,
            at.is_required,
            at.file_extensions,
            at.max_file_size
        FROM employee_attachments_new ea
        JOIN attachment_types at ON ea.attachment_type_id = at.id
        WHERE ea.employee_id = {$employeeId}
        ORDER BY at.is_required DESC, ea.created_at DESC
    ");
    
    $attachments = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        // التحقق من وجود الملف
        if ($row['file_path'] && file_exists($row['file_path'])) {
            $row['file_exists'] = true;
            $row['file_size_formatted'] = formatFileSize($row['file_size']);
        } else {
            $row['file_exists'] = false;
            $row['status'] = 'غير موجود';
        }
        
        $attachments[] = $row;
    }
    
    // إذا لم توجد مرفقات، إنشاء المرفقات الافتراضية
    if (empty($attachments)) {
        createDefaultAttachmentsForEmployee($db, $employeeId);
        
        // إعادة جلب المرفقات
        $result = $db->query("
            SELECT 
                ea.*,
                at.type_name_ar,
                at.icon_class,
                at.is_required,
                at.file_extensions,
                at.max_file_size
            FROM employee_attachments_new ea
            JOIN attachment_types at ON ea.attachment_type_id = at.id
            WHERE ea.employee_id = {$employeeId}
            ORDER BY at.is_required DESC, ea.created_at DESC
        ");
        
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $row['file_exists'] = false;
            $attachments[] = $row;
        }
    }
    
    echo json_encode(['success' => true, 'attachments' => $attachments]);
}

// دالة إنشاء المرفقات الافتراضية للموظف
function createDefaultAttachmentsForEmployee($db, $employeeId) {
    $stmt = $db->prepare("
        INSERT INTO employee_attachments_new (employee_id, attachment_type_id, status)
        SELECT ?, id, 'غير موجود'
        FROM attachment_types 
        WHERE is_default = 1
    ");
    $stmt->bindValue(1, $employeeId, SQLITE3_INTEGER);
    $stmt->execute();
}

// دالة تحديث حالة المرفق
function updateAttachmentStatus($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['status'])) {
        echo json_encode(['error' => 'بيانات غير مكتملة']);
        return;
    }
    
    $stmt = $db->prepare("
        UPDATE employee_attachments_new 
        SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    
    $stmt->bindValue(1, $data['status'], SQLITE3_TEXT);
    $stmt->bindValue(2, $data['notes'] ?? '', SQLITE3_TEXT);
    $stmt->bindValue(3, $data['id'], SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        logActivity($db, 'تحديث حالة مرفق', 'employee_attachments_new', $data['id'], null, $data);
        echo json_encode(['success' => true, 'message' => 'تم تحديث حالة المرفق']);
    } else {
        echo json_encode(['error' => 'فشل في تحديث حالة المرفق']);
    }
}

// دالة حذف المرفق
function deleteAttachment($db) {
    $attachmentId = $_POST['id'] ?? $_GET['id'] ?? 0;
    
    if (!$attachmentId) {
        echo json_encode(['error' => 'معرف المرفق مطلوب']);
        return;
    }
    
    // جلب معلومات المرفق
    $stmt = $db->prepare("SELECT * FROM employee_attachments_new WHERE id = ?");
    $stmt->bindValue(1, $attachmentId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $attachment = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$attachment) {
        echo json_encode(['error' => 'المرفق غير موجود']);
        return;
    }
    
    // حذف الملف من النظام
    if ($attachment['file_path'] && file_exists($attachment['file_path'])) {
        unlink($attachment['file_path']);
    }
    
    // حذف المرفق من قاعدة البيانات
    $stmt = $db->prepare("DELETE FROM employee_attachments_new WHERE id = ?");
    $stmt->bindValue(1, $attachmentId, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        logActivity($db, 'حذف مرفق', 'employee_attachments_new', $attachmentId, $attachment, null);
        echo json_encode(['success' => true, 'message' => 'تم حذف المرفق']);
    } else {
        echo json_encode(['error' => 'فشل في حذف المرفق']);
    }
}

// دالة تحميل المرفق
function downloadAttachment($db) {
    $attachmentId = $_GET['id'] ?? 0;
    
    if (!$attachmentId) {
        echo json_encode(['error' => 'معرف المرفق مطلوب']);
        return;
    }
    
    // جلب معلومات المرفق
    $stmt = $db->prepare("SELECT * FROM employee_attachments_new WHERE id = ?");
    $stmt->bindValue(1, $attachmentId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $attachment = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$attachment || !$attachment['file_path'] || !file_exists($attachment['file_path'])) {
        header('HTTP/1.0 404 Not Found');
        echo json_encode(['error' => 'الملف غير موجود']);
        return;
    }
    
    // تحديد نوع المحتوى
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $attachment['file_path']);
    finfo_close($finfo);
    
    // إرسال الملف
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $attachment['file_name'] . '"');
    header('Content-Length: ' . filesize($attachment['file_path']));
    
    readfile($attachment['file_path']);
    
    // تسجيل عملية التحميل
    logActivity($db, 'تحميل مرفق', 'employee_attachments_new', $attachmentId, null, [
        'file_name' => $attachment['file_name']
    ]);
}

// دالة جلب إحصائيات المرفقات
function getAttachmentStats($db) {
    $stats = [];
    
    // إجمالي المرفقات
    $result = $db->query("SELECT COUNT(*) as total FROM employee_attachments_new");
    $stats['total_attachments'] = $result->fetchArray(SQLITE3_ASSOC)['total'];
    
    // المرفقات المكتملة
    $result = $db->query("SELECT COUNT(*) as completed FROM employee_attachments_new WHERE status = 'موجود'");
    $stats['completed_attachments'] = $result->fetchArray(SQLITE3_ASSOC)['completed'];
    
    // المرفقات المفقودة
    $result = $db->query("SELECT COUNT(*) as missing FROM employee_attachments_new WHERE status = 'غير موجود'");
    $stats['missing_attachments'] = $result->fetchArray(SQLITE3_ASSOC)['missing'];
    
    // إحصائيات حسب النوع
    $result = $db->query("
        SELECT 
            at.type_name_ar,
            COUNT(ea.id) as total,
            SUM(CASE WHEN ea.status = 'موجود' THEN 1 ELSE 0 END) as completed
        FROM attachment_types at
        LEFT JOIN employee_attachments_new ea ON at.id = ea.attachment_type_id
        GROUP BY at.id, at.type_name_ar
        ORDER BY completed DESC
    ");
    
    $typeStats = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $typeStats[] = $row;
    }
    $stats['by_type'] = $typeStats;
    
    echo json_encode(['success' => true, 'stats' => $stats]);
}

// دوال مساعدة
function formatFileSize($bytes) {
    if ($bytes >= 1073741824) {
        return number_format($bytes / 1073741824, 2) . ' جيجابايت';
    } elseif ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' ميجابايت';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' كيلوبايت';
    } else {
        return $bytes . ' بايت';
    }
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
