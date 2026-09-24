"use client";

import type { ReactNode } from "react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { InfoEndpointDef } from "@/features/escrow-lab/constants/info-endpoints";
import { BATCH_CONTRACT_IDS_MAX } from "@/features/escrow-lab/lib/escrow-query-keys";
import { InfoEndpointListFilters } from "@/features/escrow-lab/ui/info/InfoEndpointListFilters";
import type { ListEscrowEventsParams, ListEscrowsParams } from "@/types";

export interface InfoEndpointFormState {
  contractId: string;
  contractIdsText: string;
  listParams: ListEscrowsParams;
  eventParams: ListEscrowEventsParams;
}

interface InfoEndpointParamsProps {
  endpoint: InfoEndpointDef;
  form: InfoEndpointFormState;
  onChange: (next: InfoEndpointFormState) => void;
  onRun: () => void;
  isPending: boolean;
}

export const InfoEndpointParams = ({
  endpoint,
  form,
  onChange,
  onRun,
  isPending,
}: InfoEndpointParamsProps) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle>Request</CardTitle>
      <CardDescription>
        Build the payload for this endpoint, then run it against the active API
        key.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      {endpoint.needsContractId ? (
        <Field label="contractId" htmlFor="info-contract-id">
          <Input
            id="info-contract-id"
            placeholder="C…"
            value={form.contractId}
            onChange={(event) =>
              onChange({ ...form, contractId: event.target.value })
            }
          />
        </Field>
      ) : null}

      {endpoint.needsContractIds ? (
        <Field
          label={`contractIds (max ${BATCH_CONTRACT_IDS_MAX}, one per line)`}
          htmlFor="info-contract-ids"
        >
          <Textarea
            id="info-contract-ids"
            placeholder={"C…\nC…"}
            rows={4}
            value={form.contractIdsText}
            onChange={(event) =>
              onChange({ ...form, contractIdsText: event.target.value })
            }
          />
        </Field>
      ) : null}

      {endpoint.hasEventParams ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="limit" htmlFor="info-events-limit">
            <Input
              id="info-events-limit"
              type="number"
              min={1}
              max={200}
              value={form.eventParams.limit ?? 50}
              onChange={(event) =>
                onChange({
                  ...form,
                  eventParams: {
                    ...form.eventParams,
                    limit: Number(event.target.value) || undefined,
                  },
                })
              }
            />
          </Field>
          <Field label="order" htmlFor="info-events-order">
            <Select
              value={form.eventParams.order ?? "desc"}
              onValueChange={(value) =>
                onChange({
                  ...form,
                  eventParams: {
                    ...form.eventParams,
                    order: value as "asc" | "desc",
                  },
                })
              }
            >
              <SelectTrigger id="info-events-order" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">asc</SelectItem>
                <SelectItem value="desc">desc</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="cursor" htmlFor="info-events-cursor">
            <Input
              id="info-events-cursor"
              placeholder="optional"
              value={form.eventParams.cursor ?? ""}
              onChange={(event) =>
                onChange({
                  ...form,
                  eventParams: {
                    ...form.eventParams,
                    cursor: event.target.value.trim() || undefined,
                  },
                })
              }
            />
          </Field>
        </div>
      ) : null}

      {endpoint.hasListFilters ? (
        <InfoEndpointListFilters
          listParams={form.listParams}
          onChange={(listParams) => onChange({ ...form, listParams })}
        />
      ) : null}

      <Button
        type="button"
        size="sm"
        className="self-start"
        onClick={onRun}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PlayIcon className="size-4" />
        )}
        Run request
      </Button>
    </CardContent>
  </Card>
);

const Field = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor} className="font-mono text-xs">
      {label}
    </Label>
    {children}
  </div>
);
