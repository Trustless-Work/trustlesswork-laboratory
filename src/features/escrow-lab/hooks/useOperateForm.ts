"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  operateLabFormSchema,
  type OperateLabFormValues,
} from "@/features/escrow-lab/schemas/operate.schema";

export function useOperateForm() {
  return useForm<OperateLabFormValues>({
    resolver: zodResolver(operateLabFormSchema),
    defaultValues: {
      updateEngagementId: "",
      updateTitle: "",
      updateDescription: "",
      updateAmount: 100,
      updatePlatformFee: 1,
      updateReceiverMemo: undefined,
      updateTrustlineAddress: "",
      updateTrustlineSymbol: "USDC",
      updateTrustlineIsCustom: false,
      updateApprovers: [""],
      updateServiceProviders: [""],
      updateReleaseSigners: [""],
      updateDisputeResolvers: [""],
      updateObservers: [],
      updateReceiver: "",
      milestoneDesc: "Added milestone",
      milestoneAmount: 1,
      milestoneReceiver: "",
      milestoneApprovalsTarget: 1,
      editMilestoneIndex: 0,
      editMilestoneDesc: "",
      editMilestoneAmount: undefined,
      ledgers: 100000,
      fundAmount: 100,
      status: "completed",
      evidence: "",
      reason: "",
      distributions: "G...,100",
    },
    mode: "onChange",
  });
}
