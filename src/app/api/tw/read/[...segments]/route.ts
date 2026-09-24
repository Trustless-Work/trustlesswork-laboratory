import { NextResponse } from "next/server";
import type { ListEscrowsParams, EscrowStatus, EscrowType, Role } from "@/types";
import {
  getTrustlessWorkClient,
  getRequestApiKey,
} from "@/lib/trustless-work/client";
import { toApiErrorResponse } from "@/lib/trustless-work/errors";
import {
  executeRead,
  isReadOperation,
} from "@/lib/trustless-work/read-registry";

function parseListParams(searchParams: URLSearchParams): ListEscrowsParams {
  const params: ListEscrowsParams = {};
  const scope = searchParams.get("scope");
  if (scope === "mine" || scope === "all") params.scope = scope;

  const status = searchParams.get("status");
  if (status) params.status = status as EscrowStatus;

  const contractType = searchParams.get("contractType");
  if (contractType === "single-release" || contractType === "multi-release") {
    params.contractType = contractType as EscrowType;
  }

  const engagementId = searchParams.get("engagementId");
  if (engagementId) params.engagementId = engagementId;

  const participant = searchParams.get("participant");
  if (participant) params.participant = participant;

  const role = searchParams.get("role");
  if (role) params.role = role as Role;

  const cursor = searchParams.get("cursor");
  if (cursor) params.cursor = cursor;

  const limit = searchParams.get("limit");
  if (limit) params.limit = Number(limit);

  const sort = searchParams.get("sort");
  if (sort === "createdAt" || sort === "updatedAt") params.sort = sort;

  const order = searchParams.get("order");
  if (order === "asc" || order === "desc") params.order = order;

  const contractIds = searchParams.getAll("contractIds");
  if (contractIds.length) params.contractIds = contractIds;

  return params;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ segments: string[] }> },
) {
  try {
    const { segments } = await context.params;
    const [operation, maybeId] = segments;
    if (!operation || !isReadOperation(operation)) {
      return NextResponse.json(
        {
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: `Unknown read operation: ${operation ?? "(missing)"}`,
          code: "INVALID_OPERATION",
        },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const client = getTrustlessWorkClient(getRequestApiKey(request));

    const contractIds = searchParams.getAll("contractIds");
    const eventOrder = searchParams.get("order");
    const result = await executeRead(client.rest, operation, {
      contractId: maybeId,
      contractIds: contractIds.length ? contractIds : undefined,
      listParams: parseListParams(searchParams),
      eventParams: {
        cursor: searchParams.get("cursor") ?? undefined,
        limit: searchParams.get("limit")
          ? Number(searchParams.get("limit"))
          : undefined,
        order:
          eventOrder === "asc" || eventOrder === "desc"
            ? eventOrder
            : undefined,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
