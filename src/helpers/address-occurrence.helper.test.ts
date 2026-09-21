import { describe, expect, it } from "vitest";
import {
  getAddressOccurrenceCounts,
  isSharedEscrowAddress,
} from "@/helpers/address-occurrence.helper";

describe("getAddressOccurrenceCounts", () => {
  it("counts the same address across role groups", () => {
    const counts = getAddressOccurrenceCounts([
      { addresses: ["G1"] },
      { addresses: ["G2", "G1"] },
      { addresses: ["G3"] },
    ]);

    expect(counts.get("G1")).toBe(2);
    expect(counts.get("G2")).toBe(1);
    expect(counts.get("G3")).toBe(1);
  });

  it("counts duplicate entries within a single group", () => {
    const counts = getAddressOccurrenceCounts([
      { addresses: ["G1", "G1"] },
    ]);

    expect(counts.get("G1")).toBe(2);
  });
});

describe("isSharedEscrowAddress", () => {
  it("returns true only when count is greater than one", () => {
    const counts = new Map([
      ["G1", 2],
      ["G2", 1],
    ]);

    expect(isSharedEscrowAddress(counts, "G1")).toBe(true);
    expect(isSharedEscrowAddress(counts, "G2")).toBe(false);
    expect(isSharedEscrowAddress(counts, "missing")).toBe(false);
  });
});
