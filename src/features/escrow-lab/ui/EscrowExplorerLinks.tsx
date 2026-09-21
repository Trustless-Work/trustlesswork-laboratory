"use client";

import Link from "next/link";
import { ScanEyeIcon, TelescopeIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ESCROW_ROUND_ICON_LINK_CLASSNAME,
  getStellarExpertContractUrl,
  getTrustlessWorkViewerUrl,
} from "@/helpers/escrow-explorer.helper";
import { cn } from "@/lib/utils";

interface EscrowExplorerLinksProps {
  contractId: string;
  className?: string;
}

export const EscrowExplorerLinks = ({
  contractId,
  className,
}: EscrowExplorerLinksProps) => {
  return (
    <div className={cn("flex shrink-0 items-center gap-1.5", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={getStellarExpertContractUrl(contractId)}
            target="_blank"
            rel="noopener noreferrer"
            className={ESCROW_ROUND_ICON_LINK_CLASSNAME}
            aria-label="View on Stellar Expert"
          >
            <TelescopeIcon className="size-3.5" aria-hidden />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Stellar Expert</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={getTrustlessWorkViewerUrl(contractId)}
            target="_blank"
            rel="noopener noreferrer"
            className={ESCROW_ROUND_ICON_LINK_CLASSNAME}
            aria-label="View on Trustless Work Viewer"
          >
            <ScanEyeIcon className="size-3.5" aria-hidden />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Trustless Work Viewer</TooltipContent>
      </Tooltip>
    </div>
  );
};
