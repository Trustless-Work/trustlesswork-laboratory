import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import {
  parseDistributionLines,
  validateResolveDistributions,
} from "./distribution.helper";

describe("parseDistributionLines", () => {
  it("parses address,amount rows", () => {
    expect(parseDistributionLines("GABC,10\nGDEF,5")).toEqual([
      { address: "GABC", amount: 10 },
      { address: "GDEF", amount: 5 },
    ]);
  });
});

describe("validateResolveDistributions", () => {
  it("requires exact equality for single-release", () => {
    const escrow = {
      type: "single-release",
      balance: "100",
      snapshot: {},
    } as EscrowSummary;
    expect(
      validateResolveDistributions(escrow, [{ address: "G1", amount: 90 }]),
    ).toMatch(/equal/i);
    expect(
      validateResolveDistributions(escrow, [{ address: "G1", amount: 100 }]),
    ).toBeNull();
  });

  it("allows sum ≤ selected milestone amounts for multi-release", () => {
    const escrow = {
      type: "multi-release",
      balance: "100",
      snapshot: {
        milestones: [{ amount: "40" }, { amount: "60" }],
      },
    } as EscrowSummary;
    expect(
      validateResolveDistributions(
        escrow,
        [{ address: "G1", amount: 50 }],
        [0],
      ),
    ).toMatch(/≤/i);
    expect(
      validateResolveDistributions(
        escrow,
        [{ address: "G1", amount: 40 }],
        [0],
      ),
    ).toBeNull();
  });
});
