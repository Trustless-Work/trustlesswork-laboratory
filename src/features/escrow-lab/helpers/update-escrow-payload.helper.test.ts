import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import {
  buildUpdateEscrowPayload,
  formatAddressList,
  parseAddressList,
  resolveTrustlineAddress,
  resolveTrustlineSymbol,
  toAddressArray,
} from "./update-escrow-payload.helper";

function singleEscrow(): EscrowSummary {
  return {
    network: "testnet",
    contractId: "CABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXY",
    type: "single-release",
    engagementId: "ENG-1",
    status: "active",
    totalAmount: null,
    balance: "0",
    asset: null,
    lastLedgerSeq: "1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    snapshot: {
      title: "Old title",
      description: "Old description",
      engagementId: "ENG-1",
      trustline: { address: "C…", symbol: "USDC" },
      platformFee: "1",
      amount: "100",
      roles: {
        admin: "GADMIN",
        platform: "GPLATFORM",
        approvers: ["GAPPROVER"],
        serviceProviders: ["GSP"],
        releaseSigners: ["GRELEASE"],
        disputeResolvers: ["GDR"],
        receiver: "GRECEIVER",
      },
      milestones: [{ description: "Phase 1", approvalsTarget: 1 }],
      released: true,
      dispute: { isDisputed: true, resolved: true, reason: "x" },
    },
  } as EscrowSummary;
}

describe("buildUpdateEscrowPayload", () => {
  it("forces single-release flags false and preserves admin/platform", () => {
    const payload = buildUpdateEscrowPayload(singleEscrow(), "GADMIN", {
      engagementId: "ENG-2",
      title: "New title",
      description: "New description",
      amount: 250,
      platformFee: 2,
    });

    expect(payload.escrow.released).toBe(false);
    expect(payload.escrow.dispute).toEqual({
      isDisputed: false,
      resolved: false,
      reason: "",
    });
    expect((payload.escrow.roles as { admin: string }).admin).toBe("GADMIN");
    expect((payload.escrow.roles as { platform: string }).platform).toBe(
      "GPLATFORM",
    );
    expect(payload.escrow.title).toBe("New title");
    expect(payload.escrow.amount).toBe(250);
  });

  it("applies editable role lists while keeping admin/platform", () => {
    const payload = buildUpdateEscrowPayload(singleEscrow(), "GADMIN", {
      engagementId: "ENG-2",
      title: "New title",
      description: "New description",
      roles: {
        approvers: ["GNEWAPPROVER"],
        serviceProviders: ["GNEWSP"],
        releaseSigners: ["GNEWRELEASE"],
        disputeResolvers: ["GNEWDR"],
        observers: ["GOBSERVER"],
        receiver: "GNEWRECEIVER",
      },
    });

    const roles = payload.escrow.roles as {
      admin: string;
      platform: string;
      approvers: string[];
      serviceProviders: string[];
      releaseSigners: string[];
      disputeResolvers: string[];
      observers: string[];
      receiver: string;
    };

    expect(roles.admin).toBe("GADMIN");
    expect(roles.platform).toBe("GPLATFORM");
    expect(roles.approvers).toEqual(["GNEWAPPROVER"]);
    expect(roles.serviceProviders).toEqual(["GNEWSP"]);
    expect(roles.releaseSigners).toEqual(["GNEWRELEASE"]);
    expect(roles.disputeResolvers).toEqual(["GNEWDR"]);
    expect(roles.observers).toEqual(["GOBSERVER"]);
    expect(roles.receiver).toBe("GNEWRECEIVER");
  });

  it("overrides trustline from the form patch", () => {
    const payload = buildUpdateEscrowPayload(singleEscrow(), "GADMIN", {
      engagementId: "ENG-2",
      title: "New title",
      description: "New description",
      trustline: {
        address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
        symbol: "USDC",
      },
    });

    expect(payload.escrow.trustline).toEqual({
      address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      symbol: "USDC",
    });
  });
});

describe("address list helpers", () => {
  it("formats and parses comma-separated addresses", () => {
    expect(formatAddressList([" GAAA ", "GBBB"])).toBe("GAAA, GBBB");
    expect(parseAddressList("GAAA, GBBB\nGCCC")).toEqual([
      "GAAA",
      "GBBB",
      "GCCC",
    ]);
  });
});

describe("trustline helpers", () => {
  it("resolves address from address or contractId", () => {
    expect(resolveTrustlineAddress({ address: "CADDR" })).toBe("CADDR");
    expect(resolveTrustlineAddress({ contractId: "CID" })).toBe("CID");
    expect(resolveTrustlineSymbol({ symbol: " USDC " })).toBe("USDC");
  });
});

describe("toAddressArray", () => {
  it("pads required lists to minCount and keeps observers empty", () => {
    expect(toAddressArray([" GAAA "], 1)).toEqual(["GAAA"]);
    expect(toAddressArray([], 1)).toEqual([""]);
    expect(toAddressArray([], 0)).toEqual([]);
    expect(toAddressArray("GAAA, GBBB", 1)).toEqual(["GAAA", "GBBB"]);
  });
});
