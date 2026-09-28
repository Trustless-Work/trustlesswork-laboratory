"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  amountsEqual,
  formatAmount,
  sumDistributions,
} from "@/features/escrow-lab/helpers/amount.helper";
import { getWithdrawAllocationStatus } from "@/features/escrow-lab/helpers/distribution.helper";
import type { OperateLabFormValues } from "@/features/escrow-lab/schemas/operate.schema";
import { cn } from "@/lib/utils";

const MAX_WITHDRAW_ROWS = 50;

interface WithdrawDistributionsFieldsProps {
  form: UseFormReturn<OperateLabFormValues>;
  balance: number;
  assetSymbol: string;
}

export const WithdrawDistributionsFields = ({
  form,
  balance,
  assetSymbol,
}: WithdrawDistributionsFieldsProps) => {
  const previousBalance = useRef<number | null>(null);
  const rows = useFieldArray({
    control: form.control,
    name: "withdrawDistributions",
  });
  const watched = form.watch("withdrawDistributions");
  const allocated = sumDistributions(
    watched.map((row) => ({ amount: Number(row.amount) || 0 })),
  );
  const matched = amountsEqual(allocated, balance);
  const over = allocated > balance + 1e-6;
  const incomplete = watched.some(
    (row) => !row.address.trim() || !(Number(row.amount) > 0),
  );

  useEffect(() => {
    const current = form.getValues("withdrawDistributions");
    const onlyDefaultRow =
      current.length === 1 && current[0]?.address.trim() === "";
    const amount = current[0]?.amount ?? 0;
    const stillDefault =
      onlyDefaultRow &&
      (amount === 0 ||
        (previousBalance.current !== null &&
          amountsEqual(amount, previousBalance.current)));

    if (stillDefault && balance > 0) {
      form.setValue("withdrawDistributions.0.amount", balance, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }

    previousBalance.current = balance;
  }, [balance, form]);

  const leftover = Math.max(0, balance - allocated);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Assign the remaining {formatAmount(balance)} {assetSymbol}. Add another
        wallet to split it. The amounts must add up to that balance.
      </p>
      {rows.fields.map((row, index) => (
        <div
          key={row.id}
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8.5rem_auto] sm:items-end"
        >
          <FormField
            control={form.control}
            name={`withdrawDistributions.${index}.address`}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Wallet</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value}
                    placeholder="G…"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`withdrawDistributions.${index}.amount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step="any"
                    value={Number.isFinite(field.value) ? field.value : 0}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      field.onChange(Number.isFinite(next) ? next : 0);
                    }}
                    placeholder="0"
                    className="tabular-nums"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={rows.fields.length <= 1}
            aria-label={`Remove wallet ${index + 1}`}
            onClick={() => rows.remove(index)}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.fields.length >= MAX_WITHDRAW_ROWS}
          onClick={() =>
            rows.append({
              address: "",
              amount: leftover,
            })
          }
        >
          <PlusIcon data-icon="inline-start" />
          Add wallet
        </Button>
        <p
          className={cn(
            "text-xs tabular-nums",
            matched && !incomplete
              ? "text-muted-foreground"
              : "text-destructive",
          )}
        >
          {getWithdrawAllocationStatus({
            allocated,
            balance,
            assetSymbol,
            incomplete,
            over,
          })}
        </p>
      </div>
    </div>
  );
};
