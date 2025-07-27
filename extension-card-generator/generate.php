<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// معالجة طلبات OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// تسجيل معلومات الطلب للتشخيص
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("Content type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log("Raw input: " . file_get_contents('php://input'));

// إعدادات قاعدة البيانات
$db_path = 'db/cards.db';
$output_dir = 'output/';
$templates_dir = 'templates/';
$fonts_dir = 'fonts/';

// إعدادات القوالب
$templates_config = [
    'template1' => [
        'name' => 'القالب الأزرق الكلاسيكي',
        'start_color' => [102, 126, 234],
        'end_color' => [118, 75, 162]
    ],
    'template2' => [
        'name' => 'القالب الأخضر الحديث',
        'start_color' => [39, 174, 96],
        'end_color' => [46, 204, 113]
    ],
    'template3' => [
        'name' => 'القالب الذهبي الفاخر',
        'start_color' => [243, 156, 18],
        'end_color' => [230, 126, 34]
    ]
];

// التأكد من وجود المجلدات
if (!file_exists('db')) mkdir('db', 0755, true);
if (!file_exists($output_dir)) mkdir($output_dir, 0755, true);
if (!file_exists($templates_dir)) mkdir($templates_dir, 0755, true);
if (!file_exists($fonts_dir)) mkdir($fonts_dir, 0755, true);

// إنشاء قاعدة البيانات إذا لم تكن موجودة
function initDatabase($db_path) {
    try {
        $pdo = new PDO("sqlite:$db_path");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // إنشاء جدول البطاقات
        $sql = "CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            line1 TEXT NOT NULL,
            line2 TEXT NOT NULL,
            line3 TEXT NOT NULL,
            employee_name TEXT NOT NULL,
            department TEXT NOT NULL,
            position TEXT NOT NULL,
            organization TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            location TEXT NOT NULL,
            signature TEXT NOT NULL,
            template TEXT NOT NULL,
            photo_path TEXT,
            output_file TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        
        $pdo->exec($sql);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

// حفظ البيانات في قاعدة البيانات
function saveCardData($pdo, $data, $output_file, $photo_path = null) {
    try {
        $sql = "INSERT INTO cards (
            line1, line2, line3, employee_name, department, position,
            organization, start_date, end_date, location, signature,
            template, photo_path, output_file
        ) VALUES (
            :line1, :line2, :line3, :employee_name, :department, :position,
            :organization, :start_date, :end_date, :location, :signature,
            :template, :photo_path, :output_file
        )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':line1' => $data['line1'],
            ':line2' => $data['line2'],
            ':line3' => $data['line3'],
            ':employee_name' => $data['employeeName'],
            ':department' => $data['department'],
            ':position' => $data['position'],
            ':organization' => $data['organization'],
            ':start_date' => $data['startDate'],
            ':end_date' => $data['endDate'],
            ':location' => $data['location'],
            ':signature' => $data['signature'],
            ':template' => $data['template'],
            ':photo_path' => $photo_path,
            ':output_file' => $output_file
        ]);
        
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Save error: " . $e->getMessage());
        return false;
    }
}

// معالجة رفع الصورة
function processPhoto($photo_data, $employee_name) {
    global $output_dir;
    
    if (!$photo_data) return null;
    
    // فك تشفير base64
    $photo_data = str_replace('data:image/jpeg;base64,', '', $photo_data);
    $photo_data = str_replace('data:image/png;base64,', '', $photo_data);
    $photo_data = str_replace(' ', '+', $photo_data);
    $photo_binary = base64_decode($photo_data);
    
    if (!$photo_binary) return null;
    
    // إنشاء اسم ملف فريد
    $photo_filename = 'photo_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $employee_name) . '_' . time() . '.jpg';
    $photo_path = $output_dir . $photo_filename;
    
    // حفظ الصورة
    if (file_put_contents($photo_path, $photo_binary)) {
        return $photo_path;
    }
    
    return null;
}

