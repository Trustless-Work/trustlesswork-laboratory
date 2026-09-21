"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MAX_ROLE_ADDRESS_COUNT } from "@/features/escrow-lab/constants/role-address.constants";
import type { OperateLabFormValues } from "@/features/escrow-lab/schemas/operate.schema";

type RoleListFieldName =
  | "updateApprovers"
  | "updateServiceProviders"
  | "updateReleaseSigners"
  | "updateDisputeResolvers"
  | "updateObservers";

interface EscrowRoleAddressListProps {
  form: UseFormReturn<OperateLabFormValues>;
  name: RoleListFieldName;
  label: string;
  minCount?: number;
  required?: boolean;
}

export const EscrowRoleAddressList = ({
  form,
  name,
  label,
  minCount = 1,
  required = true,
}: EscrowRoleAddressListProps) => {
  const addresses = form.watch(name);
  const list = Array.isArray(addresses) ? addresses : [];
  const atMax = list.length >= MAX_ROLE_ADDRESS_COUNT;
  const lastValue = list[list.length - 1] ?? "";
  const lastFilled = list.length === 0 || lastValue.trim().length > 0;
  const canAdd = !atMax && lastFilled;
  const error = form.formState.errors[name];
  const errorMessage =
    typeof error?.message === "string" ? error.message : undefined;

  function setList(next: string[]) {
    form.setValue(name, next, { shouldDirty: true, shouldTouch: true });
    form.clearErrors(name);
  }

  function updateAddress(index: number, value: string) {
    const next = list.map((item, i) => (i === index ? value : item));
    setList(next);
  }

  function addAddress() {
    if (!canAdd) return;
    setList([...list, ""]);
  }

  function removeAddress(index: number) {
    if (list.length <= minCount) return;
    setList(list.filter((_, i) => i !== index));
  }

  return (
    <FormItem className="sm:col-span-2 lg:col-span-1">
      <FormLabel required={required}>{label}</FormLabel>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No addresses added yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((address, index) => (
            <div key={`${name}-${index}`} className="flex items-center gap-2">
              <FormControl>
                <Input
                  value={address}
                  onChange={(event) =>
                    updateAddress(index, event.target.value)
                  }
                  className="font-mono text-xs"
                  placeholder="G…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </FormControl>
              {list.length > minCount ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground"
                  aria-label={`Remove ${label} address`}
                  onClick={() => removeAddress(index)}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
      {atMax ? (
        <p className="text-xs text-muted-foreground">
          Maximum of {MAX_ROLE_ADDRESS_COUNT} addresses reached.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-fit"
          disabled={!canAdd}
          onClick={addAddress}
        >
          <PlusIcon className="size-3.5" />
          Add address
        </Button>
      )}
      {errorMessage ? <FormMessage>{errorMessage}</FormMessage> : null}
    </FormItem>
  );
};
