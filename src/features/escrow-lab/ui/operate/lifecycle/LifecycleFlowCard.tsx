"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
} from "lucide-react";
import { LiveStatusDot } from "@/components/shared/LiveStatusDot";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getActionIcon } from "@/features/escrow-lab/constants/icons";
import {
  buildLifecycleFlow,
  lifecycleFlowNodeStatusLabel,
} from "@/features/escrow-lab/helpers/lifecycle-flow.helper";
import {
  getLifecycleStage,
  isActiveLifecycleStage,
  lifecycleLabel,
  lifecycleStageIcon,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
import { scrollToLabAction } from "@/features/escrow-lab/helpers/scroll-to-action.helper";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { LifecycleFlowDialog } from "@/features/escrow-lab/ui/operate/lifecycle/LifecycleFlowDialog";
import { cn } from "@/lib/utils";
import type { EscrowSummary, LabWriteAction } from "@/types";

const LifecycleFlowCanvas = dynamic(
  () =>
    import("@/features/escrow-lab/ui/operate/lifecycle/LifecycleFlowCanvas").then(
      (mod) => mod.LifecycleFlowCanvas,
    ),
  {
    ssr: false,
    loading: () => <LifecycleFlowCanvasSkeleton />,
  },
);

interface LifecycleFlowCardProps {
  escrow: EscrowSummary;
}

export const LifecycleFlowCard = ({ escrow }: LifecycleFlowCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const model = useMemo(() => buildLifecycleFlow(escrow), [escrow]);
  const stage = getLifecycleStage(escrow);
  const stageIcon = lifecycleStageIcon(stage);
  const current = model.nodes.find((node) => node.id === model.currentNodeId);
  const nextActionIcon =
    current?.def.action !== null && current?.def.action !== undefined
      ? getActionIcon(current.def.action)
      : null;

  const handleNodeAction = (action: LabWriteAction) => {
    scrollToLabAction(action);
  };

  return (
    <>
      <section className="rounded-xl bg-card/20 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
            <h2 className="text-sm font-medium">Lifecycle</h2>
            <Separator
              orientation="vertical"
              className="hidden h-4 shrink-0 sm:block"
            />
            <div
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                stage === "disputed"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  stage === "disputed"
                    ? "border-destructive/30 bg-destructive/10"
                    : "border-border bg-card",
                )}
                aria-hidden
              >
                <Icon icon={stageIcon} className="size-3.5" />
              </span>
              <span
                className={cn(
                  "font-medium",
                  stage === "disputed"
                    ? "text-destructive"
                    : "text-foreground",
                )}
              >
                {lifecycleLabel(stage)}
              </span>
              {isActiveLifecycleStage(stage) ? (
                <LiveStatusDot className="size-1.5" />
              ) : null}
            </div>
            {current ? (
              <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <ArrowRightIcon className="size-3 shrink-0" aria-hidden />
                {nextActionIcon ? (
                  <Icon icon={nextActionIcon} className="size-3.5 shrink-0" />
                ) : (
                  <Icon
                    icon={CheckCircle2Icon}
                    className="size-3.5 shrink-0"
                  />
                )}
                <span>
                  Next{" "}
                  <span className="font-medium text-foreground">
                    {current.def.title}
                  </span>
                </span>
              </div>
            ) : (
              <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <Icon icon={CheckCircle2Icon} className="size-3.5 shrink-0" />
                <span className="font-medium text-foreground">Complete</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setDetailsOpen(true)}
            >
              More details
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse lifecycle" : "Expand lifecycle"}
              onClick={() => setExpanded((value) => !value)}
            >
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform",
                  expanded ? "rotate-0" : "-rotate-90",
                )}
              />
            </Button>
          </div>
        </div>

        {expanded ? (
          <div className="border-t border-border">
            <p className="px-4 pt-3 text-xs text-muted-foreground sm:px-5">
              {model.caption} Click a step to jump to its action.
            </p>
            <div className="h-80 w-full sm:h-[22rem]">
              <LifecycleFlowCanvas
                model={model}
                viewport="deploy"
                onNodeAction={handleNodeAction}
              />
            </div>
            {current ? (
              <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
                Current step:{" "}
                <span className="font-medium text-foreground">
                  {current.def.title}
                </span>
                {" · "}
                {lifecycleFlowNodeStatusLabel(current.status)}
                {current.detail ? ` · ${current.detail}` : null}
              </p>
            ) : (
              <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
                Happy path complete for this escrow.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <LifecycleFlowDialog
        model={model}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onNodeAction={handleNodeAction}
      />
    </>
  );
};

const LifecycleFlowCanvasSkeleton = () => (
  <div className="flex h-full w-full items-center justify-center gap-3 p-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-20 w-36 rounded-xl" />
    ))}
  </div>
);

export const LifecycleFlowCardSkeleton = () => (
  <section className="rounded-xl bg-card/20 p-4 ring-1 ring-foreground/10 sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="hidden h-4 w-24 sm:block" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-28 rounded-4xl" />
        <Skeleton className="size-8 rounded-4xl" />
      </div>
    </div>
  </section>
);
