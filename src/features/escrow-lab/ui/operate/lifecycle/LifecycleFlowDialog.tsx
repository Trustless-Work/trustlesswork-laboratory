"use client";

import dynamic from "next/dynamic";
import type { LucideIcon } from "lucide-react";
import {
  BanIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  InfoIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { LiveStatusDot } from "@/components/shared/LiveStatusDot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  lifecycleFlowNodeStatusLabel,
  type LifecycleFlowModel,
  type LifecycleFlowNodeStatus,
} from "@/features/escrow-lab/helpers/lifecycle-flow.helper";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { cn } from "@/lib/utils";
import type { LabWriteAction } from "@/types";

const LifecycleFlowCanvas = dynamic(
  () =>
    import("@/features/escrow-lab/ui/operate/lifecycle/LifecycleFlowCanvas").then(
      (mod) => mod.LifecycleFlowCanvas,
    ),
  { ssr: false },
);

interface LifecycleFlowDialogProps {
  model: LifecycleFlowModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNodeAction: (action: LabWriteAction) => void;
}

const LEGEND: LifecycleFlowNodeStatus[] = [
  "current",
  "done",
  "upcoming",
  "disputed",
  "closed",
];

export const LifecycleFlowDialog = ({
  model,
  open,
  onOpenChange,
  onNodeAction,
}: LifecycleFlowDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85vh,52rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 gap-1.5 border-b border-border px-4 pt-4 pb-3 pr-12 sm:px-5 sm:pt-5 sm:pr-14">
          <div className="flex items-center gap-1.5">
            <DialogTitle>Escrow lifecycle</DialogTitle>
            <StatusLegendMenu />
          </div>
          <DialogDescription>{model.caption}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 bg-muted/20">
          {open ? (
            <LifecycleFlowCanvas
              model={model}
              showControls
              onNodeAction={(action) => {
                onOpenChange(false);
                window.setTimeout(() => onNodeAction(action), 120);
              }}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatusLegendMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        aria-label="Status legend"
      >
        <InfoIcon className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52 p-1.5">
      <DropdownMenuLabel className="px-2.5 py-2">
        What each mark means
      </DropdownMenuLabel>
      <ul className="flex flex-col gap-1 px-1 pb-1">
        {LEGEND.map((status) => (
          <li key={status}>
            <LegendItem status={status} />
          </li>
        ))}
      </ul>
    </DropdownMenuContent>
  </DropdownMenu>
);

function legendIcon(status: LifecycleFlowNodeStatus): LucideIcon | null {
  switch (status) {
    case "done":
      return CheckCircle2Icon;
    case "upcoming":
      return CircleDashedIcon;
    case "disputed":
      return ShieldAlertIcon;
    case "closed":
      return BanIcon;
    case "current":
      return null;
  }
}

const LegendItem = ({ status }: { status: LifecycleFlowNodeStatus }) => {
  const icon = legendIcon(status);

  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs",
        status === "done"
          ? "text-emerald-600 dark:text-emerald-400"
          : status === "disputed"
            ? "text-destructive"
            : status === "closed" || status === "upcoming"
              ? "text-muted-foreground"
              : "text-foreground",
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {status === "current" ? (
          <LiveStatusDot className="size-1.5" />
        ) : icon ? (
          <Icon icon={icon} className="size-3.5" aria-hidden />
        ) : null}
      </span>
      <span className="font-medium">{lifecycleFlowNodeStatusLabel(status)}</span>
    </span>
  );
};
