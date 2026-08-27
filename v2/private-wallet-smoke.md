# Private Wallet smoke test

1. Open `/v2/` → More → Private Travel Wallet.
2. Save four local member names; verify Budget payer/split chips update.
3. Save a policy number; verify Trip/SOS shows only the masked form until tapped.
4. Select a PDF; verify it is listed, can be opened, and survives refresh/offline reopen on the same device.
5. Export normal trip backup; verify it contains `privateWalletExcluded: true` and no private wallet profile.
6. Export Private JSON; verify it contains profile only and no PDF.
7. Clear Private Wallet; verify local member names, policy profile, and stored PDF are removed.
