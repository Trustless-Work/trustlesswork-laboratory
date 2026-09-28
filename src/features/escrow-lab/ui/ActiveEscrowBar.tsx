"use client";

import { RefreshCwIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddressChip } from "@/components/shared/AddressChip";
import {
  getTypeIcon,
  normalizeEscrowType,
} from "@/features/escrow-lab/constants/icons";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { EscrowConnectedRoleBadges } from "@/features/escrow-lab/ui/EscrowConnectedRoleBadges";
import { EscrowExplorerLinks } from "@/features/escrow-lab/ui/EscrowExplorerLinks";
import { useActiveEscrow } from "@/features/escrow-lab/hooks/useActiveEscrow";

export const ActiveEscrowBar = () => {
  const { escrow, escrowId, isFetching, refetch, unloadEscrow } =
    useActiveEscrow();

  if (!escrowId || !escrow) return null;

  const type = normalizeEscrowType(escrow.type);
  const typeLabel =
    type === "multi-release" ? "Multi Release" : "Single Release";

  return (
    <div className="sticky top-24 z-30 border-b border-border bg-background/80 backdrop-blur-md md:top-16">
      <div className="mx-auto flex w-full max-w-7xl items-start gap-2 px-3 py-2.5 md:items-center md:gap-6 md:px-8 md:py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className="w-fit gap-1.5">
              <Icon icon={getTypeIcon(type)} className="size-3.5" />
              {typeLabel}
            </Badge>
            <EscrowExplorerLinks contractId={escrow.contractId} />
          </div>

          <Separator
            orientation="vertical"
            className="hidden h-5 shrink-0 md:block"
          />

          <AddressChip address={escrow.contractId} chars={4} />
          <EscrowConnectedRoleBadges escrow={escrow} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh escrow"
              >
                <RefreshCwIcon
                  className={
                    isFetching
                      ? "animate-spin motion-reduce:animate-none"
                      : undefined
                  }
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={unloadEscrow}
                aria-label="Unload escrow"
              >
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unload</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
