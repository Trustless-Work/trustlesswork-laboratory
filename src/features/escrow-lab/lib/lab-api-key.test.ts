import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  clearLabApiKey,
  getLabApiKey,
  maskApiKey,
  setLabApiKey,
} from "./lab-api-key";

function installSessionStorage(): void {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
    },
  });
}

describe("maskApiKey", () => {
  it("masks keys for display", () => {
    expect(maskApiKey("tw_abcdefghijklmnop")).toBe("tw_a…mnop");
    expect(maskApiKey("short")).toBe("••••••••");
  });
});

describe("lab-api-key storage", () => {
  beforeEach(() => {
    installSessionStorage();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "sessionStorage");
    Reflect.deleteProperty(globalThis, "window");
  });

  it("stores and reads a trimmed key", () => {
    setLabApiKey("  tw_test_key  ");
    expect(getLabApiKey()).toBe("tw_test_key");
  });

  it("clears empty saves", () => {
    setLabApiKey("tw_test_key");
    setLabApiKey("   ");
    expect(getLabApiKey()).toBeNull();
  });

  it("clears explicitly", () => {
    setLabApiKey("tw_test_key");
    clearLabApiKey();
    expect(getLabApiKey()).toBeNull();
  });
});
