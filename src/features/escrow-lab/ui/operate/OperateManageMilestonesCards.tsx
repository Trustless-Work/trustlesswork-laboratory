"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { OperateLabFormValues } from "@/features/escrow-lab/schemas/operate.schema";
import { parseAmount } from "@/features/escrow-lab/helpers/amount.helper";
import { gateAction } from "@/features/escrow-lab/helpers/gating.helper";
import {
  getEscrowBalance,
  getMilestones,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
import {
  ActionCard,
  gateReason,
} from "@/features/escrow-lab/ui/operate/ActionCard";
import type { EscrowSummary, LabWriteAction } from "@/types";

interface OperateManageMilestonesCardsProps {
  form: UseFormReturn<OperateLabFormValues>;
  escrow: EscrowSummary;
  walletAddress: string | null;
  selected: number[];
  isPending: boolean;
  onRun: (action: LabWriteAction, payload: unknown) => Promise<void>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

export const OperateManageMilestonesCards = ({
  form,
  escrow,
  walletAddress,
  selected,
  isPending,
  onRun,
}: OperateManageMilestonesCardsProps) => {
  const disabledReason = gateReason(
    gateAction(escrow, walletAddress, "manage-milestones"),
  );
  const canEdit = getEscrowBalance(escrow) <= 0;
  const milestones = getMilestones(escrow);
  const roles = asRecord(asRecord(escrow.snapshot)?.roles);
  const approverCount = Array.isArray(roles?.approvers)
    ? roles.approvers.length
    : 1;
  const editIndex = selected.length === 1 ? selected[0] : null;
  const editMilestone =
    editIndex !== null ? asRecord(milestones[editIndex]) : null;
  const editLabel =
    editIndex !== null
      ? `#${editIndex} ${String(editMilestone?.description ?? "Untitled")}`
      : null;

  useEffect(() => {
    if (editIndex === null) return;
    const row = asRecord(milestones[editIndex]);
    if (!row) return;
    form.setValue("editMilestoneDesc", String(row.description ?? ""));
    if (escrow.type === "multi-release") {
      form.setValue(
        "editMilestoneAmount",
        parseAmount(row.amount as string | number | undefined),
      );
    }
  }, [editIndex, milestones, escrow.type, form]);

  return (
    <>
      <ActionCard
        title="Add Milestone"
        description={
          canEdit
            ? "Append a milestone. Approvals target is set only at creation."
            : "Append a milestone (editing existing ones is blocked once funded)."
        }
        action="manage-milestones"
        roles={["admin"]}
        loading={isPending}
        disabledReason={disabledReason}
        onSubmit={async () => {
          if (!walletAddress) return;
          const valid = await form.trigger(["milestoneDesc"]);
          if (!valid) return;
          const target = form.getValues("milestoneApprovalsTarget") ?? 1;
          if (target > approverCount) {
            form.setError("milestoneApprovalsTarget", {
              message: `Target cannot exceed ${approverCount} approvers`,
            });
            return;
          }
          const newMilestones =
            escrow.type === "single-release"
              ? [
                  {
                    description: form.getValues("milestoneDesc"),
                    approvalsTarget: target,
                  },
                ]
              : [
                  {
                    description: form.getValues("milestoneDesc"),
                    amount: form.getValues("milestoneAmount") ?? 1,
                    receiver:
                      form.getValues("milestoneReceiver") || walletAddress,
                    approvalsTarget: target,
                  },
                ];
          await onRun("manage-milestones", {
            contractId: escrow.contractId,
            admin: walletAddress,
            newMilestones,
            milestoneUpdates: [],
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="milestoneDesc"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel required>Description</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={500} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="milestoneApprovalsTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Approvals target</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="tabular-nums"
                    value={Number(field.value ?? 1)}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {escrow.type === "multi-release" ? (
            <>
              <FormField
                control={form.control}
                name="milestoneAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={Number(field.value ?? 0)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="milestoneReceiver"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel required>Receiver</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
        </div>
      </ActionCard>

      {canEdit && milestones.length > 0 ? (
        <ActionCard
          title="Edit Milestone"
          description={
            editLabel
              ? `Editing ${editLabel}. Description (and multi amount) only while balance is zero.`
              : "Select exactly one milestone in the Milestones panel."
          }
          action="manage-milestones"
          roles={["admin"]}
          loading={isPending}
          disabledReason={
            disabledReason ??
            (editIndex === null ? "Select one milestone" : undefined)
          }
          onSubmit={async () => {
            if (!walletAddress || editIndex === null) return;
            if (!milestones[editIndex]) return;
            const newDescription = form.getValues("editMilestoneDesc")?.trim();
            const newAmount = form.getValues("editMilestoneAmount");
            if (!newDescription && newAmount === undefined) return;
            await onRun("manage-milestones", {
              contractId: escrow.contractId,
              admin: walletAddress,
              newMilestones: [],
              milestoneUpdates:
                escrow.type === "single-release"
                  ? [
                      {
                        index: editIndex,
                        newDescription: newDescription || undefined,
                      },
                    ]
                  : [
                      {
                        index: editIndex,
                        newDescription: newDescription || undefined,
                        newAmount,
                      },
                    ],
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="editMilestoneDesc"
              render={({ field }) => (
                <FormItem
                  className={
                    escrow.type === "multi-release" ? undefined : "sm:col-span-2"
                  }
                >
                  <FormLabel>New description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      maxLength={500}
                      disabled={editIndex === null}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {escrow.type === "multi-release" ? (
              <FormField
                control={form.control}
                name="editMilestoneAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={Number(field.value ?? 0)}
                        disabled={editIndex === null}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </ActionCard>
      ) : null}
    </>
  );
};
