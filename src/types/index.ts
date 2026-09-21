export type {
  EscrowType,
  Roles,
  MultiReleaseRoles,
  EscrowSummary,
  EscrowDetail,
  Escrow,
  SingleReleaseEscrow,
  MultiReleaseEscrow,
  SingleReleaseMilestone,
  MultiReleaseMilestone,
  Dispute,
  MilestoneDispute,
  MilestoneApprovals,
  Trustline,
  DeployTrustline,
  Distribution,
  BuildTransactionResponse,
  DeployEscrowResponse,
  SendTransactionResponse,
  SendTransactionCode,
  ListEscrowsParams,
  ListEscrowsResponse,
  EscrowStatus,
  Role,
  EscrowEvent,
  FundEscrowPayload,
  DeploySingleReleaseEscrowPayload,
  DeployMultiReleaseEscrowPayload,
  ApproveMilestonesPayload,
  ApproveAndReleaseMilestonesPayload,
  ChangeMilestoneStatusPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseStartDisputePayload,
  SingleReleaseResolveDisputePayload,
  MultiReleaseResolveDisputePayload,
  SingleReleaseWithdrawRemainingFundsPayload,
  MultiReleaseWithdrawRemainingFundsPayload,
  UpdateSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  ManageSingleReleaseMilestonesPayload,
  ManageMultiReleaseMilestonesPayload,
} from "@trustless-work/escrow-js";

export type LabTab = "deploy" | "operate";

export type LabWriteAction =
  | "deploy"
  | "fund"
  | "update"
  | "manage-milestones"
  | "change-milestone-status"
  | "approve-milestones"
  | "approve-and-release-milestones"
  | "release-funds"
  | "dispute"
  | "resolve-dispute"
  | "withdraw-remaining-funds"
  | "extend-ttl";

export type GateResult =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string };

export type ConsolePhase = "build" | "sign" | "submit" | "error";

export interface ConsoleEntry {
  readonly id: string;
  readonly createdAt: string;
  readonly action: LabWriteAction | "submit";
  readonly type: "single-release" | "multi-release" | "shared";
  readonly phase: ConsolePhase;
  readonly request?: unknown;
  readonly unsignedXdr?: string;
  readonly signedXdr?: string;
  readonly response?: unknown;
  readonly error?: string;
}

export type HeldRole =
  | "admin"
  | "platform"
  | "approver"
  | "serviceProvider"
  | "releaseSigner"
  | "disputeResolver"
  | "receiver"
  | "observer";
