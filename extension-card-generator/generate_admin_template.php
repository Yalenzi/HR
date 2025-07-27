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
$output_dir = 'output/';
$organization_file = 'organization_data.json';

// التأكد من وجود المجلدات
if (!file_exists($output_dir)) mkdir($output_dir, 0755, true);

// تحميل بيانات المنشأة
function getOrganizationData() {
    global $organization_file;
    if (file_exists($organization_file)) {
        return json_decode(file_get_contents($organization_file), true);
    }
    
    // بيانات افتراضية
    return [
        'organizationName' => 'مركز الخدمات الطبية الشرعية',
        'managerName' => 'د. فواز جمال الديدب',
        'managerPosition' => 'مدير مركز الخدمات الطبية الشرعية'
    ];
}

// إنشاء نموذج إداري
function generateAdminTemplate($templateType, $data) {
    global $output_dir;
    
    // أبعاد النموذج
    $width = 800;
    $height = 1000; // أطول للنماذج الإدارية
    
    // إنشاء صورة جديدة
    $image = imagecreatetruecolor($width, $height);
    
    // الألوان
    $white = imagecolorallocate($image, 255, 255, 255);
    $black = imagecolorallocate($image, 0, 0, 0);
    $blue = imagecolorallocate($image, 52, 152, 219);
    $gray = imagecolorallocate($image, 108, 117, 125);
    
    // خلفية بيضاء
    imagefill($image, 0, 0, $white);
    
    // تحميل بيانات المنشأة
    $orgData = getOrganizationData();
    
    // رسم الهيدر
    imagefilledrectangle($image, 0, 0, $width, 80, $blue);
    
    // عنوان النموذج
    $templateTitles = [
        'decision' => 'قرار إداري',
        'assignment' => 'قرار تكليف',
        'certificate' => 'شهادة تقدير',
        'extension' => 'قرار تمديد تكليف'
    ];
    
    $title = $templateTitles[$templateType] ?? 'نموذج إداري';
    
    // رسم العنوان
    $font = 5;
    $title_x = ($width - strlen($title) * 12) / 2;
    imagestring($image, $font, $title_x, 30, $title, $white);
    
    // معلومات المنشأة في الأعلى
    imagestring($image, $font, 50, 120, $orgData['organizationName'], $black);
    
    // محتوى النموذج حسب النوع
    $y_pos = 180;
    
    switch ($templateType) {
        case 'decision':
            generateDecisionContent($image, $data, $orgData, $y_pos, $font, $black, $gray);
            break;
        case 'assignment':
            generateAssignmentContent($image, $data, $orgData, $y_pos, $font, $black, $gray);
            break;
        case 'certificate':
            generateCertificateContent($image, $data, $orgData, $y_pos, $font, $black, $gray);
            break;
        case 'extension':
            generateExtensionContent($image, $data, $orgData, $y_pos, $font, $black, $gray);
            break;
    }
    
    // إضافة معلومات المدير في الأسفل (ثابتة)
    $manager_y = $height - 150;
    
    // خط فاصل
    imageline($image, 50, $manager_y - 20, $width - 50, $manager_y - 20, $gray);
    
    // منصب المدير
    imagestring($image, $font, 50, $manager_y, $orgData['managerPosition'], $black);
    
    // اسم المدير
    imagestring($image, $font, 50, $manager_y + 30, $orgData['managerName'], $black);
    
    // التاريخ
    $date = date('Y/m/d');
    imagestring($image, $font, $width - 150, $manager_y + 60, "التاريخ: $date", $gray);
    
    // حفظ النموذج
    $filename = "admin_{$templateType}_" . date('Y-m-d_H-i-s') . '.png';
    $output_path = $output_dir . $filename;
    
    if (imagepng($image, $output_path)) {
        imagedestroy($image);
        return $filename;
    }
    
    imagedestroy($image);
    return false;
}

