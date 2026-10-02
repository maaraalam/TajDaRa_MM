# TAJDARA M&M Universal v8

One responsive build for Desktop + iPhone.

## Market venues
- TX = Toobit public market data
- NX = Nobitex public market data
- BN = Binance public market data
- DX = Digikala Digital Gold local price history

The app does **not** connect to exchange accounts and does not use private exchange API keys.

## v8 highlights
- Exchange-style interactive candlestick chart with crosshair, zoom, pan and auto refresh.
- SMC overlays: BOS, CHoCH, buy-side / sell-side liquidity sweep markers.
- Recent swing-high / swing-low trend lines.
- EMA20 / EMA50 overlays.
- Journal BUY / SELL fills plotted directly on the chart.
- Open-position AVG, STOP, TP1 and TP2 price lines.
- Signal Watch for BUY, TAKE PROFIT and EXIT / SELL.
- Optional 24/7 Cloudflare Worker monitoring with shared Telegram delivery.
- Market Moving News section with HIGH / MEDIUM / LOW impact labels.
- Optional Telegram alerts for HIGH-impact news.
- Local browser notifications while the PWA is open.

## Important DX note
A verified public Digikala Digital Gold live-market API is not embedded. DX therefore charts the price snapshots that you save in Settings. Every changed DX price is appended to local history so the chart builds over time.

## GitHub Pages update
Upload/replace these items in the repository root:
- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icons/`
- `README.md`

The `cloudflare-worker/` folder does not need to be served by GitHub Pages; keep it in the repository as setup/source files if you want.

Commit the changes. Existing Pages settings stay unchanged. Refresh the site once after deployment; on iPhone, reopening the installed PWA may be needed to pick up the new service worker cache.

## Telegram + 24/7 monitoring
See `cloudflare-worker/README_TELEGRAM.md`.
