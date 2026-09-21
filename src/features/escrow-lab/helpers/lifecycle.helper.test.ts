import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import {
  getDispute,
  getLifecycleStage,
  getMilestones,
  hasAnyDisputeResolved,
  hasDisputeHistory,
  isStructurallyLocked,
  lifecycleStageIcon,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
import type { LifecycleStage } from "@/features/escrow-lab/helpers/lifecycle.helper";

function stubEscrow(
  overrides: Partial<EscrowSummary> & { type: EscrowSummary["type"] },
): EscrowSummary {
  return {
    contractId: "C…",
    engagementId: "ENG-1",
    title: "Test",
    balance: "0",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: null,
    snapshot: null as unknown as EscrowSummary["snapshot"],
    ...overrides,
  } as EscrowSummary;
}

describe("lifecycle helpers with null snapshot", () => {
  it("getDispute returns empty dispute state", () => {
    expect(getDispute(stubEscrow({ type: "multi-release" }))).toEqual({
      isDisputed: false,
      resolved: false,
      reason: "",
    });
  });

  it("getMilestones returns an empty list", () => {
    expect(getMilestones(stubEscrow({ type: "single-release" }))).toEqual([]);
  });

  it("getLifecycleStage falls back to draft", () => {
    expect(getLifecycleStage(stubEscrow({ type: "multi-release" }))).toBe(
      "draft",
    );
  });
});

describe("isStructurallyLocked", () => {
  it("locks only when balance is positive", () => {
    expect(
      isStructurallyLocked(
        stubEscrow({ type: "single-release", balance: "0", status: "released" }),
      ),
    ).toBe(false);
    expect(
      isStructurallyLocked(
        stubEscrow({ type: "single-release", balance: "10", status: "active" }),
      ),
    ).toBe(true);
  });
});

describe("multi-release dispute helpers", () => {
  const escrow = stubEscrow({
    type: "multi-release",
    snapshot: {
      title: "t",
      description: "d",
      engagementId: "e",
      trustline: { address: "C…" },
      platformFee: "1",
      roles: {
        approvers: ["G1"],
        serviceProviders: ["G2"],
        platform: "G3",
        releaseSigners: ["G4"],
        disputeResolvers: ["G5"],
        admin: "G6",
      },
      milestones: [
        {
          description: "a",
          amount: "10",
          receiver: "G1",
          dispute: { isDisputed: false, resolved: true, reason: "" },
        },
        {
          description: "b",
          amount: "10",
          receiver: "G2",
          dispute: { isDisputed: false, resolved: false, reason: "" },
        },
      ],
    } as EscrowSummary["snapshot"],
  });

  it("detects any milestone dispute resolved", () => {
    expect(hasAnyDisputeResolved(escrow)).toBe(true);
    expect(getDispute(escrow).resolved).toBe(false);
  });

  it("detects dispute history", () => {
    expect(hasDisputeHistory(escrow)).toBe(true);
  });
});

describe("lifecycleStageIcon", () => {
  it("returns an icon for every stage", () => {
    const stages: LifecycleStage[] = [
      "draft",
      "funded",
      "in_progress",
      "approved",
      "released",
      "disputed",
      "resolved",
    ];
    for (const stage of stages) {
      expect(lifecycleStageIcon(stage)).toBeDefined();
    }
  });
});
