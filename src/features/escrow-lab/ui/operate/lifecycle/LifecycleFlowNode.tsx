"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import {
  BanIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  FilePlus2Icon,
  ShieldAlertIcon,
} from "lucide-react";
import { LiveStatusDot } from "@/components/shared/LiveStatusDot";
import { getActionIcon } from "@/features/escrow-lab/constants/icons";
import {
  lifecycleFlowNodeStatusLabel,
  type LifecycleFlowNodeId,
  type LifecycleFlowNodeStatus,
} from "@/features/escrow-lab/helpers/lifecycle-flow.helper";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import { cn } from "@/lib/utils";
import type { LabWriteAction } from "@/types";

export type LifecycleFlowRfNodeData = {
  title: string;
  roleLabel: string;
  description: string;
  status: LifecycleFlowNodeStatus;
  detail?: string;
  action: LabWriteAction | null;
  interactive: boolean;
};

export type LifecycleFlowRfNode = Node<LifecycleFlowRfNodeData, "lifecycle">;

const handleClass =
  "!size-2 !border-border !bg-card !opacity-0 !ring-0 hover:!opacity-100";

export const LifecycleFlowNode = ({
  data,
  selected,
}: NodeProps<LifecycleFlowRfNode>) => {
  const ActionIcon =
    data.action !== null ? getActionIcon(data.action) : FilePlus2Icon;

  return (
    <div
      className={cn(
        "w-[220px] rounded-xl bg-card/20 p-3 ring-1 ring-foreground/10 transition-opacity",
        data.status === "upcoming" && "opacity-55",
        data.status === "closed" && "opacity-40",
        data.status === "current" && "ring-primary/40",
        data.status === "disputed" && "ring-destructive/30",
        selected && "ring-primary/50",
        data.interactive && "cursor-pointer",
      )}
    >
      <Handle
        id="t-top"
        type="target"
        position={Position.Top}
        className={handleClass}
        isConnectable={false}
      />
      <Handle
        id="t-left"
        type="target"
        position={Position.Left}
        className={handleClass}
        isConnectable={false}
      />
      <Handle
        id="t-bottom"
        type="target"
        position={Position.Bottom}
        className={handleClass}
        isConnectable={false}
      />

      <div className="flex items-start gap-2">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card"
          aria-hidden
        >
          <Icon icon={ActionIcon} className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-medium leading-tight">{data.title}</p>
            <StatusMark status={data.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{data.roleLabel}</p>
          {data.detail ? (
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              {data.detail}
            </p>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        {data.description}
      </p>

      <Handle
        id="s-top"
        type="source"
        position={Position.Top}
        className={handleClass}
        isConnectable={false}
      />
      <Handle
        id="s-right"
        type="source"
        position={Position.Right}
        className={handleClass}
        isConnectable={false}
      />
      <Handle
        id="s-bottom"
        type="source"
        position={Position.Bottom}
        className={handleClass}
        isConnectable={false}
      />
    </div>
  );
};

function statusIcon(status: LifecycleFlowNodeStatus): LucideIcon | null {
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

const StatusMark = ({ status }: { status: LifecycleFlowNodeStatus }) => {
  const icon = statusIcon(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px]",
        status === "done" && "text-emerald-600 dark:text-emerald-400",
        status === "disputed" && "text-destructive",
        status !== "done" && status !== "disputed" && "text-muted-foreground",
      )}
      title={lifecycleFlowNodeStatusLabel(status)}
    >
      {status === "current" ? (
        <LiveStatusDot className="size-1.5" />
      ) : icon ? (
        <Icon icon={icon} className="size-3 shrink-0" aria-hidden />
      ) : null}
      <span className="sr-only">{lifecycleFlowNodeStatusLabel(status)}</span>
    </span>
  );
};

export type { LifecycleFlowNodeId };
