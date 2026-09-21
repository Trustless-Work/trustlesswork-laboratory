"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { signTransaction } from "@/components/tw-blocks/wallet-kit/wallet-kit";
import { useWalletContext } from "@/providers/WalletProvider";
import {
  LabApiError,
  labApiService,
} from "@/features/escrow-lab/services/lab-api.service";
import { humanizeEscrowError } from "@/features/escrow-lab/helpers/error-message.helper";
import { waitForEscrowDetailRefresh } from "@/features/escrow-lab/helpers/escrow-refresh.helper";
import {
  getLabWriteToastMessages,
  showLabTransactionSuccessToast,
} from "@/features/escrow-lab/helpers/transaction-toast.helper";
import { useLabConsole } from "@/features/escrow-lab/hooks/useLabConsole";
import type {
  DeployEscrowResponse,
  EscrowDetail,
  EscrowType,
  LabWriteAction,
  SendTransactionResponse,
} from "@/types";

interface WriteArgs {
  type: EscrowType;
  action: LabWriteAction;
  payload: unknown;
}

function isDeployResponse(
  value: unknown,
): value is DeployEscrowResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "contractId" in value &&
    typeof (value as { contractId: unknown }).contractId === "string"
  );
}

function isIndexerLagging(result: SendTransactionResponse): boolean {
  return result.code === "STELLAR_TX_SUBMITTED_INDEXER_LAGGING";
}

export function useEscrowWrite() {
  const { walletAddress } = useWalletContext();
  const queryClient = useQueryClient();
  const { pushEntry, updateEntry } = useLabConsole();

  return useMutation({
    mutationFn: async ({ type, action, payload }: WriteArgs) => {
      if (!walletAddress) {
        throw new Error("Connect a wallet before signing");
      }

      const messages = getLabWriteToastMessages(action);
      const toastId = toast.loading(messages.loading);
      const entryId = pushEntry({
        action,
        type,
        phase: "build",
        request: payload,
      });

      try {
        const built = await labApiService.buildWrite(type, action, payload);
        updateEntry(entryId, {
          phase: "sign",
          unsignedXdr: built.unsignedXdr,
          response: built,
        });

        const signedXdr = await signTransaction({
          unsignedTransaction: built.unsignedXdr,
          address: walletAddress,
        });
        updateEntry(entryId, { phase: "submit", signedXdr });

        const submitted = await labApiService.submit(signedXdr);
        updateEntry(entryId, { phase: "submit", response: submitted });

        showLabTransactionSuccessToast({
          title: messages.success,
          txHash: submitted.txHash,
          toastId,
          description: isIndexerLagging(submitted)
            ? "Indexer lagging — refreshing escrow state…"
            : undefined,
        });

        const contractId =
          typeof payload === "object" &&
          payload !== null &&
          "contractId" in payload &&
          typeof (payload as { contractId: unknown }).contractId === "string"
            ? (payload as { contractId: string }).contractId
            : isDeployResponse(built)
              ? built.contractId
              : submitted.contractId;

        if (contractId) {
          const previous = queryClient.getQueryData<EscrowDetail>([
            "escrow",
            contractId,
          ]);
          const detail = await waitForEscrowDetailRefresh({
            previous,
            fetchDetail: () => labApiService.getEscrow(contractId),
          });
          queryClient.setQueryData(["escrow", contractId], detail);
        }

        await queryClient.invalidateQueries({ queryKey: ["escrows"] });
        if (contractId) {
          await queryClient.invalidateQueries({
            queryKey: ["escrow", contractId, "events"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["escrow", contractId, "milestones"],
          });
        }

        return {
          built,
          submitted,
          contractId:
            (isDeployResponse(built) ? built.contractId : undefined) ??
            submitted.contractId,
        };
      } catch (error) {
        const raw =
          error instanceof LabApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Transaction failed";
        const code = error instanceof LabApiError ? error.code : undefined;
        const message = humanizeEscrowError(code, raw);
        updateEntry(entryId, { phase: "error", error: message });
        toast.error(message, { id: toastId });
        throw error;
      }
    },
  });
}
