import {
  amountsEqual,
  formatAmount,
  parseAmount,
  sumDistributions,
} from "@/features/escrow-lab/helpers/amount.helper";
import { getMilestones } from "@/features/escrow-lab/helpers/lifecycle.helper";
import type { EscrowSummary } from "@/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function parseDistributionLines(raw: string): Array<{
  address: string;
  amount: number;
}> {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [address, amount] = line.split(",");
      return {
        address: (address ?? "").trim(),
        amount: Number(amount),
      };
    });
}

export function validateResolveDistributions(
  escrow: EscrowSummary,
  distributions: Array<{ address: string; amount: number }>,
  milestoneIndexes: number[] = [],
): string | null {
  if (distributions.length === 0) return "Add at least one distribution";
  if (distributions.some((row) => !row.address || !(row.amount > 0))) {
    return "Each line must be address,amount with a positive amount";
  }

  const total = sumDistributions(distributions);

  if (escrow.type === "single-release") {
    const balance = parseAmount(escrow.balance);
    if (!amountsEqual(total, balance)) {
      return `Distributions must equal escrow balance (${balance})`;
    }
    return null;
  }

  const milestones = getMilestones(escrow);
  let cap = 0;
  for (const index of milestoneIndexes) {
    const row = asRecord(milestones[index]);
    cap += parseAmount(row?.amount as string | number | undefined);
  }
  if (total > cap + 1e-6) {
    return `Distributions must be ≤ selected milestone amounts (${cap})`;
  }
  return null;
}

export function getWithdrawAllocationStatus(input: {
  allocated: number;
  balance: number;
  assetSymbol: string;
  incomplete: boolean;
  over: boolean;
}): string {
  const { allocated, balance, assetSymbol, incomplete, over } = input;
  if (over) {
    return `${formatAmount(allocated - balance)} ${assetSymbol} over the remaining balance`;
  }
  if (!amountsEqual(allocated, balance)) {
    return `${formatAmount(balance - allocated)} ${assetSymbol} still unassigned`;
  }
  if (incomplete) {
    return "Each row needs a wallet and a positive amount";
  }
  return `${formatAmount(allocated)} ${assetSymbol} assigned`;
}

/** Withdraw is a full sweep: wallet rows must add up to the remaining balance. */
export function validateWithdrawDistributions(
  escrow: EscrowSummary,
  distributions: Array<{ address: string; amount: number }>,
): string | null {
  if (distributions.length === 0) return "Add at least one wallet";
  if (
    distributions.some((row) => !row.address.trim() || !(row.amount > 0))
  ) {
    return "Each row needs a wallet and a positive amount";
  }

  const balance = parseAmount(escrow.balance);
  const total = sumDistributions(distributions);
  if (!amountsEqual(total, balance)) {
    return `Amounts must equal the remaining balance (${formatAmount(balance)}). Assigned ${formatAmount(total)}.`;
  }
  return null;
}
