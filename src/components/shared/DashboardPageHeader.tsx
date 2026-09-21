import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

export const DashboardPageHeader = ({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: DashboardPageHeaderProps) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/10 sm:size-14">
              <Icon className="size-5 sm:size-6" />
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            <h1 className="scroll-mt-20 text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      <Separator />
    </div>
  );
};
