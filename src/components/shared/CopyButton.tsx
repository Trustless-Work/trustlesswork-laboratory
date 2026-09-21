"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: "icon-xs" | "icon-sm" | "icon";
}

export const CopyButton = ({
  value,
  label = "Copied",
  className,
  size = "icon-xs",
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn(className)}
      onClick={handleCopy}
      aria-label="Copy address"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};
