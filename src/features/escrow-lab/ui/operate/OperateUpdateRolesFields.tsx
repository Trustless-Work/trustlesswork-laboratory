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
import { formatRoleLabel } from "@/features/escrow-lab/helpers/role.helper";
import { EscrowRoleAddressList } from "@/features/escrow-lab/ui/operate/EscrowRoleAddressList";

interface OperateUpdateRolesFieldsProps {
  form: UseFormReturn<OperateLabFormValues>;
  isSingle: boolean;
  adminAddress: string;
  platformAddress: string;
}

const LIST_FIELDS = [
  {
    name: "updateApprovers" as const,
    key: "approvers",
    minCount: 1,
    required: true,
  },
  {
    name: "updateServiceProviders" as const,
    key: "serviceProviders",
    minCount: 1,
    required: true,
  },
  {
    name: "updateReleaseSigners" as const,
    key: "releaseSigners",
    minCount: 1,
    required: true,
  },
  {
    name: "updateDisputeResolvers" as const,
    key: "disputeResolvers",
    minCount: 1,
    required: true,
  },
  {
    name: "updateObservers" as const,
    key: "observers",
    minCount: 0,
    required: false,
  },
] as const;

export const OperateUpdateRolesFields = ({
  form,
  isSingle,
  adminAddress,
  platformAddress,
}: OperateUpdateRolesFieldsProps) => (
  <div className="space-y-3 sm:col-span-2">
    <div>
      <h3 className="text-sm font-medium">Roles</h3>
      <p className="text-xs text-muted-foreground">
        Admin and platform are immutable after creation.
      </p>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      <FormItem>
        <FormLabel>Admin</FormLabel>
        <FormControl>
          <Input
            value={adminAddress}
            disabled
            readOnly
            className="font-mono text-xs"
          />
        </FormControl>
        <p className="text-[0.8rem] text-muted-foreground">
          Immutable after creation.
        </p>
      </FormItem>
      <FormItem>
        <FormLabel>Platform</FormLabel>
        <FormControl>
          <Input
            value={platformAddress}
            disabled
            readOnly
            className="font-mono text-xs"
          />
        </FormControl>
        <p className="text-[0.8rem] text-muted-foreground">
          Immutable after creation.
        </p>
      </FormItem>
      {isSingle ? (
        <FormField
          control={form.control}
          name="updateReceiver"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{formatRoleLabel("receiver")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="font-mono text-xs"
                  placeholder="G…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
      {LIST_FIELDS.map((item) => (
        <EscrowRoleAddressList
          key={item.name}
          form={form}
          name={item.name}
          label={formatRoleLabel(item.key)}
          minCount={item.minCount}
          required={item.required}
        />
      ))}
    </div>
  </div>
);
