import { describe, expect, it } from "vitest";
import { humanizeEscrowError } from "@/features/escrow-lab/helpers/error-message.helper";

describe("humanizeEscrowError", () => {
  it("returns mapped copy for known codes", () => {
    expect(humanizeEscrowError("ESCROW_NOT_FOUND", "fallback")).toBe(
      "Escrow was not found.",
    );
  });

  it("falls back when code is missing", () => {
    expect(humanizeEscrowError(undefined, "raw")).toBe("raw");
  });
});
