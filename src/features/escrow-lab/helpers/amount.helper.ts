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

/** Contract total: single-release `amount`, or the sum of multi-release milestone amounts. */
export function getEscrowTotalAmount(
  escrow: Pick<EscrowSummary, "type" | "totalAmount" | "snapshot">,
): number {
  if (escrow.type === "single-release") {
    const snapshot = escrow.snapshot;
    if (snapshot && "amount" in snapshot) {
      return parseAmount(snapshot.amount);
    }
    return 0;
  }

  if (escrow.totalAmount) {
    return parseAmount(escrow.totalAmount);
  }

  const milestones =
    escrow.snapshot && "milestones" in escrow.snapshot
      ? escrow.snapshot.milestones
      : [];

  return milestones.reduce((sum, milestone) => {
    if (!("amount" in milestone)) return sum;
    const amount = milestone.amount;
    if (typeof amount !== "string" && typeof amount !== "number") return sum;
    return sum + parseAmount(amount);
  }, 0);
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
