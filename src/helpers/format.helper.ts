export function isUsdcSymbol(symbol: string): boolean {
  return symbol.trim().toUpperCase() === "USDC";
}

export function isUsdtSymbol(symbol: string): boolean {
  return symbol.trim().toUpperCase() === "USDT";
}

export function formatAssetAmount(
  amount: number,
  decimals = 2,
): string {
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
