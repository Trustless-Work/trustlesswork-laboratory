export const siteConfig = {
  name: "Escrow Lab",
  shortName: "Escrow Lab",
  title: "Escrow Lab · Trustless Work V2",
  description:
    "Hands-on testnet laboratory for Trustless Work V2 escrows — deploy, fund, approve, release, and dispute on Stellar.",
  url: "https://escrow-lab.trustlesswork.com",
  locale: "en_US",
  creator: "Trustless Work",
  publisher: "Trustless Work",
  category: "technology",
  keywords: [
    "Trustless Work",
    "escrow",
    "Stellar",
    "Soroban",
    "testnet",
    "USDC",
    "multi-release",
    "single-release",
    "blockchain payments",
    "smart contracts",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
