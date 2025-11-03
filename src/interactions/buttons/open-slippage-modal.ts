import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export async function handleOpenSlippage(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId("MODAL_SLIPPAGE").setTitle("Set Slippage & Fee (bp)");
  const sl = new TextInputBuilder().setCustomId("SLIPPAGE_BP").setLabel("Slippage (basis points)").setStyle(TextInputStyle.Short).setRequired(true);
  const fee = new TextInputBuilder().setCustomId("FEE_BP").setLabel("Fee (basis points)").setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(sl),
    new ActionRowBuilder<TextInputBuilder>().addComponents(fee)
  );
  await interaction.showModal(modal);
}
