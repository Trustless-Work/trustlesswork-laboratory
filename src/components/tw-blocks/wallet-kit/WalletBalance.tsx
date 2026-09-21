"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWalletContext } from "@/providers/WalletProvider";
import { useWalletBalance } from "./useWalletBalance";

export const WalletBalance = () => {
  const { walletAddress } = useWalletContext();
  const { balance, isLoading, refresh } = useWalletBalance();

  if (!walletAddress) {
    return null;
  }

  const amount = Number(balance);
  const parsedAmount = Number.isFinite(amount) ? amount : 0;

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <UsdcAmount amount={parsedAmount} symbol="USDC" size="sm" />
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={refresh}
        disabled={isLoading}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
      </Button>
    </div>
  );
};
