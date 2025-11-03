import { ButtonInteraction } from "discord.js";
import { sellByPercent } from "../../services/trading/engine.ts";
import { getOrCreateUser } from "../../store/db.ts";
import { getTokenSnapshot } from "../../services/market/index.ts";
import { buildPanel } from "../../renderers/panel.ts";
import { fmtShort } from "../../utils/numbers.ts";

export async function handleSellButton(interaction: ButtonInteraction) {
  const [_, mint, pctStr] = interaction.customId.split("::");
  const pct = Number(pctStr);
  if (!mint || mint === "none") { await interaction.reply({ content: "No token selected.", ephemeral: true }); return; }
  try {
    await interaction.deferReply({ ephemeral: true });
  const { pnl, sellMarketcap, percentChange, realized_pnl_usd, realized_pnl_sol } = await sellByPercent(interaction.user.id, mint, pct);
    const user = getOrCreateUser(interaction.user.id, {});
    const latest = await getTokenSnapshot(mint);
    const panel = buildPanel({ ...user, active_mint: mint }, latest);
    await interaction.message.edit(panel);
  const mcText = sellMarketcap ? `$${fmtShort(sellMarketcap, 0)}` : "n/a";
  const pctText = `${percentChange ? percentChange.toFixed(2) : "0.00"}%`;
  await interaction.editReply({ content: `✅ Sold ${pct}% — Sold MC: ${mcText} • PnL: ${pctText} • Realized: ${fmtShort(realized_pnl_sol,3)} SOL / $${fmtShort(realized_pnl_usd,3)}` });
  } catch (e: any) {
    await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true });
  }
}
