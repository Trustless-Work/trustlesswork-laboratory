import { describe, expect, it } from "vitest";
import {
  getStellarExpertAccountUrl,
  getStellarExpertContractUrl,
  getStellarExpertTransactionUrl,
  getTrustlessWorkViewerUrl,
} from "@/helpers/escrow-explorer.helper";

describe("escrow-explorer.helper", () => {
  it("builds testnet transaction urls", () => {
    expect(getStellarExpertTransactionUrl("abc123")).toBe(
      "https://stellar.expert/explorer/testnet/tx/abc123",
    );
  });

  it("builds testnet contract urls", () => {
    expect(getStellarExpertContractUrl("CABC")).toBe(
      "https://stellar.expert/explorer/testnet/contract/CABC",
    );
  });

  it("builds testnet account urls", () => {
    expect(getStellarExpertAccountUrl("GABC")).toBe(
      "https://stellar.expert/explorer/testnet/account/GABC",
    );
  });

  it("builds trustless work viewer urls for testnet", () => {
    expect(getTrustlessWorkViewerUrl("CABC")).toBe(
      "https://viewer.trustlesswork.com/CABC?network=testnet",
    );
  });

  it("trims identifiers", () => {
    expect(getStellarExpertTransactionUrl("  hash  ")).toBe(
      "https://stellar.expert/explorer/testnet/tx/hash",
    );
    expect(getTrustlessWorkViewerUrl("  CXYZ  ")).toBe(
      "https://viewer.trustlesswork.com/CXYZ?network=testnet",
    );
  });
});
