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

## Remaining sprints

| Sprint | Goal | Acceptance gate |
|---|---|---|
| 04 | Train, nutrition and health | Owner-authenticated CRUD, validation, history, safe handling of sensitive data |
| 05 | Coach management | Mutually accepted coach/member relation, revocable access, individual programs and progress |
| 06 | Clubs and finance | Club-scoped members, staff, branches, subscriptions, manual ledger, invoices and audit; no payments |
| 07 | Community and chat | Club/staff/finance groups with membership enforcement, reporting and blocking |
| 08 | Live, Ramadan, StartFit, library and rehab | Admin-managed campaigns, group threshold events, rights-cleared library and consent-based rehab |
| 09 | Administration | Module rollout flags, moderation and role-specific audit, no unrestricted private-data access |
| 10 | Local acceptance and release preparation | Automated tests, responsive and multilingual checks, privacy review, backups and a documented release gate |

## MVP scope and rules

The MVP prioritizes identity, security, core training/nutrition/habits and coach directory. Existing social features remain available locally. All other modules are developed and released gradually; scaffolding is not a claim of completion. The public version requires a secure server and validated production configuration. Only free-tier infrastructure is targeted initially; operating costs depend on actual usage and service limits. No live external database, real payments or production deployment are authorized by this sprint.
