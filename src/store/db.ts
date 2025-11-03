import fs from "fs";
import path from "path";

const ROOT = "src/store";
const USERS = path.join(ROOT, "users.csv");
const USERS_TPL = path.join(ROOT, "users_template.csv");
const POS = path.join(ROOT, "positions.csv");
const POS_TPL = path.join(ROOT, "positions_template.csv");
const TRD = path.join(ROOT, "trades.csv");
const TRD_TPL = path.join(ROOT, "trades_template.csv");

function ensureFile(file: string, template: string) {
  if (!fs.existsSync(file)) {
    fs.copyFileSync(template, file);
  }
}
export function ensureStores() {
  if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });
  ensureFile(USERS, USERS_TPL);
  ensureFile(POS, POS_TPL);
  ensureFile(TRD, TRD_TPL);
}

function readCsv(file: string) {
  const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/).filter(l => l.trim().length && !l.startsWith("#"));
  if (lines.length === 0) return { header: [], rows: [] as string[][] };
  const header = lines[0].split(",");
  const rows = lines.slice(1).map(l => l.split(","));
  return { header, rows };
}

function writeCsv(file: string, header: string[], rows: string[][]) {
  const out = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
  fs.writeFileSync(file, out);
}

/** USERS */
export type UserRow = {
  discord_user_id: string;
  sol_balance: number;
  realized_pnl: number;
  active_mint: string;
  buy_presets: number[];   // semicolon separated in csv
  sell_presets: number[];  // semicolon separated in csv
  slippage_bp: number;
  fee_bp: number;
};

export function getUsers(): UserRow[] {
  ensureStores();
  const { header, rows } = readCsv(USERS);
  if (header.length === 0) return [];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  return rows.map(r => ({
    discord_user_id: r[idx.discord_user_id],
    sol_balance: Number(r[idx.sol_balance] ?? 0),
    realized_pnl: Number(r[idx.realized_pnl] ?? 0),
    active_mint: r[idx.active_mint] ?? "",
    buy_presets: (r[idx.buy_presets] ?? "0.05;0.1;0.15;0.2").split(";").map(Number),
    sell_presets: (r[idx.sell_presets] ?? "25;50;75;100").split(";").map(Number),
    slippage_bp: Number(r[idx.slippage_bp] ?? 50),
    fee_bp: Number(r[idx.fee_bp] ?? 30),
  }));
}

export function saveUsers(list: UserRow[]) {
  const header = ["discord_user_id","sol_balance","realized_pnl","active_mint","buy_presets","sell_presets","slippage_bp","fee_bp"];
  const rows = list.map(u => [
    u.discord_user_id,
    String(u.sol_balance),
    String(u.realized_pnl),
    u.active_mint ?? "",
    (u.buy_presets ?? [0.05,0.1,0.15,0.2]).join(";"),
    (u.sell_presets ?? [25,50,75,100]).join(";"),
    String(u.slippage_bp ?? 50),
    String(u.fee_bp ?? 30),
  ]);
  writeCsv(USERS, header, rows);
}

export function upsertUser(u: UserRow) {
  const all = getUsers();
  const i = all.findIndex(x => x.discord_user_id === u.discord_user_id);
  if (i >= 0) all[i] = u; else all.push(u);
  saveUsers(all);
}

export function getOrCreateUser(discordId: string, defaults: Partial<UserRow>): UserRow {
  const all = getUsers();
  const found = all.find(u => u.discord_user_id === discordId);
  if (found) return found;
  const nu: UserRow = {
    discord_user_id: discordId,
    sol_balance: defaults.sol_balance ?? 10,
    realized_pnl: 0,
    active_mint: "",
    buy_presets: defaults.buy_presets ?? [0.05,0.1,0.15,0.2],
    sell_presets: defaults.sell_presets ?? [25,50,75,100],
    slippage_bp: defaults.slippage_bp ?? 50,
    fee_bp: defaults.fee_bp ?? 30,
  };
  upsertUser(nu);
  return nu;
}

