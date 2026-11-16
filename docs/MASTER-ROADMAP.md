# MUSCLIVO LIVE — Master Roadmap

Standalone project. No Supabase connection, external service, paid dependency or change to the original MUSCLIVO application. Local server and SQLite remain the baseline. Production remains gated by the existing release requirements.

## Sprint 01 — local workspace foundation

- Preserve existing local authentication, associations, social feed, live matching, chats, challenges and administrator tools.
- Add one role-aware workspace navigation hub; new features are hidden in production until reviewed.
- Separate Arabic, English and Swedish translation dictionaries; retain RTL and existing theme support.
- Add temporary interactive sample checklists for training, nutrition and daily habits. They are not persistent logs and must not be used for personal health data.
- Provide coach-directory filtering, initially based on the selected interface language; users may choose multiple languages (any match) or all. Coaches edit spoken languages in their own profile.
- Add explicit planned-scope cards for the remaining modules. Finance preview requires the currently selected club's finance permission; no financial records, payment transactions or club management are implemented by these cards.

## Sprint 02 — completed local identity foundation

The existing accounts now support nine role types, accepted and revocable assignments, club-specific authorization, a role-switching UI, and isolated local demo clubs. See [Identity model](IDENTITY.md). Production still blocks these new local features pending release review.

## Sprint 03 — local smart dashboard and settings

Home includes a server-projected summary for the active authenticated role and club. All nine roles receive permission-specific shortcuts; only authorized club roster counts, club invitation counts and platform moderation counts are calculated. No fabricated finance, training, member-progress or health records are shown. Planned shortcuts remain previews. See [Dashboard](DASHBOARD.md).

## Sprint 04 — local personal training, nutrition and health records

Owner-authenticated CRUD is available for workout programs and exercise logs, meals/calories and water, daily habits, sleep and body weight. Records persist locally across restarts, with validation and owner-only history, daily summaries, export, deletion and testing opt-in. Club, staff and administrator contexts cannot read the records. Sprint 05 adds a narrowly consented workout-only coach projection, not full access. This is a test-data MVP only; real sensitive-data collection and production enablement remain gated. See [Private records](WELLNESS.md).

## Sprint 05 — local coach and trainee management

Verified coaches and trainees can establish a mutually approved personal-context coaching relationship. Coaches can create, update and archive assigned programs, with trainees reporting completion. An independent opt-in allows read-only workout history and can be revoked without ending coaching. Ending, blocking or account deletion removes access. Club and platform contexts cannot read coaching data. See [Coaching](COACHING.md).

## Sprint 06 — local clubs and finance

Club owners/managers manage branches, accepted-member subscriptions and plans; members see their own active club records and invoices. Club owners/accountants manage a manual ledger and issued, paid or void invoices. Managers have finance read-only access. Amounts use integer minor units; SEK/EUR/USD reports are separate. Club-context checks, append-only audit and invoice-linked ledger corrections prevent cross-tenant access or double recording. No actual transactions or tax-qualified invoicing. See [Clubs and finance](CLUBS-FINANCE.md).

## Sprint 07 — local community and clubs chat

Personal direct/group chat remains available. The chat workspace now separates club rooms by active club and role, with built-in general, staff, coach and finance channels. Managers may create custom groups and invite eligible, consenting members without automatically gaining access to their private content. Reporting discloses only a selected message and reason, blocking hides messages, and role revocation removes custom memberships. See [Chat](CHAT.md).

## Sprint 08 — local live events, campaigns, library and rehab

Local threshold events, waitlists, club-scoped management, Ramadan and StartFit check-ins, rights-confirmed text library and consent-based personal test rehab records are implemented.

## Sprint 09 — local master administration

The central workspace links existing moderation and identity administration, reports aggregate counts and controls rollout of the four new local modules. No expansion of access to private data or other clubs.

## Sprint 10 — local acceptance and release preparation

19 automated tests pass, including consent, event enrollment, library publication, feature flags, backup integrity and the production gate. Browser/device acceptance, policy review, secure hosting and production deployment remain open. Chromium could not launch in the test sandbox. See [Programs and administration](PROGRAMS-ADMIN.md) and [release checklist](../RELEASE-CHECKLIST.md).

## MVP scope and rules

The MVP prioritizes identity, security, core training/nutrition/habits and coach directory. Existing social features remain available locally. All other modules are developed and released gradually; scaffolding is not a claim of completion. The public version requires a secure server and validated production configuration. Only free-tier infrastructure is targeted initially; operating costs depend on actual usage and service limits. No live external database, real payments or production deployment are authorized by this sprint.
