# Nutrition Pro — local sprint

Local SQLite only. No Supabase or external runtime service. The existing simple
wellness meal/water records remain available; the new diary has its own nutrient
snapshots. Do not enter actual personal health data in the local demo.

The 500-name catalog has 200 basic, 100 Arabic, 75 Swedish, 75 European and 50
global food records. 318 records carry sourced core nutrient values: 275 from
the Swedish Food Agency (Livsmedelsverket), database release 2026-07-01;
19 from Lebanese composition studies; 9 from USDA FoodData Central;
10 from Matvaretabellen; and 5 from a published Saudi recipe analysis.
The remaining 182 records are drafts and unavailable
for logging until matched to a reliable source. Nutrient values are per 100 g
edible portion; sodium is mg, all other nutrients except energy are grams.
Unknown values remain null. Swedish data is CC BY 4.0; the source name, release
and individual reference URL are retained in every ready record. Original
Swedish preparation descriptions distinguish the reference food or recipe from
the broader translated catalogue label. Available carbohydrates are separate
from fiber. For Swedish records, where measured sugar exceeds available
carbohydrate by difference, apply the agency's labelling guidance: raise
carbohydrate to the sugar value and add 4 kcal per gram of increase, retaining
the original values in source metadata. USDA, Lebanese and Saudi total
carbohydrate values are reduced by reported fiber; trace fiber in the Lebanese
reference is retained as unknown, with carbohydrate at source precision.
Saudi dish values are recipe-calculation averages, not laboratory measurements.
Values are reference averages, not guarantees for every recipe,
brand or individual serving. Only verified gram equivalents enable other units.

| Cuisine | Ready | Total |
|---|---:|---:|
| Basic | 188 | 200 |
| Arabic | 33 | 100 |
| Swedish | 56 | 75 |
| European | 30 | 75 |
| Global | 11 | 50 |
| Total | 318 | 500 |

## Source data

- Swedish Food Agency: https://www.livsmedelsverket.se/en/about-us/open-data/food-composition-data/
- USDA FoodData Central: https://fdc.nal.usda.gov/download-datasets/
- Norwegian Food Safety Authority, Matvaretabellen, January 2026: https://www.matvaretabellen.no/en/api/
- Lebanese composition studies (CC BY): https://doi.org/10.12688/f1000research.27461.1 and https://doi.org/10.1371/journal.pone.0312429
- Saudi recipe composition study (CC BY): https://doi.org/10.3389/fnut.2025.1658078 (tables 1, 3, 4)
- Swedish carbohydrate guidance: https://www.livsmedelsverket.se/livsmedel-och-innehall/naringsamne/livsmedelsdatabasen/naringsdeklaration/

To populate the library, explicitly match each draft to its exact preparation,
source ID, nutrient values and edible serving weight. Use the admin food editor
or the JSON import (batches of up to 50). The offline converter
`nutrition-import.mjs` accepts matched Swedish API JSON, does not call an API,
and outputs batches for the admin form. No automatic match by food name.
For dishes, use a matched recipe/source, not a generic calorie estimate.

## Controls

- The user can enter manually selected goals and training/rest-day overrides.
  The optional local calculator estimates maintenance energy using Mifflin–St
  Jeor (PMID 2305711) and an explicit activity multiplier, then fills editable
  calorie and macro fields for loss, gain, maintenance or recomposition. Its
  conservative demo limits are product guardrails, not clinical standards or
  evidence that an individual target is safe. Personal calculator inputs are
  not submitted to the server. Ramadan is a timing strategy compatible with
  any of the four goals, with iftar/suhoor meal slots and hydration reminders;
  it does not calculate fasting times or prescribe a fasting diet.
- The owner can activate a single plan. Diary and seven-day summaries use
  that plan's date-specific targets when applicable, otherwise manual goals.
  Planned-item logging requires the matching calendar date and rejects a
  duplicate. Historic diary nutrient snapshots are retained; weekly adherence
  is compared with the currently active plan, not a historical target archive.
- Food replacements are approximate same-group portion matches; meal
  replacements scale an existing private recipe to comparable calories and
  macros. Both are explicit user actions. A declared allergy disables automatic
  suggestions until ingredient coverage is verified. Cuisine, keyword and
  food-group filters do not certify dietary suitability or absence of allergens.
- Templates are editable structures, not ready-to-prescribe diets.
- A coach can assign copied plans and share copied recipes with an accepted
  trainee. Diary visibility and seven-day progress summaries are a separate
  opt-in. Revising an assigned copy also requires that consent so edit attempts
  cannot disclose private logging activity; revocation makes it read-only to
  the coach. Coaches can continue editing their own templates.
- User foods are private; admin foods are shared. Records freeze nutrient
  values and ingredient weights at creation. Export and clear include nutrition.
- Unknown serving weight blocks conversion. All units are supported when a
  valid food-specific gram equivalent is supplied.

## Deferred final QA / content

Execute the regression tests and browser/mobile QA at final project QA as
requested. Complete the remaining 182 food nutrient records, confirm source
matching, validate allergen information and portions, and review the calculator,
its guardrails, and templates professionally before public launch. No automated
clinical diet prescriptions, automatically generated meal menus or live barcode
lookup are enabled.
