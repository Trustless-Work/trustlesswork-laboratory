import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@/types";
import {
  buildLifecycleFlow,
  type LifecycleFlowModel,
} from "@/features/escrow-lab/helpers/lifecycle-flow.helper";

function stubEscrow(
  overrides: Omit<Partial<EscrowSummary>, "snapshot" | "type"> & {
    type: EscrowSummary["type"];
    snapshot?: unknown;
  },
): EscrowSummary {
  const { snapshot, ...rest } = overrides;
  return {
    contractId: "C…",
    engagementId: "ENG-1",
    title: "Test",
    balance: "0",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: null,
    ...rest,
    snapshot: (snapshot ?? null) as EscrowSummary["snapshot"],
  } as EscrowSummary;
}

function statusMap(model: LifecycleFlowModel) {
  return Object.fromEntries(model.nodes.map((n) => [n.id, n.status]));
}

describe("buildLifecycleFlow", () => {
  it("marks fund as current for an unfunded single-release escrow", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "0",
        snapshot: {
          milestones: [
            {
              description: "A",
              approvals: { target: 1, approvalCount: 0, approvedBy: [] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );

    expect(model.type).toBe("single-release");
    expect(model.currentNodeId).toBe("fund");
    expect(statusMap(model)).toMatchObject({
      deploy: "done",
      fund: "current",
    });
  });

  it("points to manage-milestones when funded with no milestones", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "100",
        snapshot: {
          milestones: [],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );

    expect(model.currentNodeId).toBe("manage-milestones");
    expect(statusMap(model)["update"]).toBe("closed");
  });

  it("advances funded escrow to approve then release (change-status is optional)", () => {
    const fundedPending = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "100",
        snapshot: {
          milestones: [
            {
              description: "A",
              status: "pending",
              approvals: { target: 1, approvalCount: 0, approvedBy: [] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );
    expect(fundedPending.currentNodeId).toBe("approve-milestones");
    expect(statusMap(fundedPending)["change-milestone-status"]).toBe(
      "upcoming",
    );
    expect(statusMap(fundedPending).fund).toBe("done");

    const approved = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "100",
        snapshot: {
          milestones: [
            {
              description: "A",
              status: "completed",
              approvals: { target: 1, approvalCount: 1, approvedBy: ["G…"] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );
    expect(approved.currentNodeId).toBe("release-funds");
  });

  it("keeps approve available as upcoming when unfunded", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "0",
        snapshot: {
          milestones: [
            {
              description: "A",
              approvals: { target: 1, approvalCount: 0, approvedBy: [] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );

    expect(model.currentNodeId).toBe("fund");
    expect(statusMap(model)["approve-milestones"]).toBe("upcoming");
    expect(statusMap(model)["change-milestone-status"]).toBe("upcoming");
  });

  it("wires dependency edges without false fund→approve sequencing", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "0",
        snapshot: {
          milestones: [
            {
              description: "A",
              approvals: { target: 1, approvalCount: 0, approvedBy: [] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );

    const ids = model.edges.map((e) => e.id);
    expect(ids).toContain("deploy->approve-milestones");
    expect(ids).toContain("approve-milestones->release-funds");
    expect(ids).toContain("fund->release-funds");
    expect(ids).toContain("deploy->dispute");
    expect(ids).not.toContain("fund->change-milestone-status");
    expect(ids).not.toContain("change-milestone-status->approve-milestones");
    expect(ids).not.toContain("release-funds->withdraw-remaining-funds");
  });

  it("marks withdraw closed on the happy path until a terminal dispute outcome", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "100",
        snapshot: {
          milestones: [
            {
              description: "A",
              approvals: { target: 1, approvalCount: 0, approvedBy: [] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: false,
        },
      }),
    );

    expect(statusMap(model)["withdraw-remaining-funds"]).toBe("closed");
  });

  it("routes open disputes to resolve and marks dispute disputed", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "100",
        status: "disputed",
        snapshot: {
          milestones: [
            {
              description: "A",
              approvals: { target: 1, approvalCount: 1, approvedBy: ["G…"] },
            },
          ],
          dispute: {
            isDisputed: true,
            resolved: false,
            reason: "Scope mismatch",
          },
          released: false,
        },
      }),
    );

    expect(model.currentNodeId).toBe("resolve-dispute");
    const statuses = statusMap(model);
    expect(statuses.dispute).toBe("disputed");
    expect(statuses["resolve-dispute"]).toBe("current");
    expect(statuses["release-funds"]).toBe("closed");
  });

  it("shows multi-release release progress details", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "multi-release",
        balance: "500",
        snapshot: {
          milestones: [
            {
              description: "T1",
              amount: "500",
              released: true,
              approvals: { target: 1, approvalCount: 1, approvedBy: ["G…"] },
              dispute: { isDisputed: false, resolved: false, reason: "" },
            },
            {
              description: "T2",
              amount: "500",
              released: false,
              approvals: { target: 1, approvalCount: 1, approvedBy: ["G…"] },
              dispute: { isDisputed: false, resolved: false, reason: "" },
            },
          ],
        },
      }),
    );

    expect(model.type).toBe("multi-release");
    expect(model.currentNodeId).toBe("release-funds");
    const release = model.nodes.find((n) => n.id === "release-funds");
    expect(release?.detail).toBe("1/2 released");
  });

  it("marks withdraw done when terminal with zero balance", () => {
    const model = buildLifecycleFlow(
      stubEscrow({
        type: "single-release",
        balance: "0",
        status: "released",
        snapshot: {
          milestones: [
            {
              description: "A",
              approvals: { target: 1, approvalCount: 1, approvedBy: ["G…"] },
            },
          ],
          dispute: { isDisputed: false, resolved: false, reason: "" },
          released: true,
        },
      }),
    );

    expect(model.currentNodeId).toBeNull();
    expect(statusMap(model)["withdraw-remaining-funds"]).toBe("done");
    expect(statusMap(model)["release-funds"]).toBe("done");
  });
});
