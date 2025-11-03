import { ButtonInteraction } from "discord.js";
import { buyWithSol } from "../../services/trading/engine.ts";
import { getOrCreateUser } from "../../store/db.ts";
import { buildPanel } from "../../renderers/panel.ts";
import { getTokenSnapshot } from "../../services/market/index.ts";
import { fmtShort } from "../../utils/numbers.ts";

export async function handleBuyButton(interaction: ButtonInteraction) {
  const [_, mint, amountStr] = interaction.customId.split("::");
  const sol = Number(amountStr);
  if (!mint || mint === "none") { await interaction.reply({ content: "Paste a token mint first.", ephemeral: true }); return; }
  try {
    await interaction.deferReply({ ephemeral: true });
  const { snap, marketcapUsd } = await buyWithSol(interaction.user.id, mint, sol);
    const user = getOrCreateUser(interaction.user.id, {});
    const latest = await getTokenSnapshot(mint);
    const panel = buildPanel({ ...user, active_mint: mint }, latest);
    await interaction.message.edit(panel);
  const mcText = marketcapUsd ? `$${fmtShort(marketcapUsd, 0)}` : "n/a";
  await interaction.editReply({ content: `✅ Bought ${sol} SOL — Price: $${fmtShort(snap.priceUsd)} • Worth @ MC: ${mcText}` });
  } catch (e: any) {
    await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true });
  }
}
