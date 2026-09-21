import "server-only";

import {
  TrustlessWorkClient,
  development,
} from "@trustless-work/escrow-js";
import { LAB_API_KEY_HEADER } from "@/lib/trustless-work/api-key-header";
import { serverEnv } from "@/lib/env";

let defaultClient: TrustlessWorkClient | null = null;

export function resolveApiKey(override?: string | null): string {
  const trimmed = override?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : serverEnv.api.apiKey;
}

export function getRequestApiKey(request: Request): string | undefined {
  const value = request.headers.get(LAB_API_KEY_HEADER)?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getTrustlessWorkClient(
  apiKeyOverride?: string | null,
): TrustlessWorkClient {
  const apiKey = resolveApiKey(apiKeyOverride);
  const isOverride = Boolean(apiKeyOverride?.trim());

  if (isOverride) {
    return new TrustlessWorkClient({
      baseURL: serverEnv.api.coreApiUrl || development,
      apiKey,
    });
  }

  if (!defaultClient) {
    defaultClient = new TrustlessWorkClient({
      baseURL: serverEnv.api.coreApiUrl || development,
      apiKey,
    });
  }
  return defaultClient;
}
