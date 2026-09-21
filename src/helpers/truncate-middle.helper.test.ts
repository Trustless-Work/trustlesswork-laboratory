import { describe, expect, it } from "vitest";
import {
  ADDRESS_TRUNCATE_MIN_HEAD,
  ADDRESS_TRUNCATE_MIN_TAIL,
  truncateMiddle,
} from "@/helpers/truncate-middle.helper";

describe("truncateMiddle", () => {
  const address =
    "GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOP";

  it("keeps first and last characters", () => {
    const truncated = truncateMiddle(address, 18);

    expect(truncated).toContain("…");
    expect(truncated.slice(0, ADDRESS_TRUNCATE_MIN_HEAD)).toBe(
      address.slice(0, ADDRESS_TRUNCATE_MIN_HEAD),
    );
    expect(truncated.slice(-ADDRESS_TRUNCATE_MIN_TAIL)).toBe(
      address.slice(-ADDRESS_TRUNCATE_MIN_TAIL),
    );
  });

  it("returns the full value when it fits", () => {
    expect(truncateMiddle("SHORT", 18)).toBe("SHORT");
  });
});
