"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { EscrowRoleId } from "@/features/escrow-lab/constants/escrow-roles.constants";
import { ActionPermissionIcons } from "@/features/escrow-lab/ui/operate/ActionPermissionIcons";
import type { LabWriteAction } from "@/types";

interface ActionCardProps {
  title: string;
  description: string;
  action: LabWriteAction;
  roles?: readonly EscrowRoleId[];
  anyDepositor?: boolean;
  children?: ReactNode;
  onSubmit: () => Promise<void>;
  disabledReason?: string;
  loading?: boolean;
}

export const ActionCard = ({
  title,
  description,
  action,
  roles = [],
  anyDepositor = false,
  children,
  onSubmit,
  disabledReason,
  loading,
}: ActionCardProps) => {
  const [open, setOpen] = useState(false);
  const blocked = Boolean(disabledReason);
  const disabled = blocked || loading;
  const contentId = `action-${action}-content`;
  const expanded = open && !blocked;

  const toggle = () => {
    if (blocked) return;
    setOpen((prev) => !prev);
  };

  return (
    <section
      data-action={action}
      className="rounded-xl bg-card/20 ring-1 ring-foreground/10"
    >
      <div
        role="button"
        tabIndex={blocked ? -1 : 0}
        aria-expanded={expanded}
        aria-controls={contentId}
        aria-disabled={blocked || undefined}
        onClick={toggle}
        onKeyDown={(event) => {
          if (blocked) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
        className={cn(
          "rounded-xl p-4 text-left transition-colors",
          blocked
            ? "cursor-not-allowed opacity-80"
            : "cursor-pointer hover:bg-muted/30",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-pretty text-sm font-medium">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ActionPermissionIcons
              roles={roles}
              anyDepositor={anyDepositor}
            />
            {disabledReason ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                    aria-label={disabledReason}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <LockIcon className="size-3.5" aria-hidden />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {disabledReason}
                </TooltipContent>
              </Tooltip>
            ) : (
              <ChevronDownIcon
                aria-hidden
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                  expanded && "rotate-180",
                )}
              />
            )}
          </div>
        </div>
      </div>
      <div
        id={contentId}
        data-state={expanded ? "open" : "closed"}
        aria-hidden={!expanded}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            inert={!expanded ? true : undefined}
            className={cn(
              "border-t border-border px-4 pb-4 pt-3 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              expanded ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {children ? (
              <div className="mb-3 flex flex-col gap-3">{children}</div>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => void onSubmit()}
              >
                {loading ? "Working…" : title}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export function gateReason(
  result: { allowed: true } | { allowed: false; reason: string },
): string | undefined {
  return result.allowed ? undefined : result.reason;
}
