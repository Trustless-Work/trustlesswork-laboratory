import { describe, expect, it } from "vitest";
import { parseEscrowListParams } from "./list-params";

describe("parseEscrowListParams", () => {
  it("reads the type filter", () => {
    const params = parseEscrowListParams(
      new URLSearchParams("type=multi-release&limit=5"),
    );
    expect(params.type).toBe("multi-release");
    expect(params.limit).toBe(5);
    expect(params).not.toHaveProperty("contractType");
  });

  it("ignores the removed contractType query param", () => {
    const params = parseEscrowListParams(
      new URLSearchParams("contractType=single-release"),
    );
    expect(params.type).toBeUndefined();
    expect(params).not.toHaveProperty("contractType");
  });
});
