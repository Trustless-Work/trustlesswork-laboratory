"use client";

import { useSyncExternalStore } from "react";

/**
 * False during SSR and the hydration pass, true afterwards.
 * Local to the component so it stays correct inside Suspense boundaries that
 * hydrate after provider effects have already run.
 */
function subscribe(): () => void {
  return () => {};
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
