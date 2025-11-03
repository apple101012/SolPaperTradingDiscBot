import { ChatInputCommandInteraction } from "discord.js";
import { getTrades } from "../store/db.ts";
import { fmtShort } from "../utils/numbers.ts";

export async function handleHistory(interaction: ChatInputCommandInteraction) {
  const trades = getTrades(interaction.user.id, 10);
  if (!trades.length) { await interaction.reply({ content: "🕰️ No trades yet." }); return; }
  const lines = trades.map(t => {
    return `• ${t.side} \`${t.mint}\` qty ${fmtShort(t.qty_tokens)} @ $${fmtShort(t.effective_price)} (Δ PnL ${fmtShort(t.realized_pnl)})`;
  }).join("\n");
  await interaction.reply({ content: `🧾 Recent trades:\n${lines}` });
}
