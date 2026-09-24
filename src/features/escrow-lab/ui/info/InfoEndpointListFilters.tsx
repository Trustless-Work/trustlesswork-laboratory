"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  EscrowStatus,
  EscrowType,
  ListEscrowsParams,
  Role,
} from "@/types";

interface InfoEndpointListFiltersProps {
  listParams: ListEscrowsParams;
  onChange: (next: ListEscrowsParams) => void;
}

export const InfoEndpointListFilters = ({
  listParams,
  onChange,
}: InfoEndpointListFiltersProps) => {
  const patch = (partial: Partial<ListEscrowsParams>) => {
    onChange({ ...listParams, ...partial });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FilterSelect
        label="scope"
        value={listParams.scope ?? "mine"}
        onValueChange={(value) =>
          patch({ scope: value as "mine" | "all" })
        }
        options={[
          { value: "mine", label: "mine" },
          { value: "all", label: "all" },
        ]}
      />
      <FilterSelect
        label="status"
        value={listParams.status ?? "any"}
        onValueChange={(value) =>
          patch({
            status: value === "any" ? undefined : (value as EscrowStatus),
          })
        }
        options={[
          { value: "any", label: "any" },
          { value: "active", label: "active" },
          { value: "released", label: "released" },
          { value: "disputed", label: "disputed" },
        ]}
      />
      <FilterSelect
        label="contractType"
        value={listParams.contractType ?? "any"}
        onValueChange={(value) =>
          patch({
            contractType:
              value === "any" ? undefined : (value as EscrowType),
          })
        }
        options={[
          { value: "any", label: "any" },
          { value: "single-release", label: "single-release" },
          { value: "multi-release", label: "multi-release" },
        ]}
      />
      <FilterSelect
        label="role"
        value={listParams.role ?? "any"}
        onValueChange={(value) =>
          patch({
            role: value === "any" ? undefined : (value as Role),
          })
        }
        options={[
          { value: "any", label: "any" },
          { value: "admin", label: "admin" },
          { value: "approver", label: "approver" },
          { value: "serviceProvider", label: "serviceProvider" },
          { value: "releaseSigner", label: "releaseSigner" },
          { value: "disputeResolver", label: "disputeResolver" },
          { value: "platform", label: "platform" },
          { value: "receiver", label: "receiver" },
          { value: "observer", label: "observer" },
        ]}
      />
      <Field label="participant" htmlFor="info-list-participant">
        <Input
          id="info-list-participant"
          placeholder="G…"
          value={listParams.participant ?? ""}
          onChange={(event) =>
            patch({
              participant: event.target.value.trim() || undefined,
            })
          }
        />
      </Field>
      <Field label="engagementId" htmlFor="info-list-engagement">
        <Input
          id="info-list-engagement"
          placeholder="optional"
          value={listParams.engagementId ?? ""}
          onChange={(event) =>
            patch({
              engagementId: event.target.value.trim() || undefined,
            })
          }
        />
      </Field>
      <Field label="limit" htmlFor="info-list-limit">
        <Input
          id="info-list-limit"
          type="number"
          min={1}
          max={100}
          value={listParams.limit ?? 20}
          onChange={(event) =>
            patch({
              limit: Number(event.target.value) || undefined,
            })
          }
        />
      </Field>
      <Field label="cursor" htmlFor="info-list-cursor">
        <Input
          id="info-list-cursor"
          placeholder="optional"
          value={listParams.cursor ?? ""}
          onChange={(event) =>
            patch({
              cursor: event.target.value.trim() || undefined,
            })
          }
        />
      </Field>
    </div>
  );
};

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

const FilterSelect = ({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="font-mono text-xs">{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
