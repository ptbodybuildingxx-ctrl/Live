# Clubs and finance — Sprint 06

Local synthetic test data only. No Supabase, bank integration, payments, tax processing, paid service or new dependencies. The existing role invitation/acceptance workflow controls membership and staff access.

| Active club role | Club operations | Finance |
|---|---|---|
| Owner | Branches, plans, subscriptions, roster, assignments | Read/write ledger and invoices |
| Manager | Branches, plans, subscriptions, roster | Read-only ledger, reports, invoices |
| Staff / coach | Club branches and plan information | None |
| Accountant | Club branches and plan information; no staff roster | Read/write; minimal accepted member selector for billing |
| Member | Club information, own subscriptions and invoices | No aggregate ledger access |
| Platform admin / personal context | No club operational data | None |

## Club operations

- Create, update and archive branches and subscription plans. Plans support monthly, annual and one-time billing terms. Archive prevents new assignments; existing membership terms remain intact.
- Assign a plan and optional branch to an accepted club member, with start/end dates. Status is derived from dates or cancellation. Overlapping non-cancelled memberships are rejected. Terms and amount are snapshotted when assigned. Revoking the member grant cancels associated memberships; no automatic renewal or payment occurs.
- Manage accepted staff/roles via the existing Identity page. The active identity context, not request-supplied identifiers, selects the club.

## Manual finance

- Record income and expenses with description, date, currency and amount. Amounts are positive integer minor units (cents/öre); balances are reported separately for SEK, EUR and USD without currency conversion. Reports reflect all non-void records, not bank balances.
- Issue numbered invoices to accepted members. Recording a payment marks an issued invoice paid and adds exactly one linked income entry. A second payment is rejected. Nothing is charged or transferred. Voiding an invoice also voids its linked income; direct void of invoice-linked entries is rejected. Independent entries can be voided with a reason. Corrections are void/reissue, not destructive edits.
- Every successful operation appends an audit event with actor, time and target. The UI displays the most recent 100 events per domain and club. No audit history is deleted by ordinary mutation.
- Account export includes only the account's own subscriptions/invoices. Deleting an account removes its membership records and detaches its ID from retained invoice/audit history. Deleted clubs' operational records are removed after identity deletion. Do not enter real personal information in free-text labels; backups and historical copies may retain data.

The entire module remains local-only; the production server rejects operational test data. These are prototype accounting records, not tax-compliant invoices or a statutory bookkeeping system. Before real deployment review accounting, privacy, retention, backup encryption, financial segregation and reconciliation requirements. Run `npm test` for tenant isolation, role gating, amount validation, membership validity, invoices, audit, export and production checks.
