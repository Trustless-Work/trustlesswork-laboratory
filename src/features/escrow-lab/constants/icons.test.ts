import { describe, expect, it } from "vitest";
import {
  getTypeIcon,
  normalizeEscrowType,
  TYPE_ICONS,
} from "@/features/escrow-lab/constants/icons";

describe("normalizeEscrowType", () => {
  it("keeps canonical types", () => {
    expect(normalizeEscrowType("single-release")).toBe("single-release");
    expect(normalizeEscrowType("multi-release")).toBe("multi-release");
  });

  it("maps v2 kinds to canonical types", () => {
    expect(normalizeEscrowType("single-release-v2")).toBe("single-release");
    expect(normalizeEscrowType("multi-release-v2")).toBe("multi-release");
  });

  it("defaults unknown values to single-release", () => {
    expect(normalizeEscrowType(undefined)).toBe("single-release");
    expect(normalizeEscrowType("shared")).toBe("single-release");
  });
});

describe("getTypeIcon", () => {
  it("always returns a defined lucide icon", () => {
    expect(getTypeIcon("single-release")).toBe(TYPE_ICONS["single-release"]);
    expect(getTypeIcon("multi-release-v2")).toBe(TYPE_ICONS["multi-release"]);
    expect(getTypeIcon("unknown")).toBeDefined();
  });
});
