export type TokenSnapshot = {
  mint: string;
  name: string;
  symbol: string;
  priceUsd: number;
  fdvUsd?: number;
  marketCapUsd?: number;
  liquidityUsd?: number;
  ts: number;
  source: "DEXSCREENER";
};
