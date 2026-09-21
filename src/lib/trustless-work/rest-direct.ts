import "server-only";

import type {
  BuildTransactionResponse,
  EscrowType,
} from "@trustless-work/escrow-js";
import { resolveApiKey } from "@/lib/trustless-work/client";
import { serverEnv } from "@/lib/env";

async function postDirect(
  path: string,
  body: unknown,
  apiKeyOverride?: string | null,
): Promise<BuildTransactionResponse> {
  const response = await fetch(`${serverEnv.api.coreApiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": resolveApiKey(apiKeyOverride),
    },
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof (data as { detail: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : `Request failed with status ${response.status}`,
    );
    Object.assign(error, { status: response.status, body: data });
    throw error;
  }

  return data as BuildTransactionResponse;
}

export async function extendTtlDirect(
  payload: {
    contractId: string;
    admin: string;
    ledgersToExtend: number;
  },
  type: EscrowType,
  apiKeyOverride?: string | null,
): Promise<BuildTransactionResponse> {
  return postDirect(`/escrow/${type}/v2/extend-ttl`, payload, apiKeyOverride);
}

export async function approveAndReleaseMilestonesDirect(
  payload: {
    contractId: string;
    signer: string;
    milestoneIndexes: number[];
  },
  type: EscrowType,
  apiKeyOverride?: string | null,
): Promise<BuildTransactionResponse> {
  return postDirect(
    `/escrow/${type}/v2/approve-and-release-milestones`,
    payload,
    apiKeyOverride,
  );
}
