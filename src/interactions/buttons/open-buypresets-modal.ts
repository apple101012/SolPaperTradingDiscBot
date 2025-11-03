import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export async function handleOpenBuyPresets(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId("MODAL_BUY_PRESETS").setTitle("Set Buy Presets (SOL)");
  const inputs = ["BUY_1","BUY_2","BUY_3","BUY_4"].map((id, i) =>
    new TextInputBuilder().setCustomId(id).setLabel(`Preset ${i+1} (SOL)`).setStyle(TextInputStyle.Short).setRequired(true)
  );
  const rows = inputs.map(inp => new ActionRowBuilder<TextInputBuilder>().addComponents(inp));
  modal.addComponents(...rows);
  await interaction.showModal(modal);
}
