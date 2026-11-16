# MUSCLIVO HEALTH PRO — local implementation

Health Pro extends the existing opt-in personal record module without changing the original seven schema kinds. All data is synthetic test data only. No Supabase, external API, health-device connection, medical advice, paid service or production enablement is introduced.

## Features

- Recurring habits with a custom title, selected weekdays, optional in-app reminder time, completion/undo, streak, archive and restore. Schedule revisions preserve prior planned days; changes take effect on the chosen date. Independent daily legacy habits remain available in history.
- Private sleep duration and separate quality rating, steps/activity minutes, self-reported energy/fatigue/stress, weight and typed body circumference. Activity, sleep, quality and recovery are limited to one entry per date; circumferences are limited to one entry per date and measurement type.
- Daily dashboard and 7/30-day summaries, calculated only from the user's actual recorded test data, with missing values explicitly shown. Nutrition Pro water records and Training Pro finished sessions are canonical when available; legacy logs are the fallback, not added a second time.
- Five optional user-defined targets (steps, activity minutes, sleep hours, body weight, habit completion rate). Targets are private, validated, editable and removable; no target is prescribed by the application. Hydration targets remain managed in Nutrition Pro.
- Four 30-day SVG trend charts for weight, sleep, steps and movement minutes. Missing days are gaps, not zero values. Every chart includes an accessible dated data list.
- Twelve localized habit templates grouped into movement, nutrition, recovery and routine. Users customize the name, weekdays and reminder before saving. A due-reminder panel in Health and an app-wide private count appear during active use; completing a habit removes its reminder.
- Accessible native expandable cards, shared MUSCLIVO design tokens, independent Arabic/English/Swedish translation files and RTL-compatible layout.
- Accepted coaching relationships may send habit suggestions, which a trainee must accept before a habit is created. The trainee may independently grant/revoke a seven-day planned/completed count to a verified coach. No habit names, check-in history or health measurement values are sent to the coach by this sharing mechanism. Club and platform contexts cannot see personal health records.

## Architecture and safety

`health.mjs` handles recurring habits, validated operations, consent and scoped projections; `wellness.mjs` routes health operations and includes the projection in the owner-only wellness response. `dist/core/health-ui.js` renders the new page and calculates personal summaries; `wellness-schema.js` validates record kinds on the server and builds the record forms. Health data is included in the existing account export and removed during personal record clearing and account deletion. All existing production gates remain closed.

Reminders use the device's local clock and are refreshed during normal app rendering and polling. No background or push delivery, wearable integration, diagnoses or clinical recommendations are provided. Real health data must not be entered before secure storage, retention, deletion, consent and access controls have been professionally reviewed. Final browser/device and production QA remain deferred.

Targeted local checks: `node --test tests/health.test.mjs tests/wellness.test.mjs tests/workspace.test.mjs`.
