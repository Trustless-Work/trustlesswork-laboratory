import type { EscrowSummary } from "@/types";
import { parseAmount } from "@/features/escrow-lab/helpers/amount.helper";
import { getMilestones } from "@/features/escrow-lab/helpers/lifecycle.helper";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function formatAddressList(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "string") return value.trim();
  return "";
}

export function parseAddressList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Normalize stored role lists for add/remove Input rows. */
export function toAddressArray(value: unknown, minCount = 1): string[] {
  let list: string[] = [];
  if (Array.isArray(value)) {
    list = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  } else if (typeof value === "string" && value.trim()) {
    list = parseAddressList(value);
  }
  if (list.length >= minCount) return list;
  if (minCount === 0) return list;
  return [
    ...list,
    ...Array.from({ length: minCount - list.length }, () => ""),
  ];
}

export function resolveTrustlineAddress(trustline: Record<string, unknown>): string {
  if (typeof trustline.address === "string" && trustline.address.trim()) {
    return trustline.address.trim();
  }
  if (typeof trustline.contractId === "string" && trustline.contractId.trim()) {
    return trustline.contractId.trim();
  }
  return "";
}

export function resolveTrustlineSymbol(trustline: Record<string, unknown>): string {
  return typeof trustline.symbol === "string" ? trustline.symbol.trim() : "";
}

export interface UpdateEscrowRolesPatch {
  approvers: string[];
  serviceProviders: string[];
  releaseSigners: string[];
  disputeResolvers: string[];
  observers: string[];
  receiver?: string;
}

export interface UpdateEscrowFormPatch {
  engagementId: string;
  title: string;
  description: string;
  amount?: number;
  platformFee?: number;
  receiverMemo?: number;
  trustline?: { address: string; symbol: string };
  roles?: UpdateEscrowRolesPatch;
}

/** Full replace payload for update_escrow. Never mutates milestones / admin / platform. */
export function buildUpdateEscrowPayload(
  escrow: EscrowSummary,
  admin: string,
  patch: UpdateEscrowFormPatch,
): {
  contractId: string;
  admin: string;
  escrow: Record<string, unknown>;
} {
  const snapshot = asRecord(escrow.snapshot) ?? {};
  const roles = asRecord(snapshot.roles) ?? {};
  const storedTrustline = asRecord(snapshot.trustline) ?? {};
  const milestones = getMilestones(escrow);
  const rolePatch = patch.roles;

  const nextRoles: Record<string, unknown> = {
    ...roles,
    admin: roles.admin,
    platform: roles.platform,
  };

  if (rolePatch) {
    nextRoles.approvers = rolePatch.approvers;
    nextRoles.serviceProviders = rolePatch.serviceProviders;
    nextRoles.releaseSigners = rolePatch.releaseSigners;
    nextRoles.disputeResolvers = rolePatch.disputeResolvers;
    nextRoles.observers = rolePatch.observers;
    if (escrow.type === "single-release" && rolePatch.receiver) {
      nextRoles.receiver = rolePatch.receiver;
    }
  }

  const trustline = patch.trustline
    ? {
        address: patch.trustline.address.trim(),
        symbol: patch.trustline.symbol.trim(),
      }
    : {
        address: resolveTrustlineAddress(storedTrustline),
        symbol: resolveTrustlineSymbol(storedTrustline),
        ...storedTrustline,
      };

  const base: Record<string, unknown> = {
    engagementId:
      patch.engagementId.trim() || String(snapshot.engagementId ?? ""),
    title: patch.title.trim() || String(snapshot.title ?? ""),
    description:
      patch.description.trim() || String(snapshot.description ?? ""),
    platformFee:
      patch.platformFee ?? parseAmount(snapshot.platformFee as string | number),
    roles: nextRoles,
    milestones,
    trustline,
  };

  if (typeof patch.receiverMemo === "number") {
    base.receiverMemo = patch.receiverMemo;
  } else if (typeof snapshot.receiverMemo === "number") {
    base.receiverMemo = snapshot.receiverMemo;
  }

  if (escrow.type === "single-release") {
    base.amount =
      patch.amount ?? parseAmount(snapshot.amount as string | number);
    base.released = false;
    base.dispute = {
      isDisputed: false,
      resolved: false,
      reason: "",
    };
  }

  return {
    contractId: escrow.contractId,
    admin,
    escrow: base,
  };
}
