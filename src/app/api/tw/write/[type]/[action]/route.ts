import { NextResponse } from "next/server";
import { getTrustlessWorkClient, getRequestApiKey } from "@/lib/trustless-work/client";
import { toApiErrorResponse } from "@/lib/trustless-work/errors";
import {
  executeWrite,
  getWriteSchema,
  isWriteAction,
} from "@/lib/trustless-work/write-registry";
import { escrowTypeSchema } from "@/features/escrow-lab/schemas/operate.schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ type: string; action: string }> },
) {
  try {
    const { type: rawType, action: rawAction } = await context.params;
    const typeResult = escrowTypeSchema.safeParse(rawType);
    if (!typeResult.success) {
      return NextResponse.json(
        {
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "Invalid escrow type",
          code: "INVALID_TYPE",
        },
        { status: 400 },
      );
    }

    if (!isWriteAction(rawAction)) {
      return NextResponse.json(
        {
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: `Unknown write action: ${rawAction}`,
          code: "INVALID_ACTION",
        },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();
    const schema = getWriteSchema(rawAction, typeResult.data);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues.map((i) => i.message).join("; "),
          code: "VALIDATION_ERROR",
          extensions: { issues: parsed.error.issues },
        },
        { status: 400 },
      );
    }

    const apiKey = getRequestApiKey(request);
    const client = getTrustlessWorkClient(apiKey);
    const result = await executeWrite(
      client.rest,
      rawAction,
      typeResult.data,
      parsed.data,
      apiKey,
    );

    return NextResponse.json(result);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
