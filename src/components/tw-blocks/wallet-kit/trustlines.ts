/**
 * Trustlines | Non-Native Tokens from Stellar (Soroban SAC contract ids)
 *
 * The form stores the SAC in `address` (C…, 56 chars) plus `symbol`.
 * Deploy and update send `{ contractId, symbol }` — `contractId` is that SAC.
 * Escrow Lab is testnet-only.
 */
export const trustlines = [
  {
    symbol: "USDC",
    address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  },
];

export const trustlineOptions = trustlines.map((trustline) => ({
  value: trustline.address,
  label: trustline.symbol,
}));
