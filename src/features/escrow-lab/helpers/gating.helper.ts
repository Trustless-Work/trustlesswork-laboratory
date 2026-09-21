import type { EscrowSummary, GateResult, LabWriteAction } from "@/types";
import { hasRole } from "@/features/escrow-lab/helpers/role.helper";
import {
  allMilestonesApproved,
  getDispute,
  getEscrowBalance,
  getMilestones,
  hasAnyDisputeResolved,
  hasDisputeHistory,
  isMilestoneApproved,
  isMilestoneReceiver,
  isReleased,
  isStructurallyLocked,
} from "@/features/escrow-lab/helpers/lifecycle.helper";

function deny(reason: string): GateResult {
  return { allowed: false, reason };
}

function allow(): GateResult {
  return { allowed: true };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function canOpenDispute(
  escrow: EscrowSummary,
  walletAddress: string,
): boolean {
  if (hasRole(escrow, walletAddress, "disputeResolver")) return false;
  return (
    hasRole(escrow, walletAddress, "approver") ||
    hasRole(escrow, walletAddress, "serviceProvider") ||
    hasRole(escrow, walletAddress, "releaseSigner") ||
    hasRole(escrow, walletAddress, "platform") ||
    hasRole(escrow, walletAddress, "receiver")
  );
}

function canDisputeMilestoneAsReceiverOnly(
  escrow: EscrowSummary,
  walletAddress: string,
  indexes: number[],
): boolean {
  const operational =
    hasRole(escrow, walletAddress, "approver") ||
    hasRole(escrow, walletAddress, "serviceProvider") ||
    hasRole(escrow, walletAddress, "releaseSigner") ||
    hasRole(escrow, walletAddress, "platform");
  if (operational) return true;
  if (!hasRole(escrow, walletAddress, "receiver")) return false;
  return indexes.every((index) =>
    isMilestoneReceiver(escrow, walletAddress, index),
  );
}

export function gateAction(
  escrow: EscrowSummary | null,
  walletAddress: string | null,
  action: LabWriteAction,
  options?: { milestoneIndexes?: number[] },
): GateResult {
  if (action === "deploy") {
    if (!walletAddress) return deny("Connect a wallet to deploy");
    return allow();
  }

  if (!escrow) return deny("Load an escrow first");
  if (!walletAddress) return deny("Connect a wallet");

  const dispute = getDispute(escrow);
  const milestones = getMilestones(escrow);
  const indexes = options?.milestoneIndexes ?? [];

  switch (action) {
    case "fund":
      return allow();

    case "update":
      if (!hasRole(escrow, walletAddress, "admin")) {
        return deny("You are not the admin");
      }
      if (dispute.isDisputed) return deny("Blocked: escrow is disputed");
      if (isStructurallyLocked(escrow)) {
        return deny("Blocked: escrow already funded");
      }
      return allow();

    case "manage-milestones":
      if (!hasRole(escrow, walletAddress, "admin")) {
        return deny("You are not the admin");
      }
      if (dispute.isDisputed) return deny("Blocked: escrow is disputed");
      if (hasAnyDisputeResolved(escrow)) {
        return deny("Blocked: dispute already resolved");
      }
      if (isReleased(escrow)) return deny("Blocked: escrow already released");
      return allow();

    case "extend-ttl":
      if (!hasRole(escrow, walletAddress, "admin")) {
        return deny("You are not the admin");
      }
      return allow();

    case "change-milestone-status":
      if (!hasRole(escrow, walletAddress, "serviceProvider")) {
        return deny("You are not a service provider");
      }
      if (milestones.length === 0) return deny("Escrow has no milestones");
      return allow();

    case "approve-milestones": {
      if (!hasRole(escrow, walletAddress, "approver")) {
        return deny("You are not an approver");
      }
      if (milestones.length === 0) return deny("Escrow has no milestones");
      if (escrow.type === "single-release") {
        if (dispute.isDisputed) return deny("Blocked: escrow is disputed");
        if (isReleased(escrow)) return deny("Blocked: escrow already released");
        if (dispute.resolved) {
          return deny("Blocked: dispute already resolved");
        }
      }
      for (const index of indexes) {
        const milestone = milestones[index];
        if (!milestone) return deny(`Milestone ${index} does not exist`);
        if (isMilestoneApproved(milestone)) {
          return deny(`Milestone ${index} already reached its approval target`);
        }
        if (escrow.type === "multi-release") {
          const row = asRecord(milestone);
          const d = asRecord(row?.dispute);
          if (row?.released) {
            return deny(`Milestone ${index} is already released`);
          }
          if (d?.isDisputed) {
            return deny(`Milestone ${index} is disputed`);
          }
          if (d?.resolved) {
            return deny(`Milestone ${index} dispute already resolved`);
          }
        }
      }
      return allow();
    }

    case "approve-and-release-milestones": {
      if (
        !hasRole(escrow, walletAddress, "approver") ||
        !hasRole(escrow, walletAddress, "releaseSigner")
      ) {
        return deny("You must be both an approver and a release signer");
      }
      const approveGate = gateAction(
        escrow,
        walletAddress,
        "approve-milestones",
        options,
      );
      if (!approveGate.allowed) return approveGate;

      if (escrow.type === "single-release") {
        if (isReleased(escrow)) return deny("Escrow already released");
        if (dispute.isDisputed) return deny("Blocked: escrow is disputed");
        if (dispute.resolved) {
          return deny("Blocked: dispute already resolved");
        }
        if (getEscrowBalance(escrow) <= 0) {
          return deny("Insufficient escrow balance");
        }
        const pending = milestones.filter((m) => !isMilestoneApproved(m));
        if (pending.length === 0) {
          return deny("All milestones are already approved");
        }
        if (indexes.length > 0) {
          const pendingIndexes = new Set(
            milestones
              .map((m, index) => (isMilestoneApproved(m) ? -1 : index))
              .filter((index) => index >= 0),
          );
          for (const index of pendingIndexes) {
            if (!indexes.includes(index)) {
              return deny(
                "Approve-and-release must cover every pending milestone",
              );
            }
          }
        }
        return allow();
      }

      if (indexes.length === 0) {
        return deny("Select at least one milestone");
      }
      for (const index of indexes) {
        const milestone = milestones[index];
        if (!milestone) return deny(`Milestone ${index} does not exist`);
        const row = asRecord(milestone);
        const d = asRecord(row?.dispute);
        if (row?.released) {
          return deny(`Milestone ${index} is already released`);
        }
        if (d?.isDisputed) {
          return deny(`Milestone ${index} is disputed`);
        }
        if (d?.resolved) {
          return deny(`Milestone ${index} dispute already resolved`);
        }
      }
      return allow();
    }

    case "release-funds": {
      if (!hasRole(escrow, walletAddress, "releaseSigner")) {
        return deny("You are not a release signer");
      }
      if (escrow.type === "single-release") {
        if (isReleased(escrow)) return deny("Escrow already released");
        if (dispute.isDisputed) return deny("Blocked: escrow is disputed");
        if (dispute.resolved) return deny("Blocked: dispute already resolved");
        if (milestones.length === 0) return deny("Escrow has no milestones");
        if (!allMilestonesApproved(escrow)) {
          const approved = milestones.filter((m) =>
            isMilestoneApproved(m),
          ).length;
          return deny(
            `${approved} of ${milestones.length} milestones approved`,
          );
        }
        if (getEscrowBalance(escrow) <= 0) {
          return deny("Insufficient escrow balance");
        }
        return allow();
      }

      if (indexes.length === 0) {
        return deny("Select at least one milestone to release");
      }
      for (const index of indexes) {
        const milestone = milestones[index];
        if (!milestone) return deny(`Milestone ${index} does not exist`);
        const row = asRecord(milestone);
        const d = asRecord(row?.dispute);
        if (!isMilestoneApproved(milestone)) {
          return deny(`Milestone ${index} is not approved`);
        }
        if (row?.released) {
          return deny(`Milestone ${index} is already released`);
        }
        if (d?.isDisputed) {
          return deny(`Milestone ${index} is disputed`);
        }
        if (d?.resolved) {
          return deny(`Milestone ${index} dispute already resolved`);
        }
      }
      return allow();
    }

    case "dispute": {
      if (!canOpenDispute(escrow, walletAddress)) {
        if (hasRole(escrow, walletAddress, "disputeResolver")) {
          return deny("Dispute resolvers cannot open disputes");
        }
        return deny("You do not have authority to open a dispute");
      }
      if (escrow.type === "single-release") {
        if (dispute.isDisputed) return deny("Escrow is already disputed");
        if (dispute.resolved) return deny("Dispute already resolved");
        return allow();
      }
      if (indexes.length === 0) {
        return deny("Select at least one milestone to dispute");
      }
      if (!canDisputeMilestoneAsReceiverOnly(escrow, walletAddress, indexes)) {
        return deny("You can only dispute milestones where you are the receiver");
      }
      for (const index of indexes) {
        const milestone = milestones[index];
        if (!milestone) return deny(`Milestone ${index} does not exist`);
        const row = asRecord(milestone);
        const d = asRecord(row?.dispute);
        if (row?.released) return deny(`Milestone ${index} is already released`);
        if (d?.isDisputed) return deny(`Milestone ${index} is already disputed`);
        if (d?.resolved) {
          return deny(`Milestone ${index} dispute already resolved`);
        }
      }
      return allow();
    }

    case "resolve-dispute": {
      if (!hasRole(escrow, walletAddress, "disputeResolver")) {
        return deny("You are not a dispute resolver");
      }
      if (escrow.type === "single-release") {
        if (!dispute.isDisputed) return deny("Escrow is not disputed");
        return allow();
      }
      if (indexes.length === 0) {
        return deny("Select disputed milestones to resolve");
      }
      for (const index of indexes) {
        const milestone = milestones[index];
        if (!milestone) return deny(`Milestone ${index} does not exist`);
        const d = asRecord(asRecord(milestone)?.dispute);
        if (!d?.isDisputed) return deny(`Milestone ${index} is not disputed`);
        if (d.resolved) {
          return deny(`Milestone ${index} dispute already resolved`);
        }
      }
      return allow();
    }

    case "withdraw-remaining-funds": {
      if (!hasRole(escrow, walletAddress, "disputeResolver")) {
        return deny("You are not a dispute resolver");
      }
      if (getEscrowBalance(escrow) <= 0) {
        return deny("No remaining balance to withdraw");
      }
      if (!hasDisputeHistory(escrow)) {
        return deny("Withdraw requires a prior dispute");
      }
      if (escrow.type === "single-release") {
        if (!(isReleased(escrow) || dispute.resolved)) {
          return deny("Escrow must be released or dispute-resolved");
        }
        return allow();
      }
      const allTerminal =
        milestones.length > 0 &&
        milestones.every((m) => {
          const row = asRecord(m);
          const d = asRecord(row?.dispute);
          return Boolean(row?.released) || Boolean(d?.resolved);
        });
      if (!allTerminal) {
        return deny("All milestones must be released or dispute-resolved");
      }
      return allow();
    }

    default:
      return deny("Unknown action");
  }
}
