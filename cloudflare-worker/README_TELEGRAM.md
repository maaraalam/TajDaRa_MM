# TAJDARA M&M v8.1 - 24/7 Telegram Signals + Market News

The Worker keeps the Telegram bot token out of the public GitHub Pages code. It can monitor synced watches every 5 minutes, send BUY / TAKE PROFIT / EXIT signals to a shared Telegram group, and notify the group about new HIGH-impact market headlines.

## 1) Create the shared Telegram group
1. Create a Telegram group containing you and your spouse.
2. Open `@BotFather`, run `/newbot`, create the bot, and copy its token.
3. Add the bot to the shared group.
4. Send a message in that group, for example `/start`.
5. In a browser open `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` and find the group `chat.id`. Group IDs are normally negative.

Do not paste the bot token into GitHub or the PWA source.

## 2) Create Cloudflare Worker + KV
In Cloudflare go to **Workers & Pages -> Create -> Worker**.

Use the included `worker.js`.

Create a KV namespace, for example `TAJDARA_WATCHES`, and bind it to the Worker with the binding name exactly:
`WATCHES`

## 3) Add Worker secrets
In Worker **Settings -> Variables and Secrets**, add these as **Secret** values:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `APP_SHARED_KEY`

`APP_SHARED_KEY` is your own long random pairing key, ideally 24+ characters. The same pairing key is entered locally in TAJDARA M&M Settings.

## 4) Add scheduled monitoring
Add a Cron Trigger:
`*/5 * * * *`

This runs signal/news checks every five minutes even when the PWA is closed.

## 5) Connect TAJDARA M&M
In **Settings -> Telegram Signals** enter:
- the Worker URL, e.g. `https://tajdara-mm-signals.<your-subdomain>.workers.dev`
- the same `APP_SHARED_KEY`
- enable **Send HIGH-impact market news to Telegram**

Then tap:
- **Send Telegram Test**
- **Sync 24/7 Signals & News**

## News sources
The Worker aggregates an official Federal Reserve RSS feed plus fresh market-search RSS feeds for macro, geopolitics, commodities, crypto and Iran FX. Headlines are heuristically tagged HIGH / MEDIUM / LOW impact. This is a screening tool, not a guarantee that a headline will move price.

## Security
- No NX, TX or BN account is connected.
- No exchange API key is used.
- Telegram bot token and group chat ID stay only in Cloudflare Worker Secrets.
- The PWA stores only the Worker URL and pairing key on your own device.
- Telegram messages contain market/signal/news information, not account credentials.

## v8.1 diagnostics
After deploying `worker.js`, open `/health`. It now reports whether auth, Telegram secrets and KV binding are configured, without exposing secret values. In the PWA Settings, use **Worker Health** first and then **Send Telegram Test**.