// محتوى قرار إداري
function generateDecisionContent($image, $data, $orgData, $y_pos, $font, $black, $gray) {
    imagestring($image, $font, 50, $y_pos, "قرار إداري رقم: " . ($data['decisionNumber'] ?? '001/2024'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "بناءً على الصلاحيات المخولة لي،", $black);
    $y_pos += 30;
    
    imagestring($image, $font, 50, $y_pos, "وبعد الاطلاع على اللوائح والأنظمة المعمول بها،", $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "أقرر ما يلي:", $black);
    $y_pos += 50;
    
    imagestring($image, $font, 70, $y_pos, "1. " . ($data['content'] ?? 'محتوى القرار'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 70, $y_pos, "2. يعمل بهذا القرار من تاريخ صدوره", $black);
    $y_pos += 40;
    
    imagestring($image, $font, 70, $y_pos, "3. على الجهات المختصة تنفيذ هذا القرار", $black);
}

// محتوى قرار تكليف
function generateAssignmentContent($image, $data, $orgData, $y_pos, $font, $black, $gray) {
    imagestring($image, $font, 50, $y_pos, "قرار تكليف رقم: " . ($data['assignmentNumber'] ?? '001/2024'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "بناءً على احتياجات العمل ومتطلبات الخدمة،", $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "يكلف السيد/ة: " . ($data['employeeName'] ?? 'اسم الموظف'), $black);
    $y_pos += 30;
    
    imagestring($image, $font, 50, $y_pos, "المنصب: " . ($data['currentPosition'] ?? 'المنصب الحالي'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "بالقيام بمهام: " . ($data['newAssignment'] ?? 'المهام الجديدة'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "لمدة: " . ($data['duration'] ?? 'المدة المحددة'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "اعتباراً من تاريخ: " . ($data['startDate'] ?? date('Y/m/d')), $black);
}

// محتوى شهادة تقدير
function generateCertificateContent($image, $data, $orgData, $y_pos, $font, $black, $gray) {
    // عنوان مركزي
    $title = "شهادة تقدير وعرفان";
    $title_x = ($width - strlen($title) * 12) / 2;
    imagestring($image, $font, $title_x, $y_pos, $title, $black);
    $y_pos += 60;
    
    imagestring($image, $font, 50, $y_pos, "تتقدم إدارة " . $orgData['organizationName'], $black);
    $y_pos += 30;
    
    imagestring($image, $font, 50, $y_pos, "بالشكر والتقدير للسيد/ة: " . ($data['employeeName'] ?? 'اسم الموظف'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "وذلك لـ: " . ($data['reason'] ?? 'سبب التقدير'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "نظراً لجهوده المتميزة وإخلاصه في العمل", $black);
    $y_pos += 30;
    
    imagestring($image, $font, 50, $y_pos, "وحرصه على تطوير الأداء وتحقيق الأهداف", $black);
    $y_pos += 50;
    
    imagestring($image, $font, 50, $y_pos, "مع أطيب التمنيات بالتوفيق والنجاح", $black);
}

// محتوى قرار تمديد تكليف
function generateExtensionContent($image, $data, $orgData, $y_pos, $font, $black, $gray) {
    imagestring($image, $font, 50, $y_pos, "قرار تمديد تكليف رقم: " . ($data['extensionNumber'] ?? '001/2024'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "بناءً على حسن الأداء ونجاح التكليف السابق،", $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "يمدد تكليف السيد/ة: " . ($data['employeeName'] ?? 'اسم الموظف'), $black);
    $y_pos += 30;
    
    imagestring($image, $font, 50, $y_pos, "في منصب: " . ($data['position'] ?? 'المنصب'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "لمدة إضافية: " . ($data['extensionPeriod'] ?? 'فترة التمديد'), $black);
    $y_pos += 40;
    
    imagestring($image, $font, 50, $y_pos, "من تاريخ: " . ($data['fromDate'] ?? date('Y/m/d')), $black);
    $y_pos += 30;
    
    imagestring($image, $font, 50, $y_pos, "حتى تاريخ: " . ($data['toDate'] ?? 'تاريخ الانتهاء'), $black);
}

// معالجة الطلب
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            throw new Exception('بيانات غير صحيحة');
        }
        
        $templateType = $data['templateType'] ?? 'decision';
        
        // إنشاء النموذج
        $filename = generateAdminTemplate($templateType, $data);
        
        if ($filename) {
            echo json_encode([
                'success' => true,
                'message' => 'تم إنشاء النموذج الإداري بنجاح',
                'filename' => $filename,
                'file_url' => $output_dir . $filename
            ]);
        } else {
            throw new Exception('فشل في إنشاء النموذج');
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
