import "server-only";

import type {
  EscrowRestService,
  ListEscrowsParams,
} from "@trustless-work/escrow-js";

export type ReadOperation =
  | "list"
  | "get"
  | "details"
  | "events"
  | "milestones"
  | "batch-milestones"
  | "financial";

export function isReadOperation(value: string): value is ReadOperation {
  return (
    value === "list" ||
    value === "get" ||
    value === "details" ||
    value === "events" ||
    value === "milestones" ||
    value === "batch-milestones" ||
    value === "financial"
  );
}

export async function executeRead(
  rest: EscrowRestService,
  operation: ReadOperation,
  params: {
    contractId?: string;
    contractIds?: string[];
    listParams?: ListEscrowsParams;
    eventParams?: { cursor?: string; limit?: number; order?: "asc" | "desc" };
  },
): Promise<unknown> {
  switch (operation) {
    case "list":
      return rest.listEscrows(params.listParams);
    case "get":
      if (!params.contractId) throw new Error("contractId is required");
      return rest.getEscrow(params.contractId);
    case "details":
      if (!params.contractIds?.length) {
        throw new Error("contractIds are required");
      }
      return rest.getEscrowDetails(params.contractIds);
    case "events":
      if (!params.contractId) throw new Error("contractId is required");
      return rest.listEscrowEvents(params.contractId, params.eventParams);
    case "milestones":
      if (!params.contractId) throw new Error("contractId is required");
      return rest.getEscrowMilestones(params.contractId);
    case "batch-milestones":
      if (!params.contractIds?.length) {
        throw new Error("contractIds are required");
      }
      return rest.getEscrowsMilestones(params.contractIds);
    case "financial":
      if (!params.contractIds?.length) {
        throw new Error("contractIds are required");
      }
      return rest.getEscrowsFinancial(params.contractIds);
  }
}
