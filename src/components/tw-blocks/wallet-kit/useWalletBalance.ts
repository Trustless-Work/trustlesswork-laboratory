"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletContext } from "@/providers/WalletProvider";

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

interface HorizonBalance {
  asset_type: string;
  asset_code?: string;
  balance: string;
}

interface HorizonAccount {
  balances: HorizonBalance[];
}

interface WalletBalanceState {
  balance: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

function isHorizonAccount(value: unknown): value is HorizonAccount {
  if (typeof value !== "object" || value === null || !("balances" in value)) {
    return false;
  }

  return Array.isArray(value.balances);
}

export const useWalletBalance = (): WalletBalanceState => {
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress } = useWalletContext();

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance("0");
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${HORIZON_TESTNET_URL}/accounts/${walletAddress}`,
      );

      if (response.status === 404) {
        setBalance("0");
        setError(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: unknown = await response.json();
      if (!isHorizonAccount(data)) {
        throw new Error("Invalid account structure");
      }

      const usdcBalance = data.balances.find(
        (item) =>
          item.asset_type === "credit_alphanum4" && item.asset_code === "USDC",
      );

      setBalance(usdcBalance?.balance ?? "0");
    } catch {
      setError("Failed to fetch balance");
      setBalance("0");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const refresh = useCallback(() => {
    void fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchBalance();
    }, 0);
    const intervalId = window.setInterval(() => {
      void fetchBalance();
    }, 30_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [walletAddress, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refresh,
  };
};
