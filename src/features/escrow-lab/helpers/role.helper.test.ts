import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import { ESCROW_ROLE_IDS } from "@/features/escrow-lab/constants/escrow-roles.constants";
import {
  EscrowRoleContext,
  formatRoleLabel,
  getHeldRoles,
  getSnapshotRoleAddresses,
} from "@/features/escrow-lab/helpers/role.helper";

const WALLET = "GADMINWALLETADDRESSEXAMPLE00000000000000000000";
const OTHER = "GOTHERWALLETADDRESSEXAMPLE00000000000000000000";

function stubEscrow(
  overrides: Omit<Partial<EscrowSummary>, "snapshot"> & {
    type: EscrowSummary["type"];
    snapshot?: unknown;
  },
): EscrowSummary {
  return {
    contractId: "C…",
    engagementId: "ENG-1",
    title: "Test",
    balance: "0",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: null,
    snapshot: null,
    ...overrides,
  } as EscrowSummary;
}

function singleEscrow(roles: Record<string, unknown>): EscrowSummary {
  return stubEscrow({
    type: "single-release",
    snapshot: { roles, milestones: [] },
  });
}

function multiEscrow(
  roles: Record<string, unknown>,
  milestones: Record<string, unknown>[] = [],
): EscrowSummary {
  return stubEscrow({
    type: "multi-release",
    snapshot: { roles, milestones },
  });
}

describe("formatRoleLabel", () => {
  it("maps known role keys to title labels", () => {
    expect(formatRoleLabel("serviceProviders")).toBe("Service Providers");
    expect(formatRoleLabel("releaseSigners")).toBe("Release Signers");
    expect(formatRoleLabel("disputeResolvers")).toBe("Dispute Resolvers");
    expect(formatRoleLabel("approvers")).toBe("Approvers");
    expect(formatRoleLabel("admin")).toBe("Admin");
  });

  it("formats combined role labels", () => {
    expect(formatRoleLabel("approvers + releaseSigners")).toBe(
      "Approvers + Release Signers",
    );
  });

  it("leaves already human labels unchanged", () => {
    expect(formatRoleLabel("Any depositor")).toBe("Any depositor");
  });
});

describe("EscrowRoleContext.getConnectedRoleIds", () => {
  it("returns nothing without a wallet", () => {
    const escrow = singleEscrow({ admin: WALLET });
    expect(new EscrowRoleContext(escrow, null).getConnectedRoleIds()).toEqual(
      [],
    );
    expect(new EscrowRoleContext(escrow, "   ").getConnectedRoleIds()).toEqual(
      [],
    );
  });

  it("returns nothing when the wallet holds no role", () => {
    const escrow = singleEscrow({ admin: OTHER, receiver: OTHER });
    expect(
      new EscrowRoleContext(escrow, WALLET).getConnectedRoleIds(),
    ).toEqual([]);
  });

  it("matches a trimmed wallet to several roles", () => {
    const escrow = singleEscrow({
      admin: ` ${WALLET} `,
      approvers: [` ${WALLET} `],
      serviceProviders: [OTHER],
      releaseSigners: [WALLET],
      disputeResolvers: [OTHER],
      platform: WALLET,
      receiver: OTHER,
      observers: [WALLET],
    });

    expect(
      new EscrowRoleContext(escrow, ` ${WALLET} `).getConnectedRoleIds(),
    ).toEqual([
      "admin",
      "approvers",
      "release-signers",
      "platform",
      "observers",
    ]);
  });

  it("orders pills admin through observers", () => {
    const escrow = singleEscrow({
      admin: WALLET,
      approvers: [WALLET],
      serviceProviders: [WALLET],
      releaseSigners: [WALLET],
      disputeResolvers: [WALLET],
      platform: WALLET,
      receiver: WALLET,
      observers: [WALLET],
    });

    expect(
      new EscrowRoleContext(escrow, WALLET).getConnectedRoleIds(),
    ).toEqual([...ESCROW_ROLE_IDS]);
  });

  it("counts single-release roles.receiver", () => {
    const escrow = singleEscrow({ receiver: WALLET });
    expect(
      new EscrowRoleContext(escrow, WALLET).getConnectedRoleIds(),
    ).toEqual(["receiver"]);
  });

  it("does not count single-release milestone receivers", () => {
    const escrow = stubEscrow({
      type: "single-release",
      snapshot: {
        roles: { receiver: OTHER },
        milestones: [{ receiver: WALLET }],
      },
    });
    expect(
      new EscrowRoleContext(escrow, WALLET).getConnectedRoleIds(),
    ).toEqual([]);
  });

  it("counts any multi-release milestone receiver", () => {
    const escrow = multiEscrow({ receiver: OTHER }, [
      { receiver: OTHER },
      { receiver: ` ${WALLET} ` },
    ]);
    expect(
      new EscrowRoleContext(escrow, WALLET).getConnectedRoleIds(),
    ).toEqual(["receiver"]);
  });
});

describe("getHeldRoles", () => {
  it("maps connected role ids onto held-role keys", () => {
    const escrow = singleEscrow({
      admin: WALLET,
      approvers: [WALLET],
      serviceProviders: [WALLET],
    });
    expect(getHeldRoles(escrow, WALLET)).toEqual([
      "admin",
      "approver",
      "serviceProvider",
    ]);
  });
});

describe("getSnapshotRoleAddresses", () => {
  it("normalizes string and list role fields", () => {
    const roles = {
      admin: ` ${WALLET} `,
      approvers: [OTHER, " ", WALLET],
      serviceProviders: [],
      releaseSigners: OTHER,
      disputeResolvers: [OTHER],
      platform: "",
      receiver: WALLET,
      observers: null,
    };

    expect(getSnapshotRoleAddresses(roles, "admin")).toEqual([WALLET]);
    expect(getSnapshotRoleAddresses(roles, "approvers")).toEqual([
      OTHER,
      WALLET,
    ]);
    expect(getSnapshotRoleAddresses(roles, "service-providers")).toEqual([]);
    expect(getSnapshotRoleAddresses(roles, "release-signers")).toEqual([OTHER]);
    expect(getSnapshotRoleAddresses(roles, "dispute-resolvers")).toEqual([
      OTHER,
    ]);
    expect(getSnapshotRoleAddresses(roles, "platform")).toEqual([]);
    expect(getSnapshotRoleAddresses(roles, "receiver")).toEqual([WALLET]);
    expect(getSnapshotRoleAddresses(roles, "observers")).toEqual([]);
  });
});
