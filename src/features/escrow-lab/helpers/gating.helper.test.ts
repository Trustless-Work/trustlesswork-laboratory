import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import { gateAction } from "./gating.helper";

const RESOLVER = "GDISPUTERESOLVER00000000000000000000000000000000000000";

function escrow(
  overrides: Partial<EscrowSummary> & { type: EscrowSummary["type"] },
): EscrowSummary {
  return {
    contractId: "C…",
    engagementId: "ENG-1",
    title: "Test",
    balance: "50",
    status: "released",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: null,
    snapshot: {
      roles: { disputeResolvers: [RESOLVER] },
      milestones: [
        {
          description: "A",
          status: "pending",
          approvals: { target: 1, approvalCount: 1, approvedBy: ["G1"] },
        },
      ],
      dispute: { isDisputed: false, resolved: false, reason: "" },
      released: true,
    },
    ...overrides,
  } as EscrowSummary;
}

describe("withdraw remaining funds", () => {
  it("allows a released single-release escrow with leftover balance and no dispute", () => {
    expect(
      gateAction(
        escrow({ type: "single-release" }),
        RESOLVER,
        "withdraw-remaining-funds",
      ),
    ).toEqual({ allowed: true });
  });

  it("allows a fully released multi-release escrow without a dispute", () => {
    expect(
      gateAction(
        escrow({
          type: "multi-release",
          snapshot: {
            roles: { disputeResolvers: [RESOLVER] },
            milestones: [
              { released: true, dispute: { resolved: false } },
              { released: true, dispute: { resolved: false } },
            ],
          } as EscrowSummary["snapshot"],
        }),
        RESOLVER,
        "withdraw-remaining-funds",
      ),
    ).toEqual({ allowed: true });
  });

  it("blocks withdraw before the escrow is terminal", () => {
    const result = gateAction(
      escrow({
        type: "single-release",
        status: "active",
        snapshot: {
          roles: { disputeResolvers: [RESOLVER] },
          milestones: [{ description: "A" }],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        } as EscrowSummary["snapshot"],
      }),
      RESOLVER,
      "withdraw-remaining-funds",
    );

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toMatch(/released or dispute-resolved/i);
    }
  });
});
