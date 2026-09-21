"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { OperateLabFormValues } from "@/features/escrow-lab/schemas/operate.schema";
import {
  ActionCard,
  gateReason,
} from "@/features/escrow-lab/ui/operate/ActionCard";
import {
  parseDistributionLines,
  validateResolveDistributions,
} from "@/features/escrow-lab/helpers/distribution.helper";
import { gateAction } from "@/features/escrow-lab/helpers/gating.helper";
import { toast } from "sonner";
import type { EscrowSummary, LabWriteAction } from "@/types";

interface OperateSettleActionsProps {
  form: UseFormReturn<OperateLabFormValues>;
  escrow: EscrowSummary;
  walletAddress: string | null;
  selected: number[];
  isPending: boolean;
  onRun: (action: LabWriteAction, payload: unknown) => Promise<void>;
}

export const OperateSettleActions = ({
  form,
  escrow,
  walletAddress,
  selected,
  isPending,
  onRun,
}: OperateSettleActionsProps) => {
  const g = (action: LabWriteAction) =>
    gateReason(
      gateAction(escrow, walletAddress, action, {
        milestoneIndexes: selected,
      }),
    );

  return (
    <>
      <ActionCard
        title="Release Funds"
        description={
          escrow.type === "single-release"
            ? "Release once all milestones are approved."
            : "Release selected approved milestones."
        }
        action="release-funds"
        roles={["release-signers"]}
        loading={isPending}
        disabledReason={g("release-funds")}
        onSubmit={async () => {
          await onRun(
            "release-funds",
            escrow.type === "single-release"
              ? {
                  contractId: escrow.contractId,
                  releaseSigner: walletAddress,
                }
              : {
                  contractId: escrow.contractId,
                  releaseSigner: walletAddress,
                  milestoneIndexes: selected,
                },
          );
        }}
      />

      <ActionCard
        title="Raise Dispute"
        description="Admin and Dispute Resolvers cannot open disputes. Reason is required."
        action="dispute"
        roles={[
          "approvers",
          "service-providers",
          "release-signers",
          "platform",
          "receiver",
        ]}
        loading={isPending}
        disabledReason={g("dispute")}
        onSubmit={async () => {
          const valid = await form.trigger("reason");
          if (!valid) return;
          const reason = form.getValues("reason");
          await onRun(
            "dispute",
            escrow.type === "single-release"
              ? {
                  contractId: escrow.contractId,
                  signer: walletAddress,
                  reason,
                }
              : {
                  contractId: escrow.contractId,
                  signer: walletAddress,
                  reason,
                  milestoneIndexes: selected,
                },
          );
        }}
      >
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Reason</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Missed deadline" rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </ActionCard>

      <ActionCard
        title="Resolve Dispute"
        description={
          escrow.type === "single-release"
            ? "One address,amount per line. Sum must equal the escrow balance."
            : "One address,amount per line. Sum must be ≤ selected milestone amounts."
        }
        action="resolve-dispute"
        roles={["dispute-resolvers"]}
        loading={isPending}
        disabledReason={g("resolve-dispute")}
        onSubmit={async () => {
          const valid = await form.trigger("distributions");
          if (!valid) return;
          const distributions = parseDistributionLines(
            form.getValues("distributions"),
          );
          const error = validateResolveDistributions(
            escrow,
            distributions,
            selected,
          );
          if (error) {
            toast.error(error);
            return;
          }
          await onRun(
            "resolve-dispute",
            escrow.type === "single-release"
              ? {
                  contractId: escrow.contractId,
                  disputeResolver: walletAddress,
                  distributions,
                }
              : {
                  contractId: escrow.contractId,
                  disputeResolver: walletAddress,
                  milestoneIndexes: selected,
                  distributions,
                },
          );
        }}
      >
        <FormField
          control={form.control}
          name="distributions"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Distributions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="font-mono"
                  placeholder="G…,100"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </ActionCard>

      <ActionCard
        title="Withdraw Remaining Funds"
        description="Full sweep when the escrow is terminal."
        action="withdraw-remaining-funds"
        roles={["dispute-resolvers"]}
        loading={isPending}
        disabledReason={g("withdraw-remaining-funds")}
        onSubmit={async () => {
          const valid = await form.trigger("distributions");
          if (!valid) return;
          await onRun("withdraw-remaining-funds", {
            contractId: escrow.contractId,
            disputeResolver: walletAddress,
            distributions: parseDistributionLines(
              form.getValues("distributions"),
            ),
          });
        }}
      />
    </>
  );
};
