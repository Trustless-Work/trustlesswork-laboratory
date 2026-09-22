"use client";

import { useWatch, type FieldValues, type Path, type PathValue, type UseFormReturn } from "react-hook-form";
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
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";

interface EscrowTrustlineFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  addressName: Path<T>;
  symbolName: Path<T>;
  isCustomName: Path<T>;
  /** When true, platform fee sits in the same 3-col grid (multi layout). */
  showPlatformFee?: boolean;
  platformFeeName?: Path<T>;
  heading?: string;
  switchId?: string;
}

function setField<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>,
  value: string | boolean,
  validate: boolean,
) {
  form.setValue(name, value as PathValue<T, Path<T>>, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: validate,
  });
}

export function normalizeContractIdInput(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase().slice(0, 56);
}

export const EscrowTrustlineField = <T extends FieldValues>({
  form,
  addressName,
  symbolName,
  isCustomName,
  showPlatformFee = false,
  platformFeeName,
  heading,
  switchId = "escrow-trustline-custom",
}: EscrowTrustlineFieldProps<T>) => {
  const isCustom = Boolean(useWatch({ control: form.control, name: isCustomName }));
  const address = String(
    useWatch({ control: form.control, name: addressName }) ?? "",
  );
  const presetValue = trustlineOptions.some((option) => option.value === address)
    ? address
    : undefined;

  function applyPreset(value: string) {
    const selected = trustlineOptions.find((option) => option.value === value);
    setField(form, addressName, value, true);
    setField(form, symbolName, selected?.label ?? "", true);
  }

  function onCustomChange(checked: boolean) {
    setField(form, isCustomName, checked, false);
    if (checked) {
      setField(form, addressName, "", false);
      setField(form, symbolName, "", false);
      form.clearErrors(addressName);
      form.clearErrors(symbolName);
      return;
    }
    const first = trustlineOptions[0];
    setField(form, addressName, first?.value ?? "", true);
    setField(form, symbolName, first?.label ?? "", true);
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
        <Label htmlFor={switchId} className="text-sm">
          Custom Trustline
        </Label>
        <Switch
          id={switchId}
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
        {showPlatformFee && platformFeeName ? (
          <FormField
            control={form.control}
            name={platformFeeName}
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
          name={addressName}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{isCustom ? "Trustline" : "Asset"}</FormLabel>
              {isCustom ? (
                <FormControl>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={String(field.value ?? "")}
                    onChange={(event) =>
                      field.onChange(normalizeContractIdInput(event.target.value))
                    }
                    className="font-mono text-xs"
                    placeholder="C…"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={56}
                  />
                </FormControl>
              ) : (
                <Select
                  value={presetValue}
                  onValueChange={(value) => {
                    field.onChange(value);
                    applyPreset(value);
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
          name={symbolName}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Symbol</FormLabel>
              <FormControl>
                <Input
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={String(field.value ?? "")}
                  onChange={(event) =>
                    field.onChange(event.target.value.toUpperCase().slice(0, 12))
                  }
                  disabled={!isCustom}
                  className="uppercase"
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
