import type { LucideIcon } from "lucide-react";
import {
  Layers2Icon,
  LayersIcon,
  Wallet,
  Banknote,
  Wrench,
  ListTree,
  CircleDollarSign,
  ShieldAlert,
  Gavel,
  BadgeCheck,
  ListChecks,
  Zap,
  RocketIcon,
  BanknoteIcon,
  FilePenLineIcon,
  CheckCircle2Icon,
  FlagIcon,
  GavelIcon,
  Undo2Icon,
  TimerIcon,
  ShieldIcon,
  ScaleIcon,
} from "lucide-react";
import type { EscrowType, HeldRole, LabWriteAction } from "@/types";
import {
  ESCROW_ROLE_META,
  type EscrowRoleId,
} from "@/features/escrow-lab/constants/escrow-roles.constants";

export const ROLE_ICONS = {
  admin: ESCROW_ROLE_META.admin.icon,
  approvers: ESCROW_ROLE_META.approvers.icon,
  "service-providers": ESCROW_ROLE_META["service-providers"].icon,
  "release-signers": ESCROW_ROLE_META["release-signers"].icon,
  "dispute-resolvers": ESCROW_ROLE_META["dispute-resolvers"].icon,
  platform: ESCROW_ROLE_META.platform.icon,
  receiver: ESCROW_ROLE_META.receiver.icon,
  observers: ESCROW_ROLE_META.observers.icon,
} as const satisfies Record<EscrowRoleId, LucideIcon>;

export const TYPE_ICONS = {
  "single-release": Layers2Icon,
  "multi-release": LayersIcon,
} as const satisfies Record<EscrowType, LucideIcon>;

export const ACTION_ICONS = {
  fund: Wallet,
  withdraw: Banknote,
  update: Wrench,
  manageMilestones: ListTree,
  release: CircleDollarSign,
  dispute: ShieldAlert,
  resolve: Gavel,
  approve: BadgeCheck,
  changeStatus: ListChecks,
  approveAndRelease: Zap,
  deploy: RocketIcon,
  extendTtl: TimerIcon,
} as const satisfies Record<string, LucideIcon>;

export const EVENT_ICONS = {
  deploy: RocketIcon,
  fund: BanknoteIcon,
  update: FilePenLineIcon,
  approve: CheckCircle2Icon,
  release: FlagIcon,
  dispute: GavelIcon,
  resolve: ScaleIcon,
  withdraw: Undo2Icon,
} as const satisfies Record<string, LucideIcon>;

const HELD_ROLE_TO_ICON_KEY: Record<HeldRole, keyof typeof ROLE_ICONS> = {
  admin: "admin",
  platform: "platform",
  approver: "approvers",
  serviceProvider: "service-providers",
  releaseSigner: "release-signers",
  disputeResolver: "dispute-resolvers",
  receiver: "receiver",
  observer: "observers",
};

const WRITE_ACTION_TO_ICON_KEY: Record<
  LabWriteAction,
  keyof typeof ACTION_ICONS
> = {
  deploy: "deploy",
  fund: "fund",
  update: "update",
  "manage-milestones": "manageMilestones",
  "change-milestone-status": "changeStatus",
  "approve-milestones": "approve",
  "approve-and-release-milestones": "approveAndRelease",
  "release-funds": "release",
  dispute: "dispute",
  "resolve-dispute": "resolve",
  "withdraw-remaining-funds": "withdraw",
  "extend-ttl": "extendTtl",
};

export function normalizeEscrowType(type: string | null | undefined): EscrowType {
  const normalized = type?.trim().toLowerCase() ?? "";
  if (
    normalized === "multi-release" ||
    normalized === "multi-release-v2" ||
    normalized.includes("multi")
  ) {
    return "multi-release";
  }
  return "single-release";
}

export function getRoleIcon(role: HeldRole): LucideIcon {
  return ROLE_ICONS[HELD_ROLE_TO_ICON_KEY[role]] ?? ShieldIcon;
}

export function getTypeIcon(type: string): LucideIcon {
  return TYPE_ICONS[normalizeEscrowType(type)];
}

export function getActionIcon(action: LabWriteAction): LucideIcon {
  return ACTION_ICONS[WRITE_ACTION_TO_ICON_KEY[action]] ?? FilePenLineIcon;
}

export function getEventIcon(kind: string): LucideIcon {
  const normalized = kind.toLowerCase();
  for (const [key, icon] of Object.entries(EVENT_ICONS)) {
    if (normalized.includes(key)) return icon;
  }
  return FilePenLineIcon;
}

export function getRoleIconByLabel(label: string): LucideIcon | undefined {
  const normalized = label.toLowerCase().replaceAll(" ", "");
  if (normalized.includes("admin")) return ROLE_ICONS.admin;
  if (normalized.includes("platform")) return ROLE_ICONS.platform;
  if (normalized.includes("approver")) return ROLE_ICONS.approvers;
  if (normalized.includes("service")) return ROLE_ICONS["service-providers"];
  if (normalized.includes("release")) return ROLE_ICONS["release-signers"];
  if (normalized.includes("dispute")) return ROLE_ICONS["dispute-resolvers"];
  if (normalized.includes("receiver")) return ROLE_ICONS.receiver;
  if (normalized.includes("observer")) return ROLE_ICONS.observers;
  if (normalized.includes("depositor") || normalized.includes("wallet")) {
    return ROLE_ICONS.receiver;
  }
  return undefined;
}
