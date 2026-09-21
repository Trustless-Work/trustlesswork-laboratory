"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface RoundedTabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface RoundedTabsProps {
  items: RoundedTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  trailing?: ReactNode;
  fullWidth?: boolean;
  "aria-label"?: string;
}

function useSlidingIndicator(activeValue: string, itemsLength: number) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const el = list.querySelector<HTMLElement>(
        `[data-value="${activeValue}"]`,
      );
      if (!el) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeValue, itemsLength]);

  return { listRef, indicator };
}

export const RoundedTabs = ({
  items,
  value,
  onValueChange,
  className,
  trailing,
  fullWidth = false,
  "aria-label": ariaLabel = "Tabs",
}: RoundedTabsProps) => {
  const groupId = useId();
  const { listRef, indicator } = useSlidingIndicator(value, items.length);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "relative flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1",
          fullWidth ? "w-full" : "w-fit",
        )}
      >
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-card shadow-sm ring-1 ring-border transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.value === value;

          return (
            <button
              key={item.value}
              data-value={item.value}
              role="tab"
              type="button"
              aria-selected={isActive}
              id={`${groupId}-${item.value}-tab`}
              onClick={() => onValueChange(item.value)}
              className={cn(
                "relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                fullWidth && "flex-1 justify-center",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      {trailing}
    </div>
  );
};
