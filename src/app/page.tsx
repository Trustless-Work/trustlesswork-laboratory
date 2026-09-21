import { siteConfig } from "@/app/site-config";
import { EscrowLabView } from "@/features/escrow-lab/views/EscrowLabView";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteConfig.url,
  description: siteConfig.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: siteConfig.creator,
    url: "https://trustlesswork.com",
  },
  about: {
    "@type": "Thing",
    name: "Trustless Work V2 Escrows on Stellar",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EscrowLabView />
    </>
  );
}
