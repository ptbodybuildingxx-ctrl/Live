# Personal records — Sprint 04

The Train, Nutrition and Health workspace pages now provide persistent local test records, alongside the previous temporary demo checklists. An authenticated user must select their own personal member or coach context and explicitly enable test logging. No external server, Supabase, medical advice, automated calorie recommendations, payments or paid dependency is introduced.

| Record | Fields |
|---|---|
| Workout program | Program name, list of up to 20 exercises |
| Workout log | Date, exercise, sets, repetitions per set, weight in kg |
| Meal | Date, meal type, description, manually entered calories in kcal |
| Water | Date, millilitres |
| Daily habit | Date, habit name, completion |
| Sleep | Date, hours, one record per day |
| Measurement | Date, body weight in kg |

Every record can be added, edited or individually deleted. Lists preserve history, and each module shows a daily summary; training also shows the total number of workout log entries. Summaries reflect only data entered by the owner, not targets or recommendations.

## Privacy and release gates

- The server derives the account and active context from the session. Requests cannot choose another owner. Every mutation validates fields, types, dates, lengths and numeric boundaries. Maximum 1,000 records per account.
- Data is included only in the owner's personal context response; it is not returned to the coach for another user, club management, platform administration, or social feed. Personal member and personal coach contexts deliberately share the same account's logs. Coach-to-trainee sharing awaits Sprint 05 consent and revocation.
- Settings allow the owner to clear all records and disable logging. Password-verified account export includes only their own records, and account deletion removes them from the active database. Local database backups or historical SQLite pages may retain old copies; deletion is logical, not cryptographic erasure.
- **Synthetic test data only.** SQLite is not encrypted at rest, and local operator access/backups are outside application role isolation. Real personal and health data must not be entered. Before production, review consent, encrypted storage, retention, backup access and secure deletion. Production cannot enable this module and rejects a local wellness database.
- Arabic, English and Swedish are independently translated. `npm test` covers all seven record types, validation, isolation, export, clearing, account deletion and restart persistence.
