# Solana DM Paper Trader (Discord Bot)

- DM-only Discord bot.
- Paste a Solana token **mint** in DM to load market data.
- One-tap Buy/Sell with presets. Paper balance persisted to CSV locally.

## Quickstart
1) `cp .env.example .env` and fill tokens.
2) `npm i`
3) `npm run deploy-commands`
4) `npm run dev`
5) DM the bot: `/start`, then paste a token mint.

## Data storage
- Committed templates: `src/store/*_template.csv`
- Personal data: `src/store/*.csv` (gitignored)
