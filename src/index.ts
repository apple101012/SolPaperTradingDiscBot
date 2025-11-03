import { client } from "./bot/client.ts";
import { CONFIG } from "./config/env.ts";
import { ActionRowBuilder, Events, ModalSubmitInteraction } from "discord.js";
import { ensureStores, getOrCreateUser } from "./store/db.ts";
import { handleBalance } from "./commands/balance.ts";
import { handlePositions } from "./commands/positions.ts";
import { handleHistory } from "./commands/history.ts";
import { handlePnl } from "./commands/pnl.ts";
import { handleReset } from "./commands/reset.ts";
import { handleBuyButton } from "./interactions/buttons/buy.ts";
import { handleSellButton } from "./interactions/buttons/sell.ts";
import { handleOpenBuyPresets } from "./interactions/buttons/open-buypresets-modal.ts";
import { handleOpenSellPresets } from "./interactions/buttons/open-sellpresets-modal.ts";
import { handleOpenSlippage } from "./interactions/buttons/open-slippage-modal.ts";
import { handleHelp } from "./interactions/buttons/help.ts";
import { handleBuyPresetsModal } from "./interactions/modals/buypresets.ts";
import { handleSellPresetsModal } from "./interactions/modals/sellpresets.ts";
import { handleSlippageModal } from "./interactions/modals/slippage.ts";
import { isLikelyMint } from "./utils/validate.ts";
import { getTokenSnapshot } from "./services/market/index.ts";
import { buildPanel } from "./renderers/panel.ts";

ensureStores();

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log("Bot is ready for DM-only use.");
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  if (msg.guildId) return; // DM only
  const text = msg.content.trim();
  if (!isLikelyMint(text)) return;

  const u = getOrCreateUser(msg.author.id, { sol_balance: CONFIG.DEFAULT_SOL_BALANCE });
  try {
    const snap = await getTokenSnapshot(text);
    u.active_mint = text;
    // persist
  const { upsertUser } = await import("./store/db.ts");
    upsertUser(u);
    const panel = buildPanel(u, snap);
    await msg.channel.send({ content: "✅ Token set.", ...panel });
  } catch (e: any) {
    await msg.channel.send(`❌ ${e.message}`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.guildId) { await interaction.reply({ content: "⚠️ DM me instead.", ephemeral: true }); return; }

    if (interaction.commandName === "start") {
      const u = getOrCreateUser(interaction.user.id, { sol_balance: CONFIG.DEFAULT_SOL_BALANCE });
      await interaction.reply({ content: "👋 Paste a Solana token mint to begin. I’ll render a panel once set." });
      const snap = u.active_mint ? await getTokenSnapshot(u.active_mint).catch(()=>undefined) : undefined;
      if (u.active_mint && snap) {
        const panel = buildPanel(u, snap);
        await interaction.followUp(panel);
      }
    }
    if (interaction.commandName === "balance") return handleBalance(interaction);
    if (interaction.commandName === "positions") return handlePositions(interaction);
    if (interaction.commandName === "history") return handleHistory(interaction);
    if (interaction.commandName === "pnl") return handlePnl(interaction);
    if (interaction.commandName === "reset") return handleReset(interaction);
  }

  if (interaction.isButton()) {
    const id = interaction.customId;
    if (id.startsWith("BUY::")) return handleBuyButton(interaction);
    if (id.startsWith("SELL::")) return handleSellButton(interaction);
    if (id === "OPEN_BUY_PRESETS") return handleOpenBuyPresets(interaction);
    if (id === "OPEN_SELL_PRESETS") return handleOpenSellPresets(interaction);
    if (id === "OPEN_SLIPPAGE") return handleOpenSlippage(interaction);
    if (id === "HELP") return handleHelp(interaction);
  }

  if (interaction.isModalSubmit()) {
    const mi = interaction as ModalSubmitInteraction;
    if (mi.customId === "MODAL_BUY_PRESETS") return handleBuyPresetsModal(mi);
    if (mi.customId === "MODAL_SELL_PRESETS") return handleSellPresetsModal(mi);
    if (mi.customId === "MODAL_SLIPPAGE") return handleSlippageModal(mi);
  }
});

client.login(CONFIG.TOKEN);
