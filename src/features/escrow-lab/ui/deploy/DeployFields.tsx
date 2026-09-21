"use client";

import type { FieldValues, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trustlines } from "@/components/tw-blocks/wallet-kit/trustlines";
import { formatRoleLabel } from "@/features/escrow-lab/helpers/role.helper";

export const IdentityFields = <T extends FieldValues>({
  form,
}: {
  form: UseFormReturn<T>;
}) => (
  <>
    <FormField
      control={form.control}
      name={"engagementId" as never}
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
      name={"title" as never}
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
      name={"description" as never}
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
  <div className="grid gap-3 sm:grid-cols-3">
    {isSingle ? (
      <FormField
        control={form.control}
        name={"amount" as never}
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
      name={"platformFee" as never}
      render={({ field }) => (
        <FormItem>
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
    <FormField
      control={form.control}
      name={"trustline.contractId" as never}
      render={({ field }) => (
        <FormItem className={isSingle ? undefined : "sm:col-span-2"}>
          <FormLabel required>Asset</FormLabel>
          <Select
            value={String(field.value ?? "")}
            onValueChange={(value) => {
              const selected = trustlines.find((t) => t.address === value);
              field.onChange(value);
              form.setValue(
                "trustline.symbol" as never,
                (selected?.symbol ?? "USDC") as never,
              );
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="USDC" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                {trustlines.map((t) => (
                  <SelectItem key={t.address} value={t.address}>
                    {t.symbol}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
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
        Stellar addresses for each operational role.
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
            name={`roles.${key}` as never}
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
        {(
          [
            "approvers",
            "serviceProviders",
            "releaseSigners",
            "disputeResolvers",
          ] as const
        ).map((key) => (
          <FormField
            key={key}
            control={form.control}
            name={`roles.${key}.0` as never}
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
      </div>
    </div>
  </section>
);
