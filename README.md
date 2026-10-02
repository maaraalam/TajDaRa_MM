# TAJDARA M&M Universal v6

One responsive PWA for iPhone and desktop.

## Security
- Local password lock only.
- No NX/TX/DX account connection.
- No API keys, balances, private order history, or order execution.
- Password verifier stays in local browser storage.

## GitHub Pages update
Upload/replace these items in the repository root:
- index.html
- manifest.webmanifest
- sw.js
- icons/

Keep Pages on `main` + `/(root)`.

## If the lock page appears blank
This v6 build fixes the JavaScript parse error that could leave only `TAJDARA M&M / Secure local access` visible. The package has been syntax-checked before release.

After publishing, open the GitHub Pages URL directly in Safari/Chrome and hard refresh. On iPhone, remove the older Home Screen icon once and add the site again if iOS keeps an old service-worker cache.
