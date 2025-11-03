import { ChatInputCommandInteraction } from "discord.js";
import { getPositions } from "../store/db.ts";
import { fmtShort } from "../utils/numbers.ts";

export async function handlePositions(interaction: ChatInputCommandInteraction) {
  const list = getPositions(interaction.user.id);
  if (!list.length) {
    await interaction.reply({ content: "📭 No open positions." });
    return;
  }
  const lines = list.map(p => `• \`${p.mint}\` — qty **${fmtShort(p.token_qty)}** @ avg **$${fmtShort(p.avg_entry)}**`).join("\n");
  await interaction.reply({ content: `📊 Open positions:\n${lines}` });
}
