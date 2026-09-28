"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDownToLineIcon, ScrollTextIcon } from "lucide-react";
import { NoData } from "@/components/shared/NoData";
import { ResponsiveCopyField } from "@/components/shared/ResponsiveCopyField";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import {
  getEscrowAssetSymbol,
  parseAmount,
} from "@/features/escrow-lab/helpers/amount.helper";
import {
  formatEscrowEventKind,
  getDepositAssetSymbol,
  getEventAmountLabel,
} from "@/features/escrow-lab/helpers/activity.helper";
import { formatConsoleTimestamp } from "@/features/escrow-lab/helpers/console-display.helper";
import { useLinkedAddressHighlight } from "@/features/escrow-lab/hooks/useLinkedAddressHighlight";
import { truncateMiddle } from "@/helpers/truncate-middle.helper";
import { getStellarExpertTransactionUrl } from "@/helpers/escrow-explorer.helper";
import { isSharedEscrowAddress } from "@/helpers/address-occurrence.helper";
import type { EscrowDeposit, EscrowEvent, EscrowSummary } from "@/types";

type LinkedAddressProps = ReturnType<
  ReturnType<typeof useLinkedAddressHighlight>["getLinkedAddressProps"]
>;

interface OperateActivityProps {
  escrow: EscrowSummary;
  events: readonly EscrowEvent[];
  deposits: readonly EscrowDeposit[];
  addressCounts: ReadonlyMap<string, number>;
  getLinkedAddressProps: (
    address: string,
    isShared: boolean,
  ) => LinkedAddressProps;
}

export const OperateActivity = ({
  escrow,
  events,
  deposits,
  addressCounts,
  getLinkedAddressProps,
}: OperateActivityProps) => {
  const fallbackSymbol = getEscrowAssetSymbol(escrow);

  return (
    <>
      <ActivitySection
        title="Events"
        description="Recent on-chain actions for this escrow."
        countLabel={`${events.length}`}
      >
        {events.length === 0 ? (
          <NoData
            icon={ScrollTextIcon}
            title="No events yet"
            description="Initialize, fund, or release to see them here."
            className="mt-3 px-4 py-8"
          />
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {events.map((event) => {
              const amount = getEventAmountLabel(event.payload);
              return (
                <li
                  key={`${event.txHash}-${event.kind}-${event.ledgerSeq}`}
                  className="min-w-0 rounded-xl border border-border bg-muted/30 p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium tracking-tight">
                        {formatEscrowEventKind(event.kind)}
                        {amount ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {amount} {fallbackSymbol}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatConsoleTimestamp(event.ledgerClosedAt)}
                      </p>
                    </div>
                    <TxLink txHash={event.txHash} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ActivitySection>

      <ActivitySection
        title="Deposits"
        description="Funds sent into this escrow."
        countLabel={`${deposits.length}`}
      >
        {deposits.length === 0 ? (
          <NoData
            icon={ArrowDownToLineIcon}
            title="No deposits yet"
            description="Funding this escrow will show up here."
            className="mt-3 px-4 py-8"
          />
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {deposits.map((deposit) => {
              const isShared = isSharedEscrowAddress(
                addressCounts,
                deposit.fromAddress,
              );
              return (
                <li
                  key={`${deposit.txHash ?? deposit.ledgerSeq ?? deposit.fromAddress}-${deposit.amount}`}
                  className="min-w-0 rounded-xl border border-border bg-muted/30 p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <UsdcAmount
                      amount={parseAmount(deposit.amount)}
                      symbol={getDepositAssetSymbol(deposit, fallbackSymbol)}
                      size="sm"
                    />
                    <TxLink txHash={deposit.txHash} />
                  </div>
                  <div className="mt-2 min-w-0">
                    <ResponsiveCopyField
                      label="From"
                      value={deposit.fromAddress}
                      compact
                      maxVisibleChars={18}
                      {...getLinkedAddressProps(deposit.fromAddress, isShared)}
                    />
                  </div>
                  {deposit.ledgerClosedAt ? (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {formatConsoleTimestamp(deposit.ledgerClosedAt)}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </ActivitySection>
    </>
  );
};

const ActivitySection = ({
  title,
  description,
  countLabel,
  children,
}: {
  title: string;
  description: string;
  countLabel: string;
  children: ReactNode;
}) => (
  <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">{countLabel}</p>
    </div>
    {children}
  </section>
);

const TxLink = ({ txHash }: { txHash?: string }) => {
  if (!txHash) return null;

  return (
    <Link
      href={getStellarExpertTransactionUrl(txHash)}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 font-mono text-[11px] text-muted-foreground underline-offset-4 hover:underline"
    >
      {truncateMiddle(txHash, 12)}
    </Link>
  );
};
