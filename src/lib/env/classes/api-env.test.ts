import { describe, expect, it } from "vitest";
import { ApiEnv } from "./api-env";
import type { ServerEnvConfig } from "@/lib/env/server-env-schema";

function createConfig(
  overrides: Partial<ServerEnvConfig> = {},
): ServerEnvConfig {
  return {
    CORE_API_URL: "https://dev.api.trustlesswork.com",
    TW_API_KEY: "test-api-key",
    NODE_ENV: "test",
    ...overrides,
  } as ServerEnvConfig;
}

describe("ApiEnv", () => {
  it("returns the core API URL", () => {
    const env = new ApiEnv(createConfig());

    expect(env.coreApiUrl).toBe("https://dev.api.trustlesswork.com");
  });

  it("strips a trailing slash from the core API URL", () => {
    const env = new ApiEnv(
      createConfig({ CORE_API_URL: "https://dev.api.trustlesswork.com/" }),
    );

    expect(env.coreApiUrl).toBe("https://dev.api.trustlesswork.com");
  });

  it("exposes the Trustless Work API key", () => {
    const env = new ApiEnv(createConfig({ TW_API_KEY: "tw-key" }));

    expect(env.apiKey).toBe("tw-key");
  });
});
