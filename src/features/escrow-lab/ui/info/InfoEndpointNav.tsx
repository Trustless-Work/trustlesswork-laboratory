"use client";

import { Badge } from "@/components/ui/badge";
import {
  INFO_ENDPOINTS,
  type InfoEndpointId,
} from "@/features/escrow-lab/constants/info-endpoints";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { cn } from "@/lib/utils";

interface InfoEndpointNavProps {
  selected: InfoEndpointId;
  onSelect: (id: InfoEndpointId) => void;
}

export const InfoEndpointNav = ({
  selected,
  onSelect,
}: InfoEndpointNavProps) => (
  <nav
    aria-label="Escrow information endpoints"
    className="flex flex-col gap-1"
  >
    {INFO_ENDPOINTS.map((endpoint) => {
      const isActive = endpoint.id === selected;
      return (
        <button
          key={endpoint.id}
          type="button"
          onClick={() => onSelect(endpoint.id)}
          className={cn(
            "flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-3.5 text-left transition-colors",
            isActive
              ? "bg-muted ring-1 ring-foreground/10"
              : "hover:bg-muted/50",
          )}
        >
          <Icon
            icon={endpoint.icon}
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium">{endpoint.title}</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {endpoint.method}
              </Badge>
            </div>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {endpoint.corePath}
            </p>
          </div>
        </button>
      );
    })}
  </nav>
);
