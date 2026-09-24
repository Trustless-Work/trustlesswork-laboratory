import type { z } from "zod";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
import {
  deployMultiFormSchema,
  deploySingleFormSchema,
  deployMultiSchema,
  deploySingleSchema,
} from "@/features/escrow-lab/schemas/operate.schema";
import { toTrustlinePayload } from "@/features/escrow-lab/helpers/update-escrow-payload.helper";

export type DeploySingleDefaults = z.infer<typeof deploySingleFormSchema>;
export type DeployMultiDefaults = z.infer<typeof deployMultiFormSchema>;
export type DeploySinglePayload = z.infer<typeof deploySingleSchema>;
export type DeployMultiPayload = z.infer<typeof deployMultiSchema>;

function defaultTrustline() {
  const first = trustlineOptions[0];
  return {
    address: first?.value ?? "",
    symbol: first?.label ?? "USDC",
  };
}

export function buildDeployEngagementId(wallet: string): string {
  const seed = wallet.slice(-8);
  return `ENG-${seed || "lab"}`;
}

export function stripDeployFormUiFields(
  values: DeploySingleDefaults,
): DeploySinglePayload;
export function stripDeployFormUiFields(
  values: DeployMultiDefaults,
): DeployMultiPayload;
export function stripDeployFormUiFields(
  values: DeploySingleDefaults | DeployMultiDefaults,
): DeploySinglePayload | DeployMultiPayload {
  const { trustlineIsCustom, trustline, ...rest } = values;
  void trustlineIsCustom;
  return {
    ...rest,
    trustline: toTrustlinePayload(trustline),
  };
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
    trustlineIsCustom: false,
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
    trustlineIsCustom: false,
  };
}