// تحميل بيانات المنشأة
function getOrganizationData() {
    $organization_file = 'organization_data.json';
    if (file_exists($organization_file)) {
        return json_decode(file_get_contents($organization_file), true);
    }
    return null;
}

// تحميل الإحداثيات المحفوظة
function getTemplateCoordinates($template) {
    $coordinates_file = "coordinates_{$template}.json";
    if (file_exists($coordinates_file)) {
        $coordinatesData = json_decode(file_get_contents($coordinates_file), true);
        return $coordinatesData['coordinates'] ?? null;
    }

    // إحداثيات افتراضية
    return [
        'line1' => ['x' => 300, 'y' => 50, 'fontSize' => 24, 'fontWeight' => 'bold', 'textAlign' => 'center'],
        'line2' => ['x' => 300, 'y' => 90, 'fontSize' => 18, 'fontWeight' => 'normal', 'textAlign' => 'center'],
        'line3' => ['x' => 300, 'y' => 130, 'fontSize' => 18, 'fontWeight' => 'normal', 'textAlign' => 'center'],
        'employeeName' => ['x' => 50, 'y' => 200, 'fontSize' => 22, 'fontWeight' => 'bold', 'textAlign' => 'right'],
        'position' => ['x' => 50, 'y' => 240, 'fontSize' => 16, 'fontWeight' => 'normal', 'textAlign' => 'right'],
        'department' => ['x' => 50, 'y' => 270, 'fontSize' => 16, 'fontWeight' => 'normal', 'textAlign' => 'right'],
        'organization' => ['x' => 300, 'y' => 480, 'fontSize' => 14, 'fontWeight' => 'normal', 'textAlign' => 'center'],
        'signature' => ['x' => 325, 'y' => 520, 'fontSize' => 16, 'fontWeight' => 'normal', 'textAlign' => 'center'],
        'photo' => ['x' => 630, 'y' => 180, 'fontSize' => 16, 'fontWeight' => 'normal', 'textAlign' => 'center']
    ];
}

