# TAJDARA M&M — Mobile PWA v5

English-only mobile trading dashboard / journal.

## Venue labels
- TX = public Toobit market data
- NX = public Nobitex market data
- DX = manual digital-gold reference price

## Privacy
This build has **no account connection**. It does not request, store or use API keys, balances, private order history or account information. It cannot place orders.

## Analysis engine
- BOS
- CHoCH
- Liquidity Sweep
- EMA20 / EMA50
- RSI14
- ATR14
- Volume expansion
- Recent-range location
- A / B / C signal quality
- Entry zone / invalidation / TP1 / TP2
- Position sizing by capital and risk percentage

## Journal
Full plan → fills → partial exits → closed trade workflow with editing, fees, average entry, open quantity, realized P/L and realized ROI.

## GitHub Pages
Upload the **contents of this folder** to the repository root so that `index.html` is at the top level. In Repository Settings → Pages, choose `Deploy from a branch`, `main`, `/(root)`.


## Local password lock (v5)
- First launch asks you to create a password (minimum 6 characters).
- The password is never hard-coded in the public repository.
- A PBKDF2-SHA256 verifier with a random salt is stored only in the browser on that device.
- The app auto-locks after 10 minutes of inactivity.
- Settings includes **Change Password** and **Lock Now**.
- Important: this is a local app lock, not server-side access control. A public GitHub Pages site is still publicly reachable; the lock protects normal access to the app UI on a device.
