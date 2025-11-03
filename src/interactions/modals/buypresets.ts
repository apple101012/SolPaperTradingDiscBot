import { ModalSubmitInteraction } from "discord.js";
import { getOrCreateUser, upsertUser } from "../../store/db.ts";

export async function handleBuyPresetsModal(interaction: ModalSubmitInteraction) {
  const v = [1,2,3,4].map(i => Number(interaction.fields.getTextInputValue(`BUY_${i}`)));
  if (v.some(x => !isFinite(x) || x <= 0)) { await interaction.reply({ content: "Invalid values.", ephemeral: true }); return; }
  const u = getOrCreateUser(interaction.user.id, {});
  u.buy_presets = v;
  upsertUser(u);
  await interaction.reply({ content: "✅ Buy presets updated.", ephemeral: true });
}
