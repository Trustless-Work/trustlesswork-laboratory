"use client";

import { useMemo, useState } from "react";
import { FilePlus2Icon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { NoData } from "@/components/shared/NoData";
import {
  getDispute,
  getMilestones,
} from "@/features/escrow-lab/helpers/lifecycle.helper";
import { normalizeEscrowType } from "@/features/escrow-lab/constants/icons";
import {
  useActiveEscrow,
  useLabUrlState,
} from "@/features/escrow-lab/hooks/useActiveEscrow";
import { useEscrowWrite } from "@/features/escrow-lab/hooks/useEscrowWrite";
import { useOperateForm } from "@/features/escrow-lab/hooks/useOperateForm";
import { OperateActions } from "@/features/escrow-lab/ui/operate/OperateActions";
import { OperateAside } from "@/features/escrow-lab/ui/operate/OperateAside";
import { MilestonesPanel } from "@/features/escrow-lab/ui/operate/MilestonesPanel";
import { OperateSkeleton } from "@/features/escrow-lab/ui/operate/OperatePanels";
import { LifecycleFlowCard } from "@/features/escrow-lab/ui/operate/lifecycle/LifecycleFlowCard";
import { useWalletContext } from "@/providers/WalletProvider";
import type { LabWriteAction } from "@/types";

export const OperateTab = () => {
  const { escrow, escrowId, isLoading } = useActiveEscrow();
  const { setTab } = useLabUrlState();
  const { walletAddress } = useWalletContext();
  const write = useEscrowWrite();
  const form = useOperateForm();
  const [selected, setSelected] = useState<number[]>([]);

  const milestones = useMemo(
    () => (escrow ? getMilestones(escrow) : []),
    [escrow],
  );

  if (isLoading) return <OperateSkeleton />;

  if (!escrow || !escrowId) {
    return (
      <NoData
        icon={FilePlus2Icon}
        title="Deploy an escrow first"
        description="This lab works with one escrow at a time — the one you deploy. Go to Deploy to create it, then return here to fund and operate."
        actionLabel="Go to Deploy"
        onAction={() => setTab("deploy")}
      />
    );
  }

  const dispute = getDispute(escrow);

  const toggleIndex = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const run = async (action: LabWriteAction, payload: unknown) => {
    await write.mutateAsync({
      type: normalizeEscrowType(escrow.type),
      action,
      payload,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] xl:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)]">
      <div className="flex min-w-0 flex-col gap-4">
        <LifecycleFlowCard escrow={escrow} />
        <Form {...form}>
          <OperateActions
            form={form}
            escrow={escrow}
            walletAddress={walletAddress}
            selected={selected}
            isPending={write.isPending}
            onRun={run}
          />
        </Form>
      </div>
      <div className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100svh-9rem)] lg:overflow-y-auto lg:overscroll-contain">
        <OperateAside escrow={escrow} dispute={dispute}>
          <MilestonesPanel
            escrow={escrow}
            milestones={milestones}
            selected={selected}
            onToggle={toggleIndex}
          />
        </OperateAside>
      </div>
    </div>
  );
};
