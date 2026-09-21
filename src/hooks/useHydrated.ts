"use client";

import { useEffect, useState } from "react";

/**
 * False during the render that hydrates this component, true afterwards.
 * Local to the component so it stays correct inside Suspense boundaries that
 * hydrate after provider effects have already run.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
