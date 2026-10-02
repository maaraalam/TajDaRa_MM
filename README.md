# TAJDARA M&M Universal v7

Responsive PWA for desktop and iPhone.

## Venues
- TX: Toobit public market data
- NX: Nobitex public market data
- BN: Binance public spot market data
- DX: Digikala Digital Gold local/manual price history

No exchange account connection, no private API keys, and no automatic order execution.

## v7 changes
- Fixed TX chart: Toobit klines now request startTime/endTime, required to receive historical candles.
- Added BN (Binance) as a public-data venue.
- DX now has a chart based on local price snapshots entered in Settings.
- Added Signal Watch: BUY, TAKE PROFIT, EXIT/SELL.
- Browser/in-app notifications and optional webhook delivery.
- Signal watches run every 60 seconds while the app is open.

## Email/SMS
A static GitHub Pages app cannot safely embed email/SMS credentials. Use the optional webhook URL with Make/Zapier/Twilio/your own server to relay signal notifications.
