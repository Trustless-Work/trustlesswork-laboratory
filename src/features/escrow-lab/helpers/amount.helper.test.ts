import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import {
  amountsEqual,
  formatAmount,
  getEscrowAssetSymbol,
  getEscrowTotalAmount,
  parseAmount,
  sumDistributions,
} from "./amount.helper";

describe("parseAmount", () => {
  it("parses decimal strings", () => {
    expect(parseAmount("1000.50")).toBe(1000.5);
  });

  it("returns numbers unchanged", () => {
    expect(parseAmount(42)).toBe(42);
  });

  it("returns 0 for empty values", () => {
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount("")).toBe(0);
  });
});

describe("formatAmount", () => {
  it("formats numbers for display", () => {
    expect(formatAmount("1000")).toContain("1");
  });
});

describe("getEscrowAssetSymbol", () => {
  it("prefers resolved asset name", () => {
    expect(
      getEscrowAssetSymbol({
        asset: { name: "USDT", address: null, contractId: null },
        snapshot: {
          trustline: { address: "C…", symbol: "USDC" },
        },
      } as Pick<EscrowSummary, "asset" | "snapshot">),
    ).toBe("USDT");
  });

  it("falls back to snapshot trustline symbol", () => {
    expect(
      getEscrowAssetSymbol({
        asset: null,
        snapshot: {
          trustline: { address: "C…", symbol: "USDC" },
        },
      } as Pick<EscrowSummary, "asset" | "snapshot">),
    ).toBe("USDC");
  });

  it("defaults to USDC when symbol is missing", () => {
    expect(
      getEscrowAssetSymbol({
        asset: null,
        snapshot: {
          trustline: { address: "C…" },
        },
      } as Pick<EscrowSummary, "asset" | "snapshot">),
    ).toBe("USDC");
  });

  it("defaults to USDC when snapshot is null", () => {
    expect(
      getEscrowAssetSymbol({
        asset: null,
        snapshot: null,
      } as unknown as Pick<EscrowSummary, "asset" | "snapshot">),
    ).toBe("USDC");
  });
});

describe("getEscrowTotalAmount", () => {
  it("reads the single-release escrow amount", () => {
    expect(
      getEscrowTotalAmount({
        type: "single-release",
        totalAmount: null,
        snapshot: { amount: "250" },
      } as Pick<EscrowSummary, "type" | "totalAmount" | "snapshot">),
    ).toBe(250);
  });

  it("prefers the projected multi-release total", () => {
    expect(
      getEscrowTotalAmount({
        type: "multi-release",
        totalAmount: "650",
        snapshot: { milestones: [{ amount: "100" }] },
      } as Pick<EscrowSummary, "type" | "totalAmount" | "snapshot">),
    ).toBe(650);
  });

  it("sums milestone amounts when the projected total is missing", () => {
    expect(
      getEscrowTotalAmount({
        type: "multi-release",
        totalAmount: null,
        snapshot: { milestones: [{ amount: "100" }, { amount: "150.5" }] },
      } as Pick<EscrowSummary, "type" | "totalAmount" | "snapshot">),
    ).toBe(250.5);
  });
});

describe("sumDistributions", () => {
  it("sums distribution amounts", () => {
    expect(
      sumDistributions([
        { amount: 100 },
        { amount: 250.5 },
      ]),
    ).toBe(350.5);
  });
});

describe("amountsEqual", () => {
  it("compares within epsilon", () => {
    expect(amountsEqual(1, 1.0000001)).toBe(true);
    expect(amountsEqual(1, 1.01)).toBe(false);
  });
});
