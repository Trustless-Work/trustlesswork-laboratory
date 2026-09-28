import type { EscrowStatus, EscrowType, ListEscrowsParams, Role } from "@/types";

export function parseEscrowListParams(
  searchParams: URLSearchParams,
): ListEscrowsParams {
  const params: ListEscrowsParams = {};
  const scope = searchParams.get("scope");
  if (scope === "mine" || scope === "all") params.scope = scope;

  const status = searchParams.get("status");
  if (status) params.status = status as EscrowStatus;

  const type = searchParams.get("type");
  if (type === "single-release" || type === "multi-release") {
    params.type = type as EscrowType;
  }

  const engagementId = searchParams.get("engagementId");
  if (engagementId) params.engagementId = engagementId;

  const participant = searchParams.get("participant");
  if (participant) params.participant = participant;

  const role = searchParams.get("role");
  if (role) params.role = role as Role;

  const cursor = searchParams.get("cursor");
  if (cursor) params.cursor = cursor;

  const limit = searchParams.get("limit");
  if (limit) params.limit = Number(limit);

  const sort = searchParams.get("sort");
  if (sort === "createdAt" || sort === "updatedAt") params.sort = sort;

  const order = searchParams.get("order");
  if (order === "asc" || order === "desc") params.order = order;

  const contractIds = searchParams.getAll("contractIds");
  if (contractIds.length) params.contractIds = contractIds;

  return params;
}
