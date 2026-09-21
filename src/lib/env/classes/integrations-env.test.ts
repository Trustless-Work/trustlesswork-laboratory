import { describe, expect, it } from "vitest";
import { IntegrationsEnv } from "./integrations-env";
import type { ClientEnvConfig } from "@/lib/env/client-env-schema";

function createConfig(
  overrides: Partial<ClientEnvConfig> = {},
): ClientEnvConfig {
  return {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: undefined,
    ...overrides,
  } as ClientEnvConfig;
}

describe("IntegrationsEnv", () => {
  it("returns the WalletConnect project id when set", () => {
    const env = new IntegrationsEnv(
      createConfig({ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: "wc-project" }),
    );

    expect(env.walletConnectProjectId).toBe("wc-project");
  });

  it("returns undefined when WalletConnect is not configured", () => {
    const env = new IntegrationsEnv(createConfig());

    expect(env.walletConnectProjectId).toBeUndefined();
  });
});
