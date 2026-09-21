"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NoData } from "@/components/shared/NoData";
import { useLabConsole } from "@/features/escrow-lab/hooks/useLabConsole";
import { ConsoleEntryCard } from "@/features/escrow-lab/ui/console/ConsoleEntryCard";
import { ConsoleEntryDetailsDialog } from "@/features/escrow-lab/ui/console/ConsoleEntryDetailsDialog";
import type { ConsoleEntry } from "@/types";

export const TransactionConsole = () => {
  const { entries, isOpen, setOpen, clear } = useLabConsole();
  const [selected, setSelected] = useState<ConsoleEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const openDetails = (entry: ConsoleEntry) => {
    setSelected(entry);
    setDetailsOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto overscroll-contain p-0 data-[side=right]:sm:max-w-xl">
          <SheetHeader className="gap-1 border-b border-border p-4 pr-12 sm:p-5 sm:pr-14">
            <SheetTitle>Transaction console</SheetTitle>
            <SheetDescription>
              Build → sign → submit history. Stored in this browser for 7 days
              (max 40 entries).
            </SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2 sm:px-5">
            <span className="text-xs text-muted-foreground tabular-nums">
              {entries.length} entr{entries.length === 1 ? "y" : "ies"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={entries.length === 0}
              onClick={clear}
            >
              Clear
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
              {entries.length === 0 ? (
                <NoData
                  title="No transactions yet"
                  description="Run a write action to see build, sign, and submit outcomes here."
                />
              ) : (
                entries.map((entry) => (
                  <ConsoleEntryCard
                    key={entry.id}
                    entry={entry}
                    onOpenDetails={openDetails}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ConsoleEntryDetailsDialog
        entry={selected}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </>
  );
};
