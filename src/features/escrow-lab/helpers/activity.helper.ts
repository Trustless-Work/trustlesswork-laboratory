import type { EscrowDeposit } from "@/types";

const EVENT_LABELS: Record<string, string> = {
  tw_init: "Initialized",
  tw_fund: "Funded",
  tw_ms_approve: "Milestones approved",
  tw_release: "Released",
  tw_dispute: "Dispute opened",
  tw_resolve: "Dispute resolved",
  tw_withdraw: "Remaining withdrawn",
  tw_update: "Updated",
};

export function formatEscrowEventKind(kind: string): string {
  const known = EVENT_LABELS[kind];
  if (known) return known;

  const raw = kind.replace(/^tw_/, "").replaceAll("_", " ").trim();
  if (!raw) return "Event";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function getEventAmountLabel(payload: Record<string, unknown>): string | null {
  const amount = payload.amount;
  if (typeof amount === "string" && amount.trim()) return amount.trim();
  if (typeof amount === "number" && Number.isFinite(amount)) return String(amount);
  return null;
}

export function getDepositAssetSymbol(
  deposit: EscrowDeposit,
  fallback: string,
): string {
  if (typeof deposit.asset === "string" && deposit.asset.trim()) {
    const [symbol] = deposit.asset.split(":");
    return symbol?.trim() || fallback;
  }

  const withAssetInfo = deposit as EscrowDeposit & {
    assetInfo?: { name?: string | null };
  };
  const name = withAssetInfo.assetInfo?.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return fallback;
}
