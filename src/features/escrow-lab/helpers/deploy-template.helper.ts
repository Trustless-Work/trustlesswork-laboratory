import { trustlines } from "@/components/tw-blocks/wallet-kit/trustlines";
import type { z } from "zod";
import type {
  deployMultiSchema,
  deploySingleSchema,
} from "@/features/escrow-lab/schemas/operate.schema";

export type DeploySingleValues = z.infer<typeof deploySingleSchema>;
export type DeployMultiValues = z.infer<typeof deployMultiSchema>;

/**
 * Known public Stellar addresses used only as lab placeholders.
 * Admin and disputeResolver must not overlap operational roles / receiver.
 */
export const LAB_ADMIN =
  "GCWTL5XN22BWFB6QSF4SKYKFQP3G3KTEHUFK7HR7CGRQJFVCO2WVXVLE";
export const LAB_DISPUTE_RESOLVER =
  "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX";
export const LAB_OBSERVER =
  "GDRDE5UKEBNKLJWJPEYDPV6GRCRW6YEF352NJZRKD377EIQXS557M4YL";

function engagementId(wallet: string): string {
  return `ENG-${wallet.slice(-8) || "lab"}`;
}

function trustlineDefaults() {
  return {
    contractId: trustlines[0]?.address ?? "",
    symbol: trustlines[0]?.symbol ?? "USDC",
  };
}

export function buildSingleDeployTemplate(wallet: string): DeploySingleValues {
  return {
    signer: wallet,
    engagementId: engagementId(wallet),
    title: "Freelance website delivery",
    description:
      "Design and ship the marketing site. Funds release after client approval.",
    amount: 250,
    platformFee: 2,
    roles: {
      approvers: [wallet],
      serviceProviders: [wallet],
      releaseSigners: [wallet],
      disputeResolvers: [LAB_DISPUTE_RESOLVER],
      platform: wallet,
      admin: LAB_ADMIN,
      receiver: wallet,
      observers: [LAB_OBSERVER],
    },
    milestones: [
      { description: "Wireframes approved", approvalsTarget: 1 },
      { description: "Production launch", approvalsTarget: 1 },
    ],
    trustline: trustlineDefaults(),
  };
}

export function buildMultiDeployTemplate(wallet: string): DeployMultiValues {
  return {
    signer: wallet,
    engagementId: engagementId(wallet),
    title: "Open-source grant",
    description:
      "Two funding tranches for protocol integration work on testnet.",
    platformFee: 2,
    roles: {
      approvers: [wallet],
      serviceProviders: [wallet],
      releaseSigners: [wallet],
      disputeResolvers: [LAB_DISPUTE_RESOLVER],
      platform: wallet,
      admin: LAB_ADMIN,
      observers: [LAB_OBSERVER],
    },
    milestones: [
      {
        description: "Spec + spike",
        amount: 100,
        receiver: wallet,
        approvalsTarget: 1,
      },
      {
        description: "Mainnet-ready integration",
        amount: 150,
        receiver: wallet,
        approvalsTarget: 1,
      },
    ],
    trustline: trustlineDefaults(),
  };
}
