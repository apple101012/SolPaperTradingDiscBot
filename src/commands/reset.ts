import { ChatInputCommandInteraction } from "discord.js";
import { getPositions, savePositions, getTrades } from "../store/db.ts";
import { getUsers, saveUsers } from "../store/db.ts";
import { CONFIG } from "../config/env.ts";

export async function handleReset(interaction: ChatInputCommandInteraction) {
  // Hard reset of THIS user's portfolio
  const id = interaction.user.id;
  const users = getUsers();
  const u = users.find(x => x.discord_user_id === id);
  if (u) {
    u.sol_balance = CONFIG.DEFAULT_SOL_BALANCE;
    u.realized_pnl = 0;
    u.active_mint = "";
  }
  saveUsers(users);
  const pos = getPositions().filter(p => p.discord_user_id !== id);
  savePositions(pos);
  // Keep trades history (optional: you can wipe it too)
  await interaction.reply({ content: "♻️ Reset complete. SOL restored and positions cleared." });
}
