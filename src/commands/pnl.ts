import { ChatInputCommandInteraction } from "discord.js";
import { getOrCreateUser } from "../store/db.ts";

export async function handlePnl(interaction: ChatInputCommandInteraction) {
  const user = getOrCreateUser(interaction.user.id, {});
  await interaction.reply({ content: `📈 Realized PnL: **${user.realized_pnl.toFixed(3)}**` });
}
