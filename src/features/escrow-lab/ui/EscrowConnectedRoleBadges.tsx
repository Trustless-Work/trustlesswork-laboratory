"use client";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ESCROW_ROLE_META,
  getEscrowRoleHelpHref,
} from "@/features/escrow-lab/constants/escrow-roles.constants";
import { EscrowRoleContext } from "@/features/escrow-lab/helpers/role.helper";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { ESCROW_ROUND_ICON_LINK_CLASSNAME } from "@/helpers/escrow-explorer.helper";
import { useWalletContext } from "@/providers/WalletProvider";
import { cn } from "@/lib/utils";
import type { EscrowSummary } from "@/types";

interface EscrowConnectedRoleBadgesProps {
  escrow: EscrowSummary;
  className?: string;
}

export const EscrowConnectedRoleBadges = ({
  escrow,
  className,
}: EscrowConnectedRoleBadgesProps) => {
  const { walletAddress } = useWalletContext();
  const roleIds = new EscrowRoleContext(
    escrow,
    walletAddress,
  ).getConnectedRoleIds();

  if (roleIds.length === 0) return null;

  return (
    <div
      className={cn("flex shrink-0 flex-wrap items-center gap-1.5", className)}
      aria-label="Your roles on this escrow"
    >
      {roleIds.map((roleId) => {
        const { icon, label } = ESCROW_ROLE_META[roleId];
        return (
          <Tooltip key={roleId}>
            <TooltipTrigger asChild>
              <Link
                href={getEscrowRoleHelpHref(roleId)}
                target="_blank"
                rel="noopener noreferrer"
                className={ESCROW_ROUND_ICON_LINK_CLASSNAME}
                aria-label={`${label} role — view help`}
              >
                <Icon icon={icon} className="size-3.5" aria-hidden />
              </Link>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
