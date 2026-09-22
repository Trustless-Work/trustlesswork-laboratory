import type { EscrowSummary } from "@/types";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
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

const SOROBAN_CONTRACT_ID = /^C[A-Z2-7]{55}$/;

function readTrustlineString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * SAC contract id shown in the form.
 * Snapshots may store it as `contractId` (deploy wire) or `address`.
 * Issuer `G…` addresses are ignored when a contract id is present.
 */
export function resolveTrustlineAddress(trustline: Record<string, unknown>): string {
  const contractId = readTrustlineString(trustline.contractId);
  const address = readTrustlineString(trustline.address);
  if (SOROBAN_CONTRACT_ID.test(contractId)) return contractId;
  if (SOROBAN_CONTRACT_ID.test(address)) return address;
  return contractId || address;
}

export function resolveTrustlineSymbol(trustline: Record<string, unknown>): string {
  return readTrustlineString(trustline.symbol);
}

/**
 * Deploy and update both send the SAC as `contractId` + `symbol`.
 * `isCustom` stays in the form. The issuer `address` (G…) is not part of this payload.
 */
export function toTrustlinePayload(fields: {
  address: string;
  symbol: string;
}): { contractId: string; symbol: string } {
  return {
    contractId: fields.address.trim(),
    symbol: fields.symbol.trim(),
  };
}

export function isPresetTrustlineAddress(address: string): boolean {
  const trimmed = address.trim();
  if (!trimmed) return false;
  return trustlineOptions.some((option) => option.value === trimmed);
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
    ? toTrustlinePayload(patch.trustline)
    : toTrustlinePayload({
        address: resolveTrustlineAddress(storedTrustline),
        symbol: resolveTrustlineSymbol(storedTrustline),
      });

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
