<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// معالجة طلبات OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعدادات قاعدة البيانات
$db_path = 'db/cards.db';
$output_dir = 'output/';
$backup_dir = 'backups/';

// التأكد من وجود المجلدات
if (!file_exists('backups')) mkdir('backups', 0755, true);

// الاتصال بقاعدة البيانات
function getDatabase() {
    global $db_path;
    try {
        $pdo = new PDO("sqlite:$db_path");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        return false;
    }
}

// معالجة طلبات GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'stats':
            getStats();
            break;
        case 'recent_cards':
            getRecentCards();
            break;
        case 'all_cards':
            getAllCards();
            break;
        case 'export_cards':
            exportCards();
            break;
        case 'get_templates':
            getTemplates();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'إجراء غير مدعوم']);
    }
}

// معالجة طلبات POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'بيانات غير صحيحة']);
        exit();
    }
    
    $action = $data['action'] ?? '';
    
    switch ($action) {
        case 'delete_card':
            deleteCard($data['card_id']);
            break;
        case 'delete_all_cards':
            deleteAllCards();
            break;
        case 'add_template':
            addTemplate($data);
            break;
        case 'delete_template':
            deleteTemplate($data['template_id']);
            break;
        case 'save_organization':
            saveOrganizationData($data['data']);
            break;
        case 'save_coordinates':
            saveCoordinates($data['template'], $data['coordinates']);
            break;
        case 'create_backup':
            createBackup();
            break;
        case 'restore_backup':
            restoreBackup();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'إجراء غير مدعوم']);
    }
}

// الحصول على الإحصائيات
function getStats() {
    $pdo = getDatabase();
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
        return;
    }
    
    try {
        // إجمالي البطاقات
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM cards");
        $total_cards = $stmt->fetch()['total'];
        
        // بطاقات اليوم
        $stmt = $pdo->query("SELECT COUNT(*) as today FROM cards WHERE DATE(created_at) = DATE('now')");
        $today_cards = $stmt->fetch()['today'];
        
        // عدد القوالب
        $total_templates = 3; // يمكن تحديثه لاحقاً
        
        // حالة النظام
        $system_status = '✅';
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_cards' => $total_cards,
                'today_cards' => $today_cards,
                'total_templates' => $total_templates,
                'system_status' => $system_status
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في جلب الإحصائيات']);
    }
}

// الحصول على آخر البطاقات
function getRecentCards() {
    $pdo = getDatabase();
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
        return;
    }
    
    try {
        $limit = $_GET['limit'] ?? 5;
        $stmt = $pdo->prepare("SELECT * FROM cards ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$limit]);
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $cards]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في جلب البطاقات']);
    }
}

// الحصول على جميع البطاقات
function getAllCards() {
    $pdo = getDatabase();
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
        return;
    }
    
    try {
        $stmt = $pdo->query("SELECT * FROM cards ORDER BY created_at DESC");
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $cards]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في جلب البطاقات']);
    }
}

// حذف بطاقة
function deleteCard($cardId) {
    $pdo = getDatabase();
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
        return;
    }
    
    try {
        // الحصول على معلومات البطاقة
        $stmt = $pdo->prepare("SELECT output_file, photo_path FROM cards WHERE id = ?");
        $stmt->execute([$cardId]);
        $card = $stmt->fetch();
        
        if ($card) {
            // حذف الملفات
            if ($card['output_file'] && file_exists('output/' . $card['output_file'])) {
                unlink('output/' . $card['output_file']);
            }
            if ($card['photo_path'] && file_exists($card['photo_path'])) {
                unlink($card['photo_path']);
            }
            
            // حذف السجل من قاعدة البيانات
            $stmt = $pdo->prepare("DELETE FROM cards WHERE id = ?");
            $stmt->execute([$cardId]);
            
            echo json_encode(['success' => true, 'message' => 'تم حذف البطاقة بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'البطاقة غير موجودة']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في حذف البطاقة']);
    }
}

// حذف جميع البطاقات
function deleteAllCards() {
    $pdo = getDatabase();
    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
        return;
    }
    
    try {
        // حذف جميع الملفات
        $stmt = $pdo->query("SELECT output_file, photo_path FROM cards");
        $cards = $stmt->fetchAll();
        
        foreach ($cards as $card) {
            if ($card['output_file'] && file_exists('output/' . $card['output_file'])) {
                unlink('output/' . $card['output_file']);
            }
            if ($card['photo_path'] && file_exists($card['photo_path'])) {
                unlink($card['photo_path']);
            }
        }
        
        // حذف جميع السجلات
        $pdo->exec("DELETE FROM cards");
        
        echo json_encode(['success' => true, 'message' => 'تم حذف جميع البطاقات بنجاح']);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في حذف البطاقات']);
    }
}

