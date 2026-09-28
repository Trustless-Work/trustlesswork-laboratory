"use client";

import Image from "next/image";
import { TerminalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import { useLabConsole } from "@/features/escrow-lab/hooks/useLabConsole";
import { LabApiKeyButton } from "@/features/escrow-lab/ui/LabApiKeyButton";
import { useHydrated } from "@/hooks/useHydrated";

export const LabNavbar = () => {
  const { setOpen, entries } = useLabConsole();
  const hydrated = useHydrated();
  const entryCount = hydrated ? entries.length : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-1.5 gap-y-2 px-3 py-2 md:h-16 md:flex-nowrap md:gap-3 md:px-8 md:py-0">
        <div className="order-1 flex min-w-0 flex-1 items-center gap-2.5 md:order-none md:mr-auto md:flex-none">
          <Image
            src="/icon.png"
            alt="Trustless Work"
            width={28}
            height={24}
            className="h-6 w-auto shrink-0"
            priority
          />
          <Separator orientation="vertical" className="!h-5 shrink-0" />
          <span className="truncate text-sm font-semibold tracking-tight md:text-base">
            Escrow Lab
          </span>
        </div>
        <div className="order-2 shrink-0 md:order-none">
          <LabApiKeyButton />
        </div>
        <div className="order-4 flex w-full min-w-0 items-center gap-1.5 md:order-none md:w-auto">
          <Button
            type="button"
            variant="outline"
            className="shrink-0 bg-transparent"
            aria-label="Open transaction console"
            onClick={() => setOpen(true)}
          >
            <TerminalIcon data-icon="inline-start" aria-hidden="true" />
            <span className="hidden sm:inline">Console</span>
            {entryCount > 0 ? (
              <Badge variant="secondary" className="ml-1 tabular-nums">
                {entryCount}
              </Badge>
            ) : null}
          </Button>
          <WalletButton className="min-w-0 flex-1 shrink md:w-auto md:flex-none" />
        </div>
        <div className="order-3 shrink-0 md:order-none">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
