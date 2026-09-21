import { normalizeEscrowType } from "@/features/escrow-lab/constants/icons";
import {
  allMilestonesApproved,
  getDispute,
  getEscrowBalance,
  getMilestones,
  hasAnyDisputeResolved,
  isMilestoneApproved,
  isReleased,
  isStructurallyLocked,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
import type { EscrowSummary, EscrowType, LabWriteAction } from "@/types";

export type LifecycleFlowNodeId =
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
  | "withdraw-remaining-funds";

export type LifecycleFlowNodeStatus =
  | "done"
  | "current"
  | "upcoming"
  | "closed"
  | "disputed";

export type LifecycleFlowEdgeKind = "happy" | "branch";

export interface LifecycleFlowNodeDef {
  readonly id: LifecycleFlowNodeId;
  readonly title: string;
  readonly roleLabel: string;
  readonly description: string;
  readonly action: LabWriteAction | null;
  readonly position: { readonly x: number; readonly y: number };
}

export interface LifecycleFlowEdgeDef {
  readonly id: string;
  readonly source: LifecycleFlowNodeId;
  readonly target: LifecycleFlowNodeId;
  readonly kind: LifecycleFlowEdgeKind;
  readonly sourceHandle?: "s-right" | "s-bottom" | "s-top";
  readonly targetHandle?: "t-left" | "t-top" | "t-bottom";
}

export interface LifecycleFlowNodeView {
  readonly id: LifecycleFlowNodeId;
  readonly def: LifecycleFlowNodeDef;
  readonly status: LifecycleFlowNodeStatus;
  readonly detail?: string;
}

export interface LifecycleFlowModel {
  readonly type: EscrowType;
  readonly caption: string;
  readonly nodes: readonly LifecycleFlowNodeView[];
  readonly edges: readonly LifecycleFlowEdgeDef[];
  readonly currentNodeId: LifecycleFlowNodeId | null;
}

/** Card is 220px wide. Columns/rows stay larger so edges travel in empty gutters. */
const COL = 420;
const ROW = 340;

function node(
  id: LifecycleFlowNodeId,
  title: string,
  roleLabel: string,
  description: string,
  action: LabWriteAction | null,
  col: number,
  row: number,
): LifecycleFlowNodeDef {
  return {
    id,
    title,
    roleLabel,
    description,
    action,
    position: { x: col * COL, y: row * ROW },
  };
}

function edge(
  source: LifecycleFlowNodeId,
  target: LifecycleFlowNodeId,
  kind: LifecycleFlowEdgeKind,
  handles?: {
    sourceHandle?: LifecycleFlowEdgeDef["sourceHandle"];
    targetHandle?: LifecycleFlowEdgeDef["targetHandle"];
  },
): LifecycleFlowEdgeDef {
  return {
    id: `${source}->${target}`,
    source,
    target,
    kind,
    sourceHandle: handles?.sourceHandle,
    targetHandle: handles?.targetHandle,
  };
}

/**
 * Topology mirrors V2 validations. Positions keep every edge in a gutter:
 *
 *   [Fund]
 *     |
 *   [Deploy] → [Approve] → [Release]
 *      |                       |
 *   [Update]                [A&R]  [Change] [Manage] [Dispute]
 *                                                    |
 *                                                 [Resolve] → [Withdraw]
 *
 * Column under Approve stays empty so the rail from Deploy never crosses a card.
 */
function buildGraph(type: EscrowType): {
  nodes: LifecycleFlowNodeDef[];
  edges: LifecycleFlowEdgeDef[];
} {
  const isMulti = type === "multi-release";

  return {
    nodes: [
      node(
        "deploy",
        "Deploy",
        "Signer",
        isMulti
          ? "Creates the multi-release escrow on-chain."
          : "Creates the escrow on-chain.",
        null,
        0,
        0,
      ),
      node(
        "approve-milestones",
        "Approve",
        "Approvers",
        "Does not require funds. Votes until each milestone hits its target.",
        "approve-milestones",
        1,
        0,
      ),
      node(
        "release-funds",
        isMulti ? "Release milestones" : "Release",
        "Release signers",
        isMulti
          ? "Needs those milestones approved and enough balance."
          : "Needs every milestone approved, no open dispute, and enough balance.",
        "release-funds",
        2,
        0,
      ),
      node(
        "fund",
        "Fund",
        "Any depositor",
        "Independent. Any wallet, anytime. Release needs the balance in practice.",
        "fund",
        2,
        -1.15,
      ),
      node(
        "update",
        "Update properties",
        "Admin",
        "Blocked once funded or while disputed.",
        "update",
        0,
        1.15,
      ),
      node(
        "approve-and-release-milestones",
        "Approve & release",
        "Approver + release signer",
        isMulti
          ? "One tx: release indexes that hit target."
          : "One tx: release only if this completes every milestone.",
        "approve-and-release-milestones",
        2,
        1.15,
      ),
      node(
        "change-milestone-status",
        "Change status",
        "Service providers",
        "Independent. Not required for approve or release.",
        "change-milestone-status",
        3.2,
        1.15,
      ),
      node(
        "manage-milestones",
        "Manage milestones",
        "Admin",
        isMulti
          ? "Edits need zero balance. Appends stay allowed after fund."
          : "Blocked if disputed, released, or resolved. Edits need zero balance.",
        "manage-milestones",
        4.4,
        1.15,
      ),
      node(
        "dispute",
        isMulti ? "Dispute milestones" : "Dispute",
        "Approvers + Service Providers + Release Signers + Platform + Receiver",
        isMulti
          ? "Per milestone. Admin and Dispute Resolvers cannot open. Blocked if that milestone is already released."
          : "One dispute for the whole escrow. Admin and Dispute Resolvers cannot open. Blocks release and admin edits.",
        "dispute",
        5.6,
        1.15,
      ),
      node(
        "resolve-dispute",
        isMulti ? "Resolve milestones" : "Resolve",
        "Dispute resolvers",
        isMulti
          ? "Needs an open dispute. Does not mark the milestone released."
          : "Needs an open dispute. Distributions must equal the balance.",
        "resolve-dispute",
        5.6,
        2.3,
      ),
      node(
        "withdraw-remaining-funds",
        "Withdraw",
        "Dispute resolvers",
        isMulti
          ? "After every milestone is released or resolved."
          : "After release or a resolved dispute. Sweeps leftovers.",
        "withdraw-remaining-funds",
        6.8,
        2.3,
      ),
    ],
    edges: [
      edge("deploy", "approve-milestones", "happy", {
        sourceHandle: "s-right",
        targetHandle: "t-left",
      }),
      edge("approve-milestones", "release-funds", "happy", {
        sourceHandle: "s-right",
        targetHandle: "t-left",
      }),
      edge("deploy", "fund", "branch", {
        sourceHandle: "s-top",
        targetHandle: "t-left",
      }),
      edge("fund", "release-funds", "branch", {
        sourceHandle: "s-bottom",
        targetHandle: "t-top",
      }),
      edge("deploy", "update", "branch", {
        sourceHandle: "s-bottom",
        targetHandle: "t-top",
      }),
      edge("deploy", "change-milestone-status", "branch", {
        sourceHandle: "s-bottom",
        targetHandle: "t-top",
      }),
      edge("deploy", "manage-milestones", "branch", {
        sourceHandle: "s-bottom",
        targetHandle: "t-top",
      }),
      edge("approve-milestones", "approve-and-release-milestones", "branch", {
        sourceHandle: "s-bottom",
        targetHandle: "t-left",
      }),
      edge("approve-and-release-milestones", "release-funds", "branch", {
        sourceHandle: "s-top",
        targetHandle: "t-bottom",
      }),
      edge("deploy", "dispute", "branch", {
        sourceHandle: "s-bottom",
        targetHandle: "t-top",
      }),
      edge("dispute", "resolve-dispute", "happy", {
        sourceHandle: "s-bottom",
        targetHandle: "t-top",
      }),
      edge("resolve-dispute", "withdraw-remaining-funds", "happy", {
        sourceHandle: "s-right",
        targetHandle: "t-left",
      }),
    ],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function countMultiProgress(escrow: EscrowSummary): {
  total: number;
  approved: number;
  released: number;
  disputedOpen: number;
} {
  const milestones = getMilestones(escrow);
  let approved = 0;
  let released = 0;
  let disputedOpen = 0;
  for (const milestone of milestones) {
    const row = asRecord(milestone);
    const dispute = asRecord(row?.dispute);
    if (Boolean(row?.released)) released += 1;
    if (isMilestoneApproved(milestone)) approved += 1;
    if (dispute?.isDisputed && !dispute?.resolved) disputedOpen += 1;
  }
  return {
    total: milestones.length,
    approved,
    released,
    disputedOpen,
  };
}

function hasAnyMilestoneProgress(escrow: EscrowSummary): boolean {
  return getMilestones(escrow).some((milestone) => {
    const status = asRecord(milestone)?.status;
    return typeof status === "string" && status !== "pending";
  });
}

function multiAllTerminal(escrow: EscrowSummary): boolean {
  const milestones = getMilestones(escrow);
  if (milestones.length === 0) return false;
  return milestones.every((milestone) => {
    const row = asRecord(milestone);
    const dispute = asRecord(row?.dispute);
    return Boolean(row?.released) || Boolean(dispute?.resolved);
  });
}

/**
 * Suggested focus — priority follows real blockers, not a fake stepper order.
 * Change-status is never "current" (optional). Fund is suggested when empty
 * balance would block a later release, but approve stays available without it.
 */
function pickCurrentNode(escrow: EscrowSummary): LifecycleFlowNodeId | null {
  const dispute = getDispute(escrow);
  const balance = getEscrowBalance(escrow);
  const milestones = getMilestones(escrow);
  const released = isReleased(escrow);
  const type = normalizeEscrowType(escrow.type);

  if (dispute.isDisputed && !dispute.resolved) {
    return "resolve-dispute";
  }

  if (type === "multi-release") {
    const multi = countMultiProgress(escrow);
    if (multi.disputedOpen > 0) return "resolve-dispute";
  }

  if (dispute.resolved && balance > 0) {
    return "withdraw-remaining-funds";
  }

  if (type === "multi-release" && multiAllTerminal(escrow) && balance > 0) {
    return "withdraw-remaining-funds";
  }

  if (released && balance > 0 && dispute.resolved) {
    return "withdraw-remaining-funds";
  }

  if (milestones.length === 0) {
    return "manage-milestones";
  }

  // Suggest funding first when empty — still optional for approve/change-status.
  if (balance <= 0 && !released && !dispute.resolved) {
    return "fund";
  }

  if (!allMilestonesApproved(escrow)) {
    return "approve-milestones";
  }

  if (type === "multi-release") {
    const { total, released: releasedCount } = countMultiProgress(escrow);
    if (releasedCount < total) return "release-funds";
    return balance > 0 ? "withdraw-remaining-funds" : null;
  }

  if (!released && !dispute.resolved) {
    return "release-funds";
  }

  if ((released || dispute.resolved) && balance > 0) {
    return "withdraw-remaining-funds";
  }

  return null;
}

function statusForNode(
  id: LifecycleFlowNodeId,
  escrow: EscrowSummary,
  current: LifecycleFlowNodeId | null,
): LifecycleFlowNodeStatus {
  if (id === current) {
    if (id === "dispute" || id === "resolve-dispute") {
      const dispute = getDispute(escrow);
      if (dispute.isDisputed && !dispute.resolved) {
        return id === "dispute" ? "disputed" : "current";
      }
    }
    return "current";
  }

  const dispute = getDispute(escrow);
  const locked = isStructurallyLocked(escrow);
  const released = isReleased(escrow);
  const balance = getEscrowBalance(escrow);
  const milestones = getMilestones(escrow);
  const type = normalizeEscrowType(escrow.type);
  const multi = type === "multi-release" ? countMultiProgress(escrow) : null;

  switch (id) {
    case "deploy":
      return "done";
    case "fund":
      // Repeatable; treat any positive balance as "done enough" for the chart.
      if (balance > 0 || locked || released || dispute.resolved) return "done";
      return "upcoming";
    case "update":
      if (locked || released || dispute.resolved || dispute.isDisputed) {
        return "closed";
      }
      return "upcoming";
    case "manage-milestones":
      if (released || hasAnyDisputeResolved(escrow)) return "closed";
      if (dispute.isDisputed && type === "single-release") return "closed";
      if (multi && multi.disputedOpen > 0) return "closed";
      if (milestones.length > 0) return "done";
      return "upcoming";
    case "change-milestone-status":
      // Independent of fund / approve / dispute (contract). Soft-close when fully terminal.
      if (released || dispute.resolved) return "done";
      if (milestones.length === 0) return "upcoming";
      if (hasAnyMilestoneProgress(escrow)) return "done";
      return "upcoming";
    case "approve-milestones":
      if (released || dispute.resolved) return "done";
      if (dispute.isDisputed && type === "single-release") return "closed";
      if (multi && multi.approved >= multi.total && multi.total > 0) {
        return "done";
      }
      if (allMilestonesApproved(escrow)) return "done";
      if (milestones.length === 0) return "upcoming";
      return "upcoming";
    case "approve-and-release-milestones":
      if (released || dispute.resolved) return "closed";
      if (dispute.isDisputed && type === "single-release") return "closed";
      if (milestones.length === 0) return "upcoming";
      return "upcoming";
    case "release-funds":
      if (released) return "done";
      if (dispute.resolved) return "closed";
      if (dispute.isDisputed && type === "single-release") return "closed";
      if (multi && multi.released > 0 && multi.released < multi.total) {
        return "done";
      }
      if (multi && multi.released >= multi.total && multi.total > 0) {
        return "done";
      }
      return "upcoming";
    case "dispute":
      if (dispute.resolved) return "done";
      if (dispute.isDisputed) return "disputed";
      if (released) return "closed";
      return "upcoming";
    case "resolve-dispute":
      if (dispute.resolved) return "done";
      if (dispute.isDisputed) return "upcoming";
      if (released) return "closed";
      return "upcoming";
    case "withdraw-remaining-funds": {
      const terminal =
        released ||
        dispute.resolved ||
        (type === "multi-release" && multiAllTerminal(escrow));
      if (terminal && balance <= 0) return "done";
      if (terminal) return "upcoming";
      // Not on the happy path until a terminal / dispute outcome exists.
      return "closed";
    }
    default:
      return "upcoming";
  }
}

function detailForNode(
  id: LifecycleFlowNodeId,
  escrow: EscrowSummary,
): string | undefined {
  const type = normalizeEscrowType(escrow.type);
  if (type !== "multi-release") return undefined;

  const multi = countMultiProgress(escrow);
  if (multi.total === 0) return undefined;

  if (id === "release-funds") {
    return `${multi.released}/${multi.total} released`;
  }
  if (id === "approve-milestones") {
    return `${multi.approved}/${multi.total} approved`;
  }
  if (id === "dispute" && multi.disputedOpen > 0) {
    return `${multi.disputedOpen} open`;
  }
  return undefined;
}

export function buildLifecycleFlow(escrow: EscrowSummary): LifecycleFlowModel {
  const type = normalizeEscrowType(escrow.type);
  const graph = buildGraph(type);
  const currentNodeId = pickCurrentNode(escrow);

  const nodes: LifecycleFlowNodeView[] = graph.nodes.map((def) => ({
    id: def.id,
    def,
    status: statusForNode(def.id, escrow, currentNodeId),
    detail: detailForNode(def.id, escrow),
  }));

  return {
    type,
    caption:
      type === "single-release"
        ? "Hard path: Deploy → Approve → Release. Fund and Change status are independent. Withdraw sits on the dispute lane."
        : "Hard path: Deploy → Approve → Release (per milestone). Fund and Change status are independent. Withdraw needs every milestone terminal.",
    nodes,
    edges: graph.edges,
    currentNodeId,
  };
}

export function lifecycleFlowNodeStatusLabel(
  status: LifecycleFlowNodeStatus,
): string {
  switch (status) {
    case "done":
      return "Done";
    case "current":
      return "Current";
    case "upcoming":
      return "Upcoming";
    case "closed":
      return "Closed";
    case "disputed":
      return "Disputed";
  }
}
