export const round = (v: number, dp = 6) => Math.round(v * 10**dp) / 10**dp;
export const fmt = (v: number, dp = 6) => round(v, dp).toFixed(dp);
export const fmtShort = (v: number, dp = 3) => round(v, dp).toFixed(dp);
