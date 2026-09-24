import type {
  BatchEscrowDetailsResponse,
  BatchEscrowFinancialResponse,
  BatchEscrowMilestonesResponse,
  BuildTransactionResponse,
  DeployEscrowResponse,
  EscrowDetail,
  EscrowMilestones,
  EscrowSummary,
  EscrowType,
  LabWriteAction,
  ListEscrowEventsParams,
  ListEscrowEventsResponse,
  ListEscrowsParams,
  ListEscrowsResponse,
  SendTransactionResponse,
} from "@/types";
import { getLabApiKey, LAB_API_KEY_HEADER } from "@/features/escrow-lab/lib/lab-api-key";

export class LabApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown, code?: string) {
    super(message);
    this.name = "LabApiError";
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function labHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const apiKey = getLabApiKey();
  if (apiKey) {
    headers.set(LAB_API_KEY_HEADER, apiKey);
  }
  return headers;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: labHeaders(init?.headers),
  });
  const body = await parseJson(response);

  if (!response.ok) {
    const detail =
      typeof body === "object" &&
      body !== null &&
      "detail" in body &&
      typeof (body as { detail: unknown }).detail === "string"
        ? (body as { detail: string }).detail
        : `Request failed (${response.status})`;
    const code =
      typeof body === "object" &&
      body !== null &&
      "code" in body &&
      typeof (body as { code: unknown }).code === "string"
        ? (body as { code: string }).code
        : undefined;
    throw new LabApiError(detail, response.status, body, code);
  }

  return body as T;
}

function toSearchParams(
  params: Record<string, string | number | string[] | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const labApiService = {
  buildWrite(
    type: EscrowType,
    action: LabWriteAction,
    payload: unknown,
  ): Promise<BuildTransactionResponse | DeployEscrowResponse> {
    return request(`/api/tw/write/${type}/${action}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  submit(signedXdr: string): Promise<SendTransactionResponse> {
    return request("/api/tw/submit", {
      method: "POST",
      body: JSON.stringify({ signedXdr }),
    });
  },

  listEscrows(params: ListEscrowsParams = {}): Promise<ListEscrowsResponse> {
    return request(
      `/api/tw/read/list${toSearchParams({
        scope: params.scope,
        status: params.status,
        contractType: params.contractType,
        engagementId: params.engagementId,
        participant: params.participant,
        role: params.role,
        cursor: params.cursor,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
        contractIds: params.contractIds,
      })}`,
    );
  },

  getEscrow(contractId: string): Promise<EscrowDetail> {
    return request(`/api/tw/read/get/${encodeURIComponent(contractId)}`);
  },

  async getEscrowSummary(contractId: string): Promise<EscrowSummary> {
    const detail = await this.getEscrow(contractId);
    return detail.escrow;
  },

  getEvents(
    contractId: string,
    params?: ListEscrowEventsParams,
  ): Promise<ListEscrowEventsResponse> {
    return request(
      `/api/tw/read/events/${encodeURIComponent(contractId)}${toSearchParams({
        cursor: params?.cursor,
        limit: params?.limit,
        order: params?.order,
      })}`,
    );
  },

  getMilestones(contractId: string): Promise<EscrowMilestones> {
    return request(
      `/api/tw/read/milestones/${encodeURIComponent(contractId)}`,
    );
  },

  getDetails(contractIds: string[]): Promise<BatchEscrowDetailsResponse> {
    return request(
      `/api/tw/read/details${toSearchParams({ contractIds })}`,
    );
  },

  getFinancial(contractIds: string[]): Promise<BatchEscrowFinancialResponse> {
    return request(
      `/api/tw/read/financial${toSearchParams({ contractIds })}`,
    );
  },

  getBatchMilestones(
    contractIds: string[],
  ): Promise<BatchEscrowMilestonesResponse> {
    return request(
      `/api/tw/read/batch-milestones${toSearchParams({ contractIds })}`,
    );
  },
};
