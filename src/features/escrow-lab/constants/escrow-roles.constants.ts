import type { LucideIcon } from "lucide-react";
import {
  BadgeCheckIcon,
  Building2Icon,
  EyeIcon,
  ScaleIcon,
  ShieldIcon,
  UnlockIcon,
  WalletIcon,
  WrenchIcon,
} from "lucide-react";

export const ESCROW_ROLE_IDS = [
  "admin",
  "approvers",
  "service-providers",
  "release-signers",
  "dispute-resolvers",
  "platform",
  "receiver",
  "observers",
] as const;

export type EscrowRoleId = (typeof ESCROW_ROLE_IDS)[number];

export interface EscrowRoleMeta {
  readonly icon: LucideIcon;
  readonly label: string;
}

export const ESCROW_ROLE_META = {
  admin: { icon: ShieldIcon, label: "Admin" },
  approvers: { icon: BadgeCheckIcon, label: "Approvers" },
  "service-providers": { icon: WrenchIcon, label: "Service Providers" },
  "release-signers": { icon: UnlockIcon, label: "Release Signers" },
  "dispute-resolvers": { icon: ScaleIcon, label: "Dispute Resolvers" },
  platform: { icon: Building2Icon, label: "Platform" },
  receiver: { icon: WalletIcon, label: "Receiver" },
  observers: { icon: EyeIcon, label: "Observers" },
} as const satisfies Record<EscrowRoleId, EscrowRoleMeta>;

export const ESCROW_ROLE_HELP_PATH = "/dashboard/help";

export function getEscrowRoleHelpHref(roleId: EscrowRoleId): string {
  return `${ESCROW_ROLE_HELP_PATH}#${roleId}`;
}
