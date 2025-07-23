# دليل ميزات PDF المتقدمة - نظام خطابات الموظفين

## 📄 **نظرة عامة على تنسيق PDF**

يستخدم النظام حالياً طريقتين لإنشاء ملفات PDF:

### **الطريقة الحالية (البسيطة):**
- **html2canvas**: يحول HTML إلى صورة
- **jsPDF**: يضع الصورة في ملف PDF
- **النتيجة**: PDF يحتوي على صورة من الخطاب

### **الطريقة الجديدة (المتقدمة):**
- نفس الطريقة لكن مع إعدادات متقدمة وتحكم كامل في التنسيق

---

## 🎨 **الميزات المتاحة حالياً**

### ✅ **الميزات الأساسية:**
- تنسيق A4 قياسي (210mm × 297mm)
- دقة عالية (scale: 2)
- خطوط وزارة الصحة المخصصة
- تصميم احترافي مع الشعار
- طباعة مباشرة
- حفظ PDF بأسماء مخصصة

### ✅ **الميزات الجديدة المضافة:**

#### **1. مولد PDF المتقدم (AdvancedPDFGenerator)**
```javascript
// استخدام المكون الجديد
<AdvancedPDFGenerator data={data} letterType={letterType}>
  {/* محتوى الخطاب */}
</AdvancedPDFGenerator>
```

**الميزات:**
- **جودة متعددة**: عالية، متوسطة، منخفضة
- **علامة مائية**: نص مخصص بشفافية
- **صفحات متعددة**: تقسيم تلقائي للمحتوى الطويل
- **ضغط الملف**: تقليل حجم PDF
- **بيانات وصفية**: معلومات الملف (العنوان، المؤلف، إلخ)

#### **2. التوقيع الرقمي (DigitalSignature)**
```javascript
<DigitalSignature 
  onSignatureChange={handleSignatureChange}
  currentSignature={signature}
/>
```

**أنواع التوقيع:**
- **رسم التوقيع**: باستخدام الماوس أو اللمس
- **رفع صورة**: PNG, JPG, GIF
- **توقيع نصي**: بأنماط مختلفة (رسمي، أنيق، عصري)

#### **3. مخصص PDF (PDFCustomizer)**
```javascript
<PDFCustomizer 
  onSettingsChange={handleSettingsChange}
  currentSettings={settings}
/>
```

**إعدادات التخصيص:**
- **الخطوط**: نوع، حجم، تباعد، لون
- **الصفحة**: هوامش، رأسية، تذييل
- **الألوان**: أساسي، ثانوي، حدود
- **الشعار**: حجم، موضع، إظهار/إخفاء

---

## 🔧 **كيفية الاستخدام**

### **1. استخدام المولد المتقدم:**

```javascript
import AdvancedPDFGenerator from '../components/AdvancedPDFGenerator';

function MyLetterComponent() {
  return (
    <AdvancedPDFGenerator 
      data={employeeData} 
      letterType="certificate"
    >
      <div className="letter-content">
        {/* محتوى الخطاب هنا */}
      </div>
    </AdvancedPDFGenerator>
  );
}
```

### **2. إضافة التوقيع الرقمي:**

```javascript
import DigitalSignature from '../components/DigitalSignature';

function SignatureSection() {
  const [signature, setSignature] = useState(null);
  
  return (
    <DigitalSignature 
      onSignatureChange={setSignature}
      currentSignature={signature}
    />
  );
}
```

### **3. تخصيص التنسيق:**

```javascript
import PDFCustomizer from '../components/PDFCustomizer';

function CustomizationPanel() {
  const [settings, setSettings] = useState({});
  
  return (
    <PDFCustomizer 
      onSettingsChange={setSettings}
      currentSettings={settings}
    />
  );
}
```

---

## ⚙️ **الإعدادات المتاحة**

### **إعدادات الجودة:**
```javascript
const qualityOptions = {
  high: { scale: 3, format: 'png', quality: 1.0 },    // أعلى جودة، حجم أكبر
  medium: { scale: 2, format: 'png', quality: 0.8 },  // متوازن
  low: { scale: 1.5, format: 'jpeg', quality: 0.6 }   // أسرع، حجم أصغر
};
```

