"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InfoEndpointId } from "@/features/escrow-lab/constants/info-endpoints";
import { humanizeEscrowError } from "@/features/escrow-lab/helpers/error-message.helper";
import { clipBatchContractIds } from "@/features/escrow-lab/lib/escrow-query-keys";
import {
  LabApiError,
  labApiService,
} from "@/features/escrow-lab/services/lab-api.service";
import type { ListEscrowEventsParams, ListEscrowsParams } from "@/types";

export interface InfoEndpointRunInput {
  endpoint: InfoEndpointId;
  contractId?: string;
  contractIds?: string[];
  listParams?: ListEscrowsParams;
  eventParams?: ListEscrowEventsParams;
}

export interface InfoEndpointRunResult {
  request: Record<string, unknown>;
  response: unknown;
  labPath: string;
  corePath: string;
}

function buildRequestPreview(input: InfoEndpointRunInput): Record<string, unknown> {
  switch (input.endpoint) {
    case "list":
      return { query: input.listParams ?? {} };
    case "get":
      return { path: { contractId: input.contractId } };
    case "details":
    case "batch-milestones":
    case "financial":
      return { query: { contractIds: input.contractIds ?? [] } };
    case "events":
      return {
        path: { contractId: input.contractId },
        query: input.eventParams ?? {},
      };
    case "milestones":
      return { path: { contractId: input.contractId } };
  }
}

async function executeEndpoint(input: InfoEndpointRunInput): Promise<unknown> {
  const contractId = input.contractId?.trim() ?? "";
  const contractIds = clipBatchContractIds(input.contractIds ?? []);

  switch (input.endpoint) {
    case "list":
      return labApiService.listEscrows(input.listParams ?? {});
    case "get":
      if (!contractId) throw new Error("contractId is required");
      return labApiService.getEscrow(contractId);
    case "details":
      if (!contractIds.length) throw new Error("contractIds are required");
      return labApiService.getDetails(contractIds);
    case "events":
      if (!contractId) throw new Error("contractId is required");
      return labApiService.getEvents(contractId, input.eventParams);
    case "milestones":
      if (!contractId) throw new Error("contractId is required");
      return labApiService.getMilestones(contractId);
    case "batch-milestones":
      if (!contractIds.length) throw new Error("contractIds are required");
      return labApiService.getBatchMilestones(contractIds);
    case "financial":
      if (!contractIds.length) throw new Error("contractIds are required");
      return labApiService.getFinancial(contractIds);
  }
}

export function useInfoEndpointRun() {
  return useMutation({
    mutationFn: async (
      input: InfoEndpointRunInput,
    ): Promise<InfoEndpointRunResult> => {
      const response = await executeEndpoint(input);
      return {
        request: buildRequestPreview(input),
        response,
        labPath: `/api/tw/read/${input.endpoint}`,
        corePath: input.endpoint,
      };
    },
    onError: (error) => {
      const raw =
        error instanceof LabApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Request failed";
      const code = error instanceof LabApiError ? error.code : undefined;
      toast.error(humanizeEscrowError(code, raw));
    },
  });
}
