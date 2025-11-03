import { Client } from "discord.js";
import { BOT_INTENTS, BOT_PARTIALS } from "./intents.ts";

export const client = new Client({
  intents: BOT_INTENTS,
  partials: BOT_PARTIALS,
});
