// Modal: slippage (placeholder)

export {};
import { ModalSubmitInteraction } from "discord.js";
import { getOrCreateUser, upsertUser } from "../../store/db.ts";

export async function handleSlippageModal(interaction: ModalSubmitInteraction) {
  const s = Number(interaction.fields.getTextInputValue("SLIPPAGE_BP"));
  const f = Number(interaction.fields.getTextInputValue("FEE_BP"));
  if (!Number.isInteger(s) || s < 0 || s > 5000 || !Number.isInteger(f) || f < 0 || f > 5000) {
    await interaction.reply({ content: "Enter integer basis points (0..5000).", ephemeral: true });
    return;
  }
  const u = getOrCreateUser(interaction.user.id, {});
  u.slippage_bp = s;
  u.fee_bp = f;
  upsertUser(u);
  await interaction.reply({ content: "✅ Slippage/Fee updated.", ephemeral: true });
}
