"use client";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";
import { useTheme } from "next-themes";
import { stringifyConsoleJson } from "@/features/escrow-lab/helpers/console-display.helper";
import { cn } from "@/lib/utils";

interface JsonCodeBlockProps {
  value: unknown;
  className?: string;
}

function asJsonObject(value: unknown): object | null {
  if (value !== null && typeof value === "object") {
    return value;
  }
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed !== null && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export const JsonCodeBlock = ({ value, className }: JsonCodeBlockProps) => {
  const { resolvedTheme } = useTheme();
  const data = asJsonObject(value);

  if (!data) {
    return (
      <pre
        className={cn(
          "p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-foreground",
          className,
        )}
      >
        {typeof value === "string" ? value : stringifyConsoleJson(value)}
      </pre>
    );
  }

  const theme =
    resolvedTheme === "dark" ? githubDarkTheme : githubLightTheme;

  return (
    <div className={cn("overflow-x-auto p-4", className)}>
      <JsonView
        value={data}
        collapsed={2}
        displayDataTypes={false}
        enableClipboard={false}
        highlightUpdates={false}
        shortenTextAfterLength={120}
        style={{
          ...theme,
          backgroundColor: "transparent",
          fontSize: "12px",
          lineHeight: "1.55",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      />
    </div>
  );
};
