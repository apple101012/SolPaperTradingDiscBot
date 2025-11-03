import { getTokenSnapshot } from "../market/index.ts";
import { applyBp, vwap, realizedOnSell } from "./math.ts";
import { getOrCreateUser, upsertUser, getPositions, upsertPosition, removePosition, appendTrade } from "../../store/db.ts";
import type { TradeRow, PositionRow } from "../../store/db.ts";
import { CONFIG } from "../../config/env.ts";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function buyWithSol(discordId: string, mint: string, solAmount: number) {
  const user = getOrCreateUser(discordId, { sol_balance: CONFIG.DEFAULT_SOL_BALANCE });
  if (solAmount <= 0) throw new Error("Invalid SOL amount");
  if (user.sol_balance < solAmount) throw new Error("Insufficient SOL balance");

  const snap = await getTokenSnapshot(mint);
  if (!snap.priceUsd || snap.priceUsd <= 0) throw new Error("No valid price");

  // Assume 1 SOL = $ price fetched via SOL/USD? For simplicity, treat trading in token vs USD normalized:
  // We'll simulate "SOL to TOKEN" using USD as intermediate with fixed SOLUSD=price 1? -> Simpler:
  // Interpret solAmount as a notional sizing factor: we convert SOL -> USD via a fixed SOLUSD= priceOfSo1111 if needed.
  // To keep MVP consistent, treat SOL as USD for quantity math (paper). You can refine later with true SOL/USD.
  const usdPerSol = 1; // MVP simplification.
  const notionalUsd = solAmount * usdPerSol;

  const slippage = user.slippage_bp ?? 50;
  const fee = user.fee_bp ?? 30;
  const priceWithSlip = applyBp(snap.priceUsd, slippage, "BUY");
  const priceEff = applyBp(priceWithSlip, fee, "BUY");

  const qtyTokens = notionalUsd / priceEff;

  // Update user & position
  user.sol_balance = user.sol_balance - solAmount;
  upsertUser(user);

  const posList = getPositions(discordId);
  const existing = posList.find(p => p.mint === mint);
  if (existing) {
    const newAvg = vwap(existing.token_qty, existing.avg_entry, qtyTokens, priceEff);
    const newAvgMC = vwap(existing.token_qty, existing.avg_entry_marketcap ?? 0, qtyTokens, snap.marketCapUsd ?? 0);
    const upd: PositionRow = { ...existing, token_qty: existing.token_qty + qtyTokens, avg_entry: newAvg, avg_entry_marketcap: newAvgMC, last_mark_ts: Date.now() };
    upsertPosition(upd);
  } else {
    const np: PositionRow = { discord_user_id: discordId, mint, token_qty: qtyTokens, avg_entry: priceEff, avg_entry_marketcap: snap.marketCapUsd ?? 0, last_mark_ts: Date.now() };
    upsertPosition(np);
  }

  const trade: TradeRow = {
    id: uid(),
    discord_user_id: discordId,
    mint,
    side: "BUY",
    quote_price: snap.priceUsd,
    effective_price: priceEff,
    qty_tokens: qtyTokens,
    amount_sol: solAmount,
    realized_pnl: 0,
    marketcap_usd: snap.marketCapUsd ?? 0,
    ts: Date.now(),
  };
  appendTrade(trade);

  return { snap, priceEff, qtyTokens, marketcapUsd: snap.marketCapUsd ?? 0 };
}

export async function sellByPercent(discordId: string, mint: string, percent: number) {
  if (percent <= 0 || percent > 100) throw new Error("Invalid percent");
  const user = getOrCreateUser(discordId, { sol_balance: CONFIG.DEFAULT_SOL_BALANCE });
  const pos = getPositions(discordId).find(p => p.mint === mint);
  if (!pos || pos.token_qty <= 0) throw new Error("No position to sell");

  const sellQty = pos.token_qty * (percent / 100);
  const snap = await getTokenSnapshot(mint);
  const slippage = user.slippage_bp ?? 50;
  const fee = user.fee_bp ?? 30;

  const priceWithSlip = applyBp(snap.priceUsd, slippage, "SELL");
  const priceEff = applyBp(priceWithSlip, fee, "SELL");

  const pnl = realizedOnSell(sellQty, pos.avg_entry, priceEff);

  // Convert tokens to "SOL" in MVP with the same simplification
  const usdPerSol = 1;
  const solReceived = (sellQty * priceEff) / usdPerSol;

  // Update position
  const remaining = pos.token_qty - sellQty;
  if (remaining <= 1e-12) {
    removePosition(discordId, mint);
  } else {
    upsertPosition({ ...pos, token_qty: remaining, last_mark_ts: Date.now() });
  }

  // Update user balances
  user.sol_balance += solReceived;
  user.realized_pnl += pnl;
  upsertUser(user);

  const trade = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    discord_user_id: discordId,
    mint,
    side: "SELL" as const,
    quote_price: snap.priceUsd,
    effective_price: priceEff,
    qty_tokens: sellQty,
    amount_sol: solReceived,
    realized_pnl: pnl,
    marketcap_usd: snap.marketCapUsd ?? 0,
    ts: Date.now(),
  };
  appendTrade(trade);

  // Percent change relative to position average marketcap (if available)
  const avgMc = pos.avg_entry_marketcap ?? 0;
  const sellMc = snap.marketCapUsd ?? 0;
  const pct = avgMc > 0 ? ((sellMc - avgMc) / avgMc) * 100 : 0;
  const pnlUsd = pnl; // pnl is in USD under MVP simplification
  const pnlSol = pnlUsd / usdPerSol;

  return { snap, priceEff, sellQty, solReceived, pnl, sellMarketcap: sellMc, percentChange: pct, realized_pnl_usd: pnlUsd, realized_pnl_sol: pnlSol };
}
