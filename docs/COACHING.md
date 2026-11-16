# Coach management — Sprint 05

Available only on the local test server. No new infrastructure, paid service, Supabase connection or medical data collection. Use synthetic records only, as in [Sprint 04](WELLNESS.md).

## Workflow and permissions

1. A verified coach in `personal:coach` or trainee in `personal:member` selects the other account from the coach directory or visible profiles. The language filter remains available to trainees. Sending a request records the sender's consent; the recipient must accept while using the corresponding personal context.
2. Pending requests grant no program or workout access. Either participant may decline/cancel/end the relationship. A coach can manage a maximum of 20 concurrent relationships and 50 assigned programs per relationship.
3. The coach can assign a named program with up to 20 exercise/instruction lines and optional notes, revise it and archive it. The trainee sees their assigned programs and marks active ones complete or incomplete. Revising a program resets completion. Trainees cannot change program contents. Archive is read-only for both parties.
4. Workout sharing is independently disabled by default. The trainee can grant or revoke consent for existing and future personal workout logs; the coach views total logged entries and up to 50 recent entries from that trainee. Food, water, habits, sleep and body-weight measurements are never included. Coaches cannot edit a trainee's personal logs. Clearing all personal test records also disables workout sharing; enabling records again does not restore consent.
5. Ending a relationship or blocking an account immediately invalidates subsequent coaching API access. Unblocking never restores a relationship. The trainee retains read-only program history while the coach cannot retrieve ended programs or the trainee's history. Account deletion removes associated links and programs from the active database. Already seen data and backups cannot be recalled.

The server checks the authenticated account, active personal role, valid verified coach, relationship status, counterpart, and record-specific permission on every operation. Club roles, moderators and platform administrators do not acquire coaching access. Dashboard incoming-request counts are restricted to the active personal context. Password-verified export includes the user's authorized relationship/program data, never another person's workout history.

The complete `npm test` suite verifies both request directions, spoofed roles, pending/accepted state, foreign account access, program editing/completion/archiving, opt-in/out, private wellness separation, club switch, block/unblock, account deletion and production gating. Production refuses local coaching data; real sensitive data requires separate privacy and release review.