// إنشاء البطاقة باستخدام GD
function generateCard($data, $photo_path = null) {
    global $output_dir, $templates_dir;

    // أبعاد البطاقة
    $width = 800;
    $height = 600;

    // تحميل بيانات المنشأة
    $organizationData = getOrganizationData();

    // تحميل الإحداثيات المحفوظة
    $coordinates = getTemplateCoordinates($data['template'] ?? 'template1');
    
    // إنشاء صورة جديدة
    $image = imagecreatetruecolor($width, $height);
    
    // الألوان
    $template = $data['template'] ?? 'template1';
    switch ($template) {
        case 'template2':
            $bg_start = [102, 126, 234]; // أخضر
            $bg_end = [118, 75, 162];
            break;
        case 'template3':
            $bg_start = [255, 193, 7]; // ذهبي
            $bg_end = [255, 87, 34];
            break;
        default:
            $bg_start = [102, 126, 234]; // أزرق
            $bg_end = [118, 75, 162];
    }
    
    // إنشاء تدرج لوني
    for ($i = 0; $i < $height; $i++) {
        $ratio = $i / $height;
        $r = $bg_start[0] + ($bg_end[0] - $bg_start[0]) * $ratio;
        $g = $bg_start[1] + ($bg_end[1] - $bg_start[1]) * $ratio;
        $b = $bg_start[2] + ($bg_end[2] - $bg_start[2]) * $ratio;
        
        $color = imagecolorallocate($image, $r, $g, $b);
        imageline($image, 0, $i, $width, $i, $color);
    }
    
    // الألوان للنص
    $white = imagecolorallocate($image, 255, 255, 255);
    $light_white = imagecolorallocate($image, 255, 255, 255);
    
    // إضافة النصوص باستخدام الإحداثيات المحفوظة
    $font = 5; // خط مدمج

    // دمج بيانات المنشأة مع بيانات البطاقة
    if ($organizationData) {
        $data['organization'] = $organizationData['organizationName'] ?? $data['organization'];
        $data['managerName'] = $organizationData['managerName'] ?? '';
        $data['managerPosition'] = $organizationData['managerPosition'] ?? '';
    }

    // رسم النصوص باستخدام الإحداثيات المحفوظة
    $textElements = [
        'line1' => $data['line1'],
        'line2' => $data['line2'],
        'line3' => $data['line3'],
        'employeeName' => $data['employeeName'],
        'position' => $data['position'],
        'department' => $data['department'],
        'organization' => $data['organization'],
        'signature' => $data['signature']
    ];

    foreach ($textElements as $field => $text) {
        if (isset($coordinates[$field]) && !empty($text)) {
            $coord = $coordinates[$field];
            $x = $coord['x'] ?? 50;
            $y = $coord['y'] ?? 50;
            $fontSize = $coord['fontSize'] ?? 16;
            $fontWeight = $coord['fontWeight'] ?? 'normal';
            $textAlign = $coord['textAlign'] ?? 'right';

            // تحديد اللون حسب أهمية النص
            $color = in_array($field, ['line1', 'employeeName']) ? $white : $light_white;

            // حساب الموضع حسب المحاذاة
            $text_x = $x;
            if ($textAlign === 'center') {
                $text_x = $x - (strlen($text) * ($fontSize / 3)) / 2;
            } elseif ($textAlign === 'left') {
                $text_x = $x - strlen($text) * ($fontSize / 3);
            }

            // رسم النص
            imagestring($image, $font, $text_x, $y, $text, $color);
        }
    }

    // إضافة معلومات إضافية إذا كانت متوفرة
    if (!empty($data['startDate'])) {
        imagestring($image, $font, 50, 350, 'من: ' . $data['startDate'], $light_white);
    }

    if (!empty($data['endDate'])) {
        imagestring($image, $font, 50, 380, 'إلى: ' . $data['endDate'], $light_white);
    }

    if (!empty($data['location'])) {
        imagestring($image, $font, 50, 410, $data['location'], $light_white);
    }

    // إضافة معلومات المدير بالتنسيق المطلوب
    if ($organizationData && !empty($organizationData['managerName'])) {
        // إضافة منصب المدير
        if (!empty($organizationData['managerPosition'])) {
            $manager_y = 450;
            imagestring($image, $font, 50, $manager_y, $organizationData['managerPosition'], $white);

            // إضافة اسم المدير تحت المنصب
            $manager_y += 25;
            imagestring($image, $font, 50, $manager_y, $organizationData['managerName'], $white);
        } else {
            // إذا لم يكن هناك منصب، أضف الاسم فقط
            imagestring($image, $font, 50, 450, $organizationData['managerName'], $white);
        }
    }
    
    // إضافة الصورة إذا كانت متوفرة باستخدام الإحداثيات المحفوظة
    if ($photo_path && file_exists($photo_path)) {
        $photo = imagecreatefromjpeg($photo_path);
        if ($photo) {
            $photo_width = 120;
            $photo_height = 120;

            // استخدام الإحداثيات المحفوظة للصورة
            if (isset($coordinates['photo'])) {
                $photo_x = $coordinates['photo']['x'] ?? ($width - $photo_width - 50);
                $photo_y = $coordinates['photo']['y'] ?? 150;
            } else {
                $photo_x = $width - $photo_width - 50;
                $photo_y = 150;
            }

            // تغيير حجم الصورة
            $resized_photo = imagecreatetruecolor($photo_width, $photo_height);
            imagecopyresampled(
                $resized_photo, $photo,
                0, 0, 0, 0,
                $photo_width, $photo_height,
                imagesx($photo), imagesy($photo)
            );

            // إضافة الصورة للبطاقة
            imagecopy($image, $resized_photo, $photo_x, $photo_y, 0, 0, $photo_width, $photo_height);

            imagedestroy($photo);
            imagedestroy($resized_photo);
        }
    }

    // إضافة شعار المنشأة إذا كان متوفراً
    if ($organizationData && !empty($organizationData['logo'])) {
        // فك تشفير base64 للشعار
        $logo_data = $organizationData['logo'];
        if (strpos($logo_data, 'data:image') === 0) {
            $logo_data = explode(',', $logo_data)[1];
            $logo_binary = base64_decode($logo_data);

            $logo_temp_path = tempnam(sys_get_temp_dir(), 'logo');
            file_put_contents($logo_temp_path, $logo_binary);

            $logo = imagecreatefromstring($logo_binary);
            if ($logo) {
                $logo_width = 60;
                $logo_height = 60;
                $logo_x = 20;
                $logo_y = 20;

                // تغيير حجم الشعار
                $resized_logo = imagecreatetruecolor($logo_width, $logo_height);
                imagecopyresampled(
                    $resized_logo, $logo,
                    0, 0, 0, 0,
                    $logo_width, $logo_height,
                    imagesx($logo), imagesy($logo)
                );

                // إضافة الشعار للبطاقة
                imagecopy($image, $resized_logo, $logo_x, $logo_y, 0, 0, $logo_width, $logo_height);

                imagedestroy($logo);
                imagedestroy($resized_logo);
            }

            unlink($logo_temp_path);
        }
    }
    
    // حفظ البطاقة
    $filename = 'card_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $data['employeeName']) . '_' . time() . '.png';
    $output_path = $output_dir . $filename;
    
    if (imagepng($image, $output_path)) {
        imagedestroy($image);
        return $filename;
    }
    
    imagedestroy($image);
    return false;
}

