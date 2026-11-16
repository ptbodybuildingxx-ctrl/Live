# MUSCLIVO LIVE — Sprints 08–10 (local MVP)

The new workspace modules use the existing local Node.js/SQLite state, authenticated identity contexts and the three language dictionaries. No dependency, external database, payment processor, streaming service or production deployment is introduced.

## Sprint 08

- Events: platform administrators manage public events; owners and managers manage events in their currently selected club only. Draft, publication, unpublishing and archiving are explicit. Events have a UTC date range, start time, place, minimum and capacity. The first eligible registrants fill seats; later eligible registrants wait in FIFO order. Leaving frees a seat automatically. Changes to seat availability and threshold confirmation generate in-app notifications for opted-in participants. Confirmation is computed from the current eligible seat count; managers can mark attendance when a confirmed event starts. This is event coordination, not audiovisual streaming.
- Ramadan and StartFit: platform administrators create and edit campaign text, language, category and date range, and publish, unpublish or archive. Members enroll, leave and check in once per UTC day during the published campaign. Administrators can see campaign enrollment and completion counts. There are no fabricated programs or automatic medical recommendations.
- Library: administrators prepare and publish rights-confirmed, plain-text books or guides with author, rights/source note, language and description. Users can filter by language/category, search metadata, read and download the text. No external document upload or copyrighted content is provided by default.
- Rehabilitation: fictional test records only, with opt-in through the existing personal/wellness context. Users can create, edit, delete and export an injury note, plan and progress. An owner may share one record with a verified coach in an accepted personal coaching relationship, or revoke consent. Editing resets sharing; ending the relationship, blocking, suspension or context switching prevents further access. Clearing wellness removes own rehab records. A coach is not automatically a medical professional. No diagnosis, prescription or medical monitoring is offered.

## Sprint 09

The Master administration workspace extends existing account verification, role assignments, moderation, audit and club management screens. Only a platform administrator in an authorized role can toggle the four new local modules. These flags affect both navigation/projections and server mutations. Management of a club event still requires that club's active owner/manager context. Platform administrators may see aggregate counts but cannot read club-private event rosters, personal injury records or unrelated conversations. Audit records contain operation, target, actor and time, never rehab content. Existing finance/club/chat and role permissions are not expanded.

## Sprint 10

Local acceptance includes Node syntax checks and API integration tests (previous sprints plus events/campaigns, rights confirmation, flags, consent, export, isolation and SQLite backup integrity). The release gate remains closed for all local modules, even with production configuration. The existing production pilot and its preflight are deliberately unchanged. Before real launch, confirm policy review, secure hosting and actual email delivery, device/browser checks and independent security review, data handling and backup retention. Free-tier hosting remains the target rather than a cost guarantee.

Run locally:

```sh
npm test
npm start
```

No network service is needed. Existing demo accounts can be used to exercise these workflows; do not enter real sensitive data.
