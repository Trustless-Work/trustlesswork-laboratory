"use client";

import { useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type ColorMode,
  type DefaultEdgeOptions,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { LifecycleFlowModel } from "@/features/escrow-lab/helpers/lifecycle-flow.helper";
import {
  LifecycleFlowNode,
  type LifecycleFlowRfNode,
} from "@/features/escrow-lab/ui/operate/lifecycle/LifecycleFlowNode";
import type { LabWriteAction } from "@/types";
import { cn } from "@/lib/utils";

const nodeTypes = {
  lifecycle: LifecycleFlowNode,
} satisfies NodeTypes;

type LifecycleEdge = Edge & {
  type: "straight" | "smoothstep";
  pathOptions?: { borderRadius?: number; offset?: number };
};

const defaultEdgeOptions = {
  type: "smoothstep",
  pathOptions: { borderRadius: 16, offset: 36 },
} satisfies DefaultEdgeOptions & Pick<LifecycleEdge, "pathOptions">;

type LifecycleViewport = "fit" | "deploy";

interface LifecycleFlowCanvasProps {
  model: LifecycleFlowModel;
  className?: string;
  showControls?: boolean;
  viewport?: LifecycleViewport;
  onNodeAction?: (action: LabWriteAction) => void;
}

function toRfNodes(model: LifecycleFlowModel): LifecycleFlowRfNode[] {
  return model.nodes.map((node) => ({
    id: node.id,
    type: "lifecycle",
    position: node.def.position,
    data: {
      title: node.def.title,
      roleLabel: node.def.roleLabel,
      description: node.def.description,
      status: node.status,
      detail: node.detail,
      action: node.def.action,
      interactive: node.def.action !== null,
    },
    draggable: false,
    connectable: false,
    selectable: node.def.action !== null,
  }));
}

function isAxisAligned(
  edge: LifecycleFlowModel["edges"][number],
  model: LifecycleFlowModel,
): boolean {
  const source = model.nodes.find((node) => node.id === edge.source);
  const target = model.nodes.find((node) => node.id === edge.target);
  if (!source || !target) return false;
  const dx = Math.abs(source.def.position.x - target.def.position.x);
  const dy = Math.abs(source.def.position.y - target.def.position.y);
  return dx < 24 || dy < 24;
}

function toRfEdges(model: LifecycleFlowModel): LifecycleEdge[] {
  const statusById = Object.fromEntries(
    model.nodes.map((node) => [node.id, node.status]),
  );

  return model.edges.map((edge) => {
    const targetStatus = statusById[edge.target];
    const sourceStatus = statusById[edge.source];
    const pathActive =
      targetStatus === "current" ||
      targetStatus === "disputed" ||
      (sourceStatus === "done" && targetStatus === "done");

    const isDisputeEdge =
      edge.target === "dispute" ||
      edge.source === "dispute" ||
      edge.target === "resolve-dispute";

    const stroke =
      targetStatus === "disputed" ||
      (isDisputeEdge && targetStatus === "current")
        ? "var(--destructive)"
        : pathActive
          ? "var(--primary)"
          : "color-mix(in oklab, var(--muted-foreground) 45%, transparent)";

    const aligned = isAxisAligned(edge, model);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: aligned ? "straight" : "smoothstep",
      animated: targetStatus === "current",
      pathOptions: aligned ? undefined : { borderRadius: 12, offset: 24 },
      style: {
        stroke,
        strokeWidth: pathActive ? 2 : 1.5,
        strokeDasharray: edge.kind === "branch" ? "7 5" : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: stroke,
      },
    } satisfies LifecycleEdge;
  });
}

const DEPLOY_ZOOM = 0.9;

const FitViewOnModel = ({ modelKey }: { modelKey: string }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void fitView({ padding: 0.22, duration: 220, maxZoom: 0.95 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, modelKey]);

  return null;
};

const FocusDeploy = () => {
  const { getNode, setCenter } = useReactFlow();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const node = getNode("deploy");
      if (!node) return;
      const width = node.measured?.width ?? 220;
      const height = node.measured?.height ?? 148;
      void setCenter(node.position.x + width / 2, node.position.y + height / 2, {
        zoom: DEPLOY_ZOOM,
        duration: 0,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [getNode, setCenter]);

  return null;
};

const LifecycleFlowCanvasInner = ({
  model,
  className,
  showControls = false,
  viewport = "fit",
  onNodeAction,
}: LifecycleFlowCanvasProps) => {
  const { resolvedTheme } = useTheme();
  const colorMode: ColorMode = resolvedTheme === "dark" ? "dark" : "light";
  const focusDeploy = viewport === "deploy";
  const initialNodes = useMemo(() => toRfNodes(model), [model]);
  const initialEdges = useMemo(() => toRfEdges(model), [model]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(toRfNodes(model));
    setEdges(toRfEdges(model));
  }, [model, setEdges, setNodes]);

  const modelKey = `${model.type}:${model.currentNodeId ?? "none"}:${model.nodes
    .map((n) => `${n.id}:${n.status}:${n.detail ?? ""}`)
    .join("|")}`;

  return (
    <div className={cn("h-full w-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        minZoom={0.25}
        maxZoom={1.25}
        colorMode={colorMode}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={(_event, node) => {
          const action = (node.data as LifecycleFlowRfNode["data"]).action;
          if (action && onNodeAction) onNodeAction(action);
        }}
        fitView={!focusDeploy}
        fitViewOptions={{ padding: 0.22, maxZoom: 0.95 }}
        defaultViewport={
          focusDeploy ? { x: 48, y: 72, zoom: DEPLOY_ZOOM } : undefined
        }
      >
        <Background
          id="lifecycle-dots"
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          bgColor="transparent"
        />
        {showControls ? (
          <Controls
            showInteractive={false}
            className="!overflow-hidden !rounded-lg !border-0 !bg-card !shadow-sm !ring-1 !ring-foreground/10 [&>button]:!border-border [&>button]:!bg-card [&>button]:!fill-foreground"
          />
        ) : null}
        {focusDeploy ? <FocusDeploy /> : <FitViewOnModel modelKey={modelKey} />}
      </ReactFlow>
    </div>
  );
};

export const LifecycleFlowCanvas = (props: LifecycleFlowCanvasProps) => (
  <ReactFlowProvider>
    <LifecycleFlowCanvasInner {...props} />
  </ReactFlowProvider>
);
