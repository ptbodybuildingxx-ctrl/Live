# MUSCLIVO LIBRARY PRO — local books and guides

The library starts empty; no copyrighted books, copied guides or synthetic published entries are seeded. All content is managed by an administrator and is free to access by authenticated users once published.

## Content management

- Add or edit a book or guide with title, author, description, language (Arabic, English, Swedish), topic, format (text, PDF or both) and a rights/source note. Confirm distribution rights when saving. Drafts are visible only to platform administrators.
- Save metadata before attaching a PDF. Uploading, replacing, removing or editing content returns it to draft. Publishing requires every selected format to be complete. Archive or return published content to draft to revoke ordinary access.
- PDF attachments use the local SQLite `library_pdf` table, not state snapshots or a public folder. Admin-only uploads are limited to 10 MiB per item and 128 MiB total. MIME and header/end-signature checks are basic validation, not malware scanning. PDFs are served to authorized readers as attachments, not embedded in an iframe. SHA-256 metadata associates the file with the item; replacing or removing is transactional with the item state.

## Reading experience

The library includes a responsive generated metadata cover, expandable reader, plaintext and PDF downloads, search, filters by topic/type/language/format, sorting, a favorites list and private user-entered reading progress. Reading preferences are scoped to the account's personal context; they are not visible to coaches, clubs or administrators, are included in account export and removed with account deletion. Archived or disabled content is unavailable to ordinary readers. There are no payments or recommendations.

## Organization and release boundaries

`library.mjs` owns validation, rights confirmation, publishing and preferences; `programs.mjs` retains the existing program flag and content collection; `dist/core/library-schema.js` and `dist/core/library-ui.js` hold the schema and reader/management UI. The shared design system and independent Arabic, English and Swedish language files are reused. No Supabase, paid service or external publishing is used. Local test data only; production remains gated. Before enabling real uploads, review rights, malware scanning, secure hosting, storage capacity and browser/device QA.
