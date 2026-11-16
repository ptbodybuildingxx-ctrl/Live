# Smart dashboard — Sprint 03

The local Home screen now includes a dashboard alongside the existing community experience. The server derives each summary from the current identity context on every login, state refresh and action; client-supplied role names never grant dashboard data. The existing identity screen remains the place for switching or accepting assignments.

| Active role | Dashboard |
|---|---|
| Member | Personal XP, joined challenges, upcoming own/joined sessions; training, nutrition and health previews in personal context; club identity in club context |
| Coach | Personal summaries in personal context; verified-coach program and consent-based trainee progress shortcuts (Sprint 05); assigned club identity and coaching preview in club context |
| Club owner | Unique active club account count, pending invitations in that club, role invitations, active memberships, open invoices and club/finance tools |
| Club manager | Unique active club account count, active memberships, open invoices, club management and read-only finance |
| Staff | Assigned club identity only |
| Accountant | Assigned club identity, open invoice count and finance recording, no roster count |
| Moderator | Pending report count and moderation shortcut |
| Admin | Pending report count, platform account count and existing admin screen |
| Super admin | Admin capabilities plus moderator assignment count and shortcut |

Club data is never aggregated from the global feed. A switch or revoked grant replaces the dashboard with the server's current authorized context; no dashboard results are cached. The display preference in Settings hides summary numbers and is stored locally per account and role context, not in the cloud. It never changes access control. Arabic, English and Swedish are separate dictionaries and the UI uses the existing responsive and RTL styles.

## Feature flags (local server only)

- `ML_SMART_DASHBOARD=0 npm start`: hides the dashboard and excludes its data from responses.
- `ML_DASHBOARD_METRICS=0 npm start`: retains authorized shortcuts but excludes all summary numbers.
- Both flags are forced off in production, irrespective of environment configuration. The existing production release gate is unchanged.

No new dependencies, external database, paid service, payment processing or real sensitive record collection. Training, coach and finance workflows remain planned or prototype scope until their respective sprints. Run `npm test` to verify context isolation, role permissions, release flags, translations and preferences.
