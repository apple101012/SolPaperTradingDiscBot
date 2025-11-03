import type { TokenSnapshot } from "../../types/market.ts";
import { getCache, setCache } from "./cache.ts";

export async function getTokenSnapshot(mint: string): Promise<TokenSnapshot> {
  const key = `dexscreener:${mint}`;
  const hit = getCache<TokenSnapshot>(key);
  if (hit) return hit;

  const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`;
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`DexScreener error: ${res.status}`);
  const json: any = await res.json();

  if (!json.pairs?.length) throw new Error("No market pairs found for mint");
  // Prefer a Solana pair with priceUsd
  const pair = json.pairs.find((p: any) => p.chainId === "solana" && p.priceUsd) ?? json.pairs[0];

  const snap: TokenSnapshot = {
    mint,
    name: pair.baseToken?.name ?? "Unknown",
    symbol: pair.baseToken?.symbol ?? "TKN",
    priceUsd: Number(pair.priceUsd ?? 0),
    fdvUsd: pair.fdv ? Number(pair.fdv) : undefined,
    marketCapUsd: pair.marketCap ? Number(pair.marketCap) : undefined,
    liquidityUsd: pair.liquidity?.usd ? Number(pair.liquidity.usd) : undefined,
    ts: Date.now(),
    source: "DEXSCREENER",
  };

  setCache(key, snap);
  return snap;
}
