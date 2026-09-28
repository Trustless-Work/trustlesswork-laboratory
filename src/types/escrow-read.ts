import type {
  EscrowDetail as SdkEscrowDetail,
  EscrowDetailsItem as SdkEscrowDetailsItem,
  EscrowFinancial as SdkEscrowFinancial,
  EscrowSummary as SdkEscrowSummary,
  EscrowType,
  ListEscrowsParams as SdkListEscrowsParams,
  ListEscrowsResponse as SdkListEscrowsResponse,
  BatchEscrowDetailsResponse as SdkBatchEscrowDetailsResponse,
  BatchEscrowFinancialResponse as SdkBatchEscrowFinancialResponse,
} from "@trustless-work/escrow-js";

/**
 * Core API read-model overlays.
 * `@trustless-work/escrow-js@1.0.0-beta.1` still types the pre-2026-09-25
 * contract (`totalAmount`, list filter `contractType`). REST forwards query
 * keys as-is, so the app speaks the live wire names.
 */

/** Decimal token units. Null until the first on-chain projection lands. */
export type EscrowAmount = string | null;

export type EscrowSummary = Omit<SdkEscrowSummary, "totalAmount"> & {
  amount: EscrowAmount;
};

export type EscrowFinancial = Omit<SdkEscrowFinancial, "totalAmount"> & {
  amount: EscrowAmount;
};

export type ListEscrowsParams = Omit<SdkListEscrowsParams, "contractType"> & {
  type?: EscrowType;
};

export type EscrowDetail = Omit<SdkEscrowDetail, "escrow"> & {
  escrow: EscrowSummary;
};

export type EscrowDetailsItem = Omit<SdkEscrowDetailsItem, "escrow"> & {
  escrow: EscrowSummary;
};

export type ListEscrowsResponse = Omit<SdkListEscrowsResponse, "data"> & {
  data: EscrowSummary[];
};

export type BatchEscrowDetailsResponse = Omit<
  SdkBatchEscrowDetailsResponse,
  "data"
> & {
  data: EscrowDetailsItem[];
};

export type BatchEscrowFinancialResponse = Omit<
  SdkBatchEscrowFinancialResponse,
  "data"
> & {
  data: EscrowFinancial[];
};
