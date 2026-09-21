import { describe, expect, it } from "vitest";
import { getLabWriteToastMessages } from "@/features/escrow-lab/helpers/transaction-toast.helper";

describe("getLabWriteToastMessages", () => {
  it("returns deploy copy", () => {
    expect(getLabWriteToastMessages("deploy")).toEqual({
      loading: "Deploying escrow...",
      success: "Escrow deployed successfully",
    });
  });

  it("returns fund copy", () => {
    expect(getLabWriteToastMessages("fund")).toEqual({
      loading: "Funding escrow...",
      success: "Escrow funded successfully",
    });
  });
});
