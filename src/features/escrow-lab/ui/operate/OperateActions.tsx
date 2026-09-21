"use client";

import type { UseFormReturn } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { OperateLabFormValues } from "@/features/escrow-lab/schemas/operate.schema";
import { gateAction } from "@/features/escrow-lab/helpers/gating.helper";
import {
  ActionCard,
  gateReason,
} from "@/features/escrow-lab/ui/operate/ActionCard";
import { OperateAdminActions } from "@/features/escrow-lab/ui/operate/OperateAdminActions";
import { OperateSettleActions } from "@/features/escrow-lab/ui/operate/OperateSettleActions";
import type { EscrowSummary, LabWriteAction } from "@/types";

interface OperateActionsProps {
  form: UseFormReturn<OperateLabFormValues>;
  escrow: EscrowSummary;
  walletAddress: string | null;
  selected: number[];
  isPending: boolean;
  onRun: (action: LabWriteAction, payload: unknown) => Promise<void>;
}

export const OperateActions = ({
  form,
  escrow,
  walletAddress,
  selected,
  isPending,
  onRun,
}: OperateActionsProps) => {
  const g = (action: LabWriteAction) =>
    gateReason(
      gateAction(escrow, walletAddress, action, {
        milestoneIndexes: selected,
      }),
    );

  return (
    <>
      <OperateAdminActions
        form={form}
        escrow={escrow}
        walletAddress={walletAddress}
        selected={selected}
        isPending={isPending}
        onRun={onRun}
      />

      <ActionCard
        title="Change Milestone Status"
        description="Report progress and evidence."
        action="change-milestone-status"
        roles={["service-providers"]}
        loading={isPending}
        disabledReason={
          g("change-milestone-status") ??
          (selected.length === 0 ? "Select milestones" : undefined)
        }
        onSubmit={async () => {
          const valid = await form.trigger("status");
          if (!valid) return;
          const { status, evidence } = form.getValues();
          await onRun("change-milestone-status", {
            contractId: escrow.contractId,
            serviceProvider: walletAddress,
            updates: selected.map((index) => ({
              index,
              newStatus: status,
              newEvidence: evidence || undefined,
            })),
          });
        }}
      >
        <FieldGroup className="gap-3">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Status</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="completed" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="evidence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evidence</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGroup>
      </ActionCard>

      <ActionCard
        title="Approve Milestones"
        description="Cast one approval vote per selected milestone."
        action="approve-milestones"
        roles={["approvers"]}
        loading={isPending}
        disabledReason={
          g("approve-milestones") ??
          (selected.length === 0 ? "Select milestones" : undefined)
        }
        onSubmit={async () => {
          await onRun("approve-milestones", {
            contractId: escrow.contractId,
            approver: walletAddress,
            milestoneIndexes: selected,
          });
        }}
      />

      <ActionCard
        title="Approve and Release"
        description="Approver + release signer shortcut for selected milestones."
        action="approve-and-release-milestones"
        roles={["approvers", "release-signers"]}
        loading={isPending}
        disabledReason={
          g("approve-and-release-milestones") ??
          (selected.length === 0 ? "Select milestones" : undefined)
        }
        onSubmit={async () => {
          await onRun("approve-and-release-milestones", {
            contractId: escrow.contractId,
            signer: walletAddress,
            milestoneIndexes: selected,
          });
        }}
      />

      <OperateSettleActions
        form={form}
        escrow={escrow}
        walletAddress={walletAddress}
        selected={selected}
        isPending={isPending}
        onRun={onRun}
      />
    </>
  );
};
