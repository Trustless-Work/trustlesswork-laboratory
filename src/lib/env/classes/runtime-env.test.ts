import { describe, expect, it } from "vitest";
import { RuntimeEnv } from "./runtime-env";

describe("RuntimeEnv", () => {
  it("reports test when NODE_ENV is test", () => {
    const env = new RuntimeEnv({ NODE_ENV: "test" });

    expect(env.nodeEnv).toBe("test");
    expect(env.isTest).toBe(true);
    expect(env.isDevelopment).toBe(false);
    expect(env.isProduction).toBe(false);
  });

  it("reports production when NODE_ENV is production", () => {
    const env = new RuntimeEnv({ NODE_ENV: "production" });

    expect(env.isProduction).toBe(true);
    expect(env.isDevelopment).toBe(false);
    expect(env.isTest).toBe(false);
  });
});
