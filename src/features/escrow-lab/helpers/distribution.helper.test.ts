import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import {
  getWithdrawAllocationStatus,
  parseDistributionLines,
  validateResolveDistributions,
  validateWithdrawDistributions,
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

describe("getWithdrawAllocationStatus", () => {
  it("reports over, under, incomplete, and exact assignment", () => {
    expect(
      getWithdrawAllocationStatus({
        allocated: 60,
        balance: 50,
        assetSymbol: "USDC",
        incomplete: false,
        over: true,
      }),
    ).toMatch(/over the remaining balance/);
    expect(
      getWithdrawAllocationStatus({
        allocated: 20,
        balance: 50,
        assetSymbol: "USDC",
        incomplete: true,
        over: false,
      }),
    ).toMatch(/still unassigned/);
    expect(
      getWithdrawAllocationStatus({
        allocated: 50,
        balance: 50,
        assetSymbol: "USDC",
        incomplete: true,
        over: false,
      }),
    ).toMatch(/wallet/i);
    expect(
      getWithdrawAllocationStatus({
        allocated: 50,
        balance: 50,
        assetSymbol: "USDC",
        incomplete: false,
        over: false,
      }),
    ).toBe("50 USDC assigned");
  });
});

describe("validateWithdrawDistributions", () => {
  it("requires a full sweep of the remaining balance", () => {
    const escrow = {
      type: "single-release",
      balance: "50",
      snapshot: {},
    } as EscrowSummary;

    expect(
      validateWithdrawDistributions(escrow, [{ address: "G1", amount: 25 }]),
    ).toMatch(/remaining balance/i);
    expect(
      validateWithdrawDistributions(escrow, [{ address: "G1", amount: 60 }]),
    ).toMatch(/Assigned 60/);
    expect(
      validateWithdrawDistributions(escrow, [{ address: "", amount: 50 }]),
    ).toMatch(/wallet/i);
    expect(
      validateWithdrawDistributions(escrow, [{ address: "G1", amount: 50 }]),
    ).toBeNull();
  });
});
