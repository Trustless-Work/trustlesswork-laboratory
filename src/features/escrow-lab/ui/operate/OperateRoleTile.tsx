"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ResponsiveCopyField } from "@/components/shared/ResponsiveCopyField";
import {
  ESCROW_ROLE_META,
  getEscrowRoleHelpHref,
  type EscrowRoleId,
} from "@/features/escrow-lab/constants/escrow-roles.constants";
import { useLinkedAddressHighlight } from "@/features/escrow-lab/hooks/useLinkedAddressHighlight";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { isSharedEscrowAddress } from "@/helpers/address-occurrence.helper";

type LinkedAddressProps = ReturnType<
  ReturnType<typeof useLinkedAddressHighlight>["getLinkedAddressProps"]
>;

interface OperateRoleTileProps {
  roleId: EscrowRoleId;
  addresses: readonly string[];
  addressCounts: ReadonlyMap<string, number>;
  getLinkedAddressProps: (
    address: string,
    isShared: boolean,
  ) => LinkedAddressProps;
}

export const OperateRoleTile = ({
  roleId,
  addresses,
  addressCounts,
  getLinkedAddressProps,
}: OperateRoleTileProps) => {
  const { icon, label } = ESCROW_ROLE_META[roleId];

  return (
    <li className="min-w-0 rounded-xl border border-border bg-muted/30 p-2.5">
      <div className="flex items-start gap-2">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"
          aria-hidden
        >
          <Icon icon={icon} className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h3 className="text-xs font-medium tracking-tight">
              <Link
                href={getEscrowRoleHelpHref(roleId)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {label}
              </Link>
            </h3>
            <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">
              {addresses.length}
            </Badge>
          </div>
          <ul className="mt-1.5 flex min-w-0 flex-col gap-1.5">
            {addresses.length === 0 ? (
              <li className="text-[11px] text-muted-foreground">None</li>
            ) : (
              addresses.map((address) => {
                const isShared = isSharedEscrowAddress(addressCounts, address);
                return (
                  <li key={`${roleId}-${address}`} className="min-w-0">
                    <ResponsiveCopyField
                      value={address}
                      compact
                      maxVisibleChars={18}
                      {...getLinkedAddressProps(address, isShared)}
                    />
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </li>
  );
};
