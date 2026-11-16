# MUSCLIVO LIVE — Local Release Candidate 1

**Master Roadmap / Sprint 01:** the local workspace now includes the new module navigation, sample training/nutrition/habits checklists, coach-language filtering and independent Arabic, English and Swedish translation files. Planned modules are clearly marked; this is not a completed clinical or club-finance system. See [Master Roadmap](docs/MASTER-ROADMAP.md).

**NEVER TRAIN ALONE.** Standalone fitness social web app. This is a local release candidate, not a public deployment. All development and tests are local; no Supabase, external analytics, CDN, API keys, or paid services. Production configuration is intentionally blocked until the operator configures it. See [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md).

## تشغيل المشروع محليًا

متطلبات التشغيل: Node.js 22.13 أو أحدث (يُفضّل 24).

```sh
npm start
```

افتح **http://127.0.0.1:4173** في متصفحك. لا يلزم تثبيت أي حزمة، ولا يوجد اتصال مع قاعدة بيانات خارجية. خادم Node.js المحلي يحفظ البيانات في `data/local.sqlite` تلقائيًا. قاعدة البيانات ليست مضمّنة في نسخة المصدر؛ تُنشأ عند التشغيل الأول.

```sh
npm test
```

## Demo accounts / الحسابات التجريبية

يمكن تسجيل الدخول بضغطة زر من شاشة الترحيب. كلمة المرور لجميع حسابات التجربة: `DemoLive2026!`

| Email | Role |
| --- | --- |
| athlete@demo.local | Athlete |
| coach@demo.local | Verified coach |
| gym@demo.local | Verified gym |
| sara@demo.local | Athlete |
| admin@demo.local | Local administrator |

لا تستخدم كلمات المرور التجريبية عند النشر. الخادم مرتبط بعنوان loopback فقط.

## الميزات المحلية

- Home, Social, Live, Chat, Profile، صفحات الاستكشاف والإشعارات والتحديات والإعدادات والإدارة.
- تسجيل محلي، حسابات متدرب ومدرب ونادٍ، تسجيل الدخول والخروج، تخزين كلمات المرور باستخدام scrypt وجلسات HttpOnly.
- منشورات نصية وصور مضغوطة محليًا، قصص 24 ساعة، إعجاب وتعليق وحفظ ومتابعة ومشاركة نصية.
- حالة التوفر، المطابقة حسب ستة معايير، طلبات التمارين وقبولها، جدولة الجلسات والانضمام إليها.
- محادثات خاصة وجماعية بين حسابات محلية، دعوات تمرين نصية، تحديث دوري للبيانات.
- تحديات تجريبية ونقاط XP وتسجيل يومي محدود.
- إعدادات الخصوصية والمظهر واللغة، حظر الحسابات والإبلاغ عنها.
- إدارة محلية محمية بصلاحية Admin، مراجعة التوثيق والبلاغات، تعليق الحسابات، سجل إداري.
- واجهة Responsive، العربية RTL والإنجليزية والسويدية، الوضعان الداكن والفاتح.

## حدود النسخة المحلية

- **مرشّحة للنشر وليست منشورة.** وضع الإنتاج يدعم تأكيد البريد واسترداد كلمة المرور باستخدام relay يختاره المالك، وقد اختُبرا محليًا بدون إرسال حقيقي. المصادقة الثنائية، إشعارات المتصفح، بث الفيديو، المكالمات، رفع الفيديو، التسجيل الآمن للوثائق، بوابات الدفع، نشر PWA وإدارة الأندية الموسعة غير مفعّلة. لا تزال مراجعة الأمان والسياسة القانونية وربط البنية الإنتاجية الفعلية شروطًا للنشر.
- هذه نسخة تجريبية صغيرة تستخدم SQLite وتخزين الصور ضمن البيانات المحلية، وليست بنية جاهزة لاستيعاب 10,000 مستخدم. في الإنتاج تُنقل الوسائط إلى تخزين خاص، وتُنفّذ سياسات وصول مركزية، وتضاف حماية معدل الطلبات والنسخ الاحتياطية واختبارات الأمان.
- الوصول إلى بيانات الجهاز والموقع الدقيق غير مطلوب؛ المدينة مدخلة من المستخدم.
- لا يتم تسجيل أو توثيق الممارسين تلقائيًا. التحقق هنا مراجعة تجريبية يدوية.
- لن يتم توصيل Supabase أو النشر أو تفعيل أي خدمة مدفوعة إلا بإذن صريح.

## هيكل المشروع

```text
musclivo-live/
  dist/             HTML, CSS, JavaScript, translation and logo
  server.mjs        Local HTTP API, session and permission logic
  release.mjs       Fail-closed production configuration
  backup.mjs        Consistent SQLite backup command
  deploy/           HTTPS reverse proxy example
  data/             Runtime SQLite database (ignored)
  tests/            Local API integration tests
  package.json      Start and test commands
  README.md         Documentation
  RELEASE-CHECKLIST.md  Public-launch gates and deployment runbook
```

