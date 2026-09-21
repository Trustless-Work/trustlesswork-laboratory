import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/app/site-config";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/icon.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: 64,
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={160}
            height={160}
            style={{ borderRadius: 28 }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {siteConfig.name}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#91d5ff",
                fontWeight: 500,
              }}
            >
              Trustless Work V2 · Stellar Testnet
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                color: "#a3a3a3",
                textAlign: "center",
                maxWidth: 820,
                lineHeight: 1.4,
              }}
            >
              Deploy, fund, approve, release, and dispute escrows hands-on.
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#006be4",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
