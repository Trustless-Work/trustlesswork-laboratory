import type { EscrowSummary, HeldRole } from "@/types";
import { normalizeEscrowType } from "@/features/escrow-lab/constants/icons";
import {
  ESCROW_ROLE_IDS,
  ESCROW_ROLE_META,
  type EscrowRoleId,
} from "@/features/escrow-lab/constants/escrow-roles.constants";

const ROLE_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    ESCROW_ROLE_IDS.map((id) => [id, ESCROW_ROLE_META[id].label]),
  ),
  admin: "Admin",
  platform: "Platform",
  receiver: "Receiver",
  observers: "Observers",
  observer: "Observer",
  approver: "Approver",
  approvers: "Approvers",
  serviceProvider: "Service Provider",
  serviceProviders: "Service Providers",
  releaseSigner: "Release Signer",
  releaseSigners: "Release Signers",
  disputeResolver: "Dispute Resolver",
  disputeResolvers: "Dispute Resolvers",
};

const ROLE_ID_TO_HELD: Record<EscrowRoleId, HeldRole> = {
  admin: "admin",
  approvers: "approver",
  "service-providers": "serviceProvider",
  "release-signers": "releaseSigner",
  "dispute-resolvers": "disputeResolver",
  platform: "platform",
  receiver: "receiver",
  observers: "observer",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function addressEquals(value: unknown, wallet: string): boolean {
  return normalizeAddress(value) === wallet;
}

function addressListIncludes(value: unknown, wallet: string): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((item) => addressEquals(item, wallet));
}

function roleAddresses(value: unknown): string[] {
  if (typeof value === "string") {
    const address = normalizeAddress(value);
    return address ? [address] : [];
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeAddress(item))
    .filter((item): item is string => item !== null);
}

export function getSnapshotRoleAddresses(
  roles: Record<string, unknown>,
  roleId: EscrowRoleId,
): string[] {
  switch (roleId) {
    case "admin":
      return roleAddresses(roles.admin);
    case "approvers":
      return roleAddresses(roles.approvers);
    case "service-providers":
      return roleAddresses(roles.serviceProviders);
    case "release-signers":
      return roleAddresses(roles.releaseSigners);
    case "dispute-resolvers":
      return roleAddresses(roles.disputeResolvers);
    case "platform":
      return roleAddresses(roles.platform);
    case "receiver":
      return roleAddresses(roles.receiver);
    case "observers":
      return roleAddresses(roles.observers);
  }
}

export function formatRoleLabel(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return trimmed;
  if (ROLE_LABELS[trimmed]) return ROLE_LABELS[trimmed];
  if (trimmed.includes(" + ")) {
    return trimmed
      .split(" + ")
      .map((part) => formatRoleLabel(part.trim()))
      .join(" + ");
  }
  if (/\s/.test(trimmed)) return trimmed;
  return trimmed
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

export class EscrowRoleContext {
  private readonly wallet: string | null;
  private readonly snapshot: Record<string, unknown> | null;
  private readonly roles: Record<string, unknown> | null;

  constructor(
    private readonly escrow: EscrowSummary,
    walletAddress: string | null,
  ) {
    this.wallet = normalizeAddress(walletAddress);
    this.snapshot = asRecord(escrow.snapshot);
    this.roles = asRecord(this.snapshot?.roles);
  }

  getConnectedRoleIds(): EscrowRoleId[] {
    if (!this.wallet || !this.roles) return [];

    return ESCROW_ROLE_IDS.filter((roleId) => this.holdsRole(roleId));
  }

  private holdsRole(roleId: EscrowRoleId): boolean {
    const wallet = this.wallet;
    const roles = this.roles;
    if (!wallet || !roles) return false;

    switch (roleId) {
      case "admin":
        return addressEquals(roles.admin, wallet);
      case "approvers":
        return addressListIncludes(roles.approvers, wallet);
      case "service-providers":
        return addressListIncludes(roles.serviceProviders, wallet);
      case "release-signers":
        return addressListIncludes(roles.releaseSigners, wallet);
      case "dispute-resolvers":
        return addressListIncludes(roles.disputeResolvers, wallet);
      case "platform":
        return addressEquals(roles.platform, wallet);
      case "receiver":
        return this.isReceiver(wallet);
      case "observers":
        return addressListIncludes(roles.observers, wallet);
    }
  }

  private isReceiver(wallet: string): boolean {
    if (addressEquals(this.roles?.receiver, wallet)) return true;
    if (normalizeEscrowType(this.escrow.type) !== "multi-release") return false;

    const milestones = Array.isArray(this.snapshot?.milestones)
      ? this.snapshot.milestones
      : [];

    return milestones.some((milestone) => {
      const row = asRecord(milestone);
      return addressEquals(row?.receiver, wallet);
    });
  }
}

export function getHeldRoles(
  escrow: EscrowSummary,
  walletAddress: string | null,
): HeldRole[] {
  return new EscrowRoleContext(escrow, walletAddress)
    .getConnectedRoleIds()
    .map((roleId) => ROLE_ID_TO_HELD[roleId]);
}

export function hasRole(
  escrow: EscrowSummary,
  walletAddress: string | null,
  role: HeldRole,
): boolean {
  return getHeldRoles(escrow, walletAddress).includes(role);
}
