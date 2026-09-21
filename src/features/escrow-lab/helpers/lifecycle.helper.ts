import type { LucideIcon } from "lucide-react";
import {
  BadgeCheckIcon,
  CircleDashedIcon,
  FlagIcon,
  ListChecksIcon,
  ScaleIcon,
  ShieldAlertIcon,
  WalletIcon,
} from "lucide-react";
import type { EscrowSummary } from "@/types";
import { parseAmount } from "@/features/escrow-lab/helpers/amount.helper";

export type LifecycleStage =
  | "draft"
  | "funded"
  | "in_progress"
  | "approved"
  | "released"
  | "disputed"
  | "resolved";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getSnapshot(escrow: EscrowSummary): Record<string, unknown> | null {
  return asRecord(escrow.snapshot);
}

export function getEscrowBalance(escrow: EscrowSummary): number {
  return parseAmount(escrow.balance);
}

export function getDispute(escrow: EscrowSummary): {
  isDisputed: boolean;
  resolved: boolean;
  reason: string;
} {
  const snapshot = getSnapshot(escrow);
  if (!snapshot) {
    return { isDisputed: false, resolved: false, reason: "" };
  }

  if (escrow.type === "single-release") {
    const dispute = asRecord(snapshot.dispute);
    return {
      isDisputed: Boolean(dispute?.isDisputed),
      resolved: Boolean(dispute?.resolved),
      reason: typeof dispute?.reason === "string" ? dispute.reason : "",
    };
  }

  const milestones = Array.isArray(snapshot.milestones)
    ? snapshot.milestones
    : [];
  let anyDisputed = false;
  let anyResolvedPath = false;
  let allTerminal = milestones.length > 0;

  for (const milestone of milestones) {
    const row = asRecord(milestone);
    const dispute = asRecord(row?.dispute);
    if (dispute?.isDisputed) anyDisputed = true;
    if (dispute?.resolved) anyResolvedPath = true;
    const terminal = Boolean(row?.released) || Boolean(dispute?.resolved);
    if (!terminal) allTerminal = false;
  }

  return {
    isDisputed: anyDisputed,
    /** Lifecycle “resolved”: every milestone terminal and at least one dispute-resolved. */
    resolved: allTerminal && anyResolvedPath,
    reason: "",
  };
}

/** True if any milestone (or the single escrow) has `dispute.resolved`. */
export function hasAnyDisputeResolved(escrow: EscrowSummary): boolean {
  const snapshot = getSnapshot(escrow);
  if (!snapshot) return false;

  if (escrow.type === "single-release") {
    return Boolean(asRecord(snapshot.dispute)?.resolved);
  }

  const milestones = Array.isArray(snapshot.milestones)
    ? snapshot.milestones
    : [];
  return milestones.some((milestone) =>
    Boolean(asRecord(asRecord(milestone)?.dispute)?.resolved),
  );
}

/** True if the escrow ever opened or resolved a dispute (needed for withdraw). */
export function hasDisputeHistory(escrow: EscrowSummary): boolean {
  const snapshot = getSnapshot(escrow);
  if (!snapshot) return false;

  if (escrow.type === "single-release") {
    const dispute = asRecord(snapshot.dispute);
    return Boolean(dispute?.isDisputed) || Boolean(dispute?.resolved);
  }

  const milestones = Array.isArray(snapshot.milestones)
    ? snapshot.milestones
    : [];
  return milestones.some((milestone) => {
    const dispute = asRecord(asRecord(milestone)?.dispute);
    return Boolean(dispute?.isDisputed) || Boolean(dispute?.resolved);
  });
}

export function isMilestoneReceiver(
  escrow: EscrowSummary,
  walletAddress: string | null,
  milestoneIndex: number,
): boolean {
  if (!walletAddress) return false;
  const milestones = getMilestones(escrow);
  const row = asRecord(milestones[milestoneIndex]);
  return (
    typeof row?.receiver === "string" &&
    row.receiver.trim() === walletAddress.trim()
  );
}

export function isReleased(escrow: EscrowSummary): boolean {
  const snapshot = getSnapshot(escrow);
  if (!snapshot) return false;

  if (escrow.type === "single-release") {
    return Boolean(snapshot.released);
  }

  const milestones = Array.isArray(snapshot.milestones)
    ? snapshot.milestones
    : [];
  return (
    milestones.length > 0 &&
    milestones.every((m) => Boolean(asRecord(m)?.released))
  );
}

export function getMilestones(escrow: EscrowSummary): unknown[] {
  const snapshot = getSnapshot(escrow);
  if (!snapshot || !Array.isArray(snapshot.milestones)) return [];
  return snapshot.milestones;
}

export function isMilestoneApproved(milestone: unknown): boolean {
  const row = asRecord(milestone);
  const approvals = asRecord(row?.approvals);
  if (!approvals) return false;
  const target = Number(approvals.target ?? 0);
  const count = Number(approvals.approvalCount ?? 0);
  return target > 0 && count >= target;
}

export function allMilestonesApproved(escrow: EscrowSummary): boolean {
  const milestones = getMilestones(escrow);
  return (
    milestones.length > 0 && milestones.every((m) => isMilestoneApproved(m))
  );
}

export function getLifecycleStage(escrow: EscrowSummary): LifecycleStage {
  const dispute = getDispute(escrow);
  if (dispute.resolved) return "resolved";
  if (dispute.isDisputed || escrow.status === "disputed") return "disputed";
  if (isReleased(escrow) || escrow.status === "released") return "released";
  if (allMilestonesApproved(escrow)) return "approved";
  if (getEscrowBalance(escrow) > 0) {
    const anyProgress = getMilestones(escrow).some((m) => {
      const status = asRecord(m)?.status;
      return typeof status === "string" && status !== "pending";
    });
    return anyProgress ? "in_progress" : "funded";
  }
  return "draft";
}

export function lifecycleLabel(stage: LifecycleStage): string {
  switch (stage) {
    case "draft":
      return "Draft";
    case "funded":
      return "Funded";
    case "in_progress":
      return "In progress";
    case "approved":
      return "Approved";
    case "released":
      return "Released";
    case "disputed":
      return "Disputed";
    case "resolved":
      return "Resolved";
  }
}

export function lifecycleStageIcon(stage: LifecycleStage): LucideIcon {
  switch (stage) {
    case "draft":
      return CircleDashedIcon;
    case "funded":
      return WalletIcon;
    case "in_progress":
      return ListChecksIcon;
    case "approved":
      return BadgeCheckIcon;
    case "released":
      return FlagIcon;
    case "disputed":
      return ShieldAlertIcon;
    case "resolved":
      return ScaleIcon;
  }
}

export function isActiveLifecycleStage(stage: LifecycleStage): boolean {
  return (
    stage === "draft" ||
    stage === "funded" ||
    stage === "in_progress" ||
    stage === "approved"
  );
}

export function isStructurallyLocked(escrow: EscrowSummary): boolean {
  return getEscrowBalance(escrow) > 0;
}
