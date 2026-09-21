import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { ConsoleEntry } from "@/types";
import {
  LAB_CONSOLE_MAX_AGE_MS,
  LAB_CONSOLE_MAX_ENTRIES,
  LAB_CONSOLE_STORAGE_KEY,
  clearConsoleEntries,
  loadConsoleEntries,
  pruneConsoleEntries,
  saveConsoleEntries,
} from "./lab-console-storage";

function entry(overrides: Partial<ConsoleEntry> = {}): ConsoleEntry {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    action: "deploy",
    type: "single-release",
    phase: "submit",
    ...overrides,
  };
}

describe("pruneConsoleEntries", () => {
  it("drops entries older than max age", () => {
    const fresh = entry();
    const stale = entry({
      createdAt: new Date(Date.now() - LAB_CONSOLE_MAX_AGE_MS - 1_000).toISOString(),
    });
    expect(pruneConsoleEntries([fresh, stale])).toEqual([fresh]);
  });

  it("caps list length", () => {
    const many = Array.from({ length: LAB_CONSOLE_MAX_ENTRIES + 5 }, () =>
      entry(),
    );
    expect(pruneConsoleEntries(many)).toHaveLength(LAB_CONSOLE_MAX_ENTRIES);
  });
});

describe("lab console storage", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips valid entries", () => {
    const rows = [entry({ action: "fund", phase: "error", error: "nope" })];
    saveConsoleEntries(rows);
    expect(loadConsoleEntries()).toEqual(rows);
    expect(store.has(LAB_CONSOLE_STORAGE_KEY)).toBe(true);
  });

  it("ignores corrupt payload", () => {
    store.set(LAB_CONSOLE_STORAGE_KEY, "{not-json");
    expect(loadConsoleEntries()).toEqual([]);
  });

  it("clears storage", () => {
    saveConsoleEntries([entry()]);
    clearConsoleEntries();
    expect(loadConsoleEntries()).toEqual([]);
  });
});
