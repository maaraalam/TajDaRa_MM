# TAJDARA M&M Universal v9

Universal iPhone + Desktop PWA.

## v9 highlights
- Dependency-free professional candlestick chart rendered locally (no external chart library required)
- Always-visible Market Workspace with 15m / 30m / 1h / 4h / 1d
- EMA20 / EMA50 overlays
- Swing trend lines, BOS, CHoCH and liquidity sweep labels
- Journal BUY/SELL markers and open Stop / TP levels on chart
- Desktop watchlist sidebar + mobile-first responsive workspace
- Multi-timeframe signal quality engine with confidence score
- Signal quality gates: structure, higher-timeframe alignment, R:R and volatility
- Cloudflare 24/7 worker upgraded to reduce low-value alerts and candle-noise
- Smarter TAKE PROFIT alert when >1R profit combines with weakening structure
- Telegram BUY / SELL / TAKE PROFIT / EXIT and high-impact news

## Upgrade
Replace the files in GitHub Pages root with this package and deploy the included `cloudflare-worker/worker.js` to the existing Worker. Existing KV, secrets, pairing key and Telegram settings remain unchanged.
