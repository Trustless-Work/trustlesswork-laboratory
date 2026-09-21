import { describe, expect, it } from "vitest";
import {
  formatAssetAmount,
  isUsdcSymbol,
  isUsdtSymbol,
} from "@/helpers/format.helper";

describe("isUsdcSymbol", () => {
  it("matches USDC case-insensitively", () => {
    expect(isUsdcSymbol("USDC")).toBe(true);
    expect(isUsdcSymbol("usdc")).toBe(true);
    expect(isUsdcSymbol(" USDC ")).toBe(true);
  });

  it("rejects other symbols", () => {
    expect(isUsdcSymbol("USDT")).toBe(false);
    expect(isUsdcSymbol("XLM")).toBe(false);
  });
});

describe("isUsdtSymbol", () => {
  it("matches USDT case-insensitively", () => {
    expect(isUsdtSymbol("USDT")).toBe(true);
    expect(isUsdtSymbol("usdt")).toBe(true);
  });

  it("rejects USDC", () => {
    expect(isUsdtSymbol("USDC")).toBe(false);
  });
});

describe("formatAssetAmount", () => {
  it("formats with two decimals by default", () => {
    expect(formatAssetAmount(1000)).toBe("1,000.00");
  });

  it("handles non-finite values", () => {
    expect(formatAssetAmount(Number.NaN)).toBe("0");
  });
});
