// A catalog record represents a specific food/preparation, never a generic serving.
export const nutrientKeys=['kcal','protein','carbs','fat','fiber','sugar','saturated','sodium'];
export const cuisines=['basic','arabic','swedish','european','global'];
export const foodGroups=['meat','fish','eggs','dairy','grains','legumes','vegetables','fruit','nuts','fats','drinks','dishes','supplements'];
export const servingUnits=['g','kg','cup','piece','slice','tbsp','tsp','ml','l','serving','pack'];
export const goals=['loss','gain','maintenance','recomposition'];
export const meals=['breakfast','lunch','dinner','snack','preWorkout','postWorkout','suhoor','iftar'];
export const strategies=['flexible','macroTracking','carbCycling','mealTiming','mealPrep','ramadan'];
export const templates=[
  ['loss','loss'],['gain','gain'],['maintenance','maintenance'],['recomposition','recomposition'],
  ['vegetarian','maintenance'],['budget','maintenance'],['athlete','gain'],['ramadan','maintenance'],['startfit','maintenance']
];
export const sources={
  swedish:'https://www.livsmedelsverket.se/en/about-us/open-data/food-composition-data/',
  usda:'https://fdc.nal.usda.gov/download-datasets/',
  norwegian:'https://www.matvaretabellen.no/en/api/',
  lebanese:'https://doi.org/10.12688/f1000research.27461.1',
  saudi:'https://doi.org/10.3389/fnut.2025.1658078',
  swedishCarbGuidance:'https://www.livsmedelsverket.se/livsmedel-och-innehall/naringsamne/livsmedelsdatabasen/naringsdeklaration/'
};
// Swedish Food Agency guidance: where measured sugar exceeds carbohydrate by
// difference, raise carbohydrate to measured sugar and adjust energy by 4 kcal/g.
export function normalizeSwedishCarbs(nutrients,source){
  const {carbs,sugar,kcal}=nutrients;
  if(Number.isFinite(carbs)&&Number.isFinite(sugar)&&Number.isFinite(kcal)&&sugar>carbs){
    return {nutrients:{...nutrients,carbs:sugar,kcal:Math.round((kcal+4*(sugar-carbs))*10)/10},source:`${source} · SLV carbohydrate guidance (original CHO ${carbs} g, ${kcal} kcal; adjusted to measured sugar)`};
  }
  return {nutrients,source};
}
// Unmatched nutrient records stay unavailable for calculations. Values of zero are
// valid only when explicitly supplied by a source; unknown is never interpreted as zero.
const rows=[];
function add(cuisine,group,raw){
  for(const line of raw.trim().split('\n')){
    const [en,ar,sv]=line.split('|').map(x=>x.trim());
    rows.push({id:'food-'+cuisine+'-'+(rows.length+1),names:{en,ar,sv},cuisine,group,preparation:'',nutrients:null,portions:{g:1,kg:1000},source:null,status:'draft'});
  }
}
add('basic','meat',`Chicken breast raw|صدر دجاج نيء|Rå kycklingfilé
Chicken breast grilled|صدر دجاج مشوي|Grillad kycklingfilé
Chicken thigh raw|فخذ دجاج نيء|Rå kycklinglårfilé
Chicken thigh roasted|فخذ دجاج مشوي|Ugnsstekt kycklinglår
Turkey breast|صدر ديك رومي|Kalkonbröst
Ground beef|لحم بقر مفروم|Nötfärs
Lean beef steak|شريحة لحم بقر قليلة الدهن|Mager nötbiff
Lamb leg|فخذ خروف|Lammstek
Lamb mince|لحم غنم مفروم|Lammfärs
Veal|لحم عجل|Kalvkött
Pork tenderloin|فيليه خنزير|Fläskfilé
Beef liver|كبد بقري|Nötlever`);
add('basic','fish',`Salmon raw|سلمون نيء|Rå lax
Salmon baked|سلمون بالفرن|Ugnsbakad lax
Cod|سمك القد|Torsk
Tuna in water|تونة بالماء|Tonfisk i vatten
Tuna in oil|تونة بالزيت|Tonfisk i olja
Sardines|سردين|Sardiner
Mackerel|ماكريل|Makrill
Herring|رنجة|Sill
Shrimp|روبيان|Räkor
Trout|تروتة|Öring`);
add('basic','eggs',`Whole egg raw|بيضة نيئة|Rått ägg
Boiled egg|بيضة مسلوقة|Kokt ägg
Egg white|بياض البيض|Äggvita
Egg yolk|صفار البيض|Äggula`);
add('basic','dairy',`Whole milk|حليب كامل الدسم|Standardmjölk
Low-fat milk|حليب قليل الدسم|Lättmjölk
Skim milk|حليب منزوع الدسم|Skummjölk
Plain yogurt|لبن زبادي طبيعي|Naturell yoghurt
Greek yogurt|زبادي يوناني|Grekisk yoghurt
Skyr|سكير|Skyr
Cottage cheese|جبنة قريش|Keso
Quark|كوارك|Kvarg
Feta|جبنة فيتا|Fetaost
Mozzarella|موزاريلا|Mozzarella
Cheddar|شيدر|Cheddar
Parmesan|بارميزان|Parmesan
Halloumi|حلوم|Halloumi
Cream|قشطة|Grädde
Butter|زبدة|Smör
Kefir|كفير|Kefir`);
add('basic','grains',`White rice dry|أرز أبيض جاف|Vitt ris okokt
White rice cooked|أرز أبيض مطبوخ|Kokt vitt ris
Brown rice dry|أرز بني جاف|Råris okokt
Brown rice cooked|أرز بني مطبوخ|Kokt råris
Basmati dry|أرز بسمتي جاف|Basmatiris okokt
Basmati cooked|أرز بسمتي مطبوخ|Kokt basmatiris
Rolled oats|شوفان رقائق|Havregryn
Oat porridge|عصيدة الشوفان|Havregrynsgröt
Bulgur dry|برغل جاف|Bulgur okokt
Bulgur cooked|برغل مطبوخ|Kokt bulgur
Quinoa dry|كينوا جافة|Quinoa okokt
Quinoa cooked|كينوا مطبوخة|Kokt quinoa
Couscous dry|كسكس جاف|Couscous okokt
Couscous cooked|كسكس مطبوخ|Kokt couscous
Pasta dry|معكرونة جافة|Pasta okokt
Pasta cooked|معكرونة مطبوخة|Kokt pasta
Whole wheat bread|خبز قمح كامل|Fullkornsbröd
White bread|خبز أبيض|Vitt bröd
Rye bread|خبز الجاودار|Rågbröd
Wheat flour|طحين قمح|Vetemjöl
Rye flour|طحين الجاودار|Rågmjöl
Barley|شعير|Korn
Millet|دخن|Hirs
Cornmeal|دقيق ذرة|Majsmjöl`);
add('basic','legumes',`Chickpeas dry|حمص جاف|Kikärter okokta
Chickpeas boiled|حمص مسلوق|Kokta kikärter
Red lentils dry|عدس أحمر جاف|Röda linser okokta
Red lentils cooked|عدس أحمر مطبوخ|Kokta röda linser
Green lentils dry|عدس أخضر جاف|Gröna linser okokta
Green lentils cooked|عدس أخضر مطبوخ|Kokta gröna linser
Kidney beans|فاصولياء حمراء|Kidneybönor
White beans|فاصولياء بيضاء|Vita bönor
Black beans|فاصولياء سوداء|Svarta bönor
Fava beans|فول|Bondbönor
Green peas|بازلاء خضراء|Gröna ärter
Soybeans|فول الصويا|Sojabönor
Tofu|توفو|Tofu
Tempeh|تمبيه|Tempeh`);
add('basic','vegetables',`Potato raw|بطاطا نيئة|Rå potatis
Potato boiled|بطاطا مسلوقة|Kokt potatis
Potato baked|بطاطا بالفرن|Bakad potatis
Sweet potato|بطاطا حلوة|Sötpotatis
Carrot|جزر|Morot
Tomato|بندورة|Tomat
Cucumber|خيار|Gurka
Broccoli|بروكلي|Broccoli
Cauliflower|قرنبيط|Blomkål
Spinach|سبانخ|Spenat
Lettuce|خس|Sallat
Kale|كرنب أجعد|Grönkål
Cabbage|ملفوف|Vitkål
Red cabbage|ملفوف أحمر|Rödkål
Red bell pepper|فلفل أحمر|Röd paprika
Green bell pepper|فلفل أخضر|Grön paprika
Onion|بصل|Lök
Garlic|ثوم|Vitlök
Leek|كراث|Purjolök
Celery|كرفس|Selleri
Zucchini|كوسا|Zucchini
Eggplant|باذنجان|Aubergine
Mushrooms|فطر|Champinjoner
Asparagus|هليون|Sparris
Beetroot|شمندر|Rödbeta
Turnip|لفت|Rova
Radish|فجل|Rädisa
Pumpkin|يقطين|Pumpa
Okra|بامية|Okra
Green beans|فاصولياء خضراء|Haricots verts
Corn|ذرة|Majs
Parsley|بقدونس|Persilja
Mint|نعناع|Mynta
Arugula|جرجير|Rucola`);
add('basic','fruit',`Apple|تفاح|Äpple
Banana|موز|Banan
Orange|برتقال|Apelsin
Mandarin|يوسفي|Mandarin
Pear|إجاص|Päron
Peach|دراق|Persika
Plum|برقوق|Plommon
Apricot|مشمش|Aprikos
Grapes|عنب|Vindruvor
Strawberry|فراولة|Jordgubbar
Blueberry|توت أزرق|Blåbär
Raspberry|توت العليق|Hallon
Blackberry|توت أسود|Björnbär
Lingonberry|توت بري أحمر|Lingon
Watermelon|بطيخ|Vattenmelon
Melon|شمام|Melon
Pineapple|أناناس|Ananas
Mango|مانجو|Mango
Kiwi|كيوي|Kiwi
Pomegranate|رمان|Granatäpple
Fig|تين|Fikon
Dates|تمر|Dadlar
Raisins|زبيب|Russin
Avocado|أفوكادو|Avokado
Grapefruit|جريب فروت|Grapefrukt
Lemon|ليمون|Citron
Cherry|كرز|Körsbär
Papaya|بابايا|Papaya`);
add('basic','nuts',`Almonds|لوز|Mandlar
Walnuts|جوز|Valnötter
Pistachios|فستق حلبي|Pistagenötter
Cashews|كاجو|Cashewnötter
Peanuts|فول سوداني|Jordnötter
Hazelnuts|بندق|Hasselnötter
Pecans|بيكان|Pekannötter
Brazil nuts|جوز برازيلي|Paranötter
Sunflower seeds|بذور دوار الشمس|Solrosfrön
Pumpkin seeds|بذور اليقطين|Pumpafrön
Chia seeds|بذور الشيا|Chiafrön
Flax seeds|بذور الكتان|Linfrön
Sesame seeds|سمسم|Sesamfrön`);
add('basic','fats',`Olive oil|زيت زيتون|Olivolja
Rapeseed oil|زيت اللفت|Rapsolja
Sunflower oil|زيت دوار الشمس|Solrosolja
Sesame oil|زيت السمسم|Sesamolja
Ghee|سمن|Ghee
Tahini|طحينة|Tahini
Peanut butter|زبدة الفول السوداني|Jordnötssmör
Almond butter|زبدة اللوز|Mandelsmör`);
add('basic','drinks',`Water|ماء|Vatten
Black coffee|قهوة سوداء|Svart kaffe
Tea|شاي|Te
Orange juice|عصير برتقال|Apelsinjuice
Apple juice|عصير تفاح|Äppeljuice
Oat drink|مشروب شوفان|Havredryck
Soy drink|مشروب صويا|Sojadryck
Almond drink|مشروب لوز|Mandeldryck`);
add('arabic','dishes',`Hummus|حمص بالطحينة|Hummus
Falafel|فلافل|Falafel
Foul medames|فول مدمس|Foul medames
Baba ghanoush|بابا غنوج|Baba ganoush
Mutabbal|متبل|Mutabbal
Tabbouleh|تبولة|Tabbouleh
Fattoush|فتوش|Fattoush
Mujaddara|مجدرة|Mujaddara
Chicken shawarma|شاورما دجاج|Kycklingshawarma
Beef shawarma|شاورما لحم|Biffshawarma
Chicken kabsa|كبسة دجاج|Kycklingkabsa
Lamb kabsa|كبسة لحم|Lammkabsa
Chicken mandi|مندي دجاج|Kycklingmandi
Lamb mandi|مندي لحم|Lammmandi
Maqluba|مقلوبة|Maqluba
Kibbeh baked|كبة بالصينية|Ugnsbakad kibbeh
Kibbeh fried|كبة مقلية|Friterad kibbeh
Shish tawook|شيش طاووق|Shish tawook
Kofta skewers|كفتة مشوية|Koftaspett
Lentil soup|شوربة عدس|Linssoppa
Freekeh with chicken|فريكة بالدجاج|Freekeh med kyckling
Molokhia|ملوخية|Molokhia
Stuffed zucchini|كوسا محشي|Fylld zucchini
Stuffed vine leaves|ورق عنب|Fyllda vinblad
Musakhan|مسخن|Musakhan
Mansaf|منسف|Mansaf
Sayadiyah|صيادية|Sayadiyah
Shakshuka|شكشوكة|Shakshuka
Manakish zaatar|مناقيش زعتر|Zaatarmanakish
Manakish cheese|مناقيش جبنة|Ostmanakish
Sfiha|صفيحة|Sfiha
Lahm bi ajin|لحم بعجين|Lahm bi ajin
Harira|حريرة|Harira
Chicken tagine|طاجين دجاج|Kycklingtagine
Lamb tagine|طاجين لحم|Lammtagine
Koshari|كشري|Koshari
Fatteh chickpea|فتة حمص|Kikärtsfatteh
Fatteh eggplant|فتة باذنجان|Auberginefatteh
Rice pudding|رز بحليب|Risgrynspudding
Muhammara|محمرة|Muhammara
Labneh|لبنة|Labneh
Luqaimat|لقيمات|Luqaimat
Qatayef|قطايف|Qatayef
Kunafa|كنافة|Kunafa
Baklava|بقلاوة|Baklava
Basbousa|بسبوسة|Basbousa
Maamoul dates|معمول تمر|Dadelmaamoul
Sambousek meat|سمبوسك لحم|Köttsambousek
Sambousek cheese|سمبوسك جبنة|Ostsambousek
Chicken musaqa'a|مسقعة دجاج|Kycklingmusaqaa`);
add('swedish','dishes',`Swedish meatballs|كرات اللحم السويدية|Köttbullar
Crispbread|خبز مقرمش سويدي|Knäckebröd
Cultured milk|لبن سويدي|Filmjölk
Gravlax|سلمون معالج|Gravad lax
Pickled herring|رنجة مخللة|Inlagd sill
Potato pancakes|فطائر البطاطا|Raggmunk
Pea soup|شوربة البازلاء السويدية|Ärtsoppa
Swedish pancakes|فطائر سويدية|Pannkakor
Pytt i panna|مكعبات بطاطا ولحم|Pytt i panna
Janssons temptation|بطاطا يانسون|Janssons frestelse
Sausage stroganoff|ستروغانوف النقانق|Korv stroganoff
Falukorv|نقانق فالو|Falukorv
Brown beans|فاصولياء بنية سويدية|Bruna bönor
Potato dumplings|زلابية بطاطا|Kroppkakor
Pitepalt|بيتي بالت|Pitepalt
Kalops|يخنة لحم سويدية|Kalops
Dill meat|يخنة بالشبت|Dillkött
Cabbage rolls|ملفوف محشي سويدي|Kåldolmar
Cabbage pudding|بودينغ الملفوف|Kålpudding
Fish gratin|غراتان السمك|Fiskgratäng
Fish soup|شوربة سمك سويدية|Fisksoppa
Salmon with dill sauce|سلمون بصلصة الشبت|Lax med dillsås
Shrimp sandwich|ساندويش روبيان|Räkmacka
Toast Skagen|توست سكاين|Toast Skagen
Open cheese sandwich|ساندويش جبنة مفتوح|Ostsmörgås
Semla|سملا|Semla
Cinnamon bun|لفافة قرفة|Kanelbulle
Cardamom bun|لفافة هال|Kardemummabulle
Saffron bun|كعكة زعفران|Lussekatt
Chocolate ball|كرة شوكولا|Chokladboll
Princess cake|كعكة الأميرة|Prinsesstårta
Kladdkaka|كعكة شوكولا سويدية|Kladdkaka
Rice porridge|عصيدة أرز سويدية|Risgrynsgröt
Potato mash|بطاطا مهروسة|Potatismos
Wallenbergare|فالنبرغاره|Wallenbergare`);
add('european','dishes',`Margherita pizza|بيتزا مارغريتا|Pizza Margherita
Pepperoni pizza|بيتزا بيبروني|Pepperonipizza
Vegetable pizza|بيتزا خضار|Grönsakspizza
Spaghetti bolognese|سباغيتي بولونيز|Spaghetti bolognese
Pasta carbonara|باستا كاربونارا|Pasta carbonara
Pasta pesto|باستا بيستو|Pasta pesto
Pasta arrabbiata|باستا أرابياتا|Pasta arrabbiata
Lasagna|لازانيا|Lasagne
Mushroom risotto|ريزوتو بالفطر|Svamprisotto
Caprese salad|سلطة كابريزي|Capresesallad
Gnocchi|نيوكي|Gnocchi
Minestrone|شوربة مينستروني|Minestrone
Bruschetta|بروشيتا|Bruschetta
Spanish tortilla|تورتيلا إسبانية|Spansk tortilla
Seafood paella|باييا بحرية|Skaldjurspaella
Chicken paella|باييا دجاج|Kycklingpaella
Gazpacho|غازباتشو|Gazpacho
Greek salad|سلطة يونانية|Grekisk sallad
Moussaka|مسقعة يونانية|Moussaka
Souvlaki|سوفلاكي|Souvlaki
Tzatziki|تزاتزيكي|Tzatziki
Ratatouille|راتاتوي|Ratatouille
Quiche Lorraine|كيش لورين|Quiche Lorraine
Croissant|كرواسون|Croissant
French onion soup|شوربة بصل فرنسية|Fransk löksoppa
Coq au vin|كوك أو فان|Coq au vin
Beef bourguignon|لحم بورغينيون|Boeuf bourguignon
Schnitzel|شنيتزل|Schnitzel
Sauerkraut|ملفوف مخلل|Surkål
Bratwurst|براتفورست|Bratwurst
Pierogi|بيروغي|Pierogi
Goulash|غولاش|Gulasch
Fish and chips|سمك وبطاطا مقلية|Fish and chips
Shepherd's pie|فطيرة الراعي|Shepherd's pie
Irish stew|يخنة أيرلندية|Irländsk gryta`);
add('global','dishes',`Salmon sushi|سوشي سلمون|Laxsushi
Tuna sushi|سوشي تونة|Tonfisksushi
Vegetable sushi|سوشي خضار|Vegetarisk sushi
Miso soup|شوربة ميسو|Misosoppa
Ramen|رامن|Ramen
Chicken teriyaki|دجاج ترياكي|Teriyakikyckling
Pad Thai|باد تاي|Pad thai
Green curry|كاري أخضر|Grön curry
Red curry|كاري أحمر|Röd curry
Chicken biryani|برياني دجاج|Kycklingbiryani
Dal|دال عدس|Dal
Tandoori chicken|دجاج تندوري|Tandoorikyckling
Butter chicken|دجاج بالزبدة|Butter chicken
Chana masala|حمص ماسالا|Chana masala
Spring rolls|لفائف الربيع|Vårrullar
Fried rice|أرز مقلي|Stekt ris
Bibimbap|بيبيمباب|Bibimbap
Kimchi|كيمتشي|Kimchi
Beef tacos|تاكو لحم|Bifftacos
Chicken tacos|تاكو دجاج|Kycklingtacos
Burrito|بوريتو|Burrito
Quesadilla|كاساديا|Quesadilla
Guacamole|غواكامولي|Guacamole
Chili con carne|تشيلي كون كارني|Chili con carne
Hamburger|هامبرغر|Hamburgare
Chicken burger|برغر دجاج|Kycklingburgare
Coleslaw|كولسلو|Coleslaw
Jollof rice|أرز جولوف|Jollofris
Injera|إنجيرا|Injera
Chicken satay|دجاج ساتاي|Kycklingsatay`);
add('basic','grains',`Buckwheat|حنطة سوداء|Bovete
Buckwheat cooked|حنطة سوداء مطبوخة|Kokt bovete
Spelt flour|طحين الحنطة|Dinkelmjöl
Rice noodles|شعيرية الأرز|Risnudlar
Rice noodles cooked|شعيرية أرز مطبوخة|Kokta risnudlar
Sourdough bread|خبز العجين المخمر|Surdegsbröd
Pita bread|خبز عربي|Pitabröd
Wholegrain tortilla|تورتيلا قمح كامل|Fullkornstortilla
Popcorn kernels|ذرة فشار|Popcornkärnor
Plain popped popcorn|فشار دون إضافات|Naturella popcorn`);
add('basic','vegetables',`Artichoke|خرشوف|Kronärtskocka
Fennel|شمر|Fänkål
Parsnip|جزر أبيض|Palsternacka
Brussels sprouts|ملفوف بروكسل|Brysselkål
Sugar snap peas|بازلاء سكرية|Sockerärter
Watercress|جرجير مائي|Vattenkrasse
Swiss chard|سلق|Mangold
Butternut squash|قرع عسلي|Butternutpumpa`);
add('basic','fruit',`Pineapple dried|أناناس مجفف|Torkad ananas
Dried apricot|مشمش مجفف|Torkade aprikoser
Prunes|قراصيا|Katrinplommon
Passion fruit|باشن فروت|Passionsfrukt
Guava|جوافة|Guava
Persimmon|كاكي|Persimon`);
add('basic','supplements',`Whey protein concentrate|بروتين مصل الحليب المركز|Vassleproteinkoncentrat
Whey protein isolate|بروتين مصل الحليب المعزول|Vassleproteinisolat
Soy protein powder|مسحوق بروتين الصويا|Sojaproteinpulver
Pea protein powder|مسحوق بروتين البازلاء|Ärtproteinpulver
Milk casein powder|مسحوق الكازين|Kaseinpulver`);
add('arabic','dishes',`Chicken fatteh|فتة دجاج|Kycklingfatteh
Lamb fatteh|فتة لحم|Lammfatteh
Kibbeh in yogurt|كبة لبنية|Kibbeh i yoghurt
Kibbeh with pomegranate|كبة رمانية|Kibbeh med granatäpple
Kibbeh grilled|كبة مشوية|Grillad kibbeh
Kibbeh potato|كبة بطاطا|Potatiskibbeh
Shish barak|شيش برك|Shish barak
Kebab halabi|كباب حلبي|Aleppokebab
Kebab karaz|كباب بالكرز|Körsbärskebab
Kebab khashkhash|كباب خشخاش|Khashkhashkebab
Arayes|عرايس|Arayes
Hawawshi|حواوشي|Hawawshi
Egyptian taameya|طعمية مصرية|Egyptisk taameya
Egyptian ful with tomato|فول بالطماطم|Ful med tomat
Chicken musakhan rolls|رولات مسخن|Musakhanrullar
Palestinian maftoul|مفتول فلسطيني|Palestinsk maftoul
Lebanese moghrabieh|مغربية لبنانية|Libanesisk moghrabieh
Lamb ouzi|أوزي لحم|Lammouzi
Chicken ouzi|أوزي دجاج|Kycklingouzi
Bukhari rice|رز بخاري|Bukhariris
Madhbi chicken|دجاج مظبي|Madhbikyckling
Harees|هريس|Harees
Jareesh|جريش|Jareesh
Thareed|ثريد|Thareed
Saleeg|سليق|Saleeg
Iraqi masgouf|مسكوف عراقي|Irakisk masgouf
Iraqi dolma|دولمة عراقية|Irakisk dolma
Iraqi quzi|قوزي عراقي|Irakisk quzi
Iraqi tashreeb|تشريب عراقي|Irakisk tashreeb
Tunisian brik|بريك تونسي|Tunisisk brik
Lablabi|لبلابي|Lablabi
Tunisian couscous with fish|كسكسي بالسمك|Tunisisk fiskcouscous
Moroccan pastilla|بسطيلة مغربية|Marockansk pastilla
Moroccan zaalouk|زعلوك مغربي|Marockansk zaalouk
Moroccan taktouka|تكتوكة مغربية|Marockansk taktouka
Moroccan couscous with vegetables|كسكس بالخضار|Marockansk grönsakscouscous
Rfissa|رفيسة|Rfissa
Algerian chorba|شوربة جزائرية|Algerisk chorba
Algerian rechta|رشتة جزائرية|Algerisk rechta
Libyan bazeen|بازين ليبي|Libysk bazeen
Libyan mbakbaka|مبكبكة ليبية|Libysk mbakbaka
Sudanese kisra|كسرة سودانية|Sudanesisk kisra
Yemeni saltah|سلتة يمنية|Jemenitisk saltah
Yemeni fahsa|فحسة يمنية|Jemenitisk fahsa
Yemeni malawah|ملوح يمني|Jemenitisk malawah
Mutabbaq|مطبق|Mutabbaq
Cheese fatayer|فطاير جبنة|Ostfatayer
Spinach fatayer|فطاير سبانخ|Spenatfatayer
Za'atar flatbread with vegetables|خبز زعتر بالخضار|Zaatarbröd med grönsaker
Qatayef nuts|قطايف جوز|Qatayef med valnötter`);
add('swedish','dishes',`Meatballs with mash|كرات لحم مع مهروس البطاطا|Köttbullar med potatismos
Meatballs tomato sauce|كرات لحم بصلصة الطماطم|Köttbullar i tomatsås
Swedish beef patties|أقراص لحم سويدية|Pannbiff
Pork roast|لحم خنزير مشوي سويدي|Fläskstek
Stekt fläsk|لحم خنزير مقلي|Stekt fläsk
Swedish sausage soup|شوربة نقانق سويدية|Korvsoppa
Grilled sausage with bread|نقانق مشوية مع خبز|Korv med bröd
Falukorv in oven|فالو بالفرن|Ugnsstekt falukorv
Swedish potato salad|سلطة بطاطا سويدية|Potatissallad
Creamed potatoes|بطاطا بالكريمة|Stuvad potatis
Dill potatoes|بطاطا بالشبت|Dillpotatis
Potato gratin|غراتان بطاطا|Potatisgratäng
Creamed macaroni|معكرونة بالحليب|Stuvade makaroner
Macaroni pudding|بودينغ معكرونة|Makaronipudding
Swedish oven pancake|بانكيك سويدي بالفرن|Ugnspannkaka
Swedish blood pudding|بودينغ الدم السويدي|Blodpudding
Palt with pork|بالت مع لحم|Fläskpalt
Gubbröra|سلطة بيض وأنشوفة|Gubbröra
Egg and anchovy sandwich|ساندويش بيض وأنشوفة|Ägg och ansjovissmörgås
Herring mustard sauce|رنجة بصلصة الخردل|Senapssill
Onion herring|رنجة بالبصل|Löksill
Fried herring|رنجة مقلية|Stekt strömming
Swedish smoked salmon|سلمون مدخن سويدي|Rökt lax
Salmon pudding|بودينغ سلمون|Laxpudding
Cod egg sauce|قد بصلصة البيض|Torsk med äggsås
Shrimp salad|سلطة روبيان|Räksallad
Smörgåstårta|كعكة الساندويش|Smörgåstårta
Swedish beetroot salad|سلطة شمندر سويدية|Rödbetssallad
Swedish coleslaw|سلطة ملفوف سويدية|Vitkålssallad
Swedish crisp oat bread|خبز شوفان مقرمش|Havreknäcke
Swedish rye loaf|خبز جاودار سويدي|Rågkaka
Swedish flatbread|خبز سويدي رقيق|Tunnbröd
Swedish hard bread roll|لفافة خبز مقرمشة|Knäckebrödsrulle
Swedish cheese pie|فطيرة جبنة سويدية|Västerbottenspaj
Apple cake Swedish|كعكة تفاح سويدية|Äppelkaka
Blueberry soup|شوربة توت أزرق|Blåbärssoppa
Rosehip soup|شوربة ثمر الورد|Nyponsoppa
Swedish cheesecake|كعكة جبنة سويدية|Ostkaka
Swedish waffle|وافل سويدي|Våffla
Swedish sponge cake|كيك إسفنجي سويدي|Sockerkaka`);
add('european','dishes',`Pizza quattro formaggi|بيتزا أربعة أجبان|Pizza quattro formaggi
Pizza prosciutto|بيتزا بروسكيوتو|Pizza prosciutto
Focaccia|فوكاتشيا|Focaccia
Ciabatta|تشاباتا|Ciabatta
Ravioli spinach ricotta|رافيولي سبانخ وريكوتا|Ravioli med spenat och ricotta
Tortellini cheese|تورتيليني جبنة|Osttortellini
Cannelloni|كانيلوني|Cannelloni
Lemon risotto|ريزوتو بالليمون|Citronrisotto
Osso buco|أوسو بوكو|Osso buco
Polenta|بولينتا|Polenta
Arancini|أرانشيني|Arancini
Italian meatballs|كرات لحم إيطالية|Italienska köttbullar
Vitello tonnato|فيتيلو توناتو|Vitello tonnato
Panzanella|بانزانيلا|Panzanella
Tiramisu|تيراميسو|Tiramisu
Panna cotta|بانا كوتا|Panna cotta
Churros|تشوروس|Churros
Patatas bravas|بطاطا برافاس|Patatas bravas
Gambas al ajillo|روبيان بالثوم إسباني|Gambas al ajillo
Spanish lentil stew|يخنة عدس إسبانية|Spansk linsgryta
Portuguese bacalhau|باكالاو برتغالي|Portugisisk bacalhau
Caldo verde|كالدو فيردي|Caldo verde
Pastel de nata|باستيل دي ناتا|Pastel de nata
Greek spanakopita|سباناكوبيتا|Spanakopita
Greek tyropita|تيروبيتا|Tyropita
Greek fava|فافا يونانية|Grekisk fava
Greek chicken gyro|غيرو دجاج يوناني|Grekisk kycklinggyro
French crepe|كريب فرنسي|Fransk crêpe
Galette buckwheat|غالييت حنطة سوداء|Bovetegalett
Tarte tatin|تارت تاتان|Tarte tatin
Bouillabaisse|بويابيس|Bouillabaisse
Salad Nicoise|سلطة نيسواز|Nicoisesallad
French cassoulet|كاسوليه|Cassoulet
Potato rösti|روستي بطاطا|Rösti
Cheese fondue|فوندو جبنة|Ostfondue
German pretzel|بريتزل ألماني|Brezel
Spätzle|شبيتزله|Spätzle
Currywurst|كاري فورست|Currywurst
Polish bigos|بيغوس بولندي|Bigos
Hungarian lángos|لانغوش مجري|Lángos`);
add('global','dishes',`Japanese yakisoba|ياكيسوبا|Yakisoba
Japanese udon soup|شوربة أودون|Udonsoppa
Japanese onigiri|أونيغيري|Onigiri
Japanese tempura|تمبورا|Tempura
Chinese dumplings|زلابية صينية|Kinesiska dumplings
Kung pao chicken|دجاج كونغ باو|Kung pao-kyckling
Mapo tofu|مابو توفو|Mapo tofu
Sweet and sour chicken|دجاج حلو وحامض|Sötsur kyckling
Vietnamese pho|فو فيتنامي|Vietnamesisk pho
Banh mi|بان مي|Banh mi
Vietnamese summer rolls|لفائف فيتنامية طازجة|Vietnamesiska sommarrullar
Korean bulgogi|بولغوغي كوري|Bulgogi
Korean japchae|جابتشي كوري|Japchae
Indian palak paneer|بالاك بانير|Palak paneer
Indian samosa|سمبوسة هندية|Indisk samosa
Indian masala dosa|دوسا ماسالا|Masala dosa
Mexican enchiladas|إنشيلادا|Enchiladas
Mexican tamales|تاماليز|Tamales
Peruvian ceviche|سيفيتشي بيروفي|Peruansk ceviche
Brazilian feijoada|فيجوادا برازيلية|Brasiliansk feijoada`);
// Starter values transcribed from the indicated Swedish Food Agency entries.
// Swedish carbohydrate values are available carbohydrates (fiber is separate).
// All other foods stay drafts until a matching source and portions are imported.
const sourceRow=(en,id,values,portion,names)=>{
  const row=rows.find(x=>x.names.en===en);
  if(row)Object.assign(row,{...(names?{names}:{}),status:'ready',
    source:'https://soknaringsinnehall.livsmedelsverket.se/Home/FoodDetails/'+id,
    nutrients:Object.fromEntries(nutrientKeys.map((k,i)=>[k,values[i]??null])),
    portions:{g:1,kg:1000,serving:portion}});
};
sourceRow('Apple',588,[48,0,10.6,.1,2.3],125,{en:'Apple with skin',ar:'تفاح مع القشرة',sv:'Äpple med skal'});
sourceRow('Banana',553,[95,1.1,21.3,.1,1.4,null,null,0],105);
sourceRow('Boiled egg',2205,[136,12.1,0,9.8,0],50);
sourceRow('Swedish meatballs',1120,[183,14.3,4.1,12.2,.5,.9,5,636],100,{en:'Swedish fried pork meatballs',ar:'كرات لحم الخنزير السويدية المقلية',sv:'Köttbullar gris stekta'});
// Swedish Food Agency food composition database, version 2026-07-01 (CC BY 4.0).
// Values are per 100 g edible portion; sodium is in mg. Reference preparation is retained.
const verifiedSwedishRows=[
  ["food-basic-7",946,"Nöt ryggbiff rå",123,21.8,0,3.8,0,0,1.6,58],
  ["food-basic-10",936,"Kalv filé rå",105,20,0,2.7,0,0,1,55],
  ["food-basic-33",70,"Färskost cottage cheese naturell fett 4%",100,13.4,1.9,4.3,0,1.6,2.8,270],
  ["food-basic-40",1715,"Vispgrädde fett 40%",374,2.1,3,40,0,2.7,25.6,24],
  ["food-basic-61",214,"Bröd fullkorn råg osötat fibrer ca 5%",239,7.1,46.1,1.6,5,4.3,0.2,341],
  ["food-basic-64",705,"Korngryn ångprep. fullkorn",351,9.2,65.4,3.1,10.7,0.9,0.6,11],
  ["food-basic-77",2547,"Gröna ärtor kokta m. salt frysvara",69,5.2,8.9,0.4,4.4,5,0,276],
  ["food-basic-83",233,"Potatis m. skal bakad u. salt",91,1.7,19.4,0.1,2.5,0.6,0,4],
  ["food-basic-104",5861,"Sparris grön kokt m. salt",22,1.9,1.8,0.2,2.5,1.7,0,36],
  ["food-basic-110",331,"Gröna bönor",27,2.1,2.1,0.4,3.4,2.2,0.1,0],
  ["food-basic-111",495,"Majskolv kokt",100,3.3,17.3,1,3.7,1.7,0.1,255],
  ["food-basic-143",1575,"Sötmandel",592,20.7,0.5,53.2,18.7,3.6,4.4,0],
  ["food-basic-145",1570,"Pistaschnötter u. salt",555,23.4,15.8,42.5,10.6,7.9,4,7],
  ["food-basic-146",1557,"Cashewnötter rostade u. salt",597,18,19.1,48.7,8.3,5.9,8.7,16],
  ["food-basic-152",1571,"Pumpafrö",573,29.8,2.4,48,9.2,1.4,7.3,7],
  ["food-basic-153",6157,"Chiafrö",448,19.4,0,33.9,36.3,0.8,2.8,0],
  ["food-basic-156",35,"Olivolja",884,0,0,100,0,0,14.3,0],
  ["food-basic-157",2189,"Rapsolja",884,0,0,100,0,0,7.1,0],
  ["food-basic-161",3602,"Tahini",625,20.4,3.6,57.2,11.2,0.8,7.2,14],
  ["food-basic-162",1559,"Jordnötssmör",615,22.6,14.3,51,7.6,15.2,8.5,470],
  ["food-basic-170",6902,"Sojadryck osötad berikad",33,3.4,1.7,1.3,0.6,0.3,0.2,33],
  ["food-arabic-172",3051,"Hummus kikärtsröra",306,5.8,8.3,26.5,7.4,0.7,3.7,627],
  ["food-arabic-219",6951,"Pirog m. kött ugnsstekt typ sambusa",230,7.8,25.1,10.5,2.1,2.8,1.7,573],
  ["food-arabic-220",6953,"Pirog m. ost ugnsstekt typ sambusa",281,10.2,27.8,14,1.3,1.2,5.3,470],
  ["food-swedish-223",162,"Hårt bröd fullkorn råg fibrer 15,5% typ Husman",354,10,64.4,2.5,15.5,1.4,0.3,400],
  ["food-swedish-250",1610,"Sött vetebröd saffransbröd hembakad",291,5.8,46.3,8.5,2,12,3.8,175],
  ["food-european-259",773,"Pizza veg. hemlagad",179,6.4,19.1,8,2.2,3.9,3,368],
  ["food-global-316",2511,"Hamburgare 90 g m. bröd tillbehör tillagad på restaurang",249,11.9,17.5,14.4,1.5,3.8,3.6,363],
  ["food-swedish-405",5969,"Gris sidfläsk el. stekfläsk rimmat stekt",385,11.4,0.1,38.3,0,0.1,14.8,1010],
  ["food-swedish-420",3036,"Sill inlagd m. senapssås",239,5.2,14.5,18,0,10.7,1.7,747],
  ["food-swedish-423",1269,"Lax kallrökt",173,20,1.3,9.8,0,0,1.4,1100],
  ["food-swedish-430",178,"Hårt bröd fullkorn havre vete råg m. mjölk fibrer 8%",379,13,61.7,6.8,8,3.1,1,500],
  ["food-basic-1",1173,"Kyckling bröstfilé rå u. skinn",104,23.1,0,1.2,0,0,0.4,65],
  ["food-basic-3",1174,"Kyckling lår rå u. skinn",114,19.6,0,3.9,0,0,1.2,86],
  ["food-basic-5",1162,"Kalkon filé rå",106,24.1,0,0.9,0,0,0.3,97],
  ["food-basic-6",951,"Nöt färs rå fett 10%",182,20.1,0,11.3,0,0,5,86],
  ["food-basic-8",924,"Lamm stek rå",108,20.9,0,2.6,0,0,1,68],
  ["food-basic-9",925,"Lamm färs rå fett 20%",245,17.4,0,19.7,0,0,9.2,82],
  ["food-basic-11",970,"Gris fläskfilé rå",107,20.6,0,2.6,0,0,1,49],
  ["food-basic-12",1445,"Nöt lever rå",127,20,4.4,3.1,0,0,1,82],
  ["food-basic-13",1255,"Lax odlad Norge fjordlax rå",210,20.2,0.7,14.1,0,0,1.9,37],
  ["food-basic-15",1246,"Torsk rå",78,18.2,0,0.5,0,0,0.1,59],
  ["food-basic-16",1278,"Tonfisk i vatten konserv. avrunnen",106,24.1,0,1,0,0,0.2,384],
  ["food-basic-17",1275,"Tonfisk i olja konserv. avrunnen",189,24.9,0,9.9,0,0,1.2,406],
  ["food-basic-18",1271,"Sardiner i olja konserv.",284,24,0,21.1,0,0,4.6,510],
  ["food-basic-19",1260,"Makrill rå",290,17,0,25,0,0,5.3,43],
  ["food-basic-20",1241,"Sill rå",148,16.7,0,9,0,0,2,198],
  ["food-basic-21",1395,"Räka kokt",77,17.6,0,0.6,0,0,0.1,630],
  ["food-basic-22",1249,"Öring odlad rå",166,19,0,10,0,0,2,48],
  ["food-basic-23",1225,"Ägg rått",136,12.1,0,9.8,0,null,null,130],
  ["food-basic-24",2205,"Ägg kokt",136,12.1,0,9.8,0,0.3,2.6,130],
  ["food-basic-25",1227,"Äggvita rå",48,11.1,0.8,0,0,null,null,150],
  ["food-basic-26",1226,"Äggula rå",325,15.9,1.9,28.6,0,null,null,43],
  ["food-basic-27",123,"Mjölk fett 3% berikad",60,3.6,4.6,3,0,4.6,1.9,34],
  ["food-basic-28",151,"Lättmjölk fett 0,5% berikad",39,3.6,4.8,0.5,0,4.7,0.3,35],
  ["food-basic-29",5727,"Minimjölk fett < 0,1% berikad",35,3.6,4.8,0,0,4.8,0,35],
  ["food-basic-30",124,"Yoghurt naturell fett 3% berikad",56,3.4,4.5,2.7,0,2.9,1.8,38],
  ["food-basic-34",3243,"Kvarg naturell fett 0,2%",64,10,5.2,0.2,0,3.2,0.1,31],
  ["food-basic-36",2255,"Ost mozzarella fett 18%",214,15.6,0.8,16.6,0,0.4,10.6,198],
  ["food-basic-38",103,"Ost hårdost parmesan fett 30% typ Parmiggiano Reggiano",428,31.1,4.2,32.2,0,0,20.7,510],
  ["food-basic-39",100,"Ost halloumi rå fett 22%",292,22.3,1.9,21.9,0,0.9,14.9,1680],
  ["food-basic-41",29,"Smör fett 80%",766,0.6,0,86.3,0,null,null,480],
  ["food-basic-42",142,"Kefir fett 3% berikad",60,3.4,4.8,3,0,3.8,2,41],
  ["food-basic-43",2481,"Ris långkornigt okokt",352,7.8,76.9,0.7,1,0.1,0.1,0],
  ["food-basic-44",2515,"Ris långkornigt kokt m. salt",113,2.5,24.6,0.2,0.3,0,0,209],
  ["food-basic-45",2478,"Ris råris långkornigt okokt fullkorn",365,9.4,71.9,3,4.2,0.5,0.6,3],
  ["food-basic-46",2517,"Ris råris långkornigt kokt m. salt fullkorn",138,3.6,27.3,1.1,1.6,0.2,0.2,264],
  ["food-basic-47",2475,"Ris basmati okokt",359,9.2,76.7,1,0.5,0.4,0.2,0],
  ["food-basic-48",2513,"Ris basmati kokt m. salt",121,3.1,25.9,0.3,0.2,0.1,0.1,220],
  ["food-basic-49",702,"Havregryn fullkorn",375,9.5,64.1,7,7.5,1,1.1,1],
  ["food-basic-50",677,"Havregrynsgröt fullkorn",66,1.7,11.3,1.2,1.3,0.2,0.2,308],
  ["food-basic-51",829,"Bulgur",353,12.3,68.2,1.3,7.7,0.4,0.2,17],
  ["food-basic-52",830,"Bulgur kokt",129,4.3,23.1,1.2,4,0.3,0.2,110],
  ["food-basic-53",7025,"Mjölmålla quinoa okokt",356,14.4,56.8,6.1,7,0,0.7,5],
  ["food-basic-54",3518,"Mjölmålla quinoa röd kokt m. salt",140,4.4,21.7,2.4,6.7,0.8,0.2,277],
  ["food-basic-55",831,"Couscous",361,12.8,72.4,0.6,5,1.5,0.1,10],
  ["food-basic-56",3752,"Couscous kokt m. salt fullkorn",144,4.7,27,0.9,3.9,1.1,0.1,229],
  ["food-basic-57",845,"Pasta okokt",358,11.9,71.5,1.3,4,0.5,0.1,2],
  ["food-basic-58",846,"Pasta kokt u. salt",128,4.2,25.8,0.5,0.7,0.6,0,1],
  ["food-basic-60",202,"Bröd vitt fibrer 3,5%",284,8,46,6.4,4.3,6,0.5,288],
  ["food-basic-62",1941,"Vetemjöl",352,8.5,72.4,1.9,3.6,1.6,0.3,1],
  ["food-basic-63",1934,"Rågmjöl fullkorn",325,8.1,59.3,1.7,18.8,2,0.3,2],
  ["food-basic-65",827,"Hirs hela el. krossade korn fullkorn",352,10.5,68.4,2.9,3.2,0.6,0.6,5],
  ["food-basic-66",1933,"Majsmjöl gult u. groddar",354,6,71.5,3.4,4.7,1.2,0.4,0],
  ["food-basic-67",881,"Kikärtor torkade",331,18.8,39.6,5.1,25.2,1,0.5,27],
  ["food-basic-68",3762,"Kikärtor torkade kokta m. salt",133,8.1,12.6,2.9,12.3,0.7,0.4,243],
  ["food-basic-70",3822,"Röda linser torkade kokta m. salt",125,10.6,14.6,0.6,9.1,0.6,0.1,219],
  ["food-basic-72",3821,"Gröna linser torkade kokta m. salt",127,9.4,15.9,0.7,9.6,0.5,0.1,243],
  ["food-basic-73",3816,"Kidneybönor röda bönor konserv. u. lag",110,8.8,13.4,0.7,7.2,1,0.1,256],
  ["food-basic-74",880,"Vita bönor torkade kokta u. salt",108,7.8,14.2,0.6,7,1.5,0.1,7],
  ["food-basic-75",3817,"Svarta bönor konserv. u. lag",111,8.1,13.8,1,6.8,0.3,0.2,226],
  ["food-basic-76",324,"Bondbönor färska kokta u. salt",102,9,9.7,1,9,1.1,0.2,2],
  ["food-basic-78",887,"Sojabönor torkade",410,37.8,10.2,19.4,22.6,2.2,3,3],
  ["food-basic-79",905,"Tofu fast",70,6.6,1.2,4.2,0.4,0.2,0.6,59],
  ["food-basic-80",7027,"Tempeh",207,18.6,8.2,10.8,1.3,1.1,2.4,9],
  ["food-basic-81",4457,"Potatis rå",79,1.7,16.4,0.1,2.1,0.8,0,3],
  ["food-basic-82",5153,"Potatis kokt u. salt",83,1.8,17.5,0.1,2.1,0.8,0,3],
  ["food-basic-84",3765,"Sötpotatis rå",71,1.6,12.9,0.4,4.4,6.1,0,0],
  ["food-basic-85",289,"Morot",36,0.7,6.6,0.2,2.4,6.2,0,31],
  ["food-basic-86",364,"Tomat",18,0.8,2.6,0.1,1.3,2.8,0,2],
  ["food-basic-87",339,"Gurka",13,0.8,2.3,0.1,0,1.7,0,3],
  ["food-basic-88",325,"Broccoli",36,2.9,3.5,0.6,2.6,null,0.2,18],
  ["food-basic-89",322,"Blomkål",25,1.7,3.7,0,1.8,null,0,23],
  ["food-basic-90",4941,"Spenat färsk",24,3.3,0.8,0.4,2.1,0.3,0.1,100],
  ["food-basic-91",3938,"Huvudsallat",16,0.9,1.2,0.6,1.2,1,0.1,5],
  ["food-basic-92",337,"Grönkål",40,3.4,3.2,0.7,3.7,2.1,0,22],
  ["food-basic-93",370,"Vitkål",32,1.2,5.7,0,2,null,0,6],
  ["food-basic-94",355,"Rödkål",31,1.1,4.7,0.3,2.6,5,0.1,8],
  ["food-basic-95",351,"Paprika röd",22,0.5,4.1,0.2,0.9,4.9,0,0],
  ["food-basic-96",350,"Paprika grön",18,0.5,3,0.1,2,3,0,0],
  ["food-basic-97",344,"Lök gul",39,1.2,7.3,0.1,1.9,4.5,0,3],
  ["food-basic-98",371,"Vitlök",128,6.8,21.9,0.2,5.3,5.4,0,10],
  ["food-basic-99",354,"Purjolök",30,1.6,4.1,0.2,2.7,4,0,6],
  ["food-basic-100",321,"Stjälkselleri",19,1,2.3,0.2,2.1,0.8,0.1,11],
  ["food-basic-101",362,"Squash",14,0,2.5,0.1,1.8,3,0,0],
  ["food-basic-102",372,"Aubergine",19,1.1,2.2,0.1,2.4,2.6,0,2],
  ["food-basic-103",333,"Champinjon",27,2.4,2.7,0.2,2.4,0.1,0,0],
  ["food-basic-105",294,"Rödbeta",51,1.2,9.8,0.1,2.6,9.4,0,20],
  ["food-basic-106",297,"Majrova",35,1.1,6,0.3,1.9,3.9,0,17],
  ["food-basic-107",293,"Rädisa",11,0.7,0.7,0.4,1.1,1.4,0.1,21],
  ["food-basic-108",353,"Pumpa",26,1,4.4,0.1,1.7,2.7,0,1],
  ["food-basic-109",2565,"Okra kokt u. salt",25,1.8,2.5,0.2,3.1,1.4,0,5],
  ["food-basic-112",352,"Persilja blad",78,5.6,9.4,1.1,3.9,0.7,0.3,53],
  ["food-basic-113",7194,"Grönmynta blad",46,4.7,2.4,0.6,5.9,0.1,0.1,17],
  ["food-basic-114",2561,"Ruccolasallat",21,3.6,0,0.4,1.7,0,0,30],
  ["food-basic-115",588,"Äpple m. skal",48,0,10.6,0,2.3,9.9,0,0],
  ["food-basic-116",553,"Banan",95,1.1,21.3,0.1,1.4,18.1,0,0],
  ["food-basic-117",551,"Apelsin",50,0.8,10.4,0.2,1.2,8.2,0,1],
  ["food-basic-118",560,"Småcitrus clementin mandarin tangerin satsumas",54,0.8,11.4,0.2,1.5,9.6,0,1],
  ["food-basic-119",583,"Päron",54,0.3,11.5,0.1,2.7,11.3,0,1],
  ["food-basic-120",580,"Persika",42,0.8,8.5,0,2.2,8.3,0,0],
  ["food-basic-121",582,"Plommon",44,0.7,9.1,0,2,8,0,0],
  ["food-basic-122",552,"Aprikos",38,0.8,7.4,0,2.1,6.6,0,1],
  ["food-basic-123",587,"Vindruvor",70,0.6,15.6,0.2,1.2,16.1,0,1],
  ["food-basic-124",526,"Jordgubbar",41,0.5,8.3,0.2,1.9,7.9,0,1],
  ["food-basic-125",555,"Blåbär",53,0.7,9.1,0.8,3.1,6.4,0,3],
  ["food-basic-126",523,"Hallon",34,1.2,4.1,0.6,3.7,4.1,0,1],
  ["food-basic-127",554,"Björnbär",35,1.3,3.8,0.5,5.3,null,0,1],
  ["food-basic-128",573,"Lingon",56,0.5,10.7,0.7,2.6,8.1,0,2],
  ["food-basic-129",549,"Vattenmelon",34,0.6,7.5,0,0.6,8.7,0,2],
  ["food-basic-130",547,"Nätmelon",37,0.9,7.1,0.3,1,5,0.1,9],
  ["food-basic-131",550,"Ananas",47,0.6,10.2,0,1.3,null,0,0],
  ["food-basic-132",574,"Mango",52,0.7,11.2,0,2,10.6,0,1],
  ["food-basic-133",565,"Kiwi grön",53,0.9,9,0.7,3.3,8.7,0,1],
  ["food-basic-134",520,"Granatäpple",67,1.1,12,0.4,5.5,11.4,0.1,1],
  ["food-basic-135",561,"Fikon",87,2,16.3,0.4,4.6,8.6,0.1,2],
  ["food-basic-136",603,"Dadlar torkade",321,2.4,71.9,0.6,7.5,58,0,11],
  ["food-basic-137",610,"Russin",285,1.9,64.4,0.5,6.1,60,0,15],
  ["food-basic-138",320,"Avokado",197,1.9,1.7,19.6,4.8,0.5,3.4,5],
  ["food-basic-139",521,"Grapefrukt",43,0.9,8.3,0.5,0.9,6.9,0.1,1],
  ["food-basic-140",559,"Citron",50,0.9,7.6,0.7,4.9,2.6,0,4],
  ["food-basic-141",571,"Sötkörsbär",62,1,13.6,0,1.2,11.5,0,0],
  ["food-basic-142",577,"Papaya",48,0.8,8.9,0.6,1.8,9.5,0.2,14],
  ["food-basic-144",1576,"Valnötter",680,13.8,8.3,64.8,9,2.5,5.7,0],
  ["food-basic-147",1560,"Jordnötter torkade",586,25.7,8.2,49,8.1,2,6.8,16],
  ["food-basic-148",1558,"Hasselnötter",658,13.2,0.5,64.6,16.1,3.6,4.8,0],
  ["food-basic-149",1569,"Pekannötter",714,8.5,1.5,73.3,13.3,4,6.2,0],
  ["food-basic-150",1568,"Paranötter",683,14.2,0,67.8,13.7,1.8,15.4,0],
  ["food-basic-151",1574,"Solrosfrö",618,20.6,3.9,56.1,11.5,2.9,4.9,0],
  ["food-basic-154",1567,"Linfrö hela",522,18.7,0,43.8,30.4,1.6,3.4,30],
  ["food-basic-155",1572,"Sesamfrö m. skal",606,19.9,4.4,54.8,12,0.6,6.8,1],
  ["food-basic-158",40,"Solrosolja",884,0,0,100,0,0,10.4,0],
  ["food-basic-159",38,"Sesamolja",884,0,0,100,0,0,14.8,0],
  ["food-basic-160",7269,"Klarnat smör ghee",875,0,1.7,98.2,0,null,null,46],
  ["food-basic-164",1953,"Vatten kranvatten",0,0,0,0,0,0,0,2],
  ["food-basic-165",1957,"Kaffe bryggt",2,0,0.5,0,0,0,0,4],
  ["food-basic-166",1962,"Te bryggt",0,0,0,0,0,0,0,3],
  ["food-basic-167",641,"Apelsinjuice färskpressad",48,0.7,10.6,0.2,0.1,8.2,0,1],
  ["food-basic-168",659,"Äppeljuice drickf.",40,0.2,9.7,0,0,10.4,0,3],
  ["food-basic-169",700,"Havredryck fett 1,5% berikad",48,1,7.1,1.5,0.8,3.4,0.2,44],
  ["food-basic-171",6903,"Mandeldryck osötad berikad",15,0,1,1.2,0.3,0.1,0.1,48],
  ["food-arabic-173",919,"Falafel kikärtsbiff friterad hemlagad",158,6.8,11.6,7.2,10.2,1.2,1,775],
  ["food-arabic-191",903,"Linssoppa veg.",85,4.9,14.1,0.3,2.5,1,0.1,387],
  ["food-arabic-195",824,"Vinbladsdolma m. ris konserv. veg.",162,2.5,11.5,11.3,2.5,2,1.7,586],
  ["food-arabic-216",3267,"Baklava",411,5.5,47.4,21.3,4.2,38,3.7,71],
  ["food-arabic-217",6979,"Mannagrynskaka m. sirap yoghurt typ basbousa",329,4,44,14.9,1.2,25.8,9.7,179],
  ["food-swedish-222",1120,"Köttbullar gris stekta",183,14.3,4.1,12.2,0.5,0.9,5,636],
  ["food-swedish-224",114,"Filmjölk fett 3% berikad",57,3.3,4.6,2.8,0,3.8,1.8,39],
  ["food-swedish-225",1285,"Lax gravad",166,18.8,3.1,8.7,0,1.3,1.2,1150],
  ["food-swedish-226",4608,"Sill inlagd u. lag",235,9.8,21.9,12,0,18.9,2.5,1175],
  ["food-swedish-227",271,"Raggmunk potatisplätt potatispannkaka hemlagad",149,4.2,20,5.5,1,2.4,2.2,320],
  ["food-swedish-228",897,"Ärtsoppa m. fläsk hemlagad",85,6.4,8.9,2.1,2.3,0.8,0.9,290],
  ["food-swedish-229",2769,"Pannkaka tunn hemlagad",136,5.5,13.6,6.5,0.5,3.7,3.6,225],
  ["food-swedish-230",7188,"Pytt i panna hemlagad",139,6,15.1,5.6,2,1.3,3,336],
  ["food-swedish-231",257,"Janssons frestelse",161,3.6,14.2,9.6,1.7,2.4,5.2,359],
  ["food-swedish-232",6462,"Korv stroganoff hemlagad",253,6.3,5.7,23,0.5,2.2,10,811],
  ["food-swedish-233",1488,"Korv falukorv kött 58%",240,9.1,5.1,20.6,0,0.7,7.7,630],
  ["food-swedish-234",5866,"Bruna bönor torkade kokta m. salt",137,8.8,16.8,0.9,13.2,0,0.2,188],
  ["food-swedish-235",2165,"Kroppkakor el. potatispalt m. fläsk hemlagad",156,4.6,19.7,6.1,1.9,1,2.2,441],
  ["food-swedish-236",253,"Pitepalt",180,4.8,25.1,6,2.6,0.6,2.4,572],
  ["food-swedish-237",1083,"Gryta kalops nöt hemlagad",77,7.2,3,3.8,0.8,1.7,1.4,282],
  ["food-swedish-238",1060,"Gryta dillkött nöt m. sås",114,8.2,4.9,6.8,0.6,1.1,2.5,270],
  ["food-swedish-239",511,"Kåldolmar stekta hemlagade",108,5.3,8.5,5.6,1.1,4.5,1.8,459],
  ["food-swedish-240",512,"Kålpudding",118,7.4,10.1,5.1,1.1,6.1,2.2,515],
  ["food-swedish-241",1358,"Fiskgratäng m. dillsås",153,10.2,5.3,10.1,0.5,3,4.7,296],
  ["food-swedish-242",2108,"Fisksoppa m. rotfrukter",73,6.3,3.9,3.2,0.9,1.8,1.4,265],
  ["food-swedish-247",1668,"Semla vetebulle fylld m. mandelmassa vispad grädde hemlagad",295,6.1,36.8,13.2,2.1,9.6,5.9,142],
  ["food-swedish-248",1594,"Sött vetebröd kanelbulle hembakad",324,5.8,45.4,12.7,2,10.9,6.8,197],
  ["food-swedish-251",1888,"Chokladboll hemlagad",454,3.4,52.3,25,3.5,36.7,13.1,127],
  ["food-swedish-252",1648,"Prinsesstårta m. grädde vaniljkräm hallonsylt marsipan",295,4.3,37.3,13.8,2.1,26.3,6.8,104],
  ["food-swedish-253",3591,"Kladdkaka",416,4.6,58.6,17.5,2.2,47.3,8,120],
  ["food-swedish-254",655,"Risgrynsgröt",86,3.2,13.3,2.1,0.1,3.1,1.2,166],
  ["food-swedish-255",274,"Potatismos hemlagad",88,2.3,14.1,2.1,1.4,1.6,1.4,326],
  ["food-swedish-256",1114,"Wallenbergare kalv stekt",246,16.7,7.1,16.7,0.8,1.5,8.3,536],
  ["food-european-257",774,"Pizza Margherita m. ost tomatsås hemlagad",246,9,27.6,10.5,2.4,4.4,4,513],
  ["food-european-258",764,"Pizza Pepperoni m. rökt korv värmd frysvara",235,9.1,30.5,7.8,2.9,5.8,3.1,680],
  ["food-european-261",5804,"Pasta carbonara m. pasta fläsk grädde",189,8.7,19.3,8.3,1.4,0.6,4.1,377],
  ["food-european-264",6346,"Lasagne nötfärs",137,7.9,11.5,6.3,1,3.3,3,383],
  ["food-european-266",6701,"Insalata Caprese",146,5.8,1.8,12.8,0.8,1.6,4.6,338],
  ["food-european-268",506,"Minestronesoppa",50,2,5.2,2.1,1.4,2.4,0.6,323],
  ["food-european-274",532,"Grekisk sallad m. fetaost",77,2.9,2,6.1,1.4,2,4.1,466],
  ["food-european-275",515,"Moussaka ugnsstekt",117,6.8,4.6,7.7,1.4,3.5,2.8,306],
  ["food-european-277",2144,"Tzatziki",75,2.4,4.2,5.5,0,2.6,2.9,425],
  ["food-european-278",2083,"Gryta ratatouille veg.",51,1,5.8,2.3,2,5.3,0.3,355],
  ["food-european-280",229,"Bröd vitt typ croissant fransk giffel",367,5.1,36.3,22.2,1.5,6.2,10.3,487],
  ["food-european-281",481,"Löksoppa fransk tillagad pulver m. vatten",25,0.4,5.2,0.2,0.2,0.3,0.1,353],
  ["food-european-284",7159,"Schnitzel kalv stekt",211,19.9,9.6,10.1,1.1,0.6,1.8,544],
  ["food-european-285",406,"Surkål konserv. m. lag",17,0.9,2,0.2,1.7,0.1,0,320],
  ["food-european-286",5967,"Korv bratwurst tillagad kryddig kött 73-75%",267,11.5,4.5,22.7,0.8,0.7,8.5,974],
  ["food-european-288",1068,"Gryta gulasch nöt",75,8.3,3.6,2.8,0.9,3,1.2,297],
  ["food-global-292",1363,"Sushi nigiri m. lax",184,9.8,22.3,5.9,1,3.5,0.8,174],
  ["food-global-293",1365,"Sushi nigiri m. tonfisk",147,8.1,26.6,0.4,1.1,4.3,0,311],
  ["food-global-294",2758,"Sushi veg.",158,2.6,30.9,2.2,1.4,4.7,0.3,276],
  ["food-global-306",750,"Vårrulle värmd frysvara",217,6.9,22.4,10.8,1.1,2.8,3,510],
  ["food-global-314",5759,"Guacamole",139,1.6,2.4,13.1,3.7,1.1,2.3,339],
  ["food-global-315",898,"Gryta chili con carne",103,7.5,7.8,3.9,3.3,2.1,1.2,369],
  ["food-global-317",775,"Kycklingburgare m. bröd tillbehör",228,10.7,22.8,10.1,1.7,3.8,1.7,433],
  ["food-global-318",2075,"Coleslaw hemlagad",88,1,7.2,5.8,1.8,5.9,0.8,347],
  ["food-basic-322",825,"Bovete hela el. krossade korn",353,9.6,70,2.5,3.7,1.2,0.4,1],
  ["food-basic-324",6494,"Dinkelmjöl",355,12,69.3,1.7,5.1,0.9,0.3,0],
  ["food-basic-325",4447,"Nudlar risnudlar okokta",360,3.4,83.2,0.6,1.6,0.3,0.2,182],
  ["food-basic-326",4448,"Nudlar risnudlar kokta",108,0.9,24.9,0.2,1,0.1,0,19],
  ["food-basic-328",193,"Bröd vitt vete vatten fibrer ca 3,5% typ pitabröd",274,8.6,53.6,1.6,3.4,1.8,0.3,461],
  ["food-basic-332",342,"Kronärtskocka",52,2.7,7.3,0.2,5,2.6,0,80],
  ["food-basic-333",336,"Fänkål",28,2.8,1.8,0.4,3.3,2.6,0.1,7],
  ["food-basic-334",290,"Palsternacka",71,1.7,12.6,0.6,3.8,6,0.1,3],
  ["food-basic-335",327,"Brysselkål",44,3.4,4.7,0.3,4.2,2.6,0,7],
  ["food-basic-336",359,"Sockerärtor",37,3.4,4.3,0.2,2.2,3.5,0,1],
  ["food-basic-337",367,"Vattenkrasse",15,1.9,0.5,0.3,1.5,0,0.1,37],
  ["food-basic-338",348,"Mangold",21,1.8,2.6,0.2,0.8,0.3,0,215],
  ["food-basic-341",599,"Aprikos torkad",190,2.2,41,0.5,5.3,39.4,0.1,9],
  ["food-basic-342",605,"Katrinplommon torkade",219,2.3,48.6,0.3,5.2,36.5,0.1,3],
  ["food-basic-343",579,"Passionsfrukt",87,2.2,12.9,0.7,10.4,6.2,0.1,28],
  ["food-basic-344",522,"Guava",33,0.6,4.8,0.1,5.1,4.9,0,3],
  ["food-basic-345",581,"Sharon",65,0.4,14.3,0.2,1.6,18.6,0,1],
  ["food-arabic-351",6946,"Fatteh m. kyckling",120,7.6,10.3,4.7,2.9,1.3,1.3,236],
  ["food-swedish-403",1128,"Pannbiff nöt stekt",178,17.3,4.3,10.1,0.5,1,4.2,680],
  ["food-swedish-408",1537,"Korv falukorv ugnsstekt",205,9,6.3,15.9,0.6,2.5,6.8,468],
  ["food-swedish-409",3872,"Potatissallad kylvara",236,1.6,12.4,20,1.2,1.4,1.4,400],
  ["food-swedish-410",272,"Potatis stuvad",95,2.8,14.4,2.5,1.4,2.1,0.9,250],
  ["food-swedish-412",277,"Potatisgratäng m. vispgrädde ost",214,4.5,12.9,15.9,1.7,1.7,10.2,327],
  ["food-swedish-413",853,"Stuvade makaroner",150,6.7,22.1,3.5,1,5,2.1,333],
  ["food-swedish-414",856,"Pastagratäng makaronipudding",129,7.9,13.4,4.6,1,1.9,2,469],
  ["food-swedish-415",734,"Ugnspannkaka lättmjölk",152,6,15.1,7.2,0.9,3.4,1.2,199],
  ["food-swedish-416",1426,"Blodpudding blodkorv fett 19%",301,10.6,21,19,2.3,12.4,9.4,350],
  ["food-swedish-422",1333,"Strömming filé stekt m. salt",122,21.6,0,3.9,0,0,1,322],
  ["food-swedish-424",258,"Laxpudding",111,8.2,9.5,4.2,1.1,2.2,1.2,494],
  ["food-swedish-426",52,"Räkmajonnäs räksallad gatukök",457,5.2,2.9,48,0,1.2,5.7,397],
  ["food-swedish-428",56,"Rödbetssallad m. gräddfil hemlagad",64,1.1,9.9,1.9,1.5,9.3,1.2,459],
  ["food-swedish-429",467,"Vitkålssallad pizzasallad",90,1,4.9,7.1,1.6,3.6,0.5,223],
  ["food-swedish-431",6757,"Bröd rågsikt fibrer ca 4% typ rågkaka",264,7.3,48.9,2.7,6.5,9.1,0.5,452],
  ["food-swedish-432",217,"Bröd vitt mjukt m. mjölk fibrer ca 4% typ tunnbröd",280,8,52.4,3.1,3.8,8.4,0.5,410],
  ["food-swedish-435",3590,"Äppelkaka hembakad typ Fyriskaka",299,2.9,37.9,14.8,1.2,23.4,6.7,132],
  ["food-swedish-436",1734,"Blåbärssoppa hemlagad",47,0.2,10.4,0.3,1,8,0,3],
  ["food-swedish-437",1751,"Nyponsoppa ätf. pastöriserad el. pulver berikad",52,0.2,12.1,0.1,0.5,9.5,0,9],
  ["food-swedish-438",2184,"Ostkaka fett 7%",172,10.4,16.6,7,0,11.9,4.2,50],
  ["food-swedish-439",736,"Våffla m. ägg",254,5.2,20.1,16.9,0.9,2.9,10.8,291],
  ["food-swedish-440",1681,"Mjuk kaka sockerkaka fin",401,4.2,48.2,21,1,28.6,9.5,207],
  ["food-european-446",872,"Tortellini m. ostfyllning kokt",186,7.2,25.7,5.3,2.6,1.2,3,392],
  ["food-european-449",1072,"Gryta osso buco kalvläggsgryta",85,7.9,4,3.6,0.9,2.5,0.7,322],
  ["food-european-450",835,"Majsgryn polenta kokt m. salt",68,1.7,13.4,0.4,1.4,0.1,0.1,227],
  ["food-european-455",2886,"Tiramisu",231,6,21,12.6,0.2,16.3,7.5,242],
  ["food-european-456",3008,"Pannacotta",241,3,11.8,20.5,0,10.8,13.1,31],
  ["food-european-471",1354,"Fisksoppa bouillabaisse",71,8.5,1.5,3.2,0.5,1,0.4,223],
  ["food-european-474",281,"Schweizisk potatiskaka rösti värmd frysvara",214,2.4,23.4,11.4,4.2,0.6,5.4,537],
];
for(const [catalogId,id,preparation,...values] of verifiedSwedishRows){
  const row=rows.find(f=>f.id===catalogId);
  if(!row)throw new Error(`Unknown catalogue food ${catalogId}`);
  Object.assign(row,{preparation,status:'ready',...normalizeSwedishCarbs(Object.fromEntries(nutrientKeys.map((k,i)=>[k,values[i]??null])),`Livsmedelsverkets Livsmedelsdatabas 2026-07-01 (CC BY 4.0) · https://soknaringsinnehall.livsmedelsverket.se/Home/FoodDetails/${id}`)});
}
// Open-access Lebanese food composition studies. Reported total carbohydrate
// includes fiber: subtract measured fiber to match the catalogue convention.
// Trace fiber (<0.01 g/100 g according to the 2021 report) remains null; available
// carbohydrate is retained at the source's one-decimal precision. Energy is
// the published estimate, not recalculated with a different energy convention.
const lebaneseRows=[
  // id, reference dish, energy, protein, total carbohydrate, fat, fiber, portions
  ['food-arabic-174','Lebanese foul moudamas',116,5.3,14.2,4.2,3.5,{cup:200,serving:100}],
  ['food-arabic-175','Lebanese baba ghanouj',39,1.1,4.5,1.8,3.1,{tbsp:100/6,serving:100}],
  ['food-arabic-177','Lebanese tabboula',53,1.9,6.1,2.3,3.2,{cup:200,serving:200}],
  ['food-arabic-178','Lebanese fattoush',52,1.5,7.2,1.9,6,{cup:200,serving:200}],
  ['food-arabic-179','Lebanese moujadara',113,5.4,21.8,0.5,5.4,{cup:200,serving:100}],
  ['food-arabic-180','Lebanese chicken shawarma, meat only',197,29.7,1.1,8.2,null,{tbsp:13.5,serving:54}],
  ['food-arabic-187','Lebanese baked kibbeh (bil sayniya)',266,11.3,19.7,15.8,4.8,{serving:76}],
  ['food-arabic-193','Lebanese molokhia stew (yakhna)',112,5.4,11.9,4.8,2,{cup:200,serving:100}],
  ['food-arabic-194','Lebanese stuffed zucchini',123,3.8,20.3,2.9,1,{piece:50,serving:100}],
  ['food-arabic-198','Lebanese fish and rice sayadia',171,6.5,22.1,6.3,null,{cup:200,serving:100}],
  ['food-arabic-203','Lebanese lahm bil ajin',244,11.2,37.1,5.6,1,{piece:20,serving:40}],
  ['food-arabic-208','Lebanese chickpea fatteh',159,6.5,15.8,7.7,5.5,{cup:200,serving:100}],
  ['food-arabic-210','Lebanese rice pudding with milk',204,6.7,32.7,6.5,null,{}],
  ['food-arabic-214','Lebanese qatayef with cream (kashta)',260,6,40.5,10.5,1.9,{serving:37}],
  ['food-arabic-215','Lebanese kunafa with cheese',279,6.1,40.4,13.2,3.1,{serving:37}],
  ['food-arabic-218','Lebanese maamoul with dates',410,6.6,68.4,15.6,7,{serving:22}],
  ['food-arabic-357','Lebanese shish barak',154,4.8,18.7,6.7,null,{cup:200,serving:100}],
  ['food-arabic-367','Lebanese moghrabieh',124,6.7,15.6,3.9,null,{cup:200,serving:100}],
  ['food-arabic-398','Lebanese spinach fatayer',311,5.3,27.2,20.1,2.1,{piece:55,serving:55}],
];
const setSourcedFood=(id,preparation,source,values,portions={})=>{
  const food=rows.find(f=>f.id===id);
  if(!food||food.status!=='draft')throw new Error(`Invalid new source food ${id}`);
  if(values.length!==nutrientKeys.length||values.slice(0,4).some(x=>!Number.isFinite(x)||x<0))throw new Error(`Invalid nutrition values ${id}`);
  Object.assign(food,{preparation,source,status:'ready',portions:{...food.portions,...portions},nutrients:Object.fromEntries(nutrientKeys.map((k,i)=>[k,values[i]]))});
};
for(const [id,preparation,kcal,protein,totalCarbs,fat,fiber,portions] of lebaneseRows){
  setSourcedFood(id,preparation,'Hoteit et al. 2021 & 2024 (CC BY); total CHO minus measured fiber, trace retained as unknown; https://doi.org/10.12688/f1000research.27461.1 ; https://doi.org/10.1371/journal.pone.0312429 ; Lebanese University report, tables 13–15,20–22',[kcal,protein,Math.round((totalCarbs-(fiber??0))*10)/10,fat,fiber,null,null,null],portions);
}
// USDA carbohydrate by difference includes fiber. Keep fiber separate.
const usdaRows=[
  ['food-basic-2',171534,'Chicken, breast, skinless, boneless, meat only, cooked, grilled','2019-04-01','SR Legacy',151,30.5,0,3.17,0,0,.992,52],
  ['food-basic-4',172388,'Chicken, thigh, meat only, cooked, roasted','2019-04-01','SR Legacy',179,24.8,0,8.15,0,0,2.31,106],
  ['food-basic-14',2706286,'Fish, salmon, baked or broiled','2024-10-31','Survey (FNDDS)',274,25.4,.01,18.4,0,.01,4.279,294],
  ['food-basic-37',2705709,'Cheese, Cheddar','2024-10-31','Survey (FNDDS)',409,23.3,2.44,34,0,.33,19.2,654],
  ['food-basic-69',174284,'Lentils, pink or red, raw','2019-04-01','SR Legacy',358,23.9,63.1,2.17,10.8,null,.379,7],
  ['food-basic-323',170686,'Buckwheat groats, roasted, cooked','2019-04-01','SR Legacy',92,3.38,19.9,.62,2.7,.9,.134,4],
  ['food-basic-339',169295,'Squash, winter, butternut, raw','2019-04-01','SR Legacy',45,1,11.7,.1,2,2.2,.021,4],
  ['food-basic-340',2709210,'Pineapple, dried','2024-10-31','Survey (FNDDS)',347,1.22,84.11,.71,2.4,77.12,.024,0],
  ['food-european-267',2708722,'Gnocchi, potato','2024-10-31','Survey (FNDDS)',135,2.44,17.2,6.33,1,.99,3.42,279],
];
for(const [id,fdcId,preparation,date,type,kcal,protein,totalCarbs,fat,fiber,sugar,saturated,sodium] of usdaRows){
  setSourcedFood(id,preparation,`USDA FoodData Central · ${type} ${date}; available carbohydrate = total CHO minus fiber · https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`,[kcal,protein,Math.round((totalCarbs-fiber)*1000)/1000,fat,fiber,sugar,saturated,sodium]);
}
// Matvaretabellen uses available carbohydrates, not total carbohydrates.
const norwegianRows=[
  ['food-basic-31','01.334','Plain Greek/Turkish yoghurt, 2% fat','yoghurt-plain-2-fat-greek-turkish',[69,9.2,3.4,2.1,0,3.4,1.3,63]],
  ['food-basic-35','01.188','Feta, goat milk (database reference)','cheese-goat-milk-feta',[260,18.1,.2,20.8,0,.2,13.3,1060]],
  ['food-basic-71','06.104','Green lentils, uncooked','lentils-green-uncooked',[263,20.5,29.2,2,23,1.9,.2,1]],
  ['food-european-263','10.227','Pasta arrabbiata','pasta-arrabiata',[127,4.3,18,3.9,2,1.4,1.2,251]],
  ['food-european-269','05.504','Bruschetta with tomato and basil','bruschetta-with-tomato-and-basil',[111,3.3,15.3,3.4,3,2,.5,261]],
  ['food-european-442','09.165','Pizza with Parma ham, home-made','pizza-parma-home-made',[205,10.8,19.7,8.7,2,1.5,3.4,479]],
  ['food-european-443','05.437','Focaccia bread','focaccia-bread',[311,7.5,41.4,12.2,3,.6,1.8,524]],
  ['food-european-472','06.201','Salad Niçoise','salad-nicoise',[113,6.3,5,7.2,1,2.5,1.2,385]],
  ['food-global-298','10.224','Pad Thai, rice noodles and shrimps, commercially prepared','pad-thai-rice-noodles-and-shrimps-industrially-made',[147,5.7,18.1,5.5,1,6.3,.7,450]],
  ['food-global-304','03.511','Butter chicken, commercially prepared','butter-chicken-industrially-made',[187,11.3,5.2,13.2,.9,4.9,5.6,470]],
];
for(const [id,sourceId,preparation,slug,values] of norwegianRows){
  setSourcedFood(id,preparation,`Matvaretabellen · Norwegian Food Safety Authority · January 2026 · ${sourceId} · https://www.matvaretabellen.no/en/${slug}/`,values);
}
// Published recipe-composition estimates, not laboratory measurements.
const saudiRows=[
  ['food-arabic-182','Saudi chicken kabsa, rice and chicken',108.43,5.06,14.64,3.26,.68,.94,.82,100.48],
  ['food-arabic-183','Saudi lamb kabsa, rice and lamb',137.41,7.28,15.56,4.97,.72,.79,2.12,145.65],
  ['food-arabic-185','Saudi lamb mandi, rice and lamb',104.27,5.42,11.15,3.9,.33,.03,1.53,144.2],
  ['food-arabic-374','Saudi thareed, lamb, vegetables and bread',99.47,5.83,9.24,4.53,.82,1.46,1.66,92.63],
  ['food-arabic-375','Saudi saleeg, chicken, rice and milk',111.81,6.51,11.08,4.32,.26,.67,1.54,89.16],
];
for(const [id,preparation,kcal,protein,totalCarbs,fat,fiber,sugar,saturated,sodium] of saudiRows){
  setSourcedFood(id,preparation,'Frontiers in Nutrition 2025 (CC BY), tables 1, 3, 4; ESHA recipe estimate, mean of 3 recipes; total CHO minus fiber · https://doi.org/10.3389/fnut.2025.1658078',[kcal,protein,Math.round((totalCarbs-fiber)*100)/100,fat,fiber,sugar,saturated,sodium]);
}
export const seedFoods=Object.freeze(rows);
export function calculateNutrients(food,quantity,unit){
  const factor=food?.portions?.[unit];
  if(!food?.nutrients||food.status!=='ready'||!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(factor)||factor<=0)return null;
  const grams=quantity*factor;
  return {grams,nutrients:Object.fromEntries(nutrientKeys.map(k=>[k,food.nutrients[k]===null?null:food.nutrients[k]*grams/100]))};
}
export function sumNutrients(items){
  return Object.fromEntries(nutrientKeys.map(k=>[k,items.some(x=>x[k]===null||x[k]===undefined)?null:items.reduce((sum,x)=>sum+x[k],0)]));
}
export function foodAlternatives(foods,food){
  if(!food?.nutrients)return [];
  const score=f=>['kcal','protein','carbs','fat'].reduce((sum,k)=>sum+Math.abs(f.nutrients[k]-food.nutrients[k])/Math.max(1,food.nutrients[k]),0);
  return foods.filter(f=>f.id!==food.id&&f.status==='ready'&&f.group===food.group&&f.nutrients).sort((a,b)=>score(a)-score(b)).slice(0,5);
}
// Mifflin et al., 1990 (PMID 2305711). Estimate for healthy adults aged 19–78.
// Activity factor is an explicit user input, not an inferred recommendation.
export function energyEstimate({weight,height,age,sex,factor}){
  if(![weight,height,age,factor].every(Number.isFinite)||weight<30||weight>300||height<120||height>220||age<19||age>78||factor<1||factor>2.5||!['male','female'].includes(sex))return null;
  const resting=10*weight+6.25*height-5*age+(sex==='male'?5:-161);
  return resting>0?{resting:Math.round(resting),total:Math.round(resting*factor)}:null;
}

