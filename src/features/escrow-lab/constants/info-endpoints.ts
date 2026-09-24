import type { LucideIcon } from "lucide-react";
import {
  CoinsIcon,
  FileSearchIcon,
  FlagIcon,
  LayersIcon,
  ListIcon,
  ListTreeIcon,
  ScrollTextIcon,
} from "lucide-react";
import type { ReadOperation } from "@/lib/trustless-work/read-registry";

export type InfoEndpointId = ReadOperation;

export interface InfoEndpointDef {
  readonly id: InfoEndpointId;
  readonly method: "GET";
  readonly corePath: string;
  readonly labPath: string;
  readonly title: string;
  readonly purpose: string;
  readonly howToUse: string;
  readonly requestShape: string;
  readonly responseShape: string;
  readonly icon: LucideIcon;
  readonly needsContractId: boolean;
  readonly needsContractIds: boolean;
  readonly hasListFilters: boolean;
  readonly hasEventParams: boolean;
}

export const INFO_ENDPOINTS: readonly InfoEndpointDef[] = [
  {
    id: "list",
    method: "GET",
    corePath: "/escrows",
    labPath: "/api/tw/read/list",
    title: "List escrows",
    purpose:
      "Keyset-paginated list with filters. Use for dashboards and pickers.",
    howToUse:
      "scope=mine returns escrows for verified wallets on this API key plus platform-attributed ones. scope=all returns every escrow on the network. Combine filters (status, contractType, participant, role, engagementId) and page with cursor + limit.",
    requestShape: [
      "GET /escrows",
      "",
      "Query",
      "  scope?: \"mine\" | \"all\"",
      "  status?: \"active\" | \"released\" | \"disputed\"",
      "  contractType?: \"single-release\" | \"multi-release\"",
      "  engagementId?: string",
      "  participant?: string",
      "  role?: Role",
      "  cursor?: string",
      "  limit?: number",
      "  sort?: \"createdAt\" | \"updatedAt\"",
      "  order?: \"asc\" | \"desc\"",
      "  contractIds?: string[]",
    ].join("\n"),
    responseShape: [
      "{",
      "  data: EscrowSummary[]",
      "  hasMore: boolean",
      "  nextCursor: string | null",
      "}",
    ].join("\n"),
    icon: ListIcon,
    needsContractId: false,
    needsContractIds: false,
    hasListFilters: true,
    hasEventParams: false,
  },
  {
    id: "get",
    method: "GET",
    corePath: "/escrows/{contractId}",
    labPath: "/api/tw/read/get/{contractId}",
    title: "Get escrow",
    purpose:
      "Full detail for one escrow: state, snapshot, recent events, deposits.",
    howToUse:
      "Pass the on-chain contractId (C…). A 404 right after deploy usually means the indexer is still catching up — poll briefly.",
    requestShape: [
      "GET /escrows/{contractId}",
      "",
      "Path",
      "  contractId: string  // C… Soroban contract",
    ].join("\n"),
    responseShape: [
      "{",
      "  escrow: EscrowSummary",
      "  events: EscrowEvent[]",
      "  deposits: EscrowDeposit[]",
      "}",
    ].join("\n"),
    icon: FileSearchIcon,
    needsContractId: true,
    needsContractIds: false,
    hasListFilters: false,
    hasEventParams: false,
  },
  {
    id: "details",
    method: "GET",
    corePath: "/escrows/details",
    labPath: "/api/tw/read/details",
    title: "Batch details",
    purpose:
      "Detail for up to 50 contract ids without the event timeline.",
    howToUse:
      "Send contractIds as repeated query params. Cap is 50. Prefer this over N sequential GET /escrows/{id} calls when you only need snapshots + deposits.",
    requestShape: [
      "GET /escrows/details",
      "",
      "Query",
      "  contractIds: string[]  // 1–50",
    ].join("\n"),
    responseShape: [
      "{",
      "  data: {",
      "    escrow: EscrowSummary",
      "    deposits: EscrowDeposit[]",
      "  }[]",
      "}",
    ].join("\n"),
    icon: LayersIcon,
    needsContractId: false,
    needsContractIds: true,
    hasListFilters: false,
    hasEventParams: false,
  },
  {
    id: "events",
    method: "GET",
    corePath: "/escrows/{contractId}/events",
    labPath: "/api/tw/read/events/{contractId}",
    title: "Escrow events",
    purpose: "Paged timeline of indexed escrow events for one contract.",
    howToUse:
      "Pass contractId plus optional cursor, limit (1–200), and order (asc|desc). Use nextCursor from the response to page.",
    requestShape: [
      "GET /escrows/{contractId}/events",
      "",
      "Path",
      "  contractId: string",
      "",
      "Query",
      "  cursor?: string",
      "  limit?: number  // 1–200",
      "  order?: \"asc\" | \"desc\"",
    ].join("\n"),
    responseShape: [
      "{",
      "  data: EscrowEvent[]",
      "  hasMore: boolean",
      "  nextCursor: string | null",
      "}",
    ].join("\n"),
    icon: ScrollTextIcon,
    needsContractId: true,
    needsContractIds: false,
    hasListFilters: false,
    hasEventParams: true,
  },
  {
    id: "milestones",
    method: "GET",
    corePath: "/escrows/{contractId}/milestones",
    labPath: "/api/tw/read/milestones/{contractId}",
    title: "Escrow milestones",
    purpose: "Milestone set for a single escrow.",
    howToUse:
      "Pass contractId. Response type matches single-release or multi-release milestone shapes.",
    requestShape: [
      "GET /escrows/{contractId}/milestones",
      "",
      "Path",
      "  contractId: string",
    ].join("\n"),
    responseShape: [
      "{",
      "  contractId: string",
      "  type: EscrowType",
      "  milestones: SingleReleaseMilestone[] | MultiReleaseMilestone[]",
      "}",
    ].join("\n"),
    icon: FlagIcon,
    needsContractId: true,
    needsContractIds: false,
    hasListFilters: false,
    hasEventParams: false,
  },
  {
    id: "batch-milestones",
    method: "GET",
    corePath: "/escrows/milestones",
    labPath: "/api/tw/read/batch-milestones",
    title: "Batch milestones",
    purpose: "Milestones for up to 50 escrows in one call.",
    howToUse:
      "Send contractIds (max 50). Useful for list pages that show progress without fetching each escrow separately.",
    requestShape: [
      "GET /escrows/milestones",
      "",
      "Query",
      "  contractIds: string[]  // 1–50",
    ].join("\n"),
    responseShape: [
      "{",
      "  data: EscrowMilestones[]",
      "}",
    ].join("\n"),
    icon: ListTreeIcon,
    needsContractId: false,
    needsContractIds: true,
    hasListFilters: false,
    hasEventParams: false,
  },
  {
    id: "financial",
    method: "GET",
    corePath: "/escrows/financial",
    labPath: "/api/tw/read/financial",
    title: "Batch financial",
    purpose:
      "Fee, deposited, released, pending, and balance for up to 50 ids.",
    howToUse:
      "Send contractIds (max 50). Replaces the old helper get-multiple-escrow-balance path.",
    requestShape: [
      "GET /escrows/financial",
      "",
      "Query",
      "  contractIds: string[]  // 1–50",
    ].join("\n"),
    responseShape: [
      "{",
      "  data: EscrowFinancial[]",
      "}",
    ].join("\n"),
    icon: CoinsIcon,
    needsContractId: false,
    needsContractIds: true,
    hasListFilters: false,
    hasEventParams: false,
  },
] as const;

export function getInfoEndpoint(id: InfoEndpointId): InfoEndpointDef {
  const found = INFO_ENDPOINTS.find((endpoint) => endpoint.id === id);
  if (!found) return INFO_ENDPOINTS[0]!;
  return found;
}
