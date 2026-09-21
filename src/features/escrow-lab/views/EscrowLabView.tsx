"use client";

import { Suspense } from "react";
import Link from "next/link";
import { FilePlus2Icon, WrenchIcon } from "lucide-react";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { Lights } from "@/components/shared/Lights";
import { RoundedTabs } from "@/components/shared/RoundedTabs";
import { TYPE_ICONS } from "@/features/escrow-lab/constants/icons";
import { getLabHeaderCopy } from "@/features/escrow-lab/constants/lab-copy";
import { LabConsoleProvider } from "@/features/escrow-lab/hooks/useLabConsole";
import { useLabUrlState } from "@/features/escrow-lab/hooks/useActiveEscrow";
import { LabNavbar } from "@/features/escrow-lab/ui/LabNavbar";
import { LabShellSkeleton } from "@/features/escrow-lab/ui/LabShellSkeleton";
import { ActiveEscrowBar } from "@/features/escrow-lab/ui/ActiveEscrowBar";
import { TransactionConsole } from "@/features/escrow-lab/ui/console/TransactionConsole";
import { DeployTab } from "@/features/escrow-lab/ui/deploy/DeployTab";
import { OperateTab } from "@/features/escrow-lab/ui/operate/OperateTab";
import { useHydrated } from "@/hooks/useHydrated";
import type { EscrowType, LabTab } from "@/types";

const EscrowLabContent = () => {
  const { type, tab, setType, setTab } = useLabUrlState();
  const copy = getLabHeaderCopy(tab, type);

  return (
    <div className="relative flex min-h-svh flex-col">
      <Link href="#lab-main" className="skip-link">
        Skip to content
      </Link>
      <Lights />
      <LabNavbar />
      <ActiveEscrowBar />
      <main
        id="lab-main"
        tabIndex={-1}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:min-h-[calc(100svh-4rem)] md:px-8"
      >
        <DashboardPageHeader
          icon={copy.icon}
          title={copy.title}
          description={copy.description}
          actions={
            <RoundedTabs
              aria-label="Escrow type"
              value={type}
              onValueChange={(value) => setType(value as EscrowType)}
              items={[
                {
                  value: "single-release",
                  label: "Single Release",
                  icon: TYPE_ICONS["single-release"],
                },
                {
                  value: "multi-release",
                  label: "Multi Release",
                  icon: TYPE_ICONS["multi-release"],
                },
              ]}
            />
          }
        />

        <RoundedTabs
          aria-label="Lab section"
          value={tab}
          onValueChange={(value) => setTab(value as LabTab)}
          items={[
            { value: "deploy", label: "Deploy", icon: FilePlus2Icon },
            { value: "operate", label: "Operate", icon: WrenchIcon },
          ]}
        />

        {tab === "deploy" ? <DeployTab type={type} /> : null}
        {tab === "operate" ? <OperateTab /> : null}
      </main>
      <TransactionConsole />
    </div>
  );
};

/**
 * The lab is driven entirely by client-only state (wallet, search params, and
 * browser storage), so it mounts after hydration instead of being hydrated
 * against markup that cannot know any of it.
 */
const EscrowLabBody = () => {
  const hydrated = useHydrated();

  if (!hydrated) return <LabShellSkeleton />;

  return <EscrowLabContent />;
};

export const EscrowLabView = () => {
  return (
    <LabConsoleProvider>
      <Suspense fallback={<LabShellSkeleton />}>
        <EscrowLabBody />
      </Suspense>
    </LabConsoleProvider>
  );
};
