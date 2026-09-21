import type { z } from "zod";
import { trustlines } from "@/components/tw-blocks/wallet-kit/trustlines";
import {
  deployMultiSchema,
  deploySingleSchema,
} from "@/features/escrow-lab/schemas/operate.schema";

export type DeploySingleDefaults = z.infer<typeof deploySingleSchema>;
export type DeployMultiDefaults = z.infer<typeof deployMultiSchema>;

function defaultTrustline() {
  return {
    contractId: trustlines[0]?.address ?? "",
    symbol: trustlines[0]?.symbol ?? "USDC",
  };
}

export function buildDeployEngagementId(wallet: string): string {
  const seed = wallet.slice(-8);
  return `ENG-${seed || "lab"}`;
}

export function buildSingleDeployDefaults(
  wallet: string,
): DeploySingleDefaults {
  return {
    signer: wallet,
    engagementId: buildDeployEngagementId(wallet),
    title: "",
    description: "",
    amount: 100,
    platformFee: 1,
    roles: {
      approvers: [wallet],
      serviceProviders: [wallet],
      releaseSigners: [wallet],
      disputeResolvers: [""],
      platform: wallet,
      admin: "",
      receiver: wallet,
      observers: [],
    },
    milestones: [{ description: "Phase 1", approvalsTarget: 1 }],
    trustline: defaultTrustline(),
  };
}

export function buildMultiDeployDefaults(wallet: string): DeployMultiDefaults {
  return {
    signer: wallet,
    engagementId: buildDeployEngagementId(wallet),
    title: "",
    description: "",
    platformFee: 1,
    roles: {
      approvers: [wallet],
      serviceProviders: [wallet],
      releaseSigners: [wallet],
      disputeResolvers: [""],
      platform: wallet,
      admin: "",
      observers: [],
    },
    milestones: [
      {
        description: "Tranche 1",
        amount: 50,
        receiver: wallet,
        approvalsTarget: 1,
      },
    ],
    trustline: defaultTrustline(),
  };
}
