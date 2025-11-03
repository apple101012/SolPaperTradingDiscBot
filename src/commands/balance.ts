import { ChatInputCommandInteraction } from "discord.js";
import { CONFIG } from "../config/env.ts";
import { getOrCreateUser } from "../store/db.ts";

export async function handleBalance(interaction: ChatInputCommandInteraction) {
  const user = getOrCreateUser(interaction.user.id, { sol_balance: CONFIG.DEFAULT_SOL_BALANCE });
  await interaction.reply({ content: `💰 SOL: **${user.sol_balance.toFixed(3)}** | Realized PnL: **${user.realized_pnl.toFixed(3)}**` });
}
