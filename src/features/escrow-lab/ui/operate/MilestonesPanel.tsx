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
import {
  getReleaseProgress,
  isMilestoneApproved,
  isMilestoneReleased,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
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
  onSelectAll: (selected: boolean) => void;
}

export const MilestonesPanel = ({
  escrow,
  milestones,
  selected,
  onToggle,
  onSelectAll,
}: MilestonesPanelProps) => {
  const isMulti = normalizeEscrowType(escrow.type) === "multi-release";
  const releaseProgress = getReleaseProgress(escrow);
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

  const allSelected =
    milestones.length > 0 &&
    milestones.every((_, index) => selected.includes(index));
  const someSelected =
    !allSelected && selected.some((index) => index >= 0 && index < milestones.length);

  return (
    <section className="rounded-3xl border border-border bg-card p-4 sm:p-6 lg:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">Milestones</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {isMulti
              ? releaseProgress && releaseProgress.total > 0
                ? `${releaseProgress.released}/${releaseProgress.total} released. Select milestones to approve, release, or update.`
                : "Select milestones to approve, release, or update."
              : "Approve each milestone here. Release happens once, for the whole escrow, after every milestone is approved."}
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
          <div className="flex items-center gap-2 px-3">
            <Checkbox
              id="milestones-select-all"
              checked={
                allSelected ? true : someSelected ? "indeterminate" : false
              }
              onCheckedChange={(value) => onSelectAll(value === true)}
            />
            <Label
              htmlFor="milestones-select-all"
              className="cursor-pointer text-sm font-normal"
            >
              Select all
            </Label>
          </div>
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
            const released = isMilestoneReleased(escrow, milestone);

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
                        {released ? " · Released" : ""}
                      </span>
                    </Label>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {released ? (
                      <Badge variant="secondary">Released</Badge>
                    ) : null}
                    <Badge
                      variant={
                        isMilestoneApproved(milestone) ? "secondary" : "outline"
                      }
                      className="tabular-nums"
                    >
                      {count}/{target}
                    </Badge>
                  </div>
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