// Planning calculator, not a prescription. Explicit assumptions; never clamps an
// unsafe result into a seemingly valid target. No personal inputs are persisted.
export const adjustmentRanges={loss:[-15,-5],gain:[5,10],maintenance:[0,0],recomposition:[-5,0]};
export function smartTargets(input){
  const {weight,height,age,goal,adjustment,proteinRate,fatPercent,eligible}=input;
  const energy=energyEstimate(input),range=adjustmentRanges[goal];
  const bmi=weight/(height/100)**2;
  if(eligible!==true||!energy||!goals.includes(goal)||!range||!Number.isInteger(age)||bmi<18.5||bmi>=40||!Number.isFinite(adjustment)||adjustment<range[0]||adjustment>range[1]||!Number.isFinite(proteinRate)||proteinRate<1.4||proteinRate>2||!Number.isFinite(fatPercent)||fatPercent<20||fatPercent>35)return null;
  const kcal=Math.round(energy.total*(1+adjustment/100));
  const protein=Math.round(weight*proteinRate),fat=Math.round(kcal*fatPercent/900),carbs=Math.round((kcal-4*protein-9*fat)/4);
  if(kcal<Math.max(1500,energy.resting)||kcal>5000||carbs<0||protein*4>kcal*.35||carbs*4<kcal*.30)return null;
  return {...energy,goal,kcal,protein,carbs,fat,adjustment};
}
export function targetValid(t){
  const {kcal,protein,carbs,fat}=t;
  return [kcal,protein,carbs,fat].every(Number.isFinite)&&kcal>=1000&&kcal<=10000&&protein>=0&&carbs>=0&&fat>=0&&Math.abs(kcal-(4*protein+4*carbs+9*fat))<=Math.max(100,kcal*.1);
}
export const dayForDate=(plan,date)=>Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(plan.startDate+'T00:00:00Z'))/86400000)+1;
export function planTargetForDate(plan,date){
  if(!plan)return null;const day=dayForDate(plan,date);
  return day>=1&&day<=plan.weeks*7?{...plan,...plan.dayTargets?.[day],day}:null;
}
export function daySummary(plan,date,logs,water,manualGoal=null){
  const entries=logs.filter(x=>x.date===date),target=planTargetForDate(plan,date);
  const planned=target?plan.items.filter(x=>x.day===target.day):[];
  const goal=target||manualGoal;
  return {date,recorded:entries.length>0,nutrients:sumNutrients(entries.map(x=>x.nutrients)),planned:planned.length,done:planned.filter(i=>entries.some(x=>x.planId===plan.id&&x.planItemId===i.id)).length,water:water.filter(x=>x.date===date).reduce((s,x)=>s+x.ml,0),target:goal?Object.fromEntries(['kcal','protein','carbs','fat','waterMl'].map(k=>[k,goal[k]??null])):null};
}
// Allergy ingredient coverage is not yet complete. Fail closed when an allergy is
// declared instead of interpreting blank metadata as allergen-free.
export function alternativeAllowed(food,{allergies='',cuisine='',exclude='',vegetarian=false}={}){
  if(String(allergies).trim())return false;
  if(cuisine&&food.cuisine!==cuisine)return false;
  if(vegetarian&&!['eggs','dairy','grains','legumes','vegetables','fruit','nuts'].includes(food.group))return false;
  const hay=[...Object.values(food.names||{}),food.preparation,food.allergens].join(' ').toLowerCase();
  return !String(exclude).split(/[,،;\n]/).map(x=>x.trim().toLowerCase()).filter(Boolean).some(x=>hay.includes(x));
}
const core=['kcal','protein','carbs','fat'];
const validCore=n=>n&&core.every(k=>Number.isFinite(n[k])&&n[k]>=0)&&n.kcal>0;
const distance=(target,actual)=>core.slice(1).reduce((s,k)=>s+Math.abs(actual[k]-target[k])/Math.max(5,target[k]),0);
const closeMacros=(target,actual)=>core.slice(1).every(k=>Math.abs(actual[k]-target[k])<=Math.max(5,target[k]*.35));
export function portionAlternatives(foods,reference,target,filters={}){
  if(!reference||!validCore(target))return [];
  return foods.filter(f=>f.status==='ready'&&f.id!==reference.id&&f.group===reference.group&&validCore(f.nutrients)&&alternativeAllowed(f,filters)).map(f=>{
    const grams=Math.round(target.kcal/f.nutrients.kcal*100),r=calculateNutrients(f,grams,'g');
    return r&&grams>=5&&grams<=1500?{food:f,...r,score:distance(target,r.nutrients)}:null;
  }).filter(x=>x&&Math.abs(x.nutrients.kcal-target.kcal)<=Math.max(5,target.kcal*.05)&&closeMacros(target,x.nutrients)).sort((a,b)=>a.score-b.score).slice(0,5);
}
export function mealAlternatives(recipes,target,filters={},excludedIds=[]){
  if(!validCore(target)||String(filters.allergies||'').trim())return [];
  return recipes.filter(r=>!excludedIds.includes(r.id)&&validCore(r.nutrients)&&r.servings>0&&Array.isArray(r.items)&&r.items.length&&r.items.every(i=>alternativeAllowed(i,filters))).map(r=>{
    const quantity=Math.round(target.kcal*r.servings/r.nutrients.kcal*100)/100;
    const nutrients=Object.fromEntries(nutrientKeys.map(k=>[k,r.nutrients[k]==null?null:r.nutrients[k]*quantity/r.servings]));
    return {recipe:r,quantity,nutrients,score:distance(target,nutrients)};
  }).filter(x=>x.quantity>=.25&&x.quantity<=4&&Math.abs(x.nutrients.kcal-target.kcal)<=Math.max(5,target.kcal*.05)&&closeMacros(target,x.nutrients)).sort((a,b)=>a.score-b.score).slice(0,5);
}