/** POSITIONS */
export type PositionRow = {
  discord_user_id: string;
  mint: string;
  token_qty: number;
  avg_entry: number;
  avg_entry_marketcap?: number;
  last_mark_ts: number;
};

export function getPositions(discordId?: string): PositionRow[] {
  ensureStores();
  const { header, rows } = readCsv(POS);
  if (header.length === 0) return [];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const list = rows.map(r => ({
    discord_user_id: r[idx.discord_user_id],
    mint: r[idx.mint],
    token_qty: Number(r[idx.token_qty] ?? 0),
    avg_entry: Number(r[idx.avg_entry] ?? 0),
    avg_entry_marketcap: Number(r[idx.avg_entry_marketcap] ?? 0),
    last_mark_ts: Number(r[idx.last_mark_ts] ?? 0),
  }));
  return discordId ? list.filter(p => p.discord_user_id === discordId) : list;
}

export function savePositions(list: PositionRow[]) {
  const header = ["discord_user_id","mint","token_qty","avg_entry","avg_entry_marketcap","last_mark_ts"];
  const rows = list.map(p => [
    p.discord_user_id,
    p.mint,
    String(p.token_qty),
    String(p.avg_entry),
    String(p.avg_entry_marketcap ?? 0),
    String(p.last_mark_ts)
  ]);
  writeCsv(POS, header, rows);
}

export function upsertPosition(p: PositionRow) {
  const all = getPositions();
  const i = all.findIndex(x => x.discord_user_id === p.discord_user_id && x.mint === p.mint);
  if (i >= 0) all[i] = p; else all.push(p);
  savePositions(all);
}

export function removePosition(discordId: string, mint: string) {
  const all = getPositions();
  savePositions(all.filter(p => !(p.discord_user_id === discordId && p.mint === mint)));
}

/** TRADES */
export type TradeRow = {
  id: string;
  discord_user_id: string;
  mint: string;
  side: "BUY" | "SELL";
  quote_price: number;
  effective_price: number;
  qty_tokens: number;
  amount_sol: number;
  realized_pnl: number;
  marketcap_usd?: number;
  ts: number;
};

export function getTrades(discordId?: string, limit = 50): TradeRow[] {
  ensureStores();
  const { header, rows } = readCsv(TRD);
  if (header.length === 0) return [];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  let list = rows.map(r => ({
    id: r[idx.id],
    discord_user_id: r[idx.discord_user_id],
    mint: r[idx.mint],
    side: (r[idx.side] as "BUY"|"SELL"),
    quote_price: Number(r[idx.quote_price] ?? 0),
    effective_price: Number(r[idx.effective_price] ?? 0),
    qty_tokens: Number(r[idx.qty_tokens] ?? 0),
    amount_sol: Number(r[idx.amount_sol] ?? 0),
    realized_pnl: Number(r[idx.realized_pnl] ?? 0),
    marketcap_usd: Number(r[idx.marketcap_usd] ?? 0),
    ts: Number(r[idx.ts] ?? 0),
  }));
  if (discordId) list = list.filter(t => t.discord_user_id === discordId);
  list.sort((a,b)=>b.ts-a.ts);
  return list.slice(0, limit);
}

export function appendTrade(t: TradeRow) {
  const { header, rows } = readCsv(TRD);
  const hdr = ["id","discord_user_id","mint","side","quote_price","effective_price","qty_tokens","amount_sol","realized_pnl","marketcap_usd","ts"];
  rows.unshift([
    t.id, t.discord_user_id, t.mint, t.side,
    String(t.quote_price), String(t.effective_price),
    String(t.qty_tokens), String(t.amount_sol),
    String(t.realized_pnl), String((t as any).marketcap_usd ?? 0), String(t.ts)
  ]);
  writeCsv(TRD, hdr, rows);
}
