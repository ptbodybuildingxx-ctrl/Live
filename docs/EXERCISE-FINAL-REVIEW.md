# MUSCLIVO LIVE — local exercise artwork acceptance review

## Outcome

**Technical tests passed; specialist anatomy and browser acceptance remain pending.** No artwork is approved or published. No Supabase contact, remote database, production changes, GitHub push, or external publishing.

| Check | Observed result |
| --- | --- |
| Project unit/integration tests | 35/35 passed |
| Existing unique catalog IDs and rigged tracks | 200/200 |
| Planar pose samples across all tracks | 40,200 (201 per track) |
| Active SVG frames, dark and light | 8,400 parsed; zero XML, nonfinite coordinates, unsafe tags/attributes, duplicate SVG IDs or missing internal references detected by the checker |
| Four-phase frame sequence comparison | 200/200 distinct; identical march and high-knees sequences were found and corrected |
| Anonymous HTTP access to drawing module / draft media | 403 / 401 |
| Athlete, coach and gym HTTP access to drawing module / unpublished start media | 403 / 404 for all three |
| Administrator access to drawing module | 200 |
| Browser, mobile and tablet | Blocked by Chromium launch permission (local socket creation denied); no browser acceptance claimed |
| Specialist approval | 0/200; reviewer identity and independent assessment absent |

This is a schematic 2D model. Keeping projected segment lengths fixed and declared contact objectives close does not prove anatomical joint ranges, real-world contact, muscle activation, machine mechanics, clinical safety or correct exercise execution.

## Test instructions

Run `npm test` from the project root. For the additional optional browser QA, install Playwright in a permitted local test environment, make Chromium available and run:

```sh
ML_QA_REPORT=./browser-svg-results.json node tests/browser-svg-qa.mjs
```

The browser runner uses an isolated in-memory database and checks all 200 admin previews in desktop English/dark, emulated phone Arabic/light, and tablet Swedish/dark configurations. It also checks non-admin roles. This runner has not executed successfully in the current environment; validate it on the target environment and fix findings before sign-off. It does not test actual iOS Safari or a physical phone.

## Professional review workflow

1. Open the offline gallery `MUSCLIVO-ANATOMY-REVIEW.html`. It includes all 200 exercises, six phase samples for moving tracks and one for static holds, a historical review point, and a per-track checklist.
2. View the full motion loop in the administrator's local preview. Check intended exercise, projected joint alignment, motion range, stability and starting/ending positions; verify apparatus contact and actual machine pivot/load path against the intended equipment. Review matching instructions, errors, safety and rights.
3. Use a qualified strength/conditioning expert for exercise technique and an appropriate licensed physiotherapy professional for rehabilitation/clinical content. Neither the animation nor a report checkbox constitutes a clinical assessment.
4. Document a decision, specific notes and reviewer identity/date. Export the JSON review record from the gallery; keep it local. Its frame hash identifies sample artwork, not a legal signature and not a complete animation version hash.
5. Re-review whenever the artwork, technique or safety instructions change. Do not activate public SVG illustrations or bypass the existing publication workflow.

References for reviewer preparation: [NSCA Basics of Strength and Conditioning](https://www.nsca.com/contentassets/116c55d64e1343d2b264e05aaf158a91/basics_of_strength_and_conditioning_manual.pdf), [ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/), [ACSM Resistance Training Guidelines](https://acsm.org/resistance-training-guidelines-update-2026/). These do not certify the illustrations.
