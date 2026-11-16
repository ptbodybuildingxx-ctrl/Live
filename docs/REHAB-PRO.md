# MUSCLIVO REHAB PRO — local framework

This module provides a private test-record workflow and an empty content-management library. No injury treatment protocols, exercise instructions, diagnosis, prescriptions, clinical recommendations or medical content are seeded. The content phase is deferred.

## Personal workflow

- Explicit wellness test-data opt-in is required before creating records. An owner can create, edit, close, reopen and delete a record with a body-region classification, side, date, personal note, manually entered plan and self-reported progress. Closing a record does not certify recovery.
- Each case has editable dated follow-up entries (self-reported progress, optional discomfort rating and note), with one entry per day, and a blank manually entered plan checklist. Checklist completion is not a clinical measure.
- A verified coach in an accepted personal coaching relationship may view one explicitly shared record, including its follow-ups and checklist. The coach cannot edit this record. Any record, check-in or checklist edit revokes sharing, and the owner may withdraw consent at any time. Ending, blocking or losing an eligible relationship also prevents access.
- Club and platform roles cannot read personal injury records. Account export, wellness clearing and account deletion include the owner's follow-up and task data. Existing legacy injury records retain their data and receive defaults for new optional fields.

## Empty content library

The administrator may create blank drafts with type (guide, plan template or exercise), body region, language, title, optional description and draft text. Public users see only published content. Draft content, review fields and actions are not exposed to ordinary users. Publishing a draft is local-only and requires a completed body, explicit specialist-review attestation, reviewer name and source/reference; editing or returning a published item to draft invalidates that review. The application does not validate professional credentials. Content approval is not a medical-device or release certification.

The library starts with zero entries. Arabic, English and Swedish interface translations are separate. Content can later be independently entered in each language. Search and filters are ready for future content.

## Boundaries

`rehab.mjs` isolates the server domain; `programs.mjs` retains the existing routing/feature flag and export integration. `dist/core/rehab-schema.js` contains classification metadata only, and `dist/core/rehab-ui.js` owns the interface. Cards use the existing theme and accessible native disclosures. Local SQLite test data only; no Supabase, external service, uploads, subscriptions, medical data capture in production or public deployment.

Before accepting real health data or publishing clinical materials publicly, secure storage, retention and deletion, privacy, specialist review, accessibility and full release acceptance remain mandatory. Browser/device QA is deferred to the final project stage.
