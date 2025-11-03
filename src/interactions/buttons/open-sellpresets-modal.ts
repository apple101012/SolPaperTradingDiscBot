import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export async function handleOpenSellPresets(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId("MODAL_SELL_PRESETS").setTitle("Set Sell Presets (%)");
  const fields = ["SELL_1","SELL_2","SELL_3","SELL_4"].map((id, i) =>
    new TextInputBuilder().setCustomId(id).setLabel(`Percent ${i+1}`).setStyle(TextInputStyle.Short).setRequired(true)
  );
  modal.addComponents(...fields.map(f => new ActionRowBuilder<TextInputBuilder>().addComponents(f)));
  await interaction.showModal(modal);
}
