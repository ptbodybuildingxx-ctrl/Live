// Original local metadata. Media is intentionally not supplied or hotlinked.
export const equipment=['bodyweight','dumbbell','barbell','machine'];
export const muscles=['chest','back','shoulders','arms','legs','core','cardio','stretch'];
export const patterns=['horizontalPush','verticalPush','fly','horizontalPull','verticalPull','pullover','shrug','lateralRaise','frontRaise','mobility','rearDelt','curl','triceps','forearm','squat','hinge','lunge','legExtension','legCurl','calf','hip','coreFlexion','coreStability','coreRotation','conditioning','locomotion','cyclicCardio','staticStretch','dynamicStretch','warmup','cooldown'];
export const levels=['beginner','intermediate','advanced'];
export const secondaryGroups=(pattern,muscle)=>({
  horizontalPush:['shoulders','arms'],verticalPush:['arms','core'],horizontalPull:['back','arms'],verticalPull:['arms','back'],fly:['shoulders'],hinge:['back','core'],squat:['core','legs'],lunge:['core'],triceps:['shoulders'],curl:['arms'],conditioning:['core'],locomotion:['legs'],cyclicCardio:['legs']
}[pattern]||[]).filter(x=>x!==muscle);
// Stable identifiers; names are independently localized for search and display.
const source={
chest:`push-up|bodyweight|horizontalPush|beginner|Push-up|ضغط أرضي|Armhävning
incline-push-up|bodyweight|horizontalPush|beginner|Incline push-up|ضغط مرتفع|Lutande armhävning
decline-push-up|bodyweight|horizontalPush|intermediate|Decline push-up|ضغط بانحدار|Armhävning med upphöjda fötter
wide-push-up|bodyweight|horizontalPush|intermediate|Wide push-up|ضغط واسع|Bred armhävning
chest-dip|bodyweight|horizontalPush|advanced|Chest dip|متوازي للصدر|Bröstdips
db-bench|dumbbell|horizontalPush|beginner|Dumbbell bench press|ضغط صدر دمبل|Hantelpress
db-incline|dumbbell|horizontalPush|beginner|Incline dumbbell press|ضغط دمبل مائل|Lutande hantelpress
db-decline|dumbbell|horizontalPush|intermediate|Decline dumbbell press|ضغط دمبل منخفض|Nedåtlutande hantelpress
db-floor|dumbbell|horizontalPush|beginner|Dumbbell floor press|ضغط دمبل أرضي|Hantelpress på golv
db-fly|dumbbell|fly|intermediate|Dumbbell fly|تفتيح دمبل|Hantelflyes
db-incline-fly|dumbbell|fly|intermediate|Incline dumbbell fly|تفتيح دمبل مائل|Lutande hantelflyes
bb-bench|barbell|horizontalPush|intermediate|Barbell bench press|بنش برس بالبار|Bänkpress
bb-incline|barbell|horizontalPush|intermediate|Incline barbell press|بنش مائل بار|Lutande bänkpress
bb-decline|barbell|horizontalPush|intermediate|Decline barbell press|بنش منخفض بار|Nedåtlutande bänkpress
bb-floor|barbell|horizontalPush|intermediate|Barbell floor press|ضغط بار أرضي|Golvpress med skivstång
machine-chest|machine|horizontalPush|beginner|Machine chest press|ضغط صدر جهاز|Bröstpress i maskin
machine-incline|machine|horizontalPush|beginner|Incline machine press|ضغط صدر مائل جهاز|Lutande maskinpress
pec-deck|machine|fly|beginner|Pec deck fly|فراشة صدر|Pec deck
cable-fly|machine|fly|intermediate|Cable chest fly|تفتيح صدر كيبل|Kabelcross
cable-low-fly|machine|fly|intermediate|Low-to-high cable fly|تفتيح كيبل تصاعدي|Kabelcross nedifrån`,
back:`pull-up|bodyweight|verticalPull|advanced|Pull-up|عقلة قبضة علوية|Chins med överhandsgrepp
chin-up|bodyweight|verticalPull|intermediate|Chin-up|عقلة قبضة سفلية|Chins med underhandsgrepp
neutral-pull|bodyweight|verticalPull|intermediate|Neutral-grip pull-up|عقلة قبضة محايدة|Chins med neutralt grepp
inverted-row|bodyweight|horizontalPull|beginner|Inverted row|سحب أفقي وزن جسم|Omvänd rodd
prone-y|bodyweight|rearDelt|beginner|Prone Y raise|رفع Y من الانبطاح|Liggande Y-lyft
db-row|dumbbell|horizontalPull|beginner|One-arm dumbbell row|سحب دمبل بذراع واحدة|Enarms hantelrodd
db-bent-row|dumbbell|horizontalPull|intermediate|Bent-over dumbbell row|سحب دمبل منحني|Framåtlutad hantelrodd
db-supported-row|dumbbell|horizontalPull|beginner|Chest-supported dumbbell row|سحب دمبل مع دعم الصدر|Bröststödd hantelrodd
db-pullover|dumbbell|pullover|intermediate|Dumbbell pullover|سحب دمبل فوق الرأس|Hantelpullover
db-renegade|dumbbell|horizontalPull|advanced|Renegade row|سحب دمبل بلانك|Renegade row
db-shrug|dumbbell|shrug|beginner|Dumbbell shrug|هز كتف دمبل|Hantelryck för trapezius
bb-row|barbell|horizontalPull|intermediate|Barbell row|سحب بار منحني|Skivstångsrodd
bb-under-row|barbell|horizontalPull|intermediate|Underhand barbell row|سحب بار قبضة سفلية|Skivstångsrodd underhand
pendlay-row|barbell|horizontalPull|advanced|Pendlay row|سحب بندلاي|Pendlayrodd
tbar-row|barbell|horizontalPull|intermediate|Landmine T-bar row|سحب بار تي|T-stångsrodd
bb-shrug|barbell|shrug|beginner|Barbell shrug|هز كتف بار|Axelryck med skivstång
machine-row|machine|horizontalPull|beginner|Seated machine row|سحب ظهر جهاز|Sittande maskinrodd
cable-row|machine|horizontalPull|beginner|Seated cable row|سحب كيبل جالس|Sittande kabelrodd
wide-cable-row|machine|horizontalPull|intermediate|Wide-grip cable row|سحب كيبل واسع|Bred kabelrodd
lat-pulldown|machine|verticalPull|beginner|Lat pulldown|سحب علوي جهاز|Latsdrag
neutral-pulldown|machine|verticalPull|beginner|Neutral-grip pulldown|سحب علوي محايد|Latsdrag neutralt grepp
under-pulldown|machine|verticalPull|intermediate|Underhand pulldown|سحب علوي سفلي|Latsdrag underhand
straight-pulldown|machine|pullover|intermediate|Straight-arm pulldown|سحب كيبل بذراع مستقيمة|Raka armar latsdrag
assisted-pullup|machine|verticalPull|beginner|Assisted pull-up|عقلة بمساعدة الجهاز|Assisterade chins
high-row|machine|horizontalPull|beginner|High-row machine|سحب ظهر عالٍ جهاز|Hög rodd i maskin`,
shoulders:`pike-pushup|bodyweight|verticalPush|intermediate|Pike push-up|ضغط كتف بايك|Pike-armhävning
wall-handstand|bodyweight|verticalPush|advanced|Wall handstand push-up|ضغط وقوف على اليدين|Handstående armhävning mot vägg
wall-slide|bodyweight|mobility|beginner|Wall slide|انزلاق الذراع على الحائط|Väggglidning
prone-t|bodyweight|rearDelt|beginner|Prone T raise|رفع T من الانبطاح|Liggande T-lyft
db-shoulder|dumbbell|verticalPush|beginner|Dumbbell shoulder press|ضغط أكتاف دمبل|Hantelpress för axlar
db-arnold|dumbbell|verticalPush|intermediate|Arnold press|ضغط أرنولد|Arnoldpress
db-lateral|dumbbell|lateralRaise|beginner|Dumbbell lateral raise|رفرفة جانبية دمبل|Sidolyft med hantlar
db-seated-lateral|dumbbell|lateralRaise|beginner|Seated lateral raise|رفرفة جانبية جالس|Sittande sidolyft
db-front|dumbbell|frontRaise|beginner|Dumbbell front raise|رفرفة أمامية دمبل|Frontlyft med hantlar
db-rear|dumbbell|rearDelt|beginner|Rear-delt dumbbell fly|رفرفة خلفية دمبل|Omvänd hantelflyes
db-supported-rear|dumbbell|rearDelt|beginner|Chest-supported rear fly|رفرفة خلفية مسنودة|Bröststödd omvänd flyes
bb-overhead|barbell|verticalPush|intermediate|Standing overhead press|ضغط كتف بار واقف|Militärpress
bb-seated-overhead|barbell|verticalPush|intermediate|Seated barbell press|ضغط كتف بار جالس|Sittande skivstångspress
landmine-press|barbell|verticalPush|intermediate|Landmine press|ضغط بار لاندماين|Landminepress
bb-pushpress|barbell|verticalPush|advanced|Push press|ضغط بار بدفع الرجلين|Push press
machine-shoulder|machine|verticalPush|beginner|Machine shoulder press|ضغط كتف جهاز|Axelpress i maskin
machine-lateral|machine|lateralRaise|beginner|Machine lateral raise|رفرفة جانبية جهاز|Sidolyft i maskin
cable-lateral|machine|lateralRaise|intermediate|Cable lateral raise|رفرفة جانبية كيبل|Sidolyft i kabel
reverse-pec|machine|rearDelt|beginner|Reverse pec deck|فراشة خلفية جهاز|Omvänd pec deck
face-pull|machine|rearDelt|intermediate|Cable face pull|سحب كيبل للوجه|Face pull`,
arms:`close-pushup|bodyweight|triceps|intermediate|Close-grip push-up|ضغط ضيق|Smal armhävning
body-triceps|bodyweight|triceps|intermediate|Bodyweight triceps extension|تمديد ترايسبس وزن جسم|Tricepspress med kroppsvikt
bench-dip|bodyweight|triceps|intermediate|Bench dip|متوازي على مقعد|Bänkdips
supinated-row|bodyweight|horizontalPull|intermediate|Underhand inverted row|سحب أفقي قبضة سفلية|Omvänd rodd med underhandsgrepp
db-curl|dumbbell|curl|beginner|Dumbbell curl|بايسبس دمبل|Hantelcurl
db-hammer|dumbbell|curl|beginner|Hammer curl|بايسبس هامر|Hammarcurl
db-incline-curl|dumbbell|curl|intermediate|Incline dumbbell curl|بايسبس مائل دمبل|Lutande hantelcurl
db-concentration|dumbbell|curl|beginner|Concentration curl|بايسبس تركيز|Koncentrationscurl
db-preacher|dumbbell|curl|intermediate|Dumbbell preacher curl|بايسبس سكوت دمبل|Scottcurl med hantel
db-reverse-curl|dumbbell|curl|intermediate|Reverse dumbbell curl|بايسبس قبضة عكسية|Omvänd hantelcurl
db-overhead-triceps|dumbbell|triceps|beginner|Dumbbell overhead extension|تمديد ترايسبس فوق الرأس دمبل|Tricepspress över huvudet
db-kickback|dumbbell|triceps|beginner|Dumbbell kickback|ترايسبس خلفي دمبل|Triceps kickback
db-skull|dumbbell|triceps|intermediate|Lying dumbbell extension|تمديد ترايسبس دمبل مستلقي|Liggande hanteltriceps
db-wrist|dumbbell|forearm|beginner|Dumbbell wrist curl|تمرين معصم دمبل|Handledscurl med hantel
bb-curl|barbell|curl|beginner|Barbell curl|بايسبس بار|Skivstångscurl
ez-curl|barbell|curl|beginner|EZ-bar curl|بايسبس بار متعرج|EZ-curl
bb-preacher|barbell|curl|intermediate|Barbell preacher curl|بايسبس سكوت بار|Scottcurl med stång
bb-reverse|barbell|curl|intermediate|Barbell reverse curl|بايسبس بار عكسي|Omvänd skivstångscurl
bb-close-bench|barbell|triceps|intermediate|Close-grip bench press|بنش بار ضيق|Smal bänkpress
ez-extension|barbell|triceps|intermediate|EZ-bar lying triceps extension|ترايسبس بار متعرج مستلقي|Liggande tricepspress EZ
machine-curl|machine|curl|beginner|Machine biceps curl|بايسبس جهاز|Bicepscurl i maskin
cable-curl|machine|curl|beginner|Cable biceps curl|بايسبس كيبل|Kabelcurl
rope-pushdown|machine|triceps|beginner|Rope triceps pushdown|ترايسبس حبل كيبل|Triceps pushdown med rep
bar-pushdown|machine|triceps|beginner|Bar triceps pushdown|ترايسبس كيبل بار|Triceps pushdown med stång
machine-triceps|machine|triceps|beginner|Machine triceps extension|تمديد ترايسبس جهاز|Tricepspress i maskin`,
legs:`body-squat|bodyweight|squat|beginner|Bodyweight squat|سكوات وزن جسم|Knäböj med kroppsvikt
split-squat|bodyweight|lunge|beginner|Split squat|سكوات ثابت متباعد|Split squat
forward-lunge|bodyweight|lunge|beginner|Forward lunge|اندفاع أمامي|Utfall framåt
reverse-lunge|bodyweight|lunge|beginner|Reverse lunge|اندفاع خلفي|Utfall bakåt
step-up|bodyweight|lunge|beginner|Step-up|صعود مقعد|Step-up
glute-bridge|bodyweight|hip|beginner|Glute bridge|جسر الحوض|Höftlyft
single-bridge|bodyweight|hip|intermediate|Single-leg glute bridge|جسر حوض برجل واحدة|Enbens höftlyft
body-calf|bodyweight|calf|beginner|Standing calf raise|رفع السمانة وزن جسم|Stående tåhävning
db-goblet|dumbbell|squat|beginner|Goblet squat|سكوات كوب دمبل|Goblet squat
db-rdl|dumbbell|hinge|intermediate|Dumbbell Romanian deadlift|ديدلفت روماني دمبل|Rumänska marklyft med hantlar
db-split|dumbbell|lunge|intermediate|Dumbbell split squat|سكوات ثابت دمبل|Split squat med hantlar
db-bulgarian|dumbbell|lunge|intermediate|Dumbbell Bulgarian split squat|سكوات بلغاري دمبل|Bulgariska utfall med hantlar
db-lunge|dumbbell|lunge|intermediate|Dumbbell walking lunge|اندفاع مشي دمبل|Gående utfall med hantlar
db-step|dumbbell|lunge|intermediate|Dumbbell step-up|صعود مقعد دمبل|Step-up med hantlar
db-calf|dumbbell|calf|beginner|Dumbbell calf raise|رفع سمانة دمبل|Tåhävning med hantlar
bb-back-squat|barbell|squat|intermediate|Barbell back squat|سكوات خلفي بار|Knäböj med skivstång
bb-front-squat|barbell|squat|intermediate|Barbell front squat|سكوات أمامي بار|Frontböj
bb-rdl|barbell|hinge|intermediate|Romanian deadlift|ديدلفت روماني بار|Rumänska marklyft
deadlift|barbell|hinge|advanced|Conventional deadlift|ديدلفت تقليدي|Marklyft
sumo-deadlift|barbell|hinge|advanced|Sumo deadlift|ديدلفت سومو|Sumomarklyft
bb-hipthrust|barbell|hip|intermediate|Barbell hip thrust|دفع حوض بار|Hip thrust med skivstång
bb-goodmorning|barbell|hinge|advanced|Barbell good morning|جود مورنينغ بار|Good morning
leg-press|machine|squat|beginner|Leg press|ضغط أرجل جهاز|Benpress
hack-squat|machine|squat|intermediate|Hack squat|هاك سكوات|Hack squat
leg-extension|machine|legExtension|beginner|Leg extension|تمديد أمامية الأرجل|Benspark
seated-legcurl|machine|legCurl|beginner|Seated leg curl|ثني خلفية الأرجل جالس|Sittande lårcurl
lying-legcurl|machine|legCurl|beginner|Lying leg curl|ثني خلفية الأرجل مستلقي|Liggande lårcurl
calf-machine|machine|calf|beginner|Standing calf machine|سمانة واقف جهاز|Stående vadpress
seated-calf|machine|calf|beginner|Seated calf raise|سمانة جالس جهاز|Sittande vadpress
hip-abductor|machine|hip|beginner|Hip abduction machine|جهاز إبعاد الفخذ|Höftabduktion i maskin`,
core:`plank|bodyweight|coreStability|beginner|Plank|بلانك|Plankan
side-plank|bodyweight|coreStability|beginner|Side plank|بلانك جانبي|Sidoplankan
dead-bug|bodyweight|coreStability|beginner|Dead bug|ديد باغ|Dead bug
bird-dog|bodyweight|coreStability|beginner|Bird dog|بيرد دوغ|Fågelhund
crunch|bodyweight|coreFlexion|beginner|Crunch|كرنش|Crunch
reverse-crunch|bodyweight|coreFlexion|beginner|Reverse crunch|كرنش عكسي|Omvänd crunch
hanging-knee|bodyweight|coreFlexion|intermediate|Hanging knee raise|رفع الركبتين معلقاً|Hängande knälyft
bicycle-crunch|bodyweight|coreRotation|intermediate|Bicycle crunch|كرنش دراجة|Cykelcrunch
db-side-bend|dumbbell|coreRotation|beginner|Dumbbell side bend|انحناء جانبي دمبل|Sidoböj med hantel
db-suitcase|dumbbell|coreStability|intermediate|Suitcase carry|حمل دمبل بيد واحدة|Suitcase carry
db-weighted-crunch|dumbbell|coreFlexion|intermediate|Weighted dumbbell crunch|كرنش دمبل|Crunch med hantel
bb-rollout|barbell|coreStability|advanced|Barbell rollout|تمدد البطن بالبار|Utrullning med skivstång
cable-crunch|machine|coreFlexion|intermediate|Cable crunch|كرنش كيبل|Kabelcrunch
pallof-press|machine|coreStability|beginner|Pallof press|ضغط بالوف|Pallofpress
machine-crunch|machine|coreFlexion|beginner|Ab crunch machine|كرنش جهاز|Magcrunch i maskin`,
cardio:`walking|bodyweight|locomotion|beginner|Walking|المشي|Promenad
jogging|bodyweight|locomotion|beginner|Jogging|هرولة|Joggning
jumping-jack|bodyweight|conditioning|beginner|Jumping jack|قفز فتح وضم|Jumping jacks
high-knees|bodyweight|conditioning|intermediate|High knees|رفع الركبتين سريعاً|Höga knän
mountain-climber|bodyweight|conditioning|intermediate|Mountain climber|متسلق الجبل|Mountain climbers
burpee|bodyweight|conditioning|advanced|Burpee|بيربي|Burpees
shadow-box|bodyweight|conditioning|beginner|Shadow boxing|ملاكمة الظل|Skuggboxning
db-farmer|dumbbell|conditioning|intermediate|Farmer carry|حمل المزارع دمبل|Farmer's walk
db-thruster|dumbbell|conditioning|advanced|Dumbbell thruster|سكوات وضغط دمبل|Hantelthruster
bb-thruster|barbell|conditioning|advanced|Barbell thruster|سكوات وضغط بار|Skivstångsthruster
treadmill|machine|locomotion|beginner|Treadmill walking|مشي جهاز السير|Gång på löpband
stationary-bike|machine|cyclicCardio|beginner|Stationary bike|دراجة ثابتة|Motionscykel
elliptical|machine|cyclicCardio|beginner|Elliptical trainer|جهاز إليبتيكال|Crosstrainer
rowing-machine|machine|cyclicCardio|intermediate|Rowing machine|جهاز تجديف|Roddmaskin
stair-climber|machine|cyclicCardio|intermediate|Stair climber|جهاز صعود الدرج|Trappmaskin`
};
const extra={
chest:`archer-pushup|bodyweight|horizontalPush|advanced|Archer push-up|ضغط الرامي|Archer-armhävning
db-squeeze-press|dumbbell|horizontalPush|intermediate|Dumbbell squeeze press|ضغط دمبل متلاصق|Hantelpress med ihoppressade hantlar
single-db-bench|dumbbell|horizontalPush|intermediate|Single-arm dumbbell bench press|ضغط صدر دمبل بذراع واحدة|Enarms hantelpress
smith-bench|machine|horizontalPush|beginner|Smith machine bench press|بنش جهاز سميث|Bänkpress i Smithmaskin
cable-high-fly|machine|fly|intermediate|High-to-low cable fly|تفتيح كيبل تنازلي|Kabelcross uppifrån`,
back:`scapular-pullup|bodyweight|verticalPull|intermediate|Scapular pull-up|عقلة لوح الكتف|Skulderbladschins
db-elbow-out-row|dumbbell|horizontalPull|intermediate|Elbows-out dumbbell row|سحب دمبل بمرفقين للخارج|Hantelrodd med breda armbågar
meadows-row|barbell|horizontalPull|advanced|Meadows row|سحب ميدوز|Meadowsrodd
cable-single-row|machine|horizontalPull|beginner|Single-arm cable row|سحب كيبل بذراع واحدة|Enarms kabelrodd
machine-pullover|machine|pullover|beginner|Machine pullover|سحب ظهر بول أوفر جهاز|Pullover i maskin`,
shoulders:`db-scaptation|dumbbell|lateralRaise|beginner|Dumbbell scaption|رفع دمبل بمستوى لوح الكتف|Scaption med hantlar
half-kneel-db-press|dumbbell|verticalPush|intermediate|Half-kneeling dumbbell press|ضغط كتف دمبل نصف ركوع|Hantelpress i halvknästående
bb-front-raise|barbell|frontRaise|intermediate|Barbell front raise|رفرفة أمامية بار|Frontlyft med skivstång
cable-front-raise|machine|frontRaise|beginner|Cable front raise|رفرفة أمامية كيبل|Frontlyft i kabel
cable-rear-fly|machine|rearDelt|intermediate|Cable reverse fly|رفرفة خلفية كيبل|Omvänd kabelcross`,
arms:`db-zottman|dumbbell|curl|intermediate|Zottman curl|بايسبس زوتمان|Zottmancurl
db-cross-hammer|dumbbell|curl|beginner|Cross-body hammer curl|هامر دمبل متقاطع|Hammarcurl över kroppen
bb-wrist-curl|barbell|forearm|beginner|Barbell wrist curl|ثني معصم بالبار|Handledscurl med skivstång
cable-overhead-triceps|machine|triceps|intermediate|Cable overhead extension|ترايسبس كيبل فوق الرأس|Tricepspress över huvudet i kabel
cable-reverse-pushdown|machine|triceps|intermediate|Reverse-grip pushdown|ترايسبس كيبل قبضة عكسية|Triceps pushdown med omvänt grepp`,
legs:`cossack-squat|bodyweight|squat|intermediate|Cossack squat|سكوات جانبي قوزاق|Cossack squat
db-single-rdl|dumbbell|hinge|intermediate|Single-leg dumbbell Romanian deadlift|ديدلفت روماني دمبل برجل واحدة|Rumänska enbensmarklyft med hantlar
bb-zercher|barbell|squat|advanced|Zercher squat|سكوات زيرشر|Zercherböj
hip-adductor|machine|hip|beginner|Hip adduction machine|جهاز التقريب للفخذ|Höftadduktion i maskin
cable-glute-kickback|machine|hip|beginner|Cable glute kickback|رفس خلفي للأرداف كيبل|Glute kickback i kabel`,
stretch:`doorway-chest|bodyweight|staticStretch|beginner|Doorway chest stretch|إطالة الصدر عند الباب|Bröststretch i dörröppning|chest,shoulders
cross-body-shoulder|bodyweight|staticStretch|beginner|Cross-body shoulder stretch|إطالة الكتف عبر الجسم|Axelstretch över kroppen|shoulders
overhead-triceps-stretch|bodyweight|staticStretch|beginner|Overhead triceps stretch|إطالة الترايسبس فوق الرأس|Tricepsstretch över huvudet|arms
seated-hamstring-stretch|bodyweight|staticStretch|beginner|Seated hamstring stretch|إطالة خلف الفخذ جالسًا|Sittande hamstringsstretch|legs
standing-quad-stretch|bodyweight|staticStretch|beginner|Standing quadriceps stretch|إطالة أمام الفخذ واقفًا|Stående lårstretch|legs
wall-calf-stretch|bodyweight|staticStretch|beginner|Wall calf stretch|إطالة السمانة على الحائط|Vadstretch mot vägg|legs
half-kneel-hip-stretch|bodyweight|staticStretch|beginner|Half-kneeling hip flexor stretch|إطالة مثنيات الورك نصف ركوع|Höftböjarstretch i halvknästående|legs
figure-four|bodyweight|staticStretch|beginner|Supine figure-four stretch|إطالة الأرداف بشكل أربعة|Liggande fyrastretch|legs
butterfly-stretch|bodyweight|staticStretch|beginner|Butterfly stretch|إطالة الفراشة|Fjärilsstretch|legs
arm-circles|bodyweight|dynamicStretch|beginner|Arm circles|دوائر الذراعين|Armcirklar|shoulders
leg-swing-front|bodyweight|dynamicStretch|beginner|Forward leg swings|تأرجح الساق أماميًا|Bensving framåt|legs
leg-swing-side|bodyweight|dynamicStretch|beginner|Lateral leg swings|تأرجح الساق جانبيًا|Bensving åt sidan|legs
walking-lunge-rotation|bodyweight|dynamicStretch|intermediate|Walking lunge with rotation|اندفاع مشي مع دوران|Gående utfall med rotation|legs,core
dynamic-inchworm|bodyweight|dynamicStretch|intermediate|Inchworm|مشي اليدين من الوقوف|Inchworm|legs,core
cat-cow|bodyweight|mobility|beginner|Cat-cow mobility|حركة القطة والبقرة|Katt-ko|back,core
open-book|bodyweight|mobility|beginner|Open book rotation|دوران الكتاب المفتوح|Open book-rotation|back,shoulders
ankle-rocks|bodyweight|mobility|beginner|Knee-to-wall ankle rocks|تحريك الكاحل نحو الحائط|Knä mot vägg|legs
hip-90-90|bodyweight|mobility|intermediate|90/90 hip switches|تبديل الورك 90/90|90/90-höftrotation|legs
thoracic-extension|bodyweight|mobility|beginner|Seated thoracic extension|تمديد الصدر والظهر جالسًا|Bröstryggsextension sittande|back
scapular-wall-circles|bodyweight|mobility|beginner|Scapular wall circles|دوائر لوح الكتف على الحائط|Skulderbladscirklar mot vägg|shoulders
march-in-place|bodyweight|warmup|beginner|March in place|مشي في المكان|Marsch på stället|legs
heel-to-toe-rock|bodyweight|warmup|beginner|Heel-to-toe rocks|تأرجح الكعب والأصابع|Häl-tå-gungning|legs
side-step-warmup|bodyweight|warmup|beginner|Side-step warm-up|خطوات جانبية للإحماء|Sidosteg som uppvärmning|legs
child-pose|bodyweight|cooldown|beginner|Child's pose|وضعية الطفل|Barnets position|back
supine-knee-hug|bodyweight|cooldown|beginner|Supine knee hug|ضم الركبتين مستلقيًا|Liggande knäkram|legs,back`
};
export const seedExercises=Object.freeze([source,extra].flatMap(set=>Object.entries(set).flatMap(([muscle,rows])=>rows.split('\n').map(row=>{
  const [id,equipment,pattern,level,en,ar,sv,targets]=row.split('|');
  return Object.freeze({id,muscle,secondary:targets?targets.split(','):secondaryGroups(pattern,muscle),equipment,pattern,level,names:{en,ar,sv},archived:false,notes:{en:'',ar:'',sv:''},media:null});
}))));
export const exerciseName=(row,lang)=>row?.names?.[lang]||row?.names?.en||row?.id||'';
export const alternatives=(catalog,row)=>catalog.filter(x=>!x.archived&&x.id!==row.id&&x.muscle===row.muscle&&x.pattern===row.pattern&&(row.muscle!=='stretch'||row.secondary?.some(m=>x.secondary?.includes(m))));
