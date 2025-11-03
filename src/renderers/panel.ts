import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getPositions } from "../store/db.ts";
import type { UserRow } from "../store/db.ts";
import type { TokenSnapshot } from "../types/market.ts";
import { fmtShort } from "../utils/numbers.ts";

export function buildPanel(user: UserRow, snap?: TokenSnapshot) {
  const title = snap ? `${snap.name} (${snap.symbol})` : "No token selected";
  const priceLine = snap
    ? `Price: $${fmtShort(snap.priceUsd)} • ` +
      (snap.marketCapUsd ? `MC: $${fmtShort(snap.marketCapUsd, 0)} • ` : "") +
      (snap.fdvUsd ? `FDV: $${fmtShort(snap.fdvUsd, 0)} • ` : "") +
      (snap.liquidityUsd ? `Liq: $${fmtShort(snap.liquidityUsd, 0)}` : "") +
      `\nSource: ${snap.source} • Updated: ${new Date(snap.ts).toLocaleTimeString()}`
    : "Paste a Solana mint address to begin.";

  const pos = user.active_mint ? getPositions(user.discord_user_id).find(p => p.mint === user.active_mint) : undefined;

  const embed = new EmbedBuilder()
    .setTitle("Solana Paper Trader")
    .setDescription(priceLine)
    .addFields(
      { name: "Token", value: `**${title}**\nMint: \`${user.active_mint || "—"}\``, inline: false },
      { name: "Wallet (paper)", value: `SOL: **${fmtShort(user.sol_balance, 3)}**\nRealized PnL: **${fmtShort(user.realized_pnl, 3)}**`, inline: true },
    { name: "Position", value: pos
      ? `Qty: **${fmtShort(pos.token_qty)}** @ Avg: **$${fmtShort(pos.avg_entry)}**${pos.avg_entry_marketcap ? `\nAvg MC: **$${fmtShort(pos.avg_entry_marketcap,0)}**` : ""}`
      : "—", inline: true }
    );

  // Buttons
  const [b1,b2,b3,b4] = user.buy_presets;
  const buyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`BUY::${user.active_mint || "none"}::${b1}`).setLabel(`Buy ${b1} SOL`).setStyle(ButtonStyle.Success).setDisabled(!user.active_mint),
    new ButtonBuilder().setCustomId(`BUY::${user.active_mint || "none"}::${b2}`).setLabel(`Buy ${b2} SOL`).setStyle(ButtonStyle.Success).setDisabled(!user.active_mint),
    new ButtonBuilder().setCustomId(`BUY::${user.active_mint || "none"}::${b3}`).setLabel(`Buy ${b3} SOL`).setStyle(ButtonStyle.Success).setDisabled(!user.active_mint),
    new ButtonBuilder().setCustomId(`BUY::${user.active_mint || "none"}::${b4}`).setLabel(`Buy ${b4} SOL`).setStyle(ButtonStyle.Success).setDisabled(!user.active_mint)
  );

  const sellRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`SELL::${user.active_mint || "none"}::25`).setLabel("Sell 25%").setStyle(ButtonStyle.Danger).setDisabled(!pos),
    new ButtonBuilder().setCustomId(`SELL::${user.active_mint || "none"}::50`).setLabel("Sell 50%").setStyle(ButtonStyle.Danger).setDisabled(!pos),
    new ButtonBuilder().setCustomId(`SELL::${user.active_mint || "none"}::75`).setLabel("Sell 75%").setStyle(ButtonStyle.Danger).setDisabled(!pos),
    new ButtonBuilder().setCustomId(`SELL::${user.active_mint || "none"}::100`).setLabel("Sell 100%").setStyle(ButtonStyle.Danger).setDisabled(!pos)
  );

  const configRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("OPEN_BUY_PRESETS").setLabel("Buy Presets").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("OPEN_SELL_PRESETS").setLabel("Sell Presets").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("OPEN_SLIPPAGE").setLabel("Slippage/Fee").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("HELP").setLabel("Help").setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [buyRow, sellRow, configRow] };
}
