"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearLabApiKey,
  getLabApiKey,
  setLabApiKey,
} from "@/features/escrow-lab/lib/lab-api-key";
import { useHydrated } from "@/hooks/useHydrated";

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

function getServerSnapshot(): string | null {
  return null;
}

export function useLabApiKey() {
  const apiKey = useSyncExternalStore(
    subscribe,
    getLabApiKey,
    getServerSnapshot,
  );
  const hydrated = useHydrated();

  const save = useCallback((value: string) => {
    setLabApiKey(value);
    emit();
  }, []);

  const clear = useCallback(() => {
    clearLabApiKey();
    emit();
  }, []);

  return {
    apiKey,
    hasKey: Boolean(apiKey),
    hydrated,
    save,
    clear,
  };
}
