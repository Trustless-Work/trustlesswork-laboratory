import "server-only";

import type {
  EscrowRestService,
  EscrowType,
  BuildTransactionResponse,
  DeployEscrowResponse,
} from "@trustless-work/escrow-js";
import type { ZodType } from "zod";
import type { LabWriteAction } from "@/types";
import {
  approveAndReleaseSchema,
  approveMilestonesSchema,
  changeMilestoneStatusSchema,
  deployMultiSchema,
  deploySingleSchema,
  disputeMultiSchema,
  disputeSingleSchema,
  extendTtlSchema,
  fundSchema,
  manageMilestonesMultiSchema,
  manageMilestonesSingleSchema,
  releaseMultiSchema,
  releaseSingleSchema,
  resolveDisputeMultiSchema,
  resolveDisputeSingleSchema,
  updateMultiSchema,
  updateSingleSchema,
  withdrawSchema,
} from "@/features/escrow-lab/schemas/operate.schema";
import {
  approveAndReleaseMilestonesDirect,
  extendTtlDirect,
} from "@/lib/trustless-work/rest-direct";

type WriteResult = BuildTransactionResponse | DeployEscrowResponse;

type WriteExecutor = (
  rest: EscrowRestService,
  payload: unknown,
  type: EscrowType,
) => Promise<WriteResult>;

interface WriteEntry {
  schema: ZodType;
  exec: WriteExecutor;
}

function getSchemaForType(
  single: ZodType,
  multi: ZodType,
  type: EscrowType,
): ZodType {
  return type === "single-release" ? single : multi;
}

export const WRITE_ACTIONS = [
  "deploy",
  "fund",
  "update",
  "manage-milestones",
  "change-milestone-status",
  "approve-milestones",
  "approve-and-release-milestones",
  "release-funds",
  "dispute",
  "resolve-dispute",
  "withdraw-remaining-funds",
  "extend-ttl",
] as const satisfies readonly LabWriteAction[];

export function isWriteAction(value: string): value is LabWriteAction {
  return (WRITE_ACTIONS as readonly string[]).includes(value);
}

export function getWriteSchema(
  action: LabWriteAction,
  type: EscrowType,
): ZodType {
  switch (action) {
    case "deploy":
      return getSchemaForType(deploySingleSchema, deployMultiSchema, type);
    case "fund":
      return fundSchema;
    case "update":
      return getSchemaForType(updateSingleSchema, updateMultiSchema, type);
    case "manage-milestones":
      return getSchemaForType(
        manageMilestonesSingleSchema,
        manageMilestonesMultiSchema,
        type,
      );
    case "change-milestone-status":
      return changeMilestoneStatusSchema;
    case "approve-milestones":
      return approveMilestonesSchema;
    case "approve-and-release-milestones":
      return approveAndReleaseSchema;
    case "release-funds":
      return getSchemaForType(releaseSingleSchema, releaseMultiSchema, type);
    case "dispute":
      return getSchemaForType(disputeSingleSchema, disputeMultiSchema, type);
    case "resolve-dispute":
      return getSchemaForType(
        resolveDisputeSingleSchema,
        resolveDisputeMultiSchema,
        type,
      );
    case "withdraw-remaining-funds":
      return withdrawSchema;
    case "extend-ttl":
      return extendTtlSchema;
  }
}

export async function executeWrite(
  rest: EscrowRestService,
  action: LabWriteAction,
  type: EscrowType,
  payload: unknown,
  apiKeyOverride?: string | null,
): Promise<WriteResult> {
  switch (action) {
    case "deploy":
      return rest.deployEscrow(
        payload as Parameters<EscrowRestService["deployEscrow"]>[0],
        type,
      );
    case "fund":
      return rest.fundEscrow(
        payload as Parameters<EscrowRestService["fundEscrow"]>[0],
        type,
      );
    case "update":
      return rest.updateEscrow(
        payload as Parameters<EscrowRestService["updateEscrow"]>[0],
        type,
      );
    case "manage-milestones":
      return rest.manageMilestones(
        payload as Parameters<EscrowRestService["manageMilestones"]>[0],
        type,
      );
    case "change-milestone-status":
      return rest.changeMilestoneStatus(
        payload as Parameters<EscrowRestService["changeMilestoneStatus"]>[0],
        type,
      );
    case "approve-milestones":
      return rest.approveMilestones(
        payload as Parameters<EscrowRestService["approveMilestones"]>[0],
        type,
      );
    case "approve-and-release-milestones":
      if (type === "single-release") {
        return approveAndReleaseMilestonesDirect(
          payload as {
            contractId: string;
            signer: string;
            milestoneIndexes: number[];
          },
          type,
          apiKeyOverride,
        );
      }
      return rest.approveAndReleaseMilestones(
        payload as Parameters<
          EscrowRestService["approveAndReleaseMilestones"]
        >[0],
      );
    case "release-funds":
      if (type === "multi-release") {
        return rest.releaseMilestones(
          payload as Parameters<EscrowRestService["releaseMilestones"]>[0],
        );
      }
      return rest.releaseFunds(
        payload as Parameters<EscrowRestService["releaseFunds"]>[0],
        type,
      );
    case "dispute":
      if (type === "multi-release") {
        return rest.disputeMilestones(
          payload as Parameters<EscrowRestService["disputeMilestones"]>[0],
        );
      }
      return rest.startDispute(
        payload as Parameters<EscrowRestService["startDispute"]>[0],
        type,
      );
    case "resolve-dispute":
      return rest.resolveDispute(
        payload as Parameters<EscrowRestService["resolveDispute"]>[0],
        type,
      );
    case "withdraw-remaining-funds":
      return rest.withdrawRemainingFunds(
        payload as Parameters<EscrowRestService["withdrawRemainingFunds"]>[0],
        type,
      );
    case "extend-ttl":
      return extendTtlDirect(
        payload as {
          contractId: string;
          admin: string;
          ledgersToExtend: number;
        },
        type,
        apiKeyOverride,
      );
  }
}

export type { WriteEntry, WriteResult };
