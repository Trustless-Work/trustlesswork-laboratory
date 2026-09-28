import { NextResponse } from "next/server";
import {
  getTrustlessWorkClient,
  getRequestApiKey,
} from "@/lib/trustless-work/client";
import { toApiErrorResponse } from "@/lib/trustless-work/errors";
import { parseEscrowListParams } from "@/lib/trustless-work/list-params";
import {
  executeRead,
  isReadOperation,
} from "@/lib/trustless-work/read-registry";

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
      listParams: parseEscrowListParams(searchParams),
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
