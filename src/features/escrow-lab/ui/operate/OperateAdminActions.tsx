"use client";

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
import { gateAction } from "@/features/escrow-lab/helpers/gating.helper";
import { labApiService } from "@/features/escrow-lab/services/lab-api.service";
import { OperateManageMilestonesCards } from "@/features/escrow-lab/ui/operate/OperateManageMilestonesCards";
import { OperateUpdateCard } from "@/features/escrow-lab/ui/operate/OperateUpdateCard";
import {
  ActionCard,
  gateReason,
} from "@/features/escrow-lab/ui/operate/ActionCard";
import type { EscrowSummary, LabWriteAction } from "@/types";

interface OperateAdminActionsProps {
  form: UseFormReturn<OperateLabFormValues>;
  escrow: EscrowSummary;
  walletAddress: string | null;
  selected: number[];
  isPending: boolean;
  onRun: (action: LabWriteAction, payload: unknown) => Promise<void>;
}

export const OperateAdminActions = ({
  form,
  escrow,
  walletAddress,
  selected,
  isPending,
  onRun,
}: OperateAdminActionsProps) => {
  const g = (action: LabWriteAction) =>
    gateReason(gateAction(escrow, walletAddress, action));

  return (
    <>
      <OperateUpdateCard
        form={form}
        escrow={escrow}
        walletAddress={walletAddress}
        isPending={isPending}
        onRun={onRun}
      />
      <OperateManageMilestonesCards
        form={form}
        escrow={escrow}
        walletAddress={walletAddress}
        selected={selected}
        isPending={isPending}
        onRun={onRun}
      />

      <ActionCard
        title="Extend TTL"
        description="Extend Soroban storage lifetime."
        action="extend-ttl"
        roles={["admin"]}
        loading={isPending}
        disabledReason={g("extend-ttl")}
        onSubmit={async () => {
          const valid = await form.trigger("ledgers");
          if (!valid) return;
          await onRun("extend-ttl", {
            contractId: escrow.contractId,
            admin: walletAddress,
            ledgersToExtend: form.getValues("ledgers"),
          });
        }}
      >
        <FormField
          control={form.control}
          name="ledgers"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Ledgers to extend</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
      </ActionCard>

      <ActionCard
        title="Fund"
        description="Deposit assets. Any address can fund. State is re-read before signing."
        action="fund"
        anyDepositor
        loading={isPending}
        disabledReason={g("fund")}
        onSubmit={async () => {
          const valid = await form.trigger("fundAmount");
          if (!valid) return;
          await labApiService.getEscrow(escrow.contractId);
          await onRun("fund", {
            contractId: escrow.contractId,
            signer: walletAddress,
            amount: form.getValues("fundAmount"),
          });
        }}
      >
        <FormField
          control={form.control}
          name="fundAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
      </ActionCard>
    </>
  );
};
