import Link from "next/link";
import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "@/lib/utils";

interface AddressChipProps {
  address: string;
  className?: string;
  showExplorer?: boolean;
  chars?: number;
}

function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export const AddressChip = ({
  address,
  className,
  showExplorer = true,
  chars = 4,
}: AddressChipProps) => {
  const explorerUrl = address.startsWith("C")
    ? `https://stellar.expert/explorer/testnet/contract/${address}`
    : `https://stellar.expert/explorer/testnet/account/${address}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs",
        className,
      )}
    >
      {showExplorer ? (
        <Link
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline-offset-2 hover:underline"
        >
          {truncateAddress(address, chars)}
        </Link>
      ) : (
        <span>{truncateAddress(address, chars)}</span>
      )}
      <CopyButton value={address} label="Address copied" />
    </span>
  );
};
