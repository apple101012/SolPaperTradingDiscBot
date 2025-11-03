import { ButtonInteraction } from "discord.js";

export async function handleHelp(interaction: ButtonInteraction) {
  await interaction.reply({
    content:
      "Help:\n• Paste a Solana mint to load a token\n• Use Buy/Sell buttons\n• Configure buy/sell presets and slippage via buttons\n• Slash cmds: /balance, /positions, /history, /pnl, /reset",
    ephemeral: true
  });
}
