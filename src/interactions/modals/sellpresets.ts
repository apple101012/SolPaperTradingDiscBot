import { ModalSubmitInteraction } from "discord.js";
import { getOrCreateUser, upsertUser } from "../../store/db.ts";

export async function handleSellPresetsModal(interaction: ModalSubmitInteraction) {
  const v = [1,2,3,4].map(i => Number(interaction.fields.getTextInputValue(`SELL_${i}`)));
  if (v.some(x => !Number.isInteger(x) || x < 1 || x > 100)) { await interaction.reply({ content: "Percents must be 1..100.", ephemeral: true }); return; }
  const u = getOrCreateUser(interaction.user.id, {});
  u.sell_presets = v;
  upsertUser(u);
  await interaction.reply({ content: "✅ Sell presets updated.", ephemeral: true });
}
