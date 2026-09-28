import type { EscrowSummary } from "@/types";

export function parseAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatAmount(
  value: string | number | null | undefined,
  decimals = 2,
): string {
  const amount = parseAmount(value);
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Root escrow total for both flavors. Null until the read-model projects it.
 */
export function getEscrowTotalAmount(
  escrow: Pick<EscrowSummary, "amount">,
): number | null {
  if (escrow.amount == null || escrow.amount.trim() === "") return null;
  return parseAmount(escrow.amount);
}

export function getEscrowAssetSymbol(
  escrow: Pick<EscrowSummary, "asset" | "snapshot">,
): string {
  if (escrow.asset?.name) return escrow.asset.name;
  const snapshot =
    typeof escrow.snapshot === "object" && escrow.snapshot !== null
      ? (escrow.snapshot as { trustline?: { symbol?: string } })
      : null;
  return snapshot?.trustline?.symbol ?? "USDC";
}

export function sumDistributions(
  distributions: Array<{ amount: number }>,
): number {
  return distributions.reduce((sum, item) => sum + item.amount, 0);
}

export function amountsEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) <= epsilon;
}
