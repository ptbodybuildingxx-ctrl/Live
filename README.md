# MUSCLIVO LIVE — Local Release Candidate 1

**Design system:** the interface uses shared design tokens, rounded controls,
native expandable cards and a responsive layout in Arabic, English and Swedish.
See [Project structure and design system](docs/PROJECT-STRUCTURE.md) for the
file map and guidance on extending modules without duplicating style rules.

**Master Roadmap / Sprint 01:** the local workspace now includes the new module navigation, sample training/nutrition/habits checklists, coach-language filtering and independent Arabic, English and Swedish translation files. Planned modules are clearly marked; this is not a completed clinical or club-finance system. See [Master Roadmap](docs/MASTER-ROADMAP.md).

**Sprint 02 — local identity and access:** select Identity & access from the dashboard or workspace. One authenticated account can switch between personal, club and permitted platform roles. Club owners can invite staff, managers, coaches, accountants or members; recipients must accept. The server checks active role and club scope for each operation. The two demo clubs illustrate isolation. The legacy social-profile role remains intact. This identity module stays local-only until production security review. See [Identity model](docs/IDENTITY.md).

**Sprint 03 — local smart dashboard:** Home displays role-specific summaries and shortcuts for the active personal, club or platform context. Settings offer a compact dashboard view per context, and local feature flags can disable the panel or its metrics. Production remains gated. See [Dashboard](docs/DASHBOARD.md).

**Sprint 04 — local personal records:** Train, Nutrition and Health now support opt-in, owner-only test records with CRUD, validation, history and summaries. Records persist in SQLite; users can export or clear their own data. Do not enter real sensitive information; production remains gated pending privacy review. See [Private records](docs/WELLNESS.md).

**Sprint 05 — local coach management:** Verified coaches and members can mutually accept coaching relationships, assign and update personal programs, and track completion. Trainees may separately opt in to sharing workout history and revoke it any time. Other private records remain private. See [Coaching](docs/COACHING.md).

**Sprint 06 — local clubs and finance:** Club owners and managers can manage branches, subscription plans and memberships; accepted members see their own subscriptions and invoices. Owners and accountants can record manual income, expenses and invoices. Managers have read-only finance. Reports and audit are isolated to the selected club. No real payment processing. See [Clubs and finance](docs/CLUBS-FINANCE.md).

**Sprint 07 — local community and chat:** Existing personal chats remain intact. Club contexts now have role-gated general, staff, coach and finance rooms plus custom groups with accepted invitations. Membership, blocking and report evidence are enforced on the server. See [Club chat](docs/CHAT.md).

**Sprints 08–10 — local events, campaigns, library, rehab and administration:** threshold events with waitlists, Ramadan/StartFit enrollment and check-ins, rights-confirmed text resources, consent-scoped test injury records, local rollout controls and a verified SQLite backup test. All 19 automated tests pass locally. Public rollout and real-device acceptance remain gated. See [Programs and administration](docs/PROGRAMS-ADMIN.md).

**Sprints 11–14 — local Training Pro:** 150 categorized exercises, multilingual search, 12 methods, phased custom plans, coach assignment, live set-by-set recording and rest timer, workout history, personal records and confirm-only progression suggestions. All 25 automated tests pass locally, including local demo credential rotation. Media and professionally reviewed exercise instructions are pending; production remains gated. See [Training Pro](docs/TRAINING-PRO.md).

**Sprint 15 — Exercise Library 200:** adds 50 entries (including 25 stretch/mobility/warm-up/cool-down movements), raises the catalog capacity to 2,000 entries, and provides local administrator media/sign-off workflow with two photos and one video, draft/review/published status, multilingual instructions, rights metadata, and authenticated media serving. Actual instructional media and specialist review still need to be supplied; no automatic publication. See [Training Pro](docs/TRAINING-PRO.md).

**Sprint 15 — editorial instructions:** all 200 built-in exercises now have Arabic, English and Swedish starter technique, common-mistake and safety notes. Related exercise variants use common instruction families; individual stretch entries have their own setup and execution notes. These are administrator-only drafts, not professionally approved instructions. Existing custom catalog records are preserved. See [Training Pro](docs/TRAINING-PRO.md).

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

يمكن تسجيل الدخول بضغطة زر من شاشة الترحيب على الجهاز المحلي فقط. لا توجد كلمات مرور ثابتة في الشيفرة. يتم توليد كلمات مرور عشوائية لحسابات التجربة وتدويرها عند كل تشغيل؛ جلسات التجربة السابقة تنتهي دون حذف بياناتها. لاختبار عمليات التصدير والحذف التي تتطلب كلمة مرور، يمكن ضبط متغير البيئة المحلي `ML_LOCAL_DEMO_PASSWORD` بقيمة خاصة من 16 إلى 128 حرفًا قبل التشغيل. لا تحفظ القيمة في المستودع، ولا تستخدم حسابات التجربة أو هذا المتغير في الإنتاج.

| Email | Role |
| --- | --- |
| athlete@demo.local | Athlete |
| coach@demo.local | Verified coach |
| gym@demo.local | Verified gym |
| sara@demo.local | Athlete |
| admin@demo.local | Local administrator |

حسابات التجربة محجوبة في الإنتاج، والخادم مرتبط بعنوان loopback فقط.

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

