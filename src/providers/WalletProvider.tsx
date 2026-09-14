"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  hasWalletHydrated: boolean;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_ADDRESS_KEY = "walletAddress";
const WALLET_NAME_KEY = "walletName";

function subscribeToNothing() {
  return () => {};
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const hasWalletHydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [didReadStorage, setDidReadStorage] = useState(false);

  if (hasWalletHydrated && !didReadStorage) {
    setWalletAddress(localStorage.getItem(WALLET_ADDRESS_KEY));
    setWalletName(localStorage.getItem(WALLET_NAME_KEY));
    setDidReadStorage(true);
  }

  const setWalletInfo = (address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    localStorage.setItem(WALLET_ADDRESS_KEY, address);
    localStorage.setItem(WALLET_NAME_KEY, name);
  };

  const clearWalletInfo = () => {
    setWalletAddress(null);
    setWalletName(null);
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    localStorage.removeItem(WALLET_NAME_KEY);
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
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
