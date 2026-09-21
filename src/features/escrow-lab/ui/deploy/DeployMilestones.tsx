"use client";

import type {
  FieldValues,
  UseFieldArrayReturn,
  UseFormReturn,
} from "react-hook-form";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NoData } from "@/components/shared/NoData";

export const MilestonesFields = <T extends FieldValues>({
  form,
  milestones,
  isSingle,
  walletAddress,
}: {
  form: UseFormReturn<T>;
  milestones: UseFieldArrayReturn<T, never>;
  isSingle: boolean;
  walletAddress: string | null;
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-medium">Milestones</h3>
        <p className="text-xs text-muted-foreground">
          {isSingle
            ? "Phases before release. Amount is escrow-level."
            : "Each tranche has its own amount and receiver."}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          milestones.append(
            (isSingle
              ? { description: "", approvalsTarget: 1 }
              : {
                  description: "",
                  amount: 1,
                  receiver: walletAddress ?? "",
                  approvalsTarget: 1,
                }) as never,
          )
        }
      >
        <PlusIcon data-icon="inline-start" />
        Add Milestone
      </Button>
    </div>

    {milestones.fields.length === 0 ? (
      <NoData
        className="py-8"
        title="No milestones yet"
        description="Add at least one milestone before deploying."
      />
    ) : (
      <div className="flex flex-col gap-3">
        {milestones.fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-border p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium">Milestone {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={milestones.fields.length <= 1}
                onClick={() => milestones.remove(index)}
                aria-label={`Remove milestone ${index + 1}`}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`milestones.${index}.description` as never}
                render={({ field: f }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel required>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...f}
                        value={String(f.value ?? "")}
                        placeholder={`Phase ${index + 1}…`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isSingle ? (
                <>
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.amount` as never}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel required>Amount</FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            type="number"
                            min={0}
                            step="any"
                            value={Number(f.value ?? 0)}
                            onChange={(e) =>
                              f.onChange(Number(e.target.value))
                            }
                            placeholder="100…"
                            className="tabular-nums"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.receiver` as never}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel required>Receiver</FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            value={String(f.value ?? "")}
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
                </>
              ) : null}
              <FormField
                control={form.control}
                name={`milestones.${index}.approvalsTarget` as never}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Approvals needed</FormLabel>
                    <FormControl>
                      <Input
                        {...f}
                        type="number"
                        min={1}
                        value={Number(f.value ?? 1)}
                        onChange={(e) => f.onChange(Number(e.target.value))}
                        placeholder="1"
                        className="tabular-nums"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);
