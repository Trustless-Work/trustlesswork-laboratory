"use client";

import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useLabApiKey } from "@/features/escrow-lab/hooks/useLabApiKey";
import {
  clipBatchContractIds,
  escrowDetailQueryKey,
  escrowDetailsBatchQueryKey,
  escrowEventsQueryKey,
  escrowFinancialBatchQueryKey,
  escrowListQueryKey,
  escrowMilestonesBatchQueryKey,
  escrowMilestonesQueryKey,
} from "@/features/escrow-lab/lib/escrow-query-keys";
import { getLabApiKeyFingerprint } from "@/features/escrow-lab/lib/lab-api-key";
import { labApiService } from "@/features/escrow-lab/services/lab-api.service";
import type { EscrowType, ListEscrowsParams } from "@/types";

export const DEFAULT_KEYSET_LIMIT = 20;
export const DEFAULT_EVENTS_LIMIT = 50;

function useApiKeyFingerprint(): string {
  const { apiKey } = useLabApiKey();
  return getLabApiKeyFingerprint(apiKey);
}

export function useEscrowList(params: ListEscrowsParams) {
  const apiKeyFp = useApiKeyFingerprint();
  return useInfiniteQuery({
    queryKey: escrowListQueryKey(apiKeyFp, params),
    queryFn: ({ pageParam }) =>
      labApiService.listEscrows({
        ...params,
        cursor: pageParam,
        limit: params.limit ?? DEFAULT_KEYSET_LIMIT,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useEscrowDetail(contractId: string | null) {
  const apiKeyFp = useApiKeyFingerprint();
  return useQuery({
    queryKey: escrowDetailQueryKey(apiKeyFp, contractId),
    queryFn: () => labApiService.getEscrow(contractId!),
    enabled: Boolean(contractId),
    staleTime: 0,
  });
}

export function useEscrowEvents(
  contractId: string | null,
  params?: { cursor?: string; limit?: number; order?: "asc" | "desc" },
) {
  const apiKeyFp = useApiKeyFingerprint();
  const limit = params?.limit ?? DEFAULT_EVENTS_LIMIT;
  return useQuery({
    queryKey: escrowEventsQueryKey(apiKeyFp, contractId, {
      ...params,
      limit,
    }),
    queryFn: () =>
      labApiService.getEvents(contractId!, {
        cursor: params?.cursor,
        limit,
        order: params?.order,
      }),
    enabled: Boolean(contractId),
  });
}

export function useEscrowMilestones(contractId: string | null) {
  const apiKeyFp = useApiKeyFingerprint();
  return useQuery({
    queryKey: escrowMilestonesQueryKey(apiKeyFp, contractId),
    queryFn: () => labApiService.getMilestones(contractId!),
    enabled: Boolean(contractId),
  });
}

export function useEscrowDetailsBatch(contractIds: readonly string[]) {
  const apiKeyFp = useApiKeyFingerprint();
  const ids = clipBatchContractIds(contractIds);
  return useQuery({
    queryKey: escrowDetailsBatchQueryKey(apiKeyFp, ids),
    queryFn: () => labApiService.getDetails(ids),
    enabled: ids.length > 0,
  });
}

export function useEscrowFinancialBatch(contractIds: readonly string[]) {
  const apiKeyFp = useApiKeyFingerprint();
  const ids = clipBatchContractIds(contractIds);
  return useQuery({
    queryKey: escrowFinancialBatchQueryKey(apiKeyFp, ids),
    queryFn: () => labApiService.getFinancial(ids),
    enabled: ids.length > 0,
  });
}

export function useEscrowMilestonesBatch(contractIds: readonly string[]) {
  const apiKeyFp = useApiKeyFingerprint();
  const ids = clipBatchContractIds(contractIds);
  return useQuery({
    queryKey: escrowMilestonesBatchQueryKey(apiKeyFp, ids),
    queryFn: () => labApiService.getBatchMilestones(ids),
    enabled: ids.length > 0,
  });
}

export function useEscrowFiltersDefaults(type: EscrowType): ListEscrowsParams {
  return {
    scope: "mine",
    contractType: type,
    limit: DEFAULT_KEYSET_LIMIT,
    sort: "createdAt",
    order: "desc",
  };
}
