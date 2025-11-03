// Simple base58-ish + length check for Solana mints
export function isLikelyMint(s: string): boolean {
  if (!s) return false;
  const ok = /^[1-9A-HJ-NP-Za-km-z]+$/.test(s);
  return ok && s.length >= 32 && s.length <= 48;
}
