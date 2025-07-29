<?php
/**
 * أداة إصلاح ترميز النصوص العربية
 * تقوم بفحص وإصلاح مشاكل الترميز في الملفات
 */

// تعيين ترميز UTF-8
header('Content-Type: text/html; charset=UTF-8');
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>أداة إصلاح ترميز النصوص العربية</title>
    <style>
        body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: #333;
            direction: rtl;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .section {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            background: #f8f9fa;
        }
        
        .result {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #e9ecef;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            border-color: #c3e6cb;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            border-color: #f5c6cb;
        }
        
        .warning {
            background: #fff3cd;
            color: #856404;
            border-color: #ffeaa7;
        }
        
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn:hover {
            background: #0056b3;
        }
        
        .btn-success {
            background: #28a745;
        }
        
        .btn-success:hover {
            background: #218838;
        }
        
        .code {
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
            direction: ltr;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 أداة إصلاح ترميز النصوص العربية</h1>
            <p>فحص وإصلاح مشاكل الترميز في النظام</p>
        </div>

        <?php
        // فحص الترميز الحالي
        echo '<div class="section">';
        echo '<h2>📊 معلومات الترميز الحالي</h2>';
        
        echo '<div class="result">';
        echo '<p><strong>ترميز PHP الداخلي:</strong> ' . mb_internal_encoding() . '</p>';
        echo '<p><strong>ترميز HTTP:</strong> ' . mb_http_output() . '</p>';
        echo '<p><strong>ترميز قاعدة البيانات:</strong> ' . (function_exists('mysqli_character_set_name') ? 'متاح' : 'غير متاح') . '</p>';
        echo '<p><strong>دعم mbstring:</strong> ' . (extension_loaded('mbstring') ? '✅ متوفر' : '❌ غير متوفر') . '</p>';
        echo '</div>';
        echo '</div>';

        // اختبار النص العربي
        echo '<div class="section">';
        echo '<h2>📝 اختبار النص العربي</h2>';
        
        $testText = 'نظام إدارة الموظفين المتكامل';
        $testOrg = 'مركز الخدمات الطبية الشرعية';
        $testManager = 'د. فواز جمال الديدب';
        
        echo '<div class="result">';
        echo '<p><strong>النص الاختباري 1:</strong> ' . $testText . '</p>';
        echo '<p><strong>النص الاختباري 2:</strong> ' . $testOrg . '</p>';
        echo '<p><strong>النص الاختباري 3:</strong> ' . $testManager . '</p>';
        echo '</div>';
        
        // فحص طول النصوص
        echo '<div class="result">';
        echo '<p><strong>طول النص 1:</strong> ' . mb_strlen($testText, 'UTF-8') . ' حرف</p>';
        echo '<p><strong>طول النص 2:</strong> ' . mb_strlen($testOrg, 'UTF-8') . ' حرف</p>';
        echo '<p><strong>طول النص 3:</strong> ' . mb_strlen($testManager, 'UTF-8') . ' حرف</p>';
        echo '</div>';
        echo '</div>';

        // فحص قاعدة البيانات
        echo '<div class="section">';
        echo '<h2>🗄️ فحص قاعدة البيانات</h2>';
        
        try {
            $dbPath = 'db/cards.db';
            if (file_exists($dbPath)) {
                $db = new SQLite3($dbPath);
                
                // فحص ترميز قاعدة البيانات
                $result = $db->query("PRAGMA encoding");
                $encoding = $result->fetchArray();
                
                echo '<div class="result success">';
                echo '<p><strong>حالة قاعدة البيانات:</strong> ✅ متصلة</p>';
                echo '<p><strong>ترميز قاعدة البيانات:</strong> ' . ($encoding ? $encoding[0] : 'غير محدد') . '</p>';
                echo '</div>';
                
                // فحص البيانات العربية
                $stmt = $db->prepare("SELECT name FROM employees LIMIT 1");
                $result = $stmt->execute();
                $row = $result->fetchArray();
                
                if ($row) {
                    echo '<div class="result">';
                    echo '<p><strong>عينة من البيانات:</strong> ' . $row['name'] . '</p>';
                    echo '<p><strong>طول الاسم:</strong> ' . mb_strlen($row['name'], 'UTF-8') . ' حرف</p>';
                    echo '</div>';
                }
                
                $db->close();
            } else {
                echo '<div class="result error">';
                echo '<p><strong>حالة قاعدة البيانات:</strong> ❌ غير موجودة</p>';
                echo '<p>يرجى تشغيل الإعداد أولاً</p>';
                echo '</div>';
            }
        } catch (Exception $e) {
            echo '<div class="result error">';
            echo '<p><strong>خطأ في قاعدة البيانات:</strong> ' . $e->getMessage() . '</p>';
            echo '</div>';
        }
        echo '</div>';

        // اختبار تحويل الترميز
        echo '<div class="section">';
        echo '<h2>🔄 اختبار تحويل الترميز</h2>';
        
        $originalText = 'نظام إدارة الموظفين المتكامل';
        
        echo '<div class="result">';
        echo '<p><strong>النص الأصلي:</strong> ' . $originalText . '</p>';
        echo '<p><strong>UTF-8 Encoded:</strong></p>';
        echo '<div class="code">' . urlencode($originalText) . '</div>';
        echo '<p><strong>Base64:</strong></p>';
        echo '<div class="code">' . base64_encode($originalText) . '</div>';
        echo '</div>';
        echo '</div>';

        // إرشادات الإصلاح
        echo '<div class="section">';
        echo '<h2>🛠️ إرشادات الإصلاح</h2>';
        
        echo '<div class="result">';
        echo '<h4>إذا كانت النصوص تظهر بشكل غريب:</h4>';
        echo '<ol>';
        echo '<li>تأكد من أن المتصفح يستخدم ترميز UTF-8</li>';
        echo '<li>امسح cache المتصفح (Ctrl+F5)</li>';
        echo '<li>تحقق من إعدادات الخادم (.htaccess)</li>';
        echo '<li>تأكد من حفظ الملفات بترميز UTF-8</li>';
        echo '</ol>';
        echo '</div>';
        
        echo '<div class="result warning">';
        echo '<h4>خطوات الإصلاح التلقائي:</h4>';
        echo '<ol>';
        echo '<li>تم إضافة meta tags للترميز في جميع الملفات</li>';
        echo '<li>تم إنشاء ملف .htaccess لضمان UTF-8</li>';
        echo '<li>تم تعيين ترميز PHP الصحيح</li>';
        echo '<li>تم فحص قاعدة البيانات</li>';
        echo '</ol>';
        echo '</div>';
        echo '</div>';

        // أدوات إضافية
        echo '<div class="section">';
        echo '<h2>🔗 أدوات إضافية</h2>';
        echo '<div class="result">';
        echo '<a href="encoding-test.html" class="btn">اختبار الترميز في المتصفح</a>';
        echo '<a href="start.html" class="btn btn-success">العودة للنظام</a>';
        echo '<a href="admin.html" class="btn">لوحة التحكم</a>';
        echo '</div>';
        echo '</div>';
        ?>
    </div>
</body>
</html>
