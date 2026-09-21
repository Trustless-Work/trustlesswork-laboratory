"use client";

import Link from "next/link";
import { WalletIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ESCROW_ROLE_META,
  getEscrowRoleHelpHref,
  type EscrowRoleId,
} from "@/features/escrow-lab/constants/escrow-roles.constants";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { ESCROW_ROUND_ICON_LINK_CLASSNAME } from "@/helpers/escrow-explorer.helper";

interface ActionPermissionIconsProps {
  roles: readonly EscrowRoleId[];
  anyDepositor?: boolean;
}

export const ActionPermissionIcons = ({
  roles,
  anyDepositor = false,
}: ActionPermissionIconsProps) => {
  if (!anyDepositor && roles.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Roles that can run this action"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {anyDepositor ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={ESCROW_ROUND_ICON_LINK_CLASSNAME}
              aria-label="Any depositor"
            >
              <Icon icon={WalletIcon} className="size-3.5" aria-hidden />
            </span>
          </TooltipTrigger>
          <TooltipContent>Any depositor</TooltipContent>
        </Tooltip>
      ) : null}
      {roles.map((roleId) => {
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
