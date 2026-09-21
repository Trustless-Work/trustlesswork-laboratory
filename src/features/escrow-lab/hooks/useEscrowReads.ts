"use client";

import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { labApiService } from "@/features/escrow-lab/services/lab-api.service";
import type { EscrowType, ListEscrowsParams } from "@/types";

export const DEFAULT_KEYSET_LIMIT = 20;

export function useEscrowList(params: ListEscrowsParams) {
  return useInfiniteQuery({
    queryKey: ["escrows", "list", params],
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
  return useQuery({
    queryKey: ["escrow", contractId],
    queryFn: () => labApiService.getEscrow(contractId!),
    enabled: Boolean(contractId),
    staleTime: 0,
  });
}

export function useEscrowEvents(contractId: string | null) {
  return useQuery({
    queryKey: ["escrow", contractId, "events"],
    queryFn: () => labApiService.getEvents(contractId!),
    enabled: Boolean(contractId),
  });
}

export function useEscrowMilestones(contractId: string | null) {
  return useQuery({
    queryKey: ["escrow", contractId, "milestones"],
    queryFn: () => labApiService.getMilestones(contractId!),
    enabled: Boolean(contractId),
  });
}

export function useEscrowFiltersDefaults(type: EscrowType): ListEscrowsParams {
  return {
    scope: "all",
    contractType: type,
    limit: DEFAULT_KEYSET_LIMIT,
    sort: "createdAt",
    order: "desc",
  };
}
