export function getStellarExpertTransactionUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash.trim()}`;
}

export function getStellarExpertContractUrl(contractId: string): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId.trim()}`;
}

export function getStellarExpertAccountUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address.trim()}`;
}

export function getTrustlessWorkViewerUrl(contractId: string): string {
  const params = new URLSearchParams({ network: "testnet" });
  return `https://viewer.trustlesswork.com/${contractId.trim()}?${params.toString()}`;
}

/** Shared chrome for escrow role / explorer round icon buttons. */
export const ESCROW_ROUND_ICON_LINK_CLASSNAME =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted";
