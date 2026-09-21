"use client";

import * as React from "react";
import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "./useWallet";
import { useAuth } from "@/providers/AuthProvider";
import { useWalletContext } from "@/providers/WalletProvider";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";

type WalletButtonProps = {
  className?: string;
  mobileBar?: boolean;
};

const WalletButtonSkeleton = ({
  className,
  mobileBar = false,
}: WalletButtonProps) => (
  <Button
    type="button"
    variant="outline"
    disabled
    aria-hidden="true"
    className={cn(
      "pointer-events-none min-w-0 gap-2 bg-transparent opacity-100",
      mobileBar ? "w-full justify-center px-2" : "px-4",
      className,
    )}
  >
    <Skeleton className="size-4 shrink-0 rounded" />
    {!mobileBar ? <Skeleton className="h-4 w-14 shrink-0" /> : null}
    <Skeleton className="h-4 w-24 shrink-0" />
  </Button>
);

export const WalletButton = ({
  className,
  mobileBar = false,
}: WalletButtonProps) => {
  const { handleConnect, handleDisconnect } = useWallet();
  const { walletAddress, walletName, hasWalletHydrated } = useWalletContext();
  const { isLoading: isSessionLoading } = useAuth();
  const hydrated = useHydrated();

  const shortAddress = React.useMemo(() => {
    if (!walletAddress) return "";
    if (walletAddress.length <= 10) return walletAddress;
    return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  if (!hydrated || !hasWalletHydrated || isSessionLoading) {
    return <WalletButtonSkeleton className={className} mobileBar={mobileBar} />;
  }

  if (walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className={cn(
              "min-w-0 gap-2 bg-transparent font-medium",
              mobileBar ? "w-full justify-center px-2" : "px-4",
              className,
            )}
          >
            <Wallet data-icon="inline-start" />
            {!mobileBar ? (
              <span className="font-medium">{walletName}</span>
            ) : null}
            <span className="truncate font-mono text-sm text-muted-foreground">
              {shortAddress}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                void handleDisconnect();
              }}
            >
              <LogOut />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      className={cn(
        "gap-2 font-medium",
        mobileBar ? "w-full justify-center px-3" : "px-6",
        className,
      )}
      onClick={handleConnect}
    >
      <Wallet data-icon="inline-start" />
      {mobileBar ? "Connect" : "Connect Wallet"}
    </Button>
  );
};
