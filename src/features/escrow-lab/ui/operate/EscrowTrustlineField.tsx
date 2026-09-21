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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  trustlineOptions,
  trustlines,
} from "@/components/tw-blocks/wallet-kit/trustlines";
import type { OperateLabFormValues } from "@/features/escrow-lab/schemas/operate.schema";

interface EscrowTrustlineFieldProps {
  form: UseFormReturn<OperateLabFormValues>;
  /** When true, platform fee sits in the same 3-col grid (multi layout). */
  showPlatformFee?: boolean;
  heading?: string;
}

export const EscrowTrustlineField = ({
  form,
  showPlatformFee = false,
  heading,
}: EscrowTrustlineFieldProps) => {
  const isCustom = Boolean(form.watch("updateTrustlineIsCustom"));

  function setPreset(address: string) {
    const selected = trustlines.find((t) => t.address === address);
    form.setValue("updateTrustlineAddress", address, { shouldDirty: true });
    form.setValue("updateTrustlineSymbol", selected?.symbol ?? "USDC", {
      shouldDirty: true,
    });
  }

  function onCustomChange(checked: boolean) {
    form.setValue("updateTrustlineIsCustom", checked, { shouldDirty: true });
    if (checked) {
      form.setValue("updateTrustlineAddress", "", { shouldDirty: true });
      form.setValue("updateTrustlineSymbol", "", { shouldDirty: true });
      return;
    }
    const first = trustlines[0];
    form.setValue("updateTrustlineAddress", first?.address ?? "", {
      shouldDirty: true,
    });
    form.setValue("updateTrustlineSymbol", first?.symbol ?? "USDC", {
      shouldDirty: true,
    });
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      {heading ? (
        <div>
          <h3 className="text-sm font-medium">{heading}</h3>
          <p className="text-xs text-muted-foreground">
            Platform fee and trustline asset for this escrow.
          </p>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
        <Label htmlFor="update-trustline-custom" className="text-sm">
          Custom trustline
        </Label>
        <Switch
          id="update-trustline-custom"
          checked={isCustom}
          onCheckedChange={onCustomChange}
        />
      </div>
      <div
        className={
          showPlatformFee
            ? "grid gap-3 sm:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2"
        }
      >
        {showPlatformFee ? (
          <FormField
            control={form.control}
            name="updatePlatformFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Fee (%)</FormLabel>
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
        ) : null}
        <FormField
          control={form.control}
          name="updateTrustlineAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Contract address</FormLabel>
              {isCustom ? (
                <FormControl>
                  <Input
                    {...field}
                    className="font-mono text-xs"
                    placeholder="C…"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={56}
                  />
                </FormControl>
              ) : (
                <Select
                  value={String(field.value ?? "")}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setPreset(value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {trustlineOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="updateTrustlineSymbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Symbol</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isCustom}
                  className="tabular-nums"
                  placeholder="USDC"
                  maxLength={12}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
