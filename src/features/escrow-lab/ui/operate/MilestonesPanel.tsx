"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { NoData } from "@/components/shared/NoData";
import { ResponsiveCopyField } from "@/components/shared/ResponsiveCopyField";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { normalizeEscrowType } from "@/features/escrow-lab/constants/icons";
import {
  getEscrowAssetSymbol,
  parseAmount,
} from "@/features/escrow-lab/helpers/amount.helper";
import { isMilestoneApproved } from "@/features/escrow-lab/helpers/lifecycle.helper";
import { useLinkedAddressHighlight } from "@/features/escrow-lab/hooks/useLinkedAddressHighlight";
import {
  getAddressOccurrenceCounts,
  isSharedEscrowAddress,
} from "@/helpers/address-occurrence.helper";
import type { EscrowSummary } from "@/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

interface MilestonesPanelProps {
  escrow: EscrowSummary;
  milestones: unknown[];
  selected: number[];
  onToggle: (index: number) => void;
}

export const MilestonesPanel = ({
  escrow,
  milestones,
  selected,
  onToggle,
}: MilestonesPanelProps) => {
  const isMulti = normalizeEscrowType(escrow.type) === "multi-release";
  const { getLinkedAddressProps } = useLinkedAddressHighlight();

  const receiverCounts = useMemo(() => {
    if (!isMulti) return new Map<string, number>();

    const receivers = milestones.flatMap((milestone) => {
      const row = asRecord(milestone);
      return typeof row?.receiver === "string" && row.receiver.trim()
        ? [row.receiver.trim()]
        : [];
    });

    return getAddressOccurrenceCounts([{ addresses: receivers }]);
  }, [isMulti, milestones]);

  return (
    <section className="rounded-3xl border border-border bg-card p-4 sm:p-6 lg:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">Milestones</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Select milestones for approve, release, status, and edit actions.
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          {selected.length} selected
        </p>
      </div>
      {milestones.length === 0 ? (
        <div className="mt-6">
          <NoData
            title="No milestones"
            description="Add milestones as admin."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {milestones.map((milestone, index) => {
            const row = asRecord(milestone);
            const approvals = asRecord(row?.approvals);
            const target = Number(approvals?.target ?? 1);
            const count = Number(approvals?.approvalCount ?? 0);
            const pct = target > 0 ? Math.min(100, (count / target) * 100) : 0;
            const checkboxId = `milestone-${index}`;
            const description = String(row?.description ?? "");
            const receiver =
              typeof row?.receiver === "string" && row.receiver.trim()
                ? row.receiver.trim()
                : null;
            const isSelected = selected.includes(index);

            return (
              <div
                key={index}
                className={
                  isSelected
                    ? "flex flex-col gap-2 rounded-2xl border border-primary/40 bg-primary/5 p-3"
                    : "flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-3"
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={isSelected}
                      onCheckedChange={() => onToggle(index)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="flex min-w-0 cursor-pointer flex-col items-start gap-1 font-normal"
                    >
                      <span className="block truncate text-sm font-medium">
                        #{index} {description || "Untitled"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Status: {String(row?.status ?? "pending")}
                      </span>
                    </Label>
                  </div>
                  <Badge
                    variant={
                      isMilestoneApproved(milestone) ? "secondary" : "outline"
                    }
                    className="tabular-nums"
                  >
                    {count}/{target}
                  </Badge>
                </div>
                <Progress value={pct} />
                {isMulti ? (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Amount
                      </span>
                      <UsdcAmount
                        amount={parseAmount(String(row?.amount ?? 0))}
                        symbol={getEscrowAssetSymbol(escrow)}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0">
                      {receiver ? (
                        <ResponsiveCopyField
                          label="Receiver"
                          value={receiver}
                          compact
                          {...getLinkedAddressProps(
                            receiver,
                            isSharedEscrowAddress(receiverCounts, receiver),
                          )}
                        />
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            Receiver
                          </span>
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
