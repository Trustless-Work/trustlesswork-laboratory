"use client";

import { useState } from "react";
import {
  getInfoEndpoint,
  type InfoEndpointId,
} from "@/features/escrow-lab/constants/info-endpoints";
import { useLabUrlState } from "@/features/escrow-lab/hooks/useActiveEscrow";
import { useLabApiKey } from "@/features/escrow-lab/hooks/useLabApiKey";
import { useEscrowFiltersDefaults } from "@/features/escrow-lab/hooks/useEscrowReads";
import { useInfoEndpointRun } from "@/features/escrow-lab/hooks/useInfoEndpointRun";
import { maskApiKey } from "@/features/escrow-lab/lib/lab-api-key";
import { InfoEndpointDocs } from "@/features/escrow-lab/ui/info/InfoEndpointDocs";
import { InfoEndpointNav } from "@/features/escrow-lab/ui/info/InfoEndpointNav";
import {
  InfoEndpointParams,
  type InfoEndpointFormState,
} from "@/features/escrow-lab/ui/info/InfoEndpointParams";
import { InfoEndpointResult } from "@/features/escrow-lab/ui/info/InfoEndpointResult";
import { InfoSkeleton } from "@/features/escrow-lab/ui/info/InfoSkeleton";

function parseContractIds(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export const InformationTab = () => {
  const { type, escrowId } = useLabUrlState();
  const { apiKey, hasKey, hydrated } = useLabApiKey();
  const listDefaults = useEscrowFiltersDefaults(type);
  const run = useInfoEndpointRun();

  const [selected, setSelected] = useState<InfoEndpointId>("list");
  const [hasRun, setHasRun] = useState(false);
  const [lastRequest, setLastRequest] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [form, setForm] = useState<InfoEndpointFormState>({
    contractId: escrowId ?? "",
    contractIdsText: escrowId ?? "",
    listParams: listDefaults,
    eventParams: { limit: 50, order: "desc" },
  });

  if (!hydrated) return <InfoSkeleton />;

  const endpoint = getInfoEndpoint(selected);
  const maskedApiKey =
    hasKey && apiKey ? maskApiKey(apiKey) : "default env key";

  const handleSelect = (id: InfoEndpointId) => {
    setSelected(id);
    setHasRun(false);
    setLastRequest(null);
    run.reset();
  };

  const handleRun = () => {
    const contractIds = parseContractIds(form.contractIdsText);
    const input = {
      endpoint: selected,
      contractId: form.contractId.trim() || undefined,
      contractIds,
      listParams: form.listParams,
      eventParams: form.eventParams,
    };
    setLastRequest({
      endpoint: selected,
      contractId: input.contractId,
      contractIds,
      listParams: form.listParams,
      eventParams: form.eventParams,
    });
    setHasRun(true);
    run.mutate(input);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
      <aside className="rounded-xl border border-border bg-card/40 p-2 lg:sticky lg:top-32 lg:self-start">
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
          Endpoints
        </p>
        <InfoEndpointNav selected={selected} onSelect={handleSelect} />
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <InfoEndpointDocs endpoint={endpoint} maskedApiKey={maskedApiKey} />
        <InfoEndpointParams
          endpoint={endpoint}
          form={form}
          onChange={setForm}
          onRun={handleRun}
          isPending={run.isPending}
        />
        <InfoEndpointResult
          request={run.data?.request ?? lastRequest}
          response={run.data?.response ?? null}
          error={run.error}
          isPending={run.isPending}
          hasRun={hasRun}
        />
      </div>
    </div>
  );
};
