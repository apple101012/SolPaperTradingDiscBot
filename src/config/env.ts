import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  TOKEN: process.env.DISCORD_BOT_TOKEN ?? "",
  CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DEFAULT_SOL_BALANCE: Number(process.env.DEFAULT_SOL_BALANCE ?? 10),
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS ?? 5),
  MARKET_PRIMARY: (process.env.MARKET_PRIMARY ?? "DEXSCREENER") as "DEXSCREENER",
};

if (!CONFIG.TOKEN || !CONFIG.CLIENT_ID) {
  console.warn("⚠️ Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in .env");
}
