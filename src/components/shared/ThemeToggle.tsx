"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={
        resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className={cn("relative shrink-0 bg-transparent", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon
        aria-hidden="true"
        className="size-4 scale-100 rotate-0 transition-transform duration-200 ease-out dark:scale-0 dark:-rotate-90"
      />
      <MoonIcon
        aria-hidden="true"
        className="absolute size-4 scale-0 rotate-90 transition-transform duration-200 ease-out dark:scale-100 dark:rotate-0"
      />
    </Button>
  );
};
