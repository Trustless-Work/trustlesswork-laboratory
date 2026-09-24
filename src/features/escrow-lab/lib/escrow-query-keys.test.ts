import { describe, expect, it } from "vitest";
import {
  BATCH_CONTRACT_IDS_MAX,
  clipBatchContractIds,
  escrowDetailQueryKey,
  escrowListQueryKey,
} from "./escrow-query-keys";

describe("clipBatchContractIds", () => {
  it("keeps ids under the API batch cap", () => {
    const ids = Array.from({ length: 60 }, (_, i) => `C${i}`);
    const clipped = clipBatchContractIds(ids);
    expect(clipped).toHaveLength(BATCH_CONTRACT_IDS_MAX);
    expect(clipped[0]).toBe("C0");
    expect(clipped.at(-1)).toBe(`C${BATCH_CONTRACT_IDS_MAX - 1}`);
  });
});

describe("escrow query keys", () => {
  it("partitions list and detail by api key fingerprint", () => {
    const params = { scope: "mine" as const, limit: 20 };
    expect(escrowListQueryKey("default", params)).toEqual([
      "escrows",
      "list",
      "default",
      params,
    ]);
    expect(escrowDetailQueryKey("kabc", "C123")).toEqual([
      "escrow",
      "kabc",
      "C123",
    ]);
  });
});