### **إعدادات العلامة المائية:**
```javascript
const watermarkSettings = {
  enabled: true,
  text: 'وزارة الصحة - سري',
  opacity: 0.1,
  angle: 45,
  position: 'center'
};
```

### **إعدادات الخط:**
```javascript
const fontSettings = {
  family: 'MOH-Regular',  // خط وزارة الصحة
  size: 14,               // حجم الخط
  lineHeight: 1.8,        // تباعد الأسطر
  color: '#000000'        // لون النص
};
```

---

## 🎯 **أمثلة عملية**

### **مثال 1: خطاب بجودة عالية مع علامة مائية**
```javascript
const pdfOptions = {
  quality: 'high',
  watermark: true,
  watermarkText: 'وزارة الصحة - المملكة العربية السعودية',
  compression: true
};
```

### **مثال 2: توقيع نصي أنيق**
```javascript
const signatureConfig = {
  type: 'text',
  text: 'د. أحمد محمد السعيد',
  style: 'elegant',
  position: 'center'
};
```

### **مثال 3: تنسيق مخصص بألوان الوزارة**
```javascript
const customSettings = {
  primaryColor: '#2d5016',    // أخضر وزارة الصحة
  secondaryColor: '#f0f8e8',  // أخضر فاتح
  fontSize: 16,               // خط أكبر
  showLogo: true,             // إظهار الشعار
  headerStyle: 'official'     // نمط رسمي
};
```

---

## 📋 **قائمة المهام للتطوير المستقبلي**

### **ميزات مقترحة:**
- [ ] **تشفير PDF**: حماية بكلمة مرور
- [ ] **توقيع رقمي معتمد**: شهادات رقمية
- [ ] **قوالب متعددة**: تصاميم مختلفة للخطابات
- [ ] **طباعة مجمعة**: عدة خطابات في ملف واحد
- [ ] **تصدير Word**: بالإضافة إلى PDF
- [ ] **معاينة مباشرة**: تحديث فوري للتغييرات
- [ ] **حفظ الإعدادات**: تذكر تفضيلات المستخدم

### **تحسينات تقنية:**
- [ ] **ضغط أفضل**: تقليل حجم الملفات
- [ ] **سرعة أكبر**: تحسين أداء التحويل
- [ ] **دعم الصور**: إدراج صور في الخطابات
- [ ] **خطوط إضافية**: المزيد من خيارات الخطوط

---

## 🚀 **كيفية التفعيل**

لاستخدام الميزات الجديدة، قم بما يلي:

1. **استبدال المكونات القديمة** بالمكونات الجديدة
2. **إضافة إعدادات التخصيص** في واجهة المستخدم
3. **تفعيل التوقيع الرقمي** في النماذج المطلوبة
4. **اختبار الميزات** مع بيانات حقيقية

### **مثال كامل للتطبيق:**
```javascript
import AdvancedPDFGenerator from './components/AdvancedPDFGenerator';
import PDFCustomizer from './components/PDFCustomizer';

function EnhancedLetterPage() {
  const [pdfSettings, setPdfSettings] = useState({});
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* إعدادات التخصيص */}
      <div className="lg:col-span-1">
        <PDFCustomizer 
          onSettingsChange={setPdfSettings}
          currentSettings={pdfSettings}
        />
      </div>
      
      {/* معاينة الخطاب */}
      <div className="lg:col-span-2">
        <AdvancedPDFGenerator 
          data={employeeData}
          letterType={letterType}
          customSettings={pdfSettings}
        >
          {/* محتوى الخطاب */}
        </AdvancedPDFGenerator>
      </div>
    </div>
  );
}
```

---

## 📞 **الدعم والمساعدة**

للحصول على المساعدة في استخدام الميزات الجديدة:
- راجع الأمثلة في الكود
- اختبر الميزات في بيئة التطوير
- تواصل مع فريق التطوير للاستفسارات
