# Private Travel Wallet

The `/v2/` Private Travel Wallet is intentionally device-only.

- Text profile: `localStorage` key `sh-private-wallet-v1`
- Expense member compatibility: `localStorage` key `sh-private-members`
- Flight Ticket PDF: IndexedDB database `shanghai-private-travel-wallet`, object store `documents`
- Public source/data must never contain passenger names, booking references, e-ticket numbers, policy numbers, or uploaded ticket files.
- Standard trip backup intentionally excludes the Private Wallet. Private profile export is a separate, explicit, unencrypted JSON export and does not include the PDF.
- Clearing site data, browser storage, or changing devices may remove the wallet. The original travel documents must be kept elsewhere.
