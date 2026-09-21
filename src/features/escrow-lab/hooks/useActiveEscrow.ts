"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EscrowType, LabTab } from "@/types";
import { normalizeEscrowType } from "@/features/escrow-lab/constants/icons";
import { useEscrowDetail } from "@/features/escrow-lab/hooks/useEscrowReads";

const TABS: LabTab[] = ["deploy", "operate"];

function isLabTab(value: string | null): value is LabTab {
  return value !== null && (TABS as string[]).includes(value);
}

function isEscrowType(value: string | null): value is EscrowType {
  return value === "single-release" || value === "multi-release";
}

export function useLabUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const type: EscrowType = isEscrowType(searchParams.get("type"))
    ? (searchParams.get("type") as EscrowType)
    : "single-release";
  const tab: LabTab = isLabTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as LabTab)
    : "deploy";
  const escrowId = searchParams.get("escrow");

  const setParams = useCallback(
    (patch: { type?: EscrowType; tab?: LabTab; escrow?: string | null }) => {
      const next = new URLSearchParams(searchParams.toString());
      if (patch.type) next.set("type", patch.type);
      if (patch.tab) next.set("tab", patch.tab);
      if (patch.escrow === null) next.delete("escrow");
      else if (patch.escrow !== undefined) next.set("escrow", patch.escrow);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    type,
    tab,
    escrowId,
    setType: (next: EscrowType) => setParams({ type: next }),
    setTab: (next: LabTab) => setParams({ tab: next }),
    setEscrowId: (id: string | null) => setParams({ escrow: id }),
    loadEscrow: (id: string) => setParams({ escrow: id, tab: "operate" }),
  };
}

export function useActiveEscrow() {
  const { escrowId, loadEscrow, setEscrowId, type, setType } = useLabUrlState();
  const query = useEscrowDetail(escrowId);
  const escrow = query.data?.escrow ?? null;

  useEffect(() => {
    if (!escrow) return;
    const nextType = normalizeEscrowType(escrow.type);
    if (nextType !== type) setType(nextType);
  }, [escrow, setType, type]);

  return {
    escrowId,
    escrow,
    detail: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    loadEscrow,
    unloadEscrow: () => setEscrowId(null),
  };
}
