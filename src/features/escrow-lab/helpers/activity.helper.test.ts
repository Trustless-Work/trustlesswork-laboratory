import { describe, expect, it } from "vitest";
import type { EscrowDeposit } from "@/types";
import {
  formatEscrowEventKind,
  getDepositAssetSymbol,
  getEventAmountLabel,
} from "./activity.helper";

describe("formatEscrowEventKind", () => {
  it("maps known contract events", () => {
    expect(formatEscrowEventKind("tw_release")).toBe("Released");
    expect(formatEscrowEventKind("tw_fund")).toBe("Funded");
  });

  it("title-cases unknown kinds", () => {
    expect(formatEscrowEventKind("tw_custom_event")).toBe("Custom event");
  });
});

describe("getEventAmountLabel", () => {
  it("reads the human amount and ignores stroop fields", () => {
    expect(
      getEventAmountLabel({ amount: "250", netAmount: "2442500000" }),
    ).toBe("250");
  });
});

describe("getDepositAssetSymbol", () => {
  it("prefers assetInfo.name from the read model", () => {
    const deposit = {
      fromAddress: "G1",
      amount: "300",
      asset: "",
      assetInfo: { name: "USDC" },
    } as EscrowDeposit & { assetInfo: { name: string } };

    expect(getDepositAssetSymbol(deposit, "XLM")).toBe("USDC");
  });
});
