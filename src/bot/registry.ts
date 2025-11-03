import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { CONFIG } from "../config/env.ts";

const commands = [
  new SlashCommandBuilder().setName("start").setDescription("Start a DM trading session"),
  new SlashCommandBuilder().setName("balance").setDescription("Show your SOL balance"),
  new SlashCommandBuilder().setName("positions").setDescription("List open positions"),
  new SlashCommandBuilder().setName("history").setDescription("Recent trades"),
  new SlashCommandBuilder().setName("pnl").setDescription("Realized PnL summary"),
  new SlashCommandBuilder().setName("reset").setDescription("Reset your paper account (confirm)"),
].map(c => c.toJSON());

export async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(CONFIG.TOKEN);
  console.log("Deploying global slash commands...");
  await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), { body: commands });
  console.log("✅ Commands deployed.");
}

if (process.argv[1].includes("registry.ts")) {
  deployCommands().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
