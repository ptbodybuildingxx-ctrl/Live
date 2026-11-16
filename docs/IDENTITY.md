# Local identity and access (Sprint 02)

Existing accounts and login sessions are preserved. Local SQLite state is migrated on startup to a separate identity registry; password hashes and the existing profile role are unchanged. No Supabase or external API is used.

## Role policy

| Role | Scope | Supported permissions |
|---|---|---|
| Member | personal / club | Personal context; read club identity when assigned |
| Coach | personal / club | Coach context; club access if assigned; verified personal coaches may use the Sprint 05 consented coaching service |
| Club owner | club | Roster, assign/revoke roles by invitation, club management and financial read/write |
| Club manager | club | Roster, club management and financial read-only access; cannot assign roles |
| Staff | club | Club identity |
| Accountant | club | Financial read/write; accepted billing-member selector only, no staff roster or role assignment |
| Moderator | platform | Review and resolve pending reports |
| Admin | platform | Existing platform administration |
| Super admin | platform | Admin plus moderator invitation/revocation |

All club actions are bound to the currently assigned club context, checked by the server. Admin and super admin do not implicitly inherit club permissions. Sprint 06 adds club operations and a manual test ledger, with separate `club.finance.read` and `club.finance.write` permissions. Sprint 05 coach programs require a verified personal coach context and a mutually accepted relationship. Club owners can only be created through verified gym accounts or the preloaded local demo fixtures; owners cannot grant ownership to arbitrary users. To protect tenant state, account deletion is blocked for an owner with other assigned members until an ownership-transfer workflow exists.

Local demo: Iron Gym has a verified gym owner, coach, member and an accountant. North Fitness is a second isolated demo club owned by Sara; her existing personal profile stays unchanged. Switch contexts with the same authenticated account. The chosen context is saved at account level; all operations re-evaluate current membership, so revocation removes access without signing out. User export includes their own assignments/invitations, not every club's roster.

Production mode refuses a local identity database and does not expose the new identity actions. The existing release gate remains unchanged. Before public rollout, review the data model, ownership transfer, recovery, role audit and session/device context rules. No payment, real health data, or live external database is enabled by this sprint.
