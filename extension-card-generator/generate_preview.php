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

// إعدادات المجلدات
$output_dir = 'output/previews/';
$backgrounds_dir = 'backgrounds/';

// التأكد من وجود المجلدات
if (!file_exists($output_dir)) mkdir($output_dir, 0755, true);
if (!file_exists($backgrounds_dir)) mkdir($backgrounds_dir, 0755, true);

// تحميل بيانات المنشأة
function getOrganizationData() {
    $organization_file = 'organization_data.json';
    if (file_exists($organization_file)) {
        return json_decode(file_get_contents($organization_file), true);
    }
    
    return [
        'organizationName' => 'مركز الخدمات الطبية الشرعية',
        'managerName' => 'د. فواز جمال الديدب',
        'managerPosition' => 'مدير مركز الخدمات الطبية الشرعية'
    ];
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

// تحميل خلفية مخصصة
function getCustomBackground($backgroundId) {
    if ($backgroundId === 'default') {
        return null;
    }
    
    // البحث في مكتبة الخلفيات المحفوظة
    // يمكن تحسين هذا لاحقاً لقراءة من قاعدة البيانات
    return null;
}

// إنشاء معاينة البطاقة
function generatePreviewCard($data) {
    global $output_dir;
    
    // تحديد أبعاد البطاقة حسب الحجم
    $dimensions = getCardDimensions($data['size']);
    $width = $dimensions['width'];
    $height = $dimensions['height'];
    
    // إنشاء صورة جديدة
    $image = imagecreatetruecolor($width, $height);
    
    // الألوان
    $white = imagecolorallocate($image, 255, 255, 255);
    $black = imagecolorallocate($image, 0, 0, 0);
    $light_white = imagecolorallocate($image, 240, 240, 240);
    
    // تطبيق خلفية القالب
    applyTemplateBackground($image, $data['template'], $width, $height);
    
    // تطبيق خلفية مخصصة إذا كانت محددة
    if ($data['background'] !== 'default') {
        applyCustomBackground($image, $data['background'], $width, $height);
    }
    
    // تحميل بيانات المنشأة والإحداثيات
    $organizationData = getOrganizationData();
    $coordinates = getTemplateCoordinates($data['template']);
    
    // رسم النصوص باستخدام الإحداثيات
    $font = 5; // خط مدمج
    
    // دمج بيانات المنشأة مع بيانات المعاينة
    $textElements = array_merge($data['fields'], [
        'organization' => $organizationData['organizationName'],
        'signature' => $organizationData['managerName']
    ]);
    
    foreach ($textElements as $field => $text) {
        if (isset($coordinates[$field]) && !empty($text)) {
            $coord = $coordinates[$field];
            $x = $coord['x'] ?? 50;
            $y = $coord['y'] ?? 50;
            $fontSize = $coord['fontSize'] ?? 16;
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
    
    // إضافة معلومات المدير
    if (!empty($organizationData['managerPosition'])) {
        imagestring($image, $font, 50, $height - 100, $organizationData['managerPosition'], $white);
        imagestring($image, $font, 50, $height - 75, $organizationData['managerName'], $white);
    }
    
    // حفظ المعاينة
    $filename = "preview_" . uniqid() . '.png';
    $output_path = $output_dir . $filename;
    
    if (imagepng($image, $output_path)) {
        imagedestroy($image);
        return $filename;
    }
    
    imagedestroy($image);
    return false;
}

// الحصول على أبعاد البطاقة حسب الحجم
function getCardDimensions($size) {
    switch($size) {
        case 'a4':
            return ['width' => 595, 'height' => 842]; // A4 بالبكسل
        case 'a6':
            return ['width' => 298, 'height' => 420]; // A6 بالبكسل
        case '5x7':
            return ['width' => 360, 'height' => 504]; // 5×7 بوصة
        default:
            return ['width' => 800, 'height' => 600]; // قياسي
    }
}

// تطبيق خلفية القالب
function applyTemplateBackground($image, $template, $width, $height) {
    // ألوان القوالب
    $templates = [
        'template1' => [
            'start' => [102, 126, 234], // #667eea
            'end' => [118, 75, 162]     // #764ba2
        ],
        'template2' => [
            'start' => [39, 174, 96],   // #27ae60
            'end' => [46, 204, 113]     // #2ecc71
        ],
        'template3' => [
            'start' => [243, 156, 18],  // #f39c12
            'end' => [230, 126, 34]     // #e67e22
        ]
    ];
    
    $colors = $templates[$template] ?? $templates['template1'];
    
    // إنشاء تدرج لوني
    for ($y = 0; $y < $height; $y++) {
        $ratio = $y / $height;
        
        $r = $colors['start'][0] + ($colors['end'][0] - $colors['start'][0]) * $ratio;
        $g = $colors['start'][1] + ($colors['end'][1] - $colors['start'][1]) * $ratio;
        $b = $colors['start'][2] + ($colors['end'][2] - $colors['start'][2]) * $ratio;
        
        $color = imagecolorallocate($image, $r, $g, $b);
        imageline($image, 0, $y, $width, $y, $color);
    }
}

// تطبيق خلفية مخصصة
function applyCustomBackground($image, $backgroundId, $width, $height) {
    // يمكن تحسين هذه الوظيفة لاحقاً لتطبيق خلفيات مخصصة
    // من مكتبة الخلفيات المحفوظة
}

// معالجة الطلب
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            throw new Exception('بيانات غير صحيحة');
        }
        
        // إنشاء المعاينة
        $filename = generatePreviewCard($data);
        
        if ($filename) {
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء المعاينة بنجاح',
                'filename' => $filename,
                'preview_url' => $output_dir . $filename
            ]);
        } else {
            throw new Exception('فشل في إنشاء المعاينة');
        }
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مدعومة'
    ]);
}
?>
