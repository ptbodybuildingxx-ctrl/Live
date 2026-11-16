# Community and club chat — Sprint 07

The existing personal direct and group conversations remain available. The Chat screen has separate Personal chats and Club rooms tabs. Club rooms are a local-only test feature. No external messaging service, live database connection, Supabase or paid dependency is introduced. No real personal, financial or medical information should be sent; the local SQLite database is not encrypted at rest and messages are not end-to-end encrypted.

## Built-in rooms

| Room | Eligible active club roles |
|---|---|
| General club | All accepted club roles |
| Staff | Owner, manager, staff |
| Coaches | Owner, manager, coach |
| Finance | Owner, manager, accountant |

Room membership is based on the selected club and role for every request. Role reassignment can restore built-in access because it is a new accepted assignment, but switching clubs, choosing a personal context, suspension or revocation immediately invalidates access at the server. The UI refreshes from the server. Platform-admin status does not give club room access.

## Custom groups

- Club owners/managers can create groups in one of the four room categories, invite only accounts with eligible accepted roles in that club, cancel invitations, remove participants and archive groups.
- The recipient must accept in an eligible active club context before reading history or sending. Management permission alone exposes group membership metadata, not message contents; a manager must also be a group participant to read them.
- Leaving, removal or loss of the last eligible role revokes custom membership. Reassigning a role does not silently restore custom membership. Pending invitations are cancelled when the recipient loses eligibility or the issuer loses management permission. Archived groups are read-only for remaining eligible members; pending invitations are cancelled.
- Successful group-management events are recorded in the local audit store. Custom groups are limited to 30 per club, 100 members per group and 500 invitations per group. Each room can hold up to 5,000 messages; responses include the most recent 100 visible messages per accessible room.

## Reporting and privacy

- Blocking filters messages in both directions, cancels pending invitations between the two accounts and prevents direct messaging. Both accounts may still participate in shared club rooms without seeing each other's messages. Unblocking does not resurrect cancelled invitations.
- A participant may report a visible message (including an existing personal direct/group message). The moderator receives the selected message excerpt and reason, not access to the chat history. The sender may remove their own club message; club managers may moderate messages only in rooms they can read. Removed message text is cleared from the active room store; previously reported evidence or backups may retain a copy.
- Account export includes the user's own sent club messages and current group membership/invitation metadata only. Account deletion removes their messages and membership, and removes evidence of their deleted messages. Deleting a club removes its room records.

The automated suite tests tenant and role authorization, pending invitation acceptance, management without room access, reporting and evidence isolation, block/unblock, member removal, invitation cancellation, leaving, archiving, role revocation, exports and production refusal. Public deployment remains blocked pending security and privacy review.
