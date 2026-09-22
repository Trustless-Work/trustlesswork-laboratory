"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatRoleLabel } from "@/features/escrow-lab/helpers/role.helper";
import { EscrowRoleAddressList } from "@/features/escrow-lab/ui/operate/EscrowRoleAddressList";
import { EscrowTrustlineField } from "@/features/escrow-lab/ui/operate/EscrowTrustlineField";

const ROLE_LIST_FIELDS = [
  {
    key: "approvers",
    minCount: 1,
    required: true,
  },
  {
    key: "serviceProviders",
    minCount: 1,
    required: true,
  },
  {
    key: "releaseSigners",
    minCount: 1,
    required: true,
  },
  {
    key: "disputeResolvers",
    minCount: 1,
    required: true,
  },
  {
    key: "observers",
    minCount: 0,
    required: false,
  },
] as const;

export const IdentityFields = <T extends FieldValues>({
  form,
}: {
  form: UseFormReturn<T>;
}) => (
  <>
    <FormField
      control={form.control}
      name={"engagementId" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Engagement ID</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={String(field.value ?? "")}
              placeholder="ENG-abc123…"
              autoComplete="off"
              spellCheck={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={"title" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel required>Title</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={String(field.value ?? "")}
              placeholder="Website redesign…"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={"description" as Path<T>}
      render={({ field }) => (
        <FormItem className="md:col-span-2">
          <FormLabel required>Description</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={String(field.value ?? "")}
              placeholder="Scope of work…"
              rows={2}
              className="min-h-16"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export const TermsFields = <T extends FieldValues>({
  form,
  isSingle,
}: {
  form: UseFormReturn<T>;
  isSingle: boolean;
}) => (
  <div className="flex flex-col gap-3">
    <div
      className={
        isSingle ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-1"
      }
    >
      {isSingle ? (
        <FormField
          control={form.control}
          name={"amount" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  step="any"
                  value={Number(field.value ?? 0)}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="500…"
                  className="tabular-nums"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
      <FormField
        control={form.control}
        name={"platformFee" as Path<T>}
        render={({ field }) => (
          <FormItem className={isSingle ? undefined : "sm:max-w-xs"}>
            <FormLabel required>Platform fee (%)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={0}
                step="any"
                value={Number(field.value ?? 0)}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="2…"
                className="tabular-nums"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <EscrowTrustlineField
      form={form}
      addressName={"trustline.address" as Path<T>}
      symbolName={"trustline.symbol" as Path<T>}
      isCustomName={"trustlineIsCustom" as Path<T>}
      switchId="deploy-trustline-custom"
    />
  </div>
);

export const RolesFields = <T extends FieldValues>({
  form,
  isSingle,
}: {
  form: UseFormReturn<T>;
  isSingle: boolean;
}) => (
  <section className="flex flex-col gap-3">
    <div>
      <h3 className="text-sm font-medium">Roles</h3>
      <p className="text-xs text-muted-foreground">
        Stellar addresses for each operational role. List roles support up to 5
        addresses.
      </p>
    </div>
    <div className="rounded-xl border border-border p-3 sm:p-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {(
          [
            "admin",
            "platform",
            ...(isSingle ? (["receiver"] as const) : []),
          ] as const
        ).map((key) => (
          <FormField
            key={key}
            control={form.control}
            name={`roles.${key}` as Path<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{formatRoleLabel(key)}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={String(field.value ?? "")}
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
        ))}
        {ROLE_LIST_FIELDS.map((item) => (
          <EscrowRoleAddressList
            key={item.key}
            form={form}
            name={`roles.${item.key}` as Path<T>}
            label={formatRoleLabel(item.key)}
            minCount={item.minCount}
            required={item.required}
          />
        ))}
      </div>
    </div>
  </section>
);
