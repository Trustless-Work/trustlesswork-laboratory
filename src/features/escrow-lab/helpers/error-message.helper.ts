import { isEscrowErrorCode } from "@trustless-work/escrow-js";

const HUMAN_COPY: Record<string, string> = {
  ESCROW_AMOUNT_CANNOT_BE_ZERO: "Amount cannot be zero.",
  ESCROW_ALREADY_INITIALIZED: "Escrow is already initialized.",
  ESCROW_NOT_FOUND: "Escrow was not found.",
  ESCROW_ONLY_RELEASE_SIGNER_CAN_RELEASE:
    "Only a release signer can release funds.",
  ESCROW_BALANCE_NOT_ENOUGH_TO_SEND_EARNINGS:
    "Escrow balance is not enough to send earnings.",
  ESCROW_ONLY_PLATFORM_ADDRESS_CAN_EXECUTE:
    "Only the platform address can execute this action.",
  ESCROW_ONLY_SERVICE_PROVIDER_CAN_CHANGE_MILESTONE_STATUS:
    "Only a service provider can change milestone status.",
  ESCROW_NO_MILESTONE_DEFINED: "This escrow has no milestones.",
  ESCROW_INVALID_MILESTONE_INDEX: "Invalid milestone index.",
  ESCROW_ONLY_APPROVER_CAN_CHANGE_MILESTONE_FLAG:
    "Only an approver can approve milestones.",
  ESCROW_ONLY_DISPUTE_RESOLVER_CAN_EXECUTE:
    "Only a dispute resolver can execute this action.",
  ESCROW_INSUFFICIENT_FUNDS_FOR_RESOLUTION:
    "Insufficient funds for dispute resolution.",
  ESCROW_HAS_FUNDS: "Escrow already has funds — structure is frozen.",
  ESCROW_UNAUTHORIZED_TO_CHANGE_DISPUTE_FLAG:
    "You are not authorized to raise or change a dispute.",
  ESCROW_TOO_MANY_MILESTONES: "Too many milestones.",
  ESCROW_PLATFORM_FEE_TOO_HIGH: "Platform fee is too high.",
  ESCROW_INSUFFICIENT_FUNDS_FOR_FUNDING:
    "Insufficient funds in the wallet to fund this escrow.",
  ESCROW_MILESTONE_HAS_ALREADY_BEEN_APPROVED:
    "Milestone has already been approved.",
  ESCROW_ONLY_ADMIN_CAN_EXECUTE: "Only the admin can execute this action.",
  ESCROW_ADMIN_ADDRESS_CANNOT_BE_CHANGED: "Admin address cannot be changed.",
  ESCROW_PLATFORM_ADDRESS_CANNOT_BE_CHANGED:
    "Platform address cannot be changed.",
  VALIDATION_ERROR: "Request validation failed. Check the payload.",
  UNAUTHORIZED: "Unauthorized — check the API key configuration.",
  STELLAR_SIMULATION_FAILED: "Stellar simulation failed for this transaction.",
};

export function humanizeEscrowError(
  code: string | undefined,
  fallback: string,
): string {
  if (!code) return fallback;
  if (HUMAN_COPY[code]) return HUMAN_COPY[code];
  if (isEscrowErrorCode(code)) {
    return code.replace(/^ESCROW_/, "").replaceAll("_", " ").toLowerCase();
  }
  return fallback;
}
