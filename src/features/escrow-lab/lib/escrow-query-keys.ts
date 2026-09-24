import type { ListEscrowsParams } from "@/types";

export const BATCH_CONTRACT_IDS_MAX = 50;

export function escrowListQueryKey(
  apiKeyFp: string,
  params: ListEscrowsParams,
) {
  return ["escrows", "list", apiKeyFp, params] as const;
}

export function escrowDetailQueryKey(
  apiKeyFp: string,
  contractId: string | null,
) {
  return ["escrow", apiKeyFp, contractId] as const;
}

export function escrowEventsQueryKey(
  apiKeyFp: string,
  contractId: string | null,
  params?: { cursor?: string; limit?: number; order?: "asc" | "desc" },
) {
  return ["escrow", apiKeyFp, contractId, "events", params ?? {}] as const;
}

export function escrowMilestonesQueryKey(
  apiKeyFp: string,
  contractId: string | null,
) {
  return ["escrow", apiKeyFp, contractId, "milestones"] as const;
}

export function escrowDetailsBatchQueryKey(
  apiKeyFp: string,
  contractIds: readonly string[],
) {
  return ["escrows", "details", apiKeyFp, contractIds] as const;
}

export function escrowFinancialBatchQueryKey(
  apiKeyFp: string,
  contractIds: readonly string[],
) {
  return ["escrows", "financial", apiKeyFp, contractIds] as const;
}

export function escrowMilestonesBatchQueryKey(
  apiKeyFp: string,
  contractIds: readonly string[],
) {
  return ["escrows", "batch-milestones", apiKeyFp, contractIds] as const;
}

export function clipBatchContractIds(
  contractIds: readonly string[],
): string[] {
  return contractIds.slice(0, BATCH_CONTRACT_IDS_MAX);
}
