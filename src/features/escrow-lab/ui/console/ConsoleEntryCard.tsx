"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getActionIcon,
  getTypeIcon,
} from "@/features/escrow-lab/constants/icons";
import {
  consoleEntryHasDetails,
  formatConsoleActionLabel,
  formatConsolePhaseLabel,
  formatConsoleTimestamp,
  formatConsoleTypeLabel,
  stringifyConsoleJson,
  truncateConsoleText,
} from "@/features/escrow-lab/helpers/console-display.helper";
import { Icon } from "@/features/escrow-lab/ui/Icon";
import type { ConsoleEntry } from "@/types";

interface ConsoleEntryCardProps {
  entry: ConsoleEntry;
  onOpenDetails: (entry: ConsoleEntry) => void;
}

export const ConsoleEntryCard = ({
  entry,
  onOpenDetails,
}: ConsoleEntryCardProps) => {
  const preview = getEntryPreview(entry);
  const hasDetails = consoleEntryHasDetails(entry);
  const isError = entry.phase === "error" || Boolean(entry.error);

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-card/20 p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1.5">
              {entry.action !== "submit" ? (
                <Icon
                  icon={getActionIcon(entry.action)}
                  className="size-3.5"
                />
              ) : null}
              {formatConsoleActionLabel(entry.action)}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              {entry.type !== "shared" ? (
                <Icon icon={getTypeIcon(entry.type)} className="size-3.5" />
              ) : null}
              {formatConsoleTypeLabel(entry.type)}
            </Badge>
            <Badge variant={isError ? "destructive" : "outline"}>
              {formatConsolePhaseLabel(entry.phase)}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatConsoleTimestamp(entry.createdAt)}
          </p>
        </div>

        {hasDetails ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => onOpenDetails(entry)}
          >
            More details
          </Button>
        ) : null}
      </div>

      {entry.error ? (
        <p className="rounded-lg bg-destructive/10 px-2.5 py-2 text-sm text-destructive">
          {truncateConsoleText(entry.error, 180)}
        </p>
      ) : null}

      {preview && !entry.error ? (
        <pre className="overflow-hidden rounded-lg border border-border bg-muted/40 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-all">
          {preview}
        </pre>
      ) : null}

      {!hasDetails ? (
        <p className="text-xs text-muted-foreground">
          No payload attached to this step.
        </p>
      ) : null}
    </article>
  );
};

function getEntryPreview(entry: ConsoleEntry): string | null {
  if (entry.response !== undefined) {
    return truncateConsoleText(stringifyConsoleJson(entry.response), 160);
  }
  if (entry.unsignedXdr) {
    return `XDR · ${truncateConsoleText(entry.unsignedXdr, 120)}`;
  }
  if (entry.request !== undefined) {
    return truncateConsoleText(stringifyConsoleJson(entry.request), 160);
  }
  return null;
}
