"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatConsoleActionLabel,
  formatConsolePhaseLabel,
  formatConsoleTimestamp,
  formatConsoleTypeLabel,
  stringifyConsoleJson,
} from "@/features/escrow-lab/helpers/console-display.helper";
import type { ConsoleEntry } from "@/types";

interface ConsoleEntryDetailsDialogProps {
  entry: ConsoleEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailPanel {
  id: string;
  label: string;
  value: string;
  tone?: "destructive";
}

export const ConsoleEntryDetailsDialog = ({
  entry,
  open,
  onOpenChange,
}: ConsoleEntryDetailsDialogProps) => {
  const panels = useMemo(() => buildPanels(entry), [entry]);
  const defaultTab = panels[0]?.id ?? "empty";
  const [tab, setTab] = useState(defaultTab);

  if (!entry) return null;

  const activeTab = panels.some((panel) => panel.id === tab)
    ? tab
    : defaultTab;
  const activePanel =
    panels.find((panel) => panel.id === activeTab) ?? panels[0] ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && panels[0]) setTab(panels[0].id);
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex h-[min(36rem,85vh)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 gap-1.5 border-b border-border px-4 pt-4 pb-3 pr-12 sm:px-5 sm:pt-5 sm:pr-14">
          <DialogTitle>{formatConsoleActionLabel(entry.action)}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">
                {formatConsoleTypeLabel(entry.type)}
              </Badge>
              <Badge
                variant={entry.phase === "error" ? "destructive" : "outline"}
              >
                {formatConsolePhaseLabel(entry.phase)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatConsoleTimestamp(entry.createdAt)}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {panels.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-8">
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              No payload recorded for this step.
            </p>
          </div>
        ) : (
          <Tabs
            key={entry.id}
            value={activeTab}
            onValueChange={setTab}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5 sm:px-5">
              <TabsList className="h-8 min-w-0 flex-1 justify-start overflow-x-auto">
                {panels.map((panel) => (
                  <TabsTrigger
                    key={panel.id}
                    value={panel.id}
                    className="shrink-0 px-2.5 text-xs sm:px-3 sm:text-sm"
                  >
                    {panel.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {activePanel ? (
                <CopyButton
                  value={activePanel.value}
                  label={`${activePanel.label} copied`}
                  className="shrink-0"
                />
              ) : null}
            </div>

            {panels.map((panel) => (
              <TabsContent
                key={panel.id}
                value={panel.id}
                className="relative mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
              >
                <div className="absolute inset-0 overflow-y-auto overscroll-contain">
                  <pre
                    className={
                      panel.tone === "destructive"
                        ? "p-4 text-xs leading-relaxed break-all whitespace-pre-wrap text-destructive sm:p-5"
                        : "p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-foreground sm:p-5"
                    }
                  >
                    {panel.value}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <DialogFooter className="z-10 mx-0 mb-0 shrink-0 rounded-b-xl">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function buildPanels(entry: ConsoleEntry | null): DetailPanel[] {
  if (!entry) return [];

  const panels: DetailPanel[] = [];

  if (entry.error) {
    panels.push({
      id: "error",
      label: "Error",
      value: entry.error,
      tone: "destructive",
    });
  }
  if (entry.request !== undefined) {
    panels.push({
      id: "request",
      label: "Request",
      value: stringifyConsoleJson(entry.request),
    });
  }
  if (entry.unsignedXdr) {
    panels.push({
      id: "unsigned-xdr",
      label: "Unsigned XDR",
      value: entry.unsignedXdr,
    });
  }
  if (entry.signedXdr) {
    panels.push({
      id: "signed-xdr",
      label: "Signed XDR",
      value: entry.signedXdr,
    });
  }
  if (entry.response !== undefined) {
    panels.push({
      id: "response",
      label: "Response",
      value: stringifyConsoleJson(entry.response),
    });
  }

  return panels;
}
