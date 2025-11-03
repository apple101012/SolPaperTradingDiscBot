export function applyBp(price: number, bp: number, side: "BUY"|"SELL") {
  const factor = bp / 10000; // 100bp = 1%
  return side === "BUY" ? price * (1 + factor) : price * (1 - factor);
}

export function vwap(oldQty: number, oldAvg: number, addQty: number, addPrice: number) {
  const totCost = oldQty * oldAvg + addQty * addPrice;
  const newQty = oldQty + addQty;
  return newQty <= 0 ? 0 : totCost / newQty;
}

export function realizedOnSell(sellQty: number, avgEntry: number, execPrice: number) {
  return (execPrice - avgEntry) * sellQty;
}
