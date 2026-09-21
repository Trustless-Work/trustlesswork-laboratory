import { describe, expect, it } from "vitest";
import {
  deploySingleSchema,
  operateLabFormSchema,
  singleReleaseRolesSchema,
  validateUpdateEscrowLabFields,
} from "@/features/escrow-lab/schemas/operate.schema";

const A = "GAHOV4DKRY7GNU3CJQX6FMT2BIPW5ELSZAHOV4DKRY7GNU3CJQX6FMT2";
const B = "GDKRY7GNU3CJQX6FMT2BIPW5ELSZAHOV4DKRY7GNU3CJQX6FMT2BIPW5";
const C = "GGNU3CJQX6FMT2BIPW5ELSZAHOV4DKRY7GNU3CJQX6FMT2BIPW5ELSZA";
const D = "GJQX6FMT2BIPW5ELSZAHOV4DKRY7GNU3CJQX6FMT2BIPW5ELSZAHOV4D";
const E = "GMT2BIPW5ELSZAHOV4DKRY7GNU3CJQX6FMT2BIPW5ELSZAHOV4DKRY7G";
const F = "GPW5ELSZAHOV4DKRY7GNU3CJQX6FMT2BIPW5ELSZAHOV4DKRY7GNU3CJ";
const G = "GSZAHOV4DKRY7GNU3CJQX6FMT2BIPW5ELSZAHOV4DKRY7GNU3CJQX6FM";

const baseRoles = {
  approvers: [A],
  serviceProviders: [B],
  releaseSigners: [C],
  disputeResolvers: [D],
  platform: E,
  admin: F,
  receiver: G,
};

describe("singleReleaseRolesSchema", () => {
  it("accepts valid separated roles", () => {
    expect(singleReleaseRolesSchema.safeParse(baseRoles).success).toBe(true);
  });

  it("rejects admin overlapping approvers", () => {
    expect(
      singleReleaseRolesSchema.safeParse({
        ...baseRoles,
        admin: baseRoles.approvers[0],
      }).success,
    ).toBe(false);
  });

  it("rejects dispute resolver overlapping platform", () => {
    expect(
      singleReleaseRolesSchema.safeParse({
        ...baseRoles,
        disputeResolvers: [baseRoles.platform],
      }).success,
    ).toBe(false);
  });
});

describe("deploySingleSchema", () => {
  it("accepts a minimal valid deploy payload", () => {
    const result = deploySingleSchema.safeParse({
      signer: baseRoles.admin,
      engagementId: "ENG-1",
      title: "Test escrow",
      description: "A test",
      amount: 100,
      platformFee: 1,
      roles: baseRoles,
      milestones: [{ description: "Phase 1", approvalsTarget: 1 }],
      trustline: {
        contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
        symbol: "USDC",
      },
    });
    expect(result.success).toBe(true);
  });
});

const updateFieldDefaults = {
  updateEngagementId: "",
  updateTitle: "",
  updateDescription: "",
  updateTrustlineAddress: "",
  updateTrustlineSymbol: "USDC",
  updateTrustlineIsCustom: false,
  updateApprovers: [""],
  updateServiceProviders: [""],
  updateReleaseSigners: [""],
  updateDisputeResolvers: [""],
  updateObservers: [],
  updateReceiver: "",
};

describe("operateLabFormSchema", () => {
  it("accepts default operate field values", () => {
    const result = operateLabFormSchema.safeParse({
      ...updateFieldDefaults,
      milestoneDesc: "Added milestone",
      milestoneApprovalsTarget: 1,
      ledgers: 100000,
      fundAmount: 100,
      status: "completed",
      evidence: "",
      reason: "Needs review",
      distributions: "G...,100",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty required reason and amount", () => {
    const result = operateLabFormSchema.safeParse({
      ...updateFieldDefaults,
      milestoneDesc: "",
      ledgers: 0,
      fundAmount: 0,
      status: "",
      reason: "",
      distributions: "",
    });
    expect(result.success).toBe(false);
  });
});

const TRUSTLINE =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

describe("validateUpdateEscrowLabFields", () => {
  const validSingle = {
    updateEngagementId: "ENG-1",
    updateTitle: "Title",
    updateDescription: "Description",
    updateAmount: 100,
    updatePlatformFee: 1,
    updateTrustlineAddress: TRUSTLINE,
    updateTrustlineSymbol: "USDC",
    updateApprovers: [A],
    updateServiceProviders: [B],
    updateReleaseSigners: [C],
    updateDisputeResolvers: [D],
    updateObservers: [],
    updateReceiver: G,
  };

  it("accepts a valid single-release update form", () => {
    const result = validateUpdateEscrowLabFields(
      validSingle,
      "single-release",
      F,
      E,
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trustline.address).toBe(TRUSTLINE);
      expect(result.data.roles.receiver).toBe(G);
    }
  });

  it("rejects empty title and invalid trustline", () => {
    const result = validateUpdateEscrowLabFields(
      {
        ...validSingle,
        updateTitle: "  ",
        updateTrustlineAddress: "not-a-contract",
      },
      "single-release",
      F,
      E,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.updateTitle).toBeTruthy();
      expect(result.fieldErrors.updateTrustlineAddress).toBeTruthy();
    }
  });

  it("rejects dispute resolver overlapping approver", () => {
    const result = validateUpdateEscrowLabFields(
      {
        ...validSingle,
        updateDisputeResolvers: [A],
      },
      "single-release",
      F,
      E,
    );
    expect(result.success).toBe(false);
  });
});
