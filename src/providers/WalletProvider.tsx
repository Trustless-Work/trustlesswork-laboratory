"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useHydrated } from "@/hooks/useHydrated";

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  hasWalletHydrated: boolean;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

interface WalletStore {
  address: string | null;
  name: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_ADDRESS_KEY = "walletAddress";
const WALLET_NAME_KEY = "walletName";

const EMPTY_STORE: WalletStore = { address: null, name: null };

let memoryStore: WalletStore | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readFromStorage(): WalletStore {
  return {
    address: localStorage.getItem(WALLET_ADDRESS_KEY),
    name: localStorage.getItem(WALLET_NAME_KEY),
  };
}

function getClientSnapshot(): WalletStore {
  if (memoryStore === null) {
    memoryStore = readFromStorage();
  }
  return memoryStore;
}

function getServerSnapshot(): WalletStore {
  return EMPTY_STORE;
}

function writeStore(next: WalletStore): void {
  memoryStore = next;
  emit();
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const store = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const hasWalletHydrated = useHydrated();

  const setWalletInfo = useCallback((address: string, name: string) => {
    localStorage.setItem(WALLET_ADDRESS_KEY, address);
    localStorage.setItem(WALLET_NAME_KEY, name);
    writeStore({ address, name });
  }, []);

  const clearWalletInfo = useCallback(() => {
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    localStorage.removeItem(WALLET_NAME_KEY);
    writeStore({ address: null, name: null });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress: store.address,
        walletName: store.name,
        hasWalletHydrated,
        setWalletInfo,
        clearWalletInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};
