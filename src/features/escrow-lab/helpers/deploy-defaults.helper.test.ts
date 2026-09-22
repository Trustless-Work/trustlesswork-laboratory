import { describe, expect, it } from "vitest";
import {
  buildDeployEngagementId,
  buildMultiDeployDefaults,
  buildSingleDeployDefaults,
  stripDeployFormUiFields,
} from "@/features/escrow-lab/helpers/deploy-defaults.helper";

const WALLET = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRS";

describe("buildDeployEngagementId", () => {
  it("falls back to a stable seed without a wallet", () => {
    expect(buildDeployEngagementId("")).toBe("ENG-lab");
  });

  it("uses the wallet suffix", () => {
    expect(buildDeployEngagementId(WALLET)).toBe(`ENG-${WALLET.slice(-8)}`);
  });
});

describe("buildSingleDeployDefaults", () => {
  it("seeds operational roles with the wallet and leaves admin empty", () => {
    const defaults = buildSingleDeployDefaults(WALLET);
    expect(defaults.roles.approvers).toEqual([WALLET]);
    expect(defaults.roles.receiver).toBe(WALLET);
    expect(defaults.roles.admin).toBe("");
    expect(defaults.roles.disputeResolvers).toEqual([""]);
    expect(defaults.roles.observers).toEqual([]);
    expect(defaults.trustlineIsCustom).toBe(false);
    expect(defaults.trustline.address).toMatch(/^C/);
    expect(defaults.milestones).toHaveLength(1);
  });

  it("is wallet-independent when no wallet is connected", () => {
    const defaults = buildSingleDeployDefaults("");
    expect(defaults.roles.platform).toBe("");
    expect(defaults.engagementId).toBe("ENG-lab");
  });
});

describe("buildMultiDeployDefaults", () => {
  it("seeds the first tranche receiver with the wallet", () => {
    const defaults = buildMultiDeployDefaults(WALLET);
    expect(defaults.milestones[0]?.receiver).toBe(WALLET);
    expect(defaults.roles.releaseSigners).toEqual([WALLET]);
    expect(defaults.trustlineIsCustom).toBe(false);
  });
});

describe("stripDeployFormUiFields", () => {
  it("removes isCustom and maps trustline to the wire payload", () => {
    const defaults = buildSingleDeployDefaults(WALLET);
    const payload = stripDeployFormUiFields(defaults);
    expect(payload).not.toHaveProperty("trustlineIsCustom");
    expect(payload.trustline).toEqual({
      contractId: defaults.trustline.address,
      symbol: defaults.trustline.symbol,
    });
  });
});
