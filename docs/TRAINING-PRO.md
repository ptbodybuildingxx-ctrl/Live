# MUSCLIVO LIVE — Training Pro (Sprints 11–15)

Local test module. No external database, paid package, media fetch or production rollout. Use fictional data only. Open Train, then Training Pro, or the personal dashboard shortcut.

## Sprint 11: Exercise catalog

150 unique exercises with Arabic, English and Swedish names, categorized by equipment (bodyweight, dumbbell, barbell, machine), primary and secondary muscle group, movement pattern and difficulty. Search and combined filters work locally. Alternatives match primary muscle and movement pattern. An administrator can create, edit, archive and restore catalog records. Media metadata requires a rights declaration and a reference; it does not download or play media. Original images, videos and professionally reviewed technique/injury notes are not included yet.

Sprint 15 expands the original 150 entries to the following 200-entry catalog while keeping existing IDs stable:

| Group | Entries |
|---|---:|
| Chest | 25 |
| Back | 30 |
| Shoulders | 25 |
| Arms | 30 |
| Legs | 35 |
| Core | 15 |
| Cardio | 15 |
| Stretch & mobility | 25 |
| Total | 200 |

## Sprint 12: Methods and builder

Standard sets, drop sets, supersets, trisets, giant sets, circuits, rest-pause, pyramids, clusters, tempo, AMRAP and custom groups are supported with server-side validation. Plans have week/day scheduling, phase, exercise sequence, warm-up flag, rounds, load, repetitions, duration, rest, side, RPE/RIR, tempo and weight sequences. Load is stored in kilograms; the display/input can use pounds. Blocks can be edited, reordered by drag or buttons, and removed. Plans can be copied, archived and restored. Revision and recent operation metadata are retained. A verified coach can assign a copy to an accepted trainee who has opted into test records; the coach may edit the assigned plan while that relationship is active.

## Sprint 13: Live workout

Starting a workout captures its plan revision and an independent step snapshot. Only the owner can log or skip steps, select a matching alternative, resume, finish, cancel or delete completed history. A local rest countdown follows logging; elapsed exercise duration is entered manually. Sets, sides and weight segments can be recorded separately. Existing plan edits do not alter an already started workout. Only one workout may be active per trainee.

## Sprint 14: Progress and privacy

Finished sessions contribute to personal-record, volume, weekly/monthly and adherence summaries. Optional progression suggests a small load increase for qualifying standard sets after two completed sessions meeting the configured repetition target and RIR condition. The trainee must explicitly confirm; no automatic changes or medical recommendation. An accepted coach can see a limited workout summary only while separate workout-sharing consent is active. Other health records, personal notes and adherence remain private. Club and platform administration contexts do not receive personal training logs. Export, clear and account-deletion flows include training records. The local limits are 100 plans and 150 stored sessions per account, 60 blocks per plan and 300 steps per workout.

## Sprint 15: exercise content administration and scalability

The original catalog has been extended with 25 additional resistance entries and 25 dedicated stretching, mobility, warm-up and cool-down entries. Stretch alternatives share movement type and target area. The catalog capacity is 2,000 records; the local UI displays 24 per page and supports multiple equipment filters and target-area search.

An administrator may add/edit independent Arabic, English and Swedish technique notes, common mistakes, safety notes, and a licensed source/rights declaration. Save those metadata first. Upload start/end JPG, PNG or WebP images and one MP4 or WebM video. The browser resizes/re-encodes images; videos must be compressed before upload. The server checks size and basic file signatures, stores the binary content in a separate SQLite table, and serves it via authenticated same-origin endpoints (including byte ranges for video). Images are capped at 2 MiB each, video at 8 MiB, and total local media at 512 MiB. These quotas are deliberate for a free-tier local pilot; increasing the catalog does not automatically increase free media storage. Uploaded media is included in SQLite backups and is never committed to GitHub.

Review workflow: draft → in review → published. Submission requires all translated notes, rights and media. A platform administrator must explicitly attest to qualified specialist review before publishing; the application does not independently verify professional qualifications. Editing metadata or replacing an asset resets publication to draft, hiding all instructions and media from non-administrators until reapproval. Archived exercises remain hidden. The catalog names remain available to authenticated local users for training program construction; the workflow does not alter existing program IDs. No seeded images, videos or reviewed technique instructions are claimed. Do not upload real participant media or copyrighted content without authority. Actual instructional media collection, rights verification, specialist review and physical browser acceptance are separate release gates.

## Acceptance

Run `npm test`. The suite checks catalog validity and translations, role-gated edits, static module delivery, method validation and ordering, coaching consent, workout snapshots, step logging, progression confirmation, export, deletion, unit conversion, UI template rendering and the production gate. These are automated API and render tests rather than verified visual browser or physical mobile acceptance. Real-device QA, independent security/privacy review, reviewed exercise content and approved hosting are still required before public use.
