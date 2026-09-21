import { NextResponse } from "next/server";
import {
  getTrustlessWorkClient,
  getRequestApiKey,
} from "@/lib/trustless-work/client";
import { toApiErrorResponse } from "@/lib/trustless-work/errors";
import { submitSchema } from "@/features/escrow-lab/schemas/operate.schema";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: parsed.error.issues.map((i) => i.message).join("; "),
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    const client = getTrustlessWorkClient(getRequestApiKey(request));
    const result = await client.rest.sendTransaction(parsed.data.signedXdr);
    return NextResponse.json(result);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
