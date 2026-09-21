"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearLabApiKey,
  getLabApiKey,
  setLabApiKey,
} from "@/features/escrow-lab/lib/lab-api-key";

export function useLabApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setApiKeyState(getLabApiKey());
    setHydrated(true);
  }, []);

  const save = useCallback((value: string) => {
    setLabApiKey(value);
    setApiKeyState(getLabApiKey());
  }, []);

  const clear = useCallback(() => {
    clearLabApiKey();
    setApiKeyState(null);
  }, []);

  return {
    apiKey,
    hasKey: Boolean(apiKey),
    hydrated,
    save,
    clear,
  };
}
