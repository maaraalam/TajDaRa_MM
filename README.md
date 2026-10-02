# TAJDARA M&M Mobile v5.1

Emergency compatibility update for GitHub Pages / iPhone PWA.

## What changed
- Main CSS and JavaScript are embedded directly inside `index.html`.
- This prevents a blank/stuck lock screen when `app.js` or `styles.css` are missing from the GitHub repository root.
- Service Worker cache version updated to v5.1.
- Password remains local-only and is never sent to NX, TX, DX, GitHub, or any account.

## GitHub update
Upload/replace these items in the repository root:
- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icons/`

Delete old `app.js` and `styles.css` if present; v5.1 does not need them.

After commit, open the GitHub Pages URL in Safari and refresh once. If the Home Screen app still shows the old version, remove the old Home Screen icon and add it again from Safari.
