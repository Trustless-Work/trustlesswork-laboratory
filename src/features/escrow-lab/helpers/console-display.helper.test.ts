import { describe, expect, it } from "vitest";
import {
  formatConsoleActionLabel,
  formatConsolePhaseLabel,
  formatConsoleTypeLabel,
  truncateConsoleText,
} from "./console-display.helper";

describe("console-display.helper", () => {
  it("formats action labels", () => {
    expect(formatConsoleActionLabel("change-milestone-status")).toBe(
      "Change Milestone Status",
    );
    expect(formatConsoleActionLabel("submit")).toBe("Submit");
  });

  it("formats type and phase labels", () => {
    expect(formatConsoleTypeLabel("single-release")).toBe("Single Release");
    expect(formatConsolePhaseLabel("error")).toBe("Error");
  });

  it("truncates long text", () => {
    expect(truncateConsoleText("abcdefghij", 6)).toBe("abcdef…");
  });
});