// معالجة الطلب
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Processing POST request");
    try {
        // قراءة البيانات
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            throw new Exception('بيانات غير صحيحة');
        }
        
        // التحقق من البيانات المطلوبة
        $required_fields = ['line1', 'line2', 'line3', 'employeeName', 'department', 'position'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                throw new Exception("الحقل $field مطلوب");
            }
        }
        
        // إنشاء قاعدة البيانات
        $pdo = initDatabase($db_path);
        if (!$pdo) {
            throw new Exception('خطأ في قاعدة البيانات');
        }
        
        // معالجة الصورة
        $photo_path = null;
        if (!empty($data['employeePhotoData'])) {
            $photo_path = processPhoto($data['employeePhotoData'], $data['employeeName']);
        }
        
        // إنشاء البطاقة
        $output_filename = generateCard($data, $photo_path);
        if (!$output_filename) {
            throw new Exception('فشل في إنشاء البطاقة');
        }
        
        // حفظ البيانات في قاعدة البيانات
        $card_id = saveCardData($pdo, $data, $output_filename, $photo_path);
        if (!$card_id) {
            throw new Exception('فشل في حفظ البيانات');
        }
        
        // إرجاع النتيجة
        echo json_encode([
            'success' => true,
            'message' => 'تم إنشاء البطاقة بنجاح',
            'filename' => $output_filename,
            'file_url' => $output_dir . $output_filename,
            'card_id' => $card_id
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // صفحة اختبار للتحقق من عمل الملف
    echo json_encode([
        'success' => true,
        'message' => 'خادم توليد البطاقات يعمل بشكل صحيح',
        'method' => 'GET',
        'timestamp' => date('Y-m-d H:i:s'),
        'php_version' => phpversion(),
        'extensions' => [
            'gd' => extension_loaded('gd'),
            'pdo' => extension_loaded('pdo'),
            'pdo_sqlite' => extension_loaded('pdo_sqlite'),
            'json' => extension_loaded('json')
        ]
    ]);
} else {
    error_log("Unsupported method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مدعومة: ' . $_SERVER['REQUEST_METHOD'],
        'supported_methods' => ['POST', 'GET', 'OPTIONS']
    ]);
}
