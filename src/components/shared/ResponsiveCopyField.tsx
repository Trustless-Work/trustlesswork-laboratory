"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { truncateMiddle } from "@/helpers/truncate-middle.helper";
import { cn } from "@/lib/utils";

type ResponsiveCopyFieldProps = {
  label?: string;
  value: string;
  compact?: boolean;
  className?: string;
  maxVisibleChars?: number;
  highlighted?: boolean;
  linkable?: boolean;
  onLinkHoverStart?: () => void;
  onLinkHoverEnd?: () => void;
};

const AVERAGE_CHARACTER_WIDTH = 7.2;
const COPY_BUTTON_WIDTH = 74;
const COMPACT_COPY_BUTTON_WIDTH = 38;
const HORIZONTAL_PADDING = 32;
const FALLBACK_VISIBLE_CHARS = 18;
const MIN_VISIBLE_CHARS = 13;

function getResponsiveValue(
  value: string,
  width: number,
  compact: boolean,
  maxVisibleChars?: number,
): string {
  if (width <= 0) {
    return truncateMiddle(value, maxVisibleChars ?? FALLBACK_VISIBLE_CHARS);
  }

  const reservedWidth =
    (compact ? COMPACT_COPY_BUTTON_WIDTH : COPY_BUTTON_WIDTH) +
    HORIZONTAL_PADDING;
  const availableWidth = Math.max(width - reservedWidth, 0);
  const availableChars = Math.floor(availableWidth / AVERAGE_CHARACTER_WIDTH);
  const cappedChars =
    maxVisibleChars === undefined
      ? availableChars
      : Math.min(availableChars, maxVisibleChars);

  if (cappedChars >= value.length) {
    return value;
  }

  return truncateMiddle(value, Math.max(cappedChars, MIN_VISIBLE_CHARS));
}

export const ResponsiveCopyField = ({
  label,
  value,
  compact = false,
  className,
  maxVisibleChars,
  highlighted = false,
  linkable = false,
  onLinkHoverStart,
  onLinkHoverEnd,
}: ResponsiveCopyFieldProps) => {
  const chipRef = useRef<HTMLDivElement | null>(null);
  const [chipWidth, setChipWidth] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const element = chipRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setChipWidth(entry.contentRect.width);
    });

    observer.observe(element);
    setChipWidth(element.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const visibleValue = useMemo(
    () => getResponsiveValue(value, chipWidth, compact, maxVisibleChars),
    [chipWidth, compact, maxVisibleChars, value],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        compact && "gap-1.5",
        className,
      )}
    >
      {label ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : null}

      <div
        ref={chipRef}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 border bg-muted/40 transition-colors duration-200",
          compact
            ? "rounded-lg px-2.5 py-1.5 sm:rounded-full sm:px-3"
            : "rounded-xl px-3 py-2 sm:rounded-full sm:px-4 sm:py-3",
          highlighted
            ? "border-dashed border-primary/80 bg-primary/10 ring-1 ring-primary/25"
            : "border-border",
          linkable && "cursor-pointer",
        )}
        onMouseEnter={linkable ? onLinkHoverStart : undefined}
        onMouseLeave={linkable ? onLinkHoverEnd : undefined}
      >
        <code
          className={cn(
            "block min-w-0 flex-1 overflow-hidden whitespace-nowrap font-mono",
            compact ? "text-[11px] leading-none" : "text-xs sm:text-sm",
          )}
          title={value}
        >
          {visibleValue}
        </code>

        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            compact
              ? "size-6 sm:size-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent"
              : "size-8 sm:size-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent",
          )}
          aria-label={label ? `Copy ${label}` : "Copy value"}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? (
            <>
              <CheckIcon
                className={cn("shrink-0", compact ? "size-3.5" : "size-4")}
                aria-hidden="true"
              />
              <span className={cn(compact && "sr-only")}>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon
                className={cn("shrink-0", compact ? "size-3.5" : "size-4")}
                aria-hidden="true"
              />
              <span className={cn(compact && "sr-only")}>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
