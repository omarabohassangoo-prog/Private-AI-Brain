# 🧠 الوسيط الذكي | Hyper-Brain Mediator vReal 6.0
> **منصة الذكاء الاصطناعي المعرفية المتكاملة بالأوزان الرقمية الفعلية (Float32Array) والانتشار الخلفي الحقيقي (Backpropagation)**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-vReal--6.0-purple.svg)]()
[![Engine](https://img.shields.io/badge/Neural_Engine-Dense_3D_Float32-cyan.svg)]()
[![Exports](https://img.shields.io/badge/Exports-PyTorch_%7C_TensorFlow.js-orange.svg)]()

---

## 📌 نبذة عن المشروع (Overview)

**"الوسيط الذكي" (Hyper-Brain Mediator vReal 6.0)** هو نظام ذكاء اصطناعي عربي معرفي متطور، يجمع بين قوة **النماذج التوليدية الضخمة (LLMs)** والشبكة العصبية المحلية الحقيقية **Real Neural Network** التي تعمل داخل المتصفح والخادم باستخدام أوزان رقمية ثنائية (`Float32Array`)، تدريب محلي بـ `Backpropagation` مع محسّن `Adam Optimizer` وتخزين عالي السعة في `IndexedDB`.

يقدم النظام حلولاً مبتكرة للشبكات العصبية المعرفية مع **12 خوارزمية استدلال دقيقة**، بالإضافة إلى آليتي إرسال رئيسيتين:
1. **🔍 بحث في المخزن:** استعلام سريع ومباشر من الذاكرة الرقمية المخزنة محلياً بدون استهلاك رصيد AI.
2. **📥 جلب بيانات للمخزن:** استدعاء النماذج التوليدية، تدريب الشبكة العصبية المحلية بالانتشار الخلفي، وتوطيد الأوزان في المخزن.

---

## 🚀 الميزات الرئيسية (Key Features)

- **🧠 شبكة عصبية حقيقية (Real Neural Network):** 3 طبقات كثيفة (`Dense Layers`) مع أوزان رقمية حقيقية `Float32Array` ومصفوفات رياضية معالجة محلياً.
- **⚡ الانتشار الخلفي الحقيقي (Backpropagation & Adam Optimizer):** حساب التدرجات الفعلية ودوال الخسارة (`Cross-Entropy` & `MSE`) وضبط الأوزان تلقائياً.
- **💾 تخزين ثنائي عالي السعة (IndexedDB Binary Storage):** حفظ واسترجاع مصفوفات الأوزان بسرعة فائقة ودون حدود الحجم التقليدية بـ `localStorage`.
- **🔄 تصدير النماذج الاحترافي (PyTorch & TensorFlow.js):** إمكانية تصدير الأوزان المدربة مباشرة بفرص التوافق مع `PyTorch state_dict` و `TensorFlow.js Artifacts`.
- **🔍 نظام البحث والاستعلام المزدوج:** زرين تفاعليين للبحث في المخزن المحلي أو جلب وتدريب بيانات جديدة.
- **🌐 معالجة دقيقة باللغة العربية (Arabic NLP & Morphology):** خوارزمية تجذير واستخراج الأصول اللغوية والمعالجة المعجمية المرنة.
- **⚙️ 12 خوارزمية استدلال معرفية (12 Cognitive Brain Algorithms):** تغطي التحليل البايزي، المرونة العصبية، التوطيد الهيبوكامبي، والتنظيم الانفعالي.

---

## 📐 خريطة المكونات المعرفية (Architecture Pipeline)

```
[استعلام المستخدم]
        │
        ├───► [زر: 🔍 بحث في المخزن] ──► (مطابقة الأوزان المعجمية والعصبية في IndexedDB) ──► [توليد رد محلي فوري]
        │
        └───► [زر: 📥 جلب بيانات للمخزن]
                     │
                     ├──► 1. تحويل النص إلى متجهات تضمين Float32Array (TextEmbedder 32D)
                     ├──► 2. تمرير أمامي عبر 3 طبقات (Forward Pass through Dense Layers)
                     ├──► 3. استدعاء Gemini AI / API المحمول
                     ├──► 4. انتشار خلفي وتدريب بـ Adam (Backpropagation Step)
                     └──► 5. توطيد الأوزان وتحديث IndexedDB + معاينة الإحصائيات
```

---

## 🛠️ التثبيت والتشغيل المحلي (Getting Started)

### متطلبات التشغيل:
- **Node.js**: v18.0.0 أو أحدث
- **npm** أو **bun**

### الخطوات:

1. **استคลون المستودع (Clone the repository):**
```bash
git clone https://github.com/your-username/hyper-brain-mediator.git
cd hyper-brain-mediator
```

2. **تثبيت الحزم (Install dependencies):**
```bash
npm install
```

3. **إعداد متغيرات البيئة (Configure environment):**
أنشئ ملف `.env` وقم بضبط مفتاح Gemini API:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **تشغيل خادم التطوير (Run dev server):**
```bash
npm run dev
```

افتح المتصفح على العنوان: `http://localhost:3000`

---

## 📊 تصدير واستيراد الأوزان (Model Exporting)

يوفر "الوسيط الذكي" زر تصدير في **نافذة الأوزان (Weights Modal)** لتنزيل الأوزان الرقمية بالصيغ التالية:
- **PyTorch format (`.json`):** مصفوفات `state_dict` مهيأة للاستيراد المباشر في بيئة Python / PyTorch.
- **TensorFlow.js format (`.json`):** طبقات ومستندات `kernel` و `bias` متوافقة مع TF.js.
- **Standard JSON format (`.json`):** النسخة الاحتياطية المباشرة للمستودع المحلي.

---

## 📑 الملفات التوثيقية والملحقات (Documentation Collateral)

- 📈 [عرض المستثمرين والخط الاستراتيجية (Investor Pitch Deck)](INVESTOR_PITCH.md)
- 🔬 [الورقة البيضاء والمواصفات التقنية (Technical Whitepaper)](TECHNICAL_WHITEPAPER.md)
- 🤝 [دليل المساهمة (Contributing Guide)](CONTRIBUTING.md)
- 📜 [ترخيص الاستخدام (MIT License)](LICENSE)

---

## 📜 الترخيص (License)

هذا المشروع مرخص بموجب رخصة [MIT License](LICENSE). جميع الحقوق محفوظة © 2026 الوسيط الذكي.
