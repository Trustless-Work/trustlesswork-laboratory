import type { ConsoleEntry } from "@/types";

export const LAB_CONSOLE_STORAGE_KEY = "tw-lab-console-entries";

/** Keep the session history useful without unbounded growth. */
export const LAB_CONSOLE_MAX_ENTRIES = 40;
export const LAB_CONSOLE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getStorage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === "undefined") return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isConsolePhase(value: unknown): value is ConsoleEntry["phase"] {
  return (
    value === "build" ||
    value === "sign" ||
    value === "submit" ||
    value === "error"
  );
}

function isConsoleAction(value: unknown): value is ConsoleEntry["action"] {
  return typeof value === "string" && value.length > 0;
}

function isConsoleType(value: unknown): value is ConsoleEntry["type"] {
  return (
    value === "single-release" ||
    value === "multi-release" ||
    value === "shared"
  );
}

function parseEntry(value: unknown): ConsoleEntry | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string") return null;
  if (typeof row.createdAt !== "string") return null;
  if (!isConsoleAction(row.action)) return null;
  if (!isConsoleType(row.type)) return null;
  if (!isConsolePhase(row.phase)) return null;

  return {
    id: row.id,
    createdAt: row.createdAt,
    action: row.action,
    type: row.type,
    phase: row.phase,
    request: row.request,
    unsignedXdr:
      typeof row.unsignedXdr === "string" ? row.unsignedXdr : undefined,
    signedXdr: typeof row.signedXdr === "string" ? row.signedXdr : undefined,
    response: row.response,
    error: typeof row.error === "string" ? row.error : undefined,
  };
}

export function pruneConsoleEntries(entries: ConsoleEntry[]): ConsoleEntry[] {
  const cutoff = Date.now() - LAB_CONSOLE_MAX_AGE_MS;
  return entries
    .filter((entry) => {
      const at = Date.parse(entry.createdAt);
      return Number.isFinite(at) && at >= cutoff;
    })
    .slice(0, LAB_CONSOLE_MAX_ENTRIES);
}

export function loadConsoleEntries(): ConsoleEntry[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(LAB_CONSOLE_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries = parsed
      .map(parseEntry)
      .filter((entry): entry is ConsoleEntry => entry !== null);
    return pruneConsoleEntries(entries);
  } catch {
    return [];
  }
}

export function saveConsoleEntries(entries: ConsoleEntry[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const next = pruneConsoleEntries(entries);
    storage.setItem(LAB_CONSOLE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — ignore; in-memory history still works.
  }
}

export function clearConsoleEntries(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(LAB_CONSOLE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
