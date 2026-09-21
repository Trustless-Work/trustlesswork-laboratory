import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-card/20 p-4 shadow-none ring-1 ring-foreground/10 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
};
