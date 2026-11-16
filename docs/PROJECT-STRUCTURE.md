# Project structure and design system

The repository is a dependency-free Node.js application with browser ES modules.
The `dist/` directory is maintained source (not generated output); there is no
build step. Keep the local SQLite database, secrets and backups out of Git.

| Location | Responsibility |
| --- | --- |
| `server.mjs` | HTTP routing, authorization, action dispatch and static asset allowlist |
| `identity.mjs`, `coaching.mjs` | Account contexts, permissions and coaching relationships |
| `training.mjs`, `nutrition.mjs`, `wellness.mjs` | Independent domain logic |
| `club-ops.mjs`, `club-chat.mjs`, `programs.mjs` | Club and program domains |
| `dist/app.js` | Application shell, navigation and event dispatch |
| `dist/core/` | Domain UI modules, registries, calculators and shared disclosure helpers |
| `dist/languages/` | Independent `ar.js`, `en.js`, `sv.js` dictionaries |
| `dist/styles/` | Shared stylesheets loaded from `dist/app.css` |
| `tests/` | Automated regression tests and local fixtures |
| `docs/` | Domain notes, roadmaps and design guidance |
| `deploy/` | Future deployment configuration examples |

## CSS ownership

| Stylesheet | Purpose |
| --- | --- |
| `tokens.css` | Dark/light colors from the MUSCLIVO palette, radii, surfaces, borders, shadows |
| `base.css` | Existing reset, layout, shell, basic controls and community UI |
| `responsive.css` | Existing desktop/tablet/mobile layout and policy styles |
| `modules.css` | Workspace, identity, dashboard, wellness and chat |
| `training.css` | Workout builder, exercise visuals and training-specific controls |
| `components.css` | Shared polished controls, disclosures, workspace cards and responsive refinements |

Use `var(--green)`, `var(--panel)`, `var(--text)`, `var(--line-strong)`,
`var(--radius-control)` and `var(--radius-panel)` instead of hard-coded colors
or duplicate radii. Keep domain-specific rules in the appropriate stylesheet.
Use logical properties for RTL (e.g. `padding-inline-start`). Use native
`details`/`summary` for expandable controls; keep buttons and forms in the
expanded content rather than nesting them in the summary. Explicit stable
`data-disclosure-key` values allow the shell to restore open state on same-page
refreshes; the state is not written to disk or sent to the server.

## Adding a module

1. Separate business logic, UI, language keys and tests.
2. For new browser files, add explicit paths to the static server allowlist.
3. Reuse the shared `card`, `stack`, `grid`, `primary`, `secondary`, `chip`
   and disclosure controls. Keep authorization checks in the server/domain.
4. Verify Arabic RTL, English, Swedish, dark/light, mobile and keyboard focus.
5. Keep commits focused and do not commit local records or credentials.

The visual refresh is local and does not enable production modules, contact
Supabase or complete the final release acceptance. Full browser and device QA
remains scheduled for the final project stage.
