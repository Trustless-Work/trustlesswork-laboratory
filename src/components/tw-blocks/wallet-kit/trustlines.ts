/**
 * Trustlines | Non-Native Tokens from Stellar (Soroban SAC contract ids)
 *
 * Deploy expects `trustline.contractId` (C… 56 chars) + `trustline.symbol`.
 * Preset `address` values are the SAC contract ids used as contractId on deploy.
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
