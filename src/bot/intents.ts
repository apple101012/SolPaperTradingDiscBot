import { GatewayIntentBits, Partials } from "discord.js";

export const BOT_INTENTS = [
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.MessageContent
];

export const BOT_PARTIALS = [Partials.Channel];
