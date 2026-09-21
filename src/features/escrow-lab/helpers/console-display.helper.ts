import type { ConsoleEntry, ConsolePhase } from "@/types";

export function formatConsoleActionLabel(
  action: ConsoleEntry["action"],
): string {
  if (action === "submit") return "Submit";
  return action
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatConsoleTypeLabel(type: ConsoleEntry["type"]): string {
  if (type === "shared") return "Shared";
  if (type === "single-release") return "Single Release";
  return "Multi Release";
}

export function formatConsolePhaseLabel(phase: ConsolePhase): string {
  switch (phase) {
    case "build":
      return "Build";
    case "sign":
      return "Sign";
    case "submit":
      return "Submit";
    case "error":
      return "Error";
  }
}

export function formatConsoleTimestamp(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function truncateConsoleText(value: string, max = 96): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export function stringifyConsoleJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function consoleEntryHasDetails(entry: ConsoleEntry): boolean {
  return Boolean(
    entry.request !== undefined ||
    entry.unsignedXdr ||
    entry.signedXdr ||
    entry.response !== undefined ||
    entry.error,
  );
}
