import { createElement } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getStellarExpertTransactionUrl } from "@/helpers/escrow-explorer.helper";
import type { LabWriteAction } from "@/types";

export const LAB_TX_TOAST_DURATION_MS = 10_000;

interface LabWriteToastMessages {
  loading: string;
  success: string;
}

export function getLabWriteToastMessages(
  action: LabWriteAction,
): LabWriteToastMessages {
  switch (action) {
    case "deploy":
      return {
        loading: "Deploying escrow...",
        success: "Escrow deployed successfully",
      };
    case "fund":
      return {
        loading: "Funding escrow...",
        success: "Escrow funded successfully",
      };
    case "update":
      return {
        loading: "Updating escrow...",
        success: "Escrow updated successfully",
      };
    case "manage-milestones":
      return {
        loading: "Updating milestones...",
        success: "Milestones updated",
      };
    case "change-milestone-status":
      return {
        loading: "Updating milestone status...",
        success: "Milestone status updated",
      };
    case "approve-milestones":
      return {
        loading: "Approving milestone...",
        success: "Milestone approved",
      };
    case "approve-and-release-milestones":
      return {
        loading: "Approving and releasing milestones...",
        success: "Milestones approved and released",
      };
    case "release-funds":
      return {
        loading: "Releasing funds...",
        success: "Funds released successfully",
      };
    case "dispute":
      return {
        loading: "Starting dispute...",
        success: "Dispute started",
      };
    case "resolve-dispute":
      return {
        loading: "Resolving dispute...",
        success: "Dispute resolved",
      };
    case "withdraw-remaining-funds":
      return {
        loading: "Withdrawing remaining funds...",
        success: "Remaining funds withdrawn",
      };
    case "extend-ttl":
      return {
        loading: "Extending contract TTL...",
        success: "Contract TTL extended",
      };
  }
}

interface ShowLabTransactionSuccessToastOptions {
  title: string;
  txHash?: string | null;
  toastId?: string | number;
  description?: string;
}

export function showLabTransactionSuccessToast({
  title,
  txHash,
  toastId,
  description,
}: ShowLabTransactionSuccessToastOptions): void {
  const trimmedTxHash = txHash?.trim() ?? "";

  if (!trimmedTxHash) {
    toast.success(title, {
      id: toastId,
      description,
      duration: LAB_TX_TOAST_DURATION_MS,
    });
    return;
  }

  const expertLink = createElement(
    Link,
    {
      href: getStellarExpertTransactionUrl(trimmedTxHash),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "underline underline-offset-2",
    },
    "View transaction on Stellar Expert",
  );

  toast.success(title, {
    id: toastId,
    duration: LAB_TX_TOAST_DURATION_MS,
    description: description
      ? createElement(
          "span",
          { className: "flex flex-col gap-1" },
          createElement("span", null, description),
          expertLink,
        )
      : expertLink,
  });
}
