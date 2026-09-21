import { describe, expect, it } from "vitest";
import {
  ESCROW_ROLE_IDS,
  ESCROW_ROLE_META,
  getEscrowRoleHelpHref,
} from "@/features/escrow-lab/constants/escrow-roles.constants";

describe("escrow role constants", () => {
  it("exposes an icon and label for every role id", () => {
    for (const roleId of ESCROW_ROLE_IDS) {
      expect(ESCROW_ROLE_META[roleId].label).toBeTruthy();
      expect(ESCROW_ROLE_META[roleId].icon).toBeDefined();
    }
  });

  it("keeps the documented display labels", () => {
    expect(ESCROW_ROLE_META.admin.label).toBe("Admin");
    expect(ESCROW_ROLE_META.approvers.label).toBe("Approvers");
    expect(ESCROW_ROLE_META["service-providers"].label).toBe(
      "Service Providers",
    );
    expect(ESCROW_ROLE_META["release-signers"].label).toBe("Release Signers");
    expect(ESCROW_ROLE_META["dispute-resolvers"].label).toBe(
      "Dispute Resolvers",
    );
    expect(ESCROW_ROLE_META.platform.label).toBe("Platform");
    expect(ESCROW_ROLE_META.receiver.label).toBe("Receiver");
    expect(ESCROW_ROLE_META.observers.label).toBe("Observers");
  });

  it("builds a help href with the role id hash", () => {
    expect(getEscrowRoleHelpHref("service-providers")).toBe(
      "/dashboard/help#service-providers",
    );
  });
});
