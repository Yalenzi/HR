<?php
/**
 * ملف تحديث القوالب في الصفحة الرئيسية
 * يقوم بقراءة القوالب من ملف التكوين وتحديث ملفات JavaScript و HTML
 */

header('Content-Type: application/json; charset=utf-8');

// قراءة القوالب من ملف التكوين
function getTemplatesConfig() {
    $templates_file = 'templates_config.json';
    
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
    
    if (file_exists($templates_file)) {
        $custom_templates = json_decode(file_get_contents($templates_file), true) ?: [];
        return array_merge($default_templates, $custom_templates);
    }
    
    return $default_templates;
}

// تحديث خيارات القوالب في HTML
function updateHTMLTemplates($templates) {
    $html_file = 'index.html';
    
    if (!file_exists($html_file)) {
        return false;
    }
    
    $html_content = file_get_contents($html_file);
    
    // إنشاء خيارات القوالب الجديدة
    $options_html = '';
    foreach ($templates as $id => $template) {
        $options_html .= "<option value=\"$id\">{$template['name']}</option>\n                            ";
    }
    
    // البحث عن قسم القوالب وتحديثه
    $pattern = '/(<select id="template"[^>]*>)(.*?)(<\/select>)/s';
    $replacement = "$1\n                            $options_html$3";
    
    $updated_html = preg_replace($pattern, $replacement, $html_content);
    
    if ($updated_html && $updated_html !== $html_content) {
        return file_put_contents($html_file, $updated_html);
    }
    
    return false;
}

// تحديث ألوان القوالب في JavaScript
function updateJSTemplates($templates) {
    $js_file = 'script.js';
    
    if (!file_exists($js_file)) {
        return false;
    }
    
    $js_content = file_get_contents($js_file);
    
    // إنشاء كود JavaScript للقوالب
    $js_templates = '';
    foreach ($templates as $id => $template) {
        if ($id === 'template1') continue; // القالب الافتراضي موجود مسبقاً
        
        $start_color = $template['start_color'] ?? '#667eea';
        $end_color = $template['end_color'] ?? '#764ba2';
        
        // تحويل hex إلى RGB
        $start_rgb = hexToRgb($start_color);
        $end_rgb = hexToRgb($end_color);
        
        $js_templates .= "
            case '$id':
                \$bg_start = [{$start_rgb['r']}, {$start_rgb['g']}, {$start_rgb['b']}];
                \$bg_end = [{$end_rgb['r']}, {$end_rgb['g']}, {$end_rgb['b']}];
                break;";
    }
    
    // البحث عن switch statement وإضافة القوالب الجديدة
    $pattern = '/(case \'template3\':[^}]+break;)/';
    $replacement = "$1$js_templates";
    
    $updated_js = preg_replace($pattern, $replacement, $js_content);
    
    if ($updated_js && $updated_js !== $js_content) {
        return file_put_contents($js_file, $updated_js);
    }
    
    return false;
}

// تحويل hex إلى RGB
function hexToRgb($hex) {
    $hex = ltrim($hex, '#');
    
    if (strlen($hex) == 3) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    
    return [
        'r' => hexdec(substr($hex, 0, 2)),
        'g' => hexdec(substr($hex, 2, 2)),
        'b' => hexdec(substr($hex, 4, 2))
    ];
}

// تحديث ملف PHP لتوليد البطاقات
function updatePHPTemplates($templates) {
    $php_file = 'generate.php';
    
    if (!file_exists($php_file)) {
        return false;
    }
    
    $php_content = file_get_contents($php_file);
    
    // إنشاء كود PHP للقوالب
    $php_templates = '';
    foreach ($templates as $id => $template) {
        if (in_array($id, ['template1', 'template2', 'template3'])) continue; // القوالب الافتراضية
        
        $start_color = $template['start_color'] ?? '#667eea';
        $end_color = $template['end_color'] ?? '#764ba2';
        
        $start_rgb = hexToRgb($start_color);
        $end_rgb = hexToRgb($end_color);
        
        $php_templates .= "
        case '$id':
            \$bg_start = [{$start_rgb['r']}, {$start_rgb['g']}, {$start_rgb['b']}];
            \$bg_end = [{$end_rgb['r']}, {$end_rgb['g']}, {$end_rgb['b']}];
            break;";
    }
    
    // البحث عن switch statement وإضافة القوالب الجديدة
    $pattern = '/(case \'template3\':[^}]+break;)/';
    $replacement = "$1$php_templates";
    
    $updated_php = preg_replace($pattern, $replacement, $php_content);
    
    if ($updated_php && $updated_php !== $php_content) {
        return file_put_contents($php_file, $updated_php);
    }
    
    return false;
}

// تنفيذ التحديث
if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $templates = getTemplatesConfig();
        
        $html_updated = updateHTMLTemplates($templates);
        $js_updated = updateJSTemplates($templates);
        $php_updated = updatePHPTemplates($templates);
        
        echo json_encode([
            'success' => true,
            'message' => 'تم تحديث القوالب بنجاح',
            'updates' => [
                'html' => $html_updated,
                'js' => $js_updated,
                'php' => $php_updated
            ],
            'templates_count' => count($templates)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'خطأ في تحديث القوالب: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مدعومة'
    ]);
}
?>