// تصدير البطاقات
function exportCards() {
    $pdo = getDatabase();
    if (!$pdo) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'خطأ في قاعدة البيانات']);
        return;
    }
    
    try {
        $stmt = $pdo->query("SELECT * FROM cards ORDER BY created_at DESC");
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // إنشاء ملف CSV
        $filename = 'cards_export_' . date('Y-m-d_H-i-s') . '.csv';
        
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        $output = fopen('php://output', 'w');
        
        // إضافة BOM للدعم العربي
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        // العناوين
        fputcsv($output, [
            'ID', 'اسم الموظف', 'المنصب', 'الإدارة', 'المؤسسة',
            'تاريخ البداية', 'تاريخ النهاية', 'الموقع', 'القالب', 'تاريخ الإنشاء'
        ]);
        
        // البيانات
        foreach ($cards as $card) {
            fputcsv($output, [
                $card['id'],
                $card['employee_name'],
                $card['position'],
                $card['department'],
                $card['organization'],
                $card['start_date'],
                $card['end_date'],
                $card['location'],
                $card['template'],
                $card['created_at']
            ]);
        }
        
        fclose($output);
        
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'خطأ في تصدير البيانات']);
    }
}

// إضافة قالب جديد
function addTemplate($data) {
    try {
        // التحقق من البيانات المطلوبة
        if (empty($data['name']) || empty($data['id'])) {
            echo json_encode(['success' => false, 'message' => 'اسم القالب ومعرفه مطلوبان']);
            return;
        }

        // حفظ القالب في ملف التكوين
        $templates_file = 'templates_config.json';

        $templates = [];
        if (file_exists($templates_file)) {
            $content = file_get_contents($templates_file);
            $templates = json_decode($content, true) ?: [];
        }

        // التحقق من عدم وجود القالب مسبقاً
        if (isset($templates[$data['id']])) {
            echo json_encode(['success' => false, 'message' => 'معرف القالب موجود مسبقاً']);
            return;
        }

        $templates[$data['id']] = [
            'name' => $data['name'],
            'start_color' => $data['start_color'] ?? '#667eea',
            'end_color' => $data['end_color'] ?? '#764ba2',
            'card_size' => $data['card_size'] ?? 'standard',
            'created_at' => date('Y-m-d H:i:s')
        ];

        if (file_put_contents($templates_file, json_encode($templates, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'تم إضافة القالب بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في حفظ القالب']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في إضافة القالب: ' . $e->getMessage()]);
    }
}

// حذف قالب
function deleteTemplate($templateId) {
    try {
        if (empty($templateId)) {
            echo json_encode(['success' => false, 'message' => 'معرف القالب مطلوب']);
            return;
        }

        // منع حذف القوالب الافتراضية
        $defaultTemplates = ['template1', 'template2', 'template3'];
        if (in_array($templateId, $defaultTemplates)) {
            echo json_encode(['success' => false, 'message' => 'لا يمكن حذف القوالب الافتراضية']);
            return;
        }

        $templates_file = 'templates_config.json';

        if (!file_exists($templates_file)) {
            echo json_encode(['success' => false, 'message' => 'ملف القوالب غير موجود']);
            return;
        }

        $templates = json_decode(file_get_contents($templates_file), true) ?: [];

        if (!isset($templates[$templateId])) {
            echo json_encode(['success' => false, 'message' => 'القالب غير موجود']);
            return;
        }

        unset($templates[$templateId]);

        if (file_put_contents($templates_file, json_encode($templates, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'تم حذف القالب بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في حفظ التغييرات']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في حذف القالب: ' . $e->getMessage()]);
    }
}

// الحصول على القوالب
function getTemplates() {
    try {
        // القوالب الافتراضية
        $default_templates = [
            'template1' => [
                'name' => 'القالب الأزرق الكلاسيكي',
                'start_color' => '#667eea',
                'end_color' => '#764ba2',
                'card_size' => 'standard'
            ],
            'template2' => [
                'name' => 'القالب الأخضر الحديث',
                'start_color' => '#27ae60',
                'end_color' => '#2ecc71',
                'card_size' => 'standard'
            ],
            'template3' => [
                'name' => 'القالب الذهبي الفاخر',
                'start_color' => '#f39c12',
                'end_color' => '#e67e22',
                'card_size' => 'standard'
            ]
        ];

        $templates_file = 'templates_config.json';

        if (file_exists($templates_file)) {
            $custom_templates = json_decode(file_get_contents($templates_file), true) ?: [];
            // دمج القوالب الافتراضية مع المخصصة
            $all_templates = array_merge($default_templates, $custom_templates);
        } else {
            $all_templates = $default_templates;
        }

        echo json_encode(['success' => true, 'data' => $all_templates]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في جلب القوالب: ' . $e->getMessage()]);
    }
}

// إنشاء نسخة احتياطية
function createBackup() {
    global $backup_dir;
    
    try {
        $timestamp = date('Y-m-d_H-i-s');
        $backup_filename = "backup_$timestamp.zip";
        $backup_path = $backup_dir . $backup_filename;
        
        $zip = new ZipArchive();
        if ($zip->open($backup_path, ZipArchive::CREATE) !== TRUE) {
            throw new Exception('لا يمكن إنشاء ملف النسخة الاحتياطية');
        }
        
        // إضافة قاعدة البيانات
        if (file_exists('db/cards.db')) {
            $zip->addFile('db/cards.db', 'cards.db');
        }
        
        // إضافة ملفات البطاقات
        if (is_dir('output')) {
            $files = glob('output/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    $zip->addFile($file, 'output/' . basename($file));
                }
            }
        }
        
        // إضافة ملفات التكوين
        if (file_exists('templates_config.json')) {
            $zip->addFile('templates_config.json', 'templates_config.json');
        }
        
        $zip->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'تم إنشاء النسخة الاحتياطية بنجاح',
            'filename' => $backup_filename,
            'backup_url' => $backup_dir . $backup_filename
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في إنشاء النسخة الاحتياطية: ' . $e->getMessage()]);
    }
}

// حفظ بيانات المنشأة
function saveOrganizationData($data) {
    try {
        $organization_file = 'organization_data.json';

        // التحقق من البيانات المطلوبة
        if (empty($data['organizationName']) || empty($data['managerName']) || empty($data['managerPosition'])) {
            echo json_encode(['success' => false, 'message' => 'اسم المنشأة واسم المدير ومنصبه مطلوبان']);
            return;
        }

        // تنظيف البيانات والاحتفاظ بالحقول المطلوبة فقط
        $cleanData = [
            'organizationName' => trim($data['organizationName']),
            'managerName' => trim($data['managerName']),
            'managerPosition' => trim($data['managerPosition']),
            'logo' => $data['logo'] ?? null,
            'updated_at' => date('Y-m-d H:i:s'),
            'version' => '2.0'
        ];

        if (file_put_contents($organization_file, json_encode($cleanData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode([
                'success' => true,
                'message' => 'تم حفظ بيانات المنشأة بنجاح',
                'data' => $cleanData
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في حفظ البيانات']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في حفظ بيانات المنشأة: ' . $e->getMessage()]);
    }
}

// حفظ الإحداثيات
function saveCoordinates($template, $coordinates) {
    try {
        if (empty($template) || empty($coordinates)) {
            echo json_encode(['success' => false, 'message' => 'القالب والإحداثيات مطلوبان']);
            return;
        }

        $coordinates_file = "coordinates_{$template}.json";

        $coordinatesData = [
            'template' => $template,
            'coordinates' => $coordinates,
            'updated_at' => date('Y-m-d H:i:s'),
            'version' => '1.0'
        ];

        if (file_put_contents($coordinates_file, json_encode($coordinatesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            // حفظ نسخة عامة أيضاً
            file_put_contents('template_coordinates.json', json_encode($coordinatesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            echo json_encode(['success' => true, 'message' => 'تم حفظ الإحداثيات بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في حفظ الإحداثيات']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'خطأ في حفظ الإحداثيات: ' . $e->getMessage()]);
    }
}

// استعادة نسخة احتياطية
function restoreBackup() {
    // سيتم تنفيذها لاحقاً
    echo json_encode(['success' => false, 'message' => 'هذه الميزة قيد التطوير']);
}
?>
