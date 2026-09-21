import type { EscrowDetail, EscrowSummary } from "@/types";

const DEFAULT_REFRESH_DELAYS_MS = [400, 800, 1_200, 2_000, 3_000] as const;

export function getEscrowReadFingerprint(
  escrow: Pick<
    EscrowSummary,
    "updatedAt" | "lastLedgerSeq" | "balance" | "status" | "snapshot"
  >,
): string {
  return [
    escrow.updatedAt,
    escrow.lastLedgerSeq,
    escrow.balance,
    escrow.status,
    JSON.stringify(escrow.snapshot),
  ].join("|");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitForEscrowDetailRefresh(options: {
  previous: EscrowDetail | null | undefined;
  fetchDetail: () => Promise<EscrowDetail>;
  delaysMs?: readonly number[];
}): Promise<EscrowDetail> {
  const delays = options.delaysMs ?? DEFAULT_REFRESH_DELAYS_MS;
  const previousFingerprint = options.previous
    ? getEscrowReadFingerprint(options.previous.escrow)
    : null;

  let latest: EscrowDetail | null = null;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    if (attempt > 0) {
      await sleep(delays[attempt - 1] ?? delays[delays.length - 1]!);
    }

    try {
      latest = await options.fetchDetail();
    } catch {
      latest = null;
      continue;
    }

    if (
      !previousFingerprint ||
      getEscrowReadFingerprint(latest.escrow) !== previousFingerprint
    ) {
      return latest;
    }
  }

  if (latest) return latest;
  return options.fetchDetail();
}
