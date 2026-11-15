// Draft in three languages. Owner must review, customize and approve before release.
const content={
  ar:{privacy:'سياسة الخصوصية',terms:'شروط الاستخدام',back:'العودة إلى التطبيق',draft:'مسودة محلية للمراجعة قبل الإطلاق العام.',contact:'التواصل بشأن الخصوصية والمساعدة',unset:'يحدد مالك المشروع عنوان التواصل قبل النشر.',sections:{privacy:[
    ['البيانات التي نعالجها','بيانات الحساب، الملف الرياضي، المدينة التي تدخلها، المحتوى، الرسائل، التفاعلات، تفضيلات الخصوصية وسجل الأمان. لا نطلب GPS أو معلومات الدفع في الإصدار الحالي.'],
    ['استخدام البيانات','تشغيل الحسابات والتواصل والمطابقة وحماية المجتمع والإدارة. يستخدم المتصفح ملف جلسة ضروري لتسجيل الدخول وتخزين تفضيلات اللغة والمظهر.'],
    ['الخصوصية','يمكن تقييد ظهور المحتوى والرسائل والحالة. الرسائل ليست مشفرة من طرف إلى طرف. الإدارة لا تعرض المحادثات الخاصة بصورة اعتيادية.'],
    ['الاحتفاظ والحذف','يمكن تنزيل البيانات وحذف الحساب من الإعدادات. تُزال القصص من العرض بعد 24 ساعة؛ النسخ الاحتياطية تحتاج إلى جدول حذف موثق قبل النشر.'],
    ['الحقوق والتواصل','يمكن طلب مساعدة بشأن البيانات أو المحتوى من عنوان الدعم أدناه. يجب مراجعة هوية المسؤول والمعالجين وأسس المعالجة ومدد الاحتفاظ قبل النشر.']
  ],terms:[
    ['استخدام الخدمة','مجتمع رياضي للتواصل بين البالغين 18 عامًا فأكثر وفق سياسة الإطلاق المقترحة. التسجيل مجاني.'],
    ['السلامة والمحتوى','يُمنع الاحتيال والتحرش والتهديد والمحتوى غير القانوني وانتحال الهوية. استخدم الحظر والإبلاغ عند الحاجة.'],
    ['النشاط الرياضي','المنصة لا تقدم تشخيصًا طبيًا ولا تضمن ملاءمة شريك أو مدرب. تحقق من المؤهلات ومارس النشاط المناسب لقدرتك.'],
    ['إدارة الحساب','يمكن تعليق الحسابات أو إزالة المحتوى المخالف، وطلب المراجعة من الدعم.'],
    ['التغييرات','تُراجع السياسة قبل الإطلاق ويجب إعلام المستخدمين بالتغييرات الجوهرية.']
  ]}},
  en:{privacy:'Privacy policy',terms:'Terms of use',back:'Back to the app',draft:'Local draft for owner review before public launch.',contact:'Privacy and support contact',unset:'The operator must set a support address before launch.',sections:{privacy:[
    ['Data we handle','Account details, fitness profile, user-entered city, content, messages, interactions, privacy preferences and security records. This version does not request GPS or payment information.'],
    ['How data is used','To operate accounts, communications, matching, safety and administration. A necessary session cookie supports sign-in; browser storage retains language and theme preferences.'],
    ['Privacy controls','You can restrict content, messaging and availability. Messages are not end-to-end encrypted. Private conversations are not routinely accessible through administration.'],
    ['Retention and removal','You may download your data or delete your account through settings. Stories stop appearing after 24 hours; backups require a documented deletion schedule before launch.'],
    ['Requests and contact','Use the support address below for data or content requests. The operator identity, processors, grounds for processing and retention periods must be reviewed before public launch.']
  ],terms:[
    ['Use of the service','A fitness community for adults aged 18 and over under the proposed pilot policy. Registration is free.'],
    ['Safety and content','Fraud, harassment, threats, unlawful content and impersonation are prohibited. Use blocking and reporting when needed.'],
    ['Exercise','The service does not provide medical diagnoses or guarantee partner or coach suitability. Verify qualifications and exercise within your abilities.'],
    ['Account moderation','Accounts or content may be restricted for violations; request review through support.'],
    ['Changes','Policies require review before launch and users should be informed of material changes.']
  ]}},
  sv:{privacy:'Integritetspolicy',terms:'Användarvillkor',back:'Tillbaka till appen',draft:'Lokalt utkast för granskning före offentlig lansering.',contact:'Kontakt för integritet och support',unset:'Operatören måste ange en supportadress före lansering.',sections:{privacy:[
    ['Uppgifter vi hanterar','Kontouppgifter, träningsprofil, angiven stad, innehåll, meddelanden, interaktioner, integritetsinställningar och säkerhetsloggar. Denna version begär inte GPS eller betalningsinformation.'],
    ['Användning av uppgifter','För konton, kommunikation, matchning, säkerhet och administration. En nödvändig sessionscookie används för inloggning; webbläsarlagring sparar språk och tema.'],
    ['Integritetsinställningar','Du kan begränsa innehåll, meddelanden och tillgänglighet. Meddelanden är inte end-to-end-krypterade. Privata konversationer visas inte rutinmässigt i administrationen.'],
    ['Lagring och radering','Du kan ladda ner dina uppgifter eller radera kontot i inställningarna. Stories visas inte efter 24 timmar; säkerhetskopior behöver en dokumenterad raderingsplan före lansering.'],
    ['Förfrågningar och kontakt','Använd supportadressen nedan för frågor om data och innehåll. Operatörens identitet, personuppgiftsbiträden, behandlingsgrunder och lagringstider måste granskas före lansering.']
  ],terms:[
    ['Användning','En träningsgemenskap för vuxna som är minst 18 år enligt den föreslagna pilotpolicyn. Registrering är gratis.'],
    ['Säkerhet och innehåll','Bedrägeri, trakasserier, hot, olagligt innehåll och identitetsstöld är förbjudna. Blockera och anmäl vid behov.'],
    ['Träning','Tjänsten ger inga medicinska diagnoser och garanterar inte lämplighet hos tränare eller träningspartner. Kontrollera kvalifikationer och träna efter din förmåga.'],
    ['Kontomoderering','Konton eller innehåll kan begränsas vid överträdelser. Begär omprövning via supporten.'],
    ['Ändringar','Villkoren måste granskas före lansering och användare informeras om väsentliga ändringar.']
  ]}}
};
const lang=new URLSearchParams(location.search).get('lang')||'en';
const c=content[lang]||content.en,container=document.querySelector('#policy'),kind=container.dataset.kind;
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
const add=(tag,text,parent=container)=>{const x=document.createElement(tag);x.textContent=text;parent.append(x);return x};
const back=add('a',c.back);back.href='/';
add('h1',c[kind]);
const message=add('p',c.draft);message.className='notice';
const switcher=add('div','');switcher.className='row wrap';
for(const l of ['ar','en','sv']){const a=add('a',l.toUpperCase(),switcher);a.href='?lang='+l}
const card=add('section','');card.className='card stack';
for(const [title,body] of c.sections[kind]){add('h2',title,card);add('p',body,card)}
add('h2',c.contact,card);
try{const response=await fetch('/api/config'),conf=await response.json();add('p',conf.contact||c.unset,card)}catch{add('p',c.unset,card)}
