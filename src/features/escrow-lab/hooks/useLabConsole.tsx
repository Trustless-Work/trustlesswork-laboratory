"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ConsoleEntry, EscrowType, LabWriteAction } from "@/types";
import {
  clearConsoleEntries,
  loadConsoleEntries,
  pruneConsoleEntries,
  saveConsoleEntries,
} from "@/features/escrow-lab/lib/lab-console-storage";

interface LabConsoleContextValue {
  entries: ConsoleEntry[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  pushEntry: (entry: Omit<ConsoleEntry, "id" | "createdAt">) => string;
  updateEntry: (id: string, patch: Partial<ConsoleEntry>) => void;
  clear: () => void;
}

const LabConsoleContext = createContext<LabConsoleContextValue | null>(null);

const EMPTY_ENTRIES: ConsoleEntry[] = [];

let memoryEntries: ConsoleEntry[] | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getClientSnapshot(): ConsoleEntry[] {
  if (memoryEntries === null) {
    memoryEntries = loadConsoleEntries();
  }
  return memoryEntries;
}

function getServerSnapshot(): ConsoleEntry[] {
  return EMPTY_ENTRIES;
}

function writeEntries(next: ConsoleEntry[]): void {
  memoryEntries = pruneConsoleEntries(next);
  saveConsoleEntries(memoryEntries);
  emit();
}

export const LabConsoleProvider = ({ children }: { children: ReactNode }) => {
  const entries = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [isOpen, setOpen] = useState(false);

  const pushEntry = useCallback(
    (entry: Omit<ConsoleEntry, "id" | "createdAt">) => {
      const id = crypto.randomUUID();
      writeEntries([
        {
          ...entry,
          id,
          createdAt: new Date().toISOString(),
        },
        ...getClientSnapshot(),
      ]);
      return id;
    },
    [],
  );

  const updateEntry = useCallback((id: string, patch: Partial<ConsoleEntry>) => {
    writeEntries(
      getClientSnapshot().map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    clearConsoleEntries();
    memoryEntries = [];
    emit();
  }, []);

  return (
    <LabConsoleContext.Provider
      value={{ entries, isOpen, setOpen, pushEntry, updateEntry, clear }}
    >
      {children}
    </LabConsoleContext.Provider>
  );
};

export function useLabConsole() {
  const context = useContext(LabConsoleContext);
  if (!context) {
    throw new Error("useLabConsole must be used within LabConsoleProvider");
  }
  return context;
}

export type ConsoleActionMeta = {
  action: LabWriteAction | "submit";
  type: EscrowType | "shared";
};
