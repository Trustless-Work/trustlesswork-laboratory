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
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 md:h-16 md:px-8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="Trustless Work"
            width={28}
            height={24}
            className="h-6 w-auto"
            priority
          />
          <Separator orientation="vertical" className="!h-5" />
          <span className="text-sm font-semibold tracking-tight md:text-base">
            Escrow Lab
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LabApiKeyButton />
          <Button
            type="button"
            variant="outline"
            className="bg-transparent"
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
          <WalletButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
