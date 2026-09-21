import "server-only";

import {
  TrustlessWorkApiError,
  formatApiErrorMessage,
  toTrustlessWorkError,
} from "@trustless-work/escrow-js";
import { NextResponse } from "next/server";

export function toApiErrorResponse(error: unknown): NextResponse {
  const normalized = toTrustlessWorkError(error);

  if (normalized instanceof TrustlessWorkApiError) {
    return NextResponse.json(
      {
        type: normalized.type,
        title: normalized.title,
        status: normalized.status,
        detail: normalized.detail,
        code: normalized.code,
        instance: normalized.instance,
        traceId: normalized.traceId,
        extensions: normalized.extensions,
      },
      { status: normalized.status },
    );
  }

  const message = formatApiErrorMessage(error);
  return NextResponse.json(
    {
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail: message,
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}
