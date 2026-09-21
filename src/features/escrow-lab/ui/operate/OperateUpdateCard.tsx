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
import { Textarea } from "@/components/ui/textarea";
import { trustlines } from "@/components/tw-blocks/wallet-kit/trustlines";
import {
  validateUpdateEscrowLabFields,
  type OperateLabFormValues,
} from "@/features/escrow-lab/schemas/operate.schema";
import { parseAmount } from "@/features/escrow-lab/helpers/amount.helper";
import { gateAction } from "@/features/escrow-lab/helpers/gating.helper";
import {
  buildUpdateEscrowPayload,
  resolveTrustlineAddress,
  resolveTrustlineSymbol,
  toAddressArray,
} from "@/features/escrow-lab/helpers/update-escrow-payload.helper";
import {
  ActionCard,
  gateReason,
} from "@/features/escrow-lab/ui/operate/ActionCard";
import { EscrowTrustlineField } from "@/features/escrow-lab/ui/operate/EscrowTrustlineField";
import { OperateUpdateRolesFields } from "@/features/escrow-lab/ui/operate/OperateUpdateRolesFields";
import type { EscrowSummary, LabWriteAction } from "@/types";

interface OperateUpdateCardProps {
  form: UseFormReturn<OperateLabFormValues>;
  escrow: EscrowSummary;
  walletAddress: string | null;
  isPending: boolean;
  onRun: (action: LabWriteAction, payload: unknown) => Promise<void>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

const UPDATE_FIELD_KEYS = [
  "updateEngagementId",
  "updateTitle",
  "updateDescription",
  "updateAmount",
  "updatePlatformFee",
  "updateTrustlineAddress",
  "updateTrustlineSymbol",
  "updateApprovers",
  "updateServiceProviders",
  "updateReleaseSigners",
  "updateDisputeResolvers",
  "updateObservers",
  "updateReceiver",
] as const;

export const OperateUpdateCard = ({
  form,
  escrow,
  walletAddress,
  isPending,
  onRun,
}: OperateUpdateCardProps) => {
  const disabledReason = gateReason(
    gateAction(escrow, walletAddress, "update"),
  );
  const snapshot = asRecord(escrow.snapshot);
  const roles = asRecord(snapshot?.roles);
  const adminAddress =
    typeof roles?.admin === "string" ? roles.admin : "";
  const platformAddress =
    typeof roles?.platform === "string" ? roles.platform : "";
  const isSingle = escrow.type === "single-release";

  useEffect(() => {
    const current = asRecord(escrow.snapshot);
    if (!current) return;
    const currentRoles = asRecord(current.roles);
    const trustline = asRecord(current.trustline) ?? {};
    const address = resolveTrustlineAddress(trustline);
    const symbol = resolveTrustlineSymbol(trustline) || "USDC";
    const isCustom = Boolean(
      address && !trustlines.some((t) => t.address === address),
    );

    form.setValue("updateEngagementId", String(current.engagementId ?? ""));
    form.setValue("updateTitle", String(current.title ?? ""));
    form.setValue("updateDescription", String(current.description ?? ""));
    form.setValue(
      "updateAmount",
      parseAmount(current.amount as string | number | undefined),
    );
    form.setValue(
      "updatePlatformFee",
      parseAmount(current.platformFee as string | number | undefined),
    );
    if (typeof current.receiverMemo === "number") {
      form.setValue("updateReceiverMemo", current.receiverMemo);
    }
    form.setValue("updateTrustlineAddress", address);
    form.setValue("updateTrustlineSymbol", symbol);
    form.setValue("updateTrustlineIsCustom", isCustom);
    form.setValue("updateApprovers", toAddressArray(currentRoles?.approvers, 1));
    form.setValue(
      "updateServiceProviders",
      toAddressArray(currentRoles?.serviceProviders, 1),
    );
    form.setValue(
      "updateReleaseSigners",
      toAddressArray(currentRoles?.releaseSigners, 1),
    );
    form.setValue(
      "updateDisputeResolvers",
      toAddressArray(currentRoles?.disputeResolvers, 1),
    );
    form.setValue("updateObservers", toAddressArray(currentRoles?.observers, 0));
    form.setValue(
      "updateReceiver",
      typeof currentRoles?.receiver === "string" ? currentRoles.receiver : "",
    );
  }, [escrow.contractId, escrow.snapshot, form]);

  return (
    <ActionCard
      title="Update Escrow"
      description="Admin-only full replace of escrow metadata while unfunded. Milestones are not edited here."
      action="update"
      roles={["admin"]}
      loading={isPending}
      disabledReason={disabledReason}
      onSubmit={async () => {
        if (!walletAddress) return;

        for (const key of UPDATE_FIELD_KEYS) {
          form.clearErrors(key);
        }

        const validated = validateUpdateEscrowLabFields(
          {
            updateEngagementId: form.getValues("updateEngagementId"),
            updateTitle: form.getValues("updateTitle"),
            updateDescription: form.getValues("updateDescription"),
            updateAmount: form.getValues("updateAmount"),
            updatePlatformFee: form.getValues("updatePlatformFee"),
            updateTrustlineAddress: form.getValues("updateTrustlineAddress"),
            updateTrustlineSymbol: form.getValues("updateTrustlineSymbol"),
            updateApprovers: form.getValues("updateApprovers"),
            updateServiceProviders: form.getValues("updateServiceProviders"),
            updateReleaseSigners: form.getValues("updateReleaseSigners"),
            updateDisputeResolvers: form.getValues("updateDisputeResolvers"),
            updateObservers: form.getValues("updateObservers"),
            updateReceiver: form.getValues("updateReceiver"),
          },
          escrow.type,
          adminAddress,
          platformAddress,
        );

        if (!validated.success) {
          for (const [key, message] of Object.entries(validated.fieldErrors)) {
            if (message) {
              form.setError(key as keyof OperateLabFormValues, {
                type: "manual",
                message,
              });
            }
          }
          return;
        }

        await onRun(
          "update",
          buildUpdateEscrowPayload(escrow, walletAddress, {
            engagementId: validated.data.engagementId,
            title: validated.data.title,
            description: validated.data.description,
            amount: validated.data.amount,
            platformFee: validated.data.platformFee,
            receiverMemo: form.getValues("updateReceiverMemo"),
            trustline: validated.data.trustline,
            roles: validated.data.roles,
          }),
        );
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="updateEngagementId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Engagement ID</FormLabel>
              <FormControl>
                <Input {...field} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="updateTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Title</FormLabel>
              <FormControl>
                <Input {...field} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="updateDescription"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel required>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} maxLength={500} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isSingle ? (
          <>
            <FormField
              control={form.control}
              name="updateAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Total amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
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
              name="updatePlatformFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Platform Fee (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="tabular-nums"
                      value={Number(field.value ?? 0)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <EscrowTrustlineField form={form} />
          </>
        ) : (
          <EscrowTrustlineField
            form={form}
            showPlatformFee
            heading="Fees & asset"
          />
        )}
        <OperateUpdateRolesFields
          form={form}
          isSingle={isSingle}
          adminAddress={adminAddress}
          platformAddress={platformAddress}
        />
      </div>
    </ActionCard>
  );
};
