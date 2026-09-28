"use client";

import { useMemo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { OverviewStat, UsdcAmountStat } from "@/components/shared/UsdcAmount";
import { ResponsiveCopyField } from "@/components/shared/ResponsiveCopyField";
import { ESCROW_ROLE_IDS } from "@/features/escrow-lab/constants/escrow-roles.constants";
import {
  getEscrowAssetSymbol,
  getEscrowTotalAmount,
  parseAmount,
} from "@/features/escrow-lab/helpers/amount.helper";
import {
  getLifecycleStage,
  getReleaseProgress,
  lifecycleLabel,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
import { getSnapshotRoleAddresses } from "@/features/escrow-lab/helpers/role.helper";
import { useLinkedAddressHighlight } from "@/features/escrow-lab/hooks/useLinkedAddressHighlight";
import { OperateActivity } from "@/features/escrow-lab/ui/operate/OperateActivity";
import { OperateRoleTile } from "@/features/escrow-lab/ui/operate/OperateRoleTile";
import { getAddressOccurrenceCounts } from "@/helpers/address-occurrence.helper";
import type { EscrowDeposit, EscrowEvent, EscrowSummary } from "@/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function DisputeStatus({
  dispute,
}: {
  dispute: { isDisputed: boolean; resolved: boolean; reason: string };
}) {
  if (dispute.isDisputed) {
    return (
      <div className="flex flex-col gap-1.5">
        <Badge variant="destructive" className="w-fit">
          Open
        </Badge>
        {dispute.reason ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {dispute.reason}
          </p>
        ) : null}
      </div>
    );
  }

  if (dispute.resolved) {
    return (
      <Badge variant="secondary" className="w-fit">
        Resolved
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="w-fit">
      None
    </Badge>
  );
}

interface OperateAsideProps {
  escrow: EscrowSummary;
  dispute: { isDisputed: boolean; resolved: boolean; reason: string };
  events: EscrowEvent[];
  deposits: EscrowDeposit[];
  children?: ReactNode;
}

export const OperateAside = ({
  escrow,
  dispute,
  events,
  deposits,
  children,
}: OperateAsideProps) => {
  const snapshot = asRecord(escrow.snapshot);
  const snapshotRoles = asRecord(snapshot?.roles);
  const { getLinkedAddressProps } = useLinkedAddressHighlight();
  const title =
    typeof snapshot?.title === "string" && snapshot.title.trim()
      ? snapshot.title.trim()
      : "—";
  const engagementId = (() => {
    if (typeof snapshot?.engagementId === "string" && snapshot.engagementId.trim()) {
      return snapshot.engagementId.trim();
    }
    if (typeof escrow.engagementId === "string" && escrow.engagementId.trim()) {
      return escrow.engagementId.trim();
    }
    return "";
  })();

  const roleRows = useMemo(
    () =>
      ESCROW_ROLE_IDS.map((roleId) => ({
        roleId,
        addresses: snapshotRoles
          ? getSnapshotRoleAddresses(snapshotRoles, roleId)
          : [],
      })),
    [snapshotRoles],
  );

  const addressCounts = useMemo(
    () => getAddressOccurrenceCounts(roleRows),
    [roleRows],
  );

  const totalAmount = getEscrowTotalAmount(escrow);
  const stage = getLifecycleStage(escrow);
  const releaseProgress = getReleaseProgress(escrow);
  const assignedWalletCount = roleRows.reduce(
    (sum, row) => sum + row.addresses.length,
    0,
  );

  return (
    <aside className="flex flex-col gap-4 lg:gap-6">
      <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight">Snapshot</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Live escrow identity and balances.
        </p>

        <dl className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            {totalAmount == null ? (
              <OverviewStat label="Total amount" value="Pending" />
            ) : (
              <UsdcAmountStat
                label="Total amount"
                amount={totalAmount}
                symbol={getEscrowAssetSymbol(escrow)}
                size="lg"
                emphasis
              />
            )}
            <UsdcAmountStat
              label="Balance"
              amount={parseAmount(escrow.balance)}
              symbol={getEscrowAssetSymbol(escrow)}
              size="lg"
              emphasis
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="mt-1 flex flex-col items-start gap-1.5">
                <Badge
                  variant={
                    stage === "released" || stage === "resolved"
                      ? "secondary"
                      : stage === "disputed"
                        ? "destructive"
                        : "outline"
                  }
                  className="w-fit"
                >
                  {lifecycleLabel(stage)}
                </Badge>
                {releaseProgress && releaseProgress.total > 0 ? (
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {releaseProgress.released}/{releaseProgress.total} released
                  </p>
                ) : null}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm text-muted-foreground">Dispute</dt>
              <dd className="mt-1">
                <DisputeStatus dispute={dispute} />
              </dd>
            </div>
          </div>
          <OverviewStat label="Title" value={title} />
          <div className="min-w-0">
            {engagementId ? (
              <ResponsiveCopyField
                label="Engagement"
                value={engagementId}
                compact
                maxVisibleChars={24}
                className="gap-1 [&_span]:text-xs"
              />
            ) : (
              <OverviewStat label="Engagement" value="—" />
            )}
          </div>
          <div className="min-w-0 border-t border-border pt-3">
            <ResponsiveCopyField
              label="Contract"
              value={escrow.contractId}
              compact
              maxVisibleChars={20}
              className="gap-1 [&_span]:text-xs"
            />
          </div>
        </dl>
      </section>

      {children}

      <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">Roles</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Assigned wallets. Open a role for help.
            </p>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">
            {assignedWalletCount}{" "}
            {assignedWalletCount === 1 ? "wallet" : "wallets"}
          </p>
        </div>

        <ul className="mt-3 grid grid-cols-1 gap-2">
          {roleRows.map(({ roleId, addresses }) => (
            <OperateRoleTile
              key={roleId}
              roleId={roleId}
              addresses={addresses}
              addressCounts={addressCounts}
              getLinkedAddressProps={getLinkedAddressProps}
            />
          ))}
        </ul>
      </section>

      <OperateActivity
        escrow={escrow}
        events={events}
        deposits={deposits}
        getLinkedAddressProps={getLinkedAddressProps}
        addressCounts={addressCounts}
      />
    </aside>
  );
};
