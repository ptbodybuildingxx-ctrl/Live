# MUSCLIVO LIVE — final local QA (2026-11-16)

## Verified results

| Check | Result |
| --- | --- |
| Full `npm test` suite | 67 / 67 passed |
| JavaScript source syntax | 85 / 85 files |
| Arabic, English, Swedish key parity | 1,106 non-empty translation keys per language; no missing literal UI keys |
| Workspace rendering | 450 module views across 11 authenticated state snapshots and three languages |
| Local static routes | 54 checked, including authorization on draft-only drawing modules |
| Role and tenant checks | All nine identity roles covered by API regression tests |
| Exercise catalog | 200 entries; SVG geometry, frame and mechanism regressions passed |
| Nutrition catalog | 500 entries; ready/draft, calculation, diary, alternatives and consent tests passed |
| Production simulation | Passed; protected local features and real release gate remain disabled |

All tests used isolated local test databases and fixture data; no Supabase, external service or paid dependency was added. The source-check script now covers every maintained JavaScript file. HTTP asset checks and deterministic HTML rendering tests were added to `tests/final-qa.test.mjs`. The background refresh now detects unsaved form changes before requesting and before applying a new snapshot, and session program filters reset on sign-in. Workspace rendering is explicitly blocked in production. Generated Node compile-cache files are excluded from source control.

## Not a visual or production acceptance

Chromium/Playwright were available, but a minimal browser launch failed because the sandbox prohibited the Chromium process-singleton socket (`Operation not permitted`). Consequently, browser screenshots, responsive layout measurements, keyboard interaction, real-device/mobile acceptance, and the optional SVG browser playback sweep cannot be reported as passed. The SVG browser harness navigation was updated to follow the workspace disclosure cards so it can be run in an environment that permits a browser with `npm run test:browser:svg`. The automated HTML and SVG checks do not establish visual quality or accessibility conformance.

## Remaining owner-controlled work

- The 182 nutrition drafts remain unavailable for logging; 318 foods have sourced core values. Allergen data, portions, calculators and nutrition programs still need the deferred content and professional review.
- Existing content publication controls are preserved. Rehabilitation, library, and campaign content can be added later; exercise media and clinical or nutrition content have not been independently approved by these tests.
- Real browser/device acceptance, independent security and privacy review, load and backup recovery acceptance, production hosting and HTTPS, actual email delivery, policy approval and operator authorization are open. Do not collect real sensitive data or enable public production features yet.
- Launch is planned without a subscription fee. Hosting, mail and backups may have provider costs; no paid service has been enabled.

The current result is a tested local release candidate, not a deployed or fully production-approved service. See [RELEASE-CHECKLIST](../RELEASE-CHECKLIST.md).
