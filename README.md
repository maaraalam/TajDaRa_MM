# TAJDARA M&M — iPhone PWA

A mobile-first companion version of TAJDARA M&M.

## Included
- English-only UI
- Matcha green dark theme
- Toobit watchlist + public live prices
- Nobitex IRT watchlist + public live prices
- Add/remove symbols
- Mobile candlestick chart when public candles are available
- Trade Planner with entry, stop, TP1, TP2, risk %, position sizing
- A/B/C signal grade
- Trade Journal
- Edit trades after creation
- Add/edit/delete BUY/SELL fills
- Average entry and realized P/L calculation
- Toman-denominated crypto trades
- Digikala Digital Gold manual quote
- Local device storage
- Backup export/import
- Offline app shell via service worker

## iPhone installation
This is a PWA, so it must be served over HTTPS (or localhost during development).
1. Upload this folder to any static HTTPS host such as GitHub Pages, Netlify, Cloudflare Pages, or your own HTTPS domain.
2. Open the URL in Safari on iPhone.
3. Tap Share.
4. Tap **Add to Home Screen**.
5. Launch **TAJDARA M&M** from the iPhone home screen.

## Security note
Private API keys are intentionally NOT stored in this browser edition. Public prices work directly when the APIs allow browser requests. For balances and private order history, use the desktop build or add a secure backend/native Keychain layer.

## Native iOS / IPA
A signed .ipa cannot be produced without Apple code signing, an Apple Developer identity, and a macOS/Xcode build step. The PWA is the immediately installable iPhone path without App Store distribution.
