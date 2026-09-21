import { afterEach, describe, expect, it, vi } from "vitest";
import type { EscrowDetail } from "@/types";
import {
  getEscrowReadFingerprint,
  waitForEscrowDetailRefresh,
} from "./escrow-refresh.helper";

function detail(
  overrides: Partial<EscrowDetail["escrow"]> = {},
): EscrowDetail {
  return {
    escrow: {
      network: "testnet",
      contractId: "C123",
      type: "single-release",
      engagementId: "eng",
      status: "active",
      totalAmount: null,
      balance: "0",
      asset: null,
      lastLedgerSeq: "1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      snapshot: {
        title: "Demo",
        description: "Demo",
        engagementId: "eng",
        trustline: { address: "C…", symbol: "USDC" },
        platformFee: "0.3",
        roles: {
          approvers: ["G1"],
          serviceProviders: ["G2"],
          platform: "G3",
          releaseSigners: ["G4"],
          disputeResolvers: ["G5"],
          receiver: "G6",
          admin: "G7",
        },
        amount: "100",
        milestones: [],
      },
      ...overrides,
    },
    events: [],
    deposits: [],
  };
}

describe("getEscrowReadFingerprint", () => {
  it("changes when balance advances", () => {
    const before = getEscrowReadFingerprint(detail().escrow);
    const after = getEscrowReadFingerprint(detail({ balance: "100" }).escrow);
    expect(before).not.toBe(after);
  });
});

describe("waitForEscrowDetailRefresh", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns immediately when the read model already advanced", async () => {
    const previous = detail();
    const next = detail({ balance: "100", lastLedgerSeq: "2" });
    const fetchDetail = vi.fn().mockResolvedValue(next);

    await expect(
      waitForEscrowDetailRefresh({ previous, fetchDetail, delaysMs: [50] }),
    ).resolves.toEqual(next);
    expect(fetchDetail).toHaveBeenCalledTimes(1);
  });

  it("polls until the fingerprint changes", async () => {
    vi.useFakeTimers();
    const previous = detail();
    const next = detail({
      balance: "100",
      lastLedgerSeq: "2",
      updatedAt: "2026-01-01T00:00:05.000Z",
    });
    const fetchDetail = vi
      .fn()
      .mockResolvedValueOnce(previous)
      .mockResolvedValueOnce(previous)
      .mockResolvedValueOnce(next);

    const pending = waitForEscrowDetailRefresh({
      previous,
      fetchDetail,
      delaysMs: [100, 100],
    });

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).resolves.toEqual(next);
    expect(fetchDetail).toHaveBeenCalledTimes(3);
  });

  it("retries when the first reads 404 before the escrow is indexed", async () => {
    vi.useFakeTimers();
    const next = detail({ lastLedgerSeq: "9" });
    const fetchDetail = vi
      .fn()
      .mockRejectedValueOnce(new Error("not found"))
      .mockResolvedValueOnce(next);

    const pending = waitForEscrowDetailRefresh({
      previous: null,
      fetchDetail,
      delaysMs: [100],
    });

    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).resolves.toEqual(next);
    expect(fetchDetail).toHaveBeenCalledTimes(2);
  });
});
