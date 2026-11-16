# MUSCLIVO MASTER ADMIN PRO — local administration

The central dashboard requires the active platform administrator or super-administrator context on the server and client. Moderators, club managers and personal users cannot receive the master projection or call its actions. The local legacy admin endpoint delegates account suspension and verification to the same permissions; production behavior and release gates remain unchanged.

The dashboard shows platform account counts, 30-day activity, suspended accounts, club count, moderation and verification queues, public content status, and catalog counts. Searchable accounts have explicit suspend/restore controls, protected platform accounts cannot be suspended through either local administration endpoint, and verification decisions are audited. The super-administrator still manages moderator assignments via the existing consent-based identity workflow. Report moderation uses its existing authorized panel.

Events, campaigns, library and rehabilitation have real availability controls. Exercise and nutrition catalogs link to their own content administration tools; protected personal and club modules retain their existing role permissions and are not globally switched on or off from this panel. Public content counts exclude tenant-specific events. Audit history is limited to 200 recent platform operations, with no record bodies, target messages, financial records, or health data. Account projections omit email addresses and credentials. Existing account exports and deletion remain intact.

The module is local-only, uses the common responsive card system, and supports independent Arabic, Swedish and English translation files. No Supabase, payment integration, paid dependency or deployment changes are introduced.
