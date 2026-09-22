"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  deployMultiFormSchema,
  deploySingleFormSchema,
} from "@/features/escrow-lab/schemas/operate.schema";
import {
  buildMultiDeployTemplate,
  buildSingleDeployTemplate,
} from "@/features/escrow-lab/helpers/deploy-template.helper";
import {
  buildMultiDeployDefaults,
  buildSingleDeployDefaults,
  stripDeployFormUiFields,
  type DeployMultiDefaults,
  type DeploySingleDefaults,
} from "@/features/escrow-lab/helpers/deploy-defaults.helper";
import { useEscrowWrite } from "@/features/escrow-lab/hooks/useEscrowWrite";
import { useActiveEscrow } from "@/features/escrow-lab/hooks/useActiveEscrow";
import { DeployFormShell } from "@/features/escrow-lab/ui/deploy/DeployFormShell";
import { useWalletContext } from "@/providers/WalletProvider";
import type { EscrowType } from "@/types";

interface DeployTabProps {
  type: EscrowType;
}

export const DeployTab = ({ type }: DeployTabProps) => {
  if (type === "multi-release") return <DeployMultiForm />;
  return <DeploySingleForm />;
};

const DeploySingleForm = () => {
  const { walletAddress } = useWalletContext();
  const write = useEscrowWrite();
  const { loadEscrow } = useActiveEscrow();

  const form = useForm<DeploySingleDefaults>({
    resolver: zodResolver(deploySingleFormSchema),
    defaultValues: buildSingleDeployDefaults(""),
    mode: "onChange",
  });

  useEffect(() => {
    if (!walletAddress) return;
    form.reset(buildSingleDeployDefaults(walletAddress), {
      keepDirtyValues: true,
    });
  }, [form, walletAddress]);

  const milestones = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = stripDeployFormUiFields(values);
    const result = await write.mutateAsync({
      type: "single-release",
      action: "deploy",
      payload: { ...payload, signer: walletAddress ?? payload.signer },
    });
    if (result.contractId) loadEscrow(result.contractId);
  });

  const onApplyTemplate = () => {
    if (!walletAddress) {
      toast.error("Connect a wallet to apply the template");
      return;
    }
    form.reset(buildSingleDeployTemplate(walletAddress));
    toast.success("Template applied");
  };

  return (
    <DeployFormShell
      form={form}
      onSubmit={onSubmit}
      onApplyTemplate={onApplyTemplate}
      isPending={write.isPending}
      walletAddress={walletAddress}
      milestones={milestones}
      isSingle
      stepFields={[
        [
          "engagementId",
          "title",
          "description",
          "amount",
          "platformFee",
          "trustline.address",
          "trustline.symbol",
        ],
        [
          "roles.admin",
          "roles.platform",
          "roles.receiver",
          "roles.approvers",
          "roles.serviceProviders",
          "roles.releaseSigners",
          "roles.disputeResolvers",
          "roles.observers",
        ],
        ["milestones"],
      ]}
    />
  );
};

const DeployMultiForm = () => {
  const { walletAddress } = useWalletContext();
  const write = useEscrowWrite();
  const { loadEscrow } = useActiveEscrow();

  const form = useForm<DeployMultiDefaults>({
    resolver: zodResolver(deployMultiFormSchema),
    defaultValues: buildMultiDeployDefaults(""),
    mode: "onChange",
  });

  useEffect(() => {
    if (!walletAddress) return;
    form.reset(buildMultiDeployDefaults(walletAddress), {
      keepDirtyValues: true,
    });
  }, [form, walletAddress]);

  const milestones = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = stripDeployFormUiFields(values);
    const result = await write.mutateAsync({
      type: "multi-release",
      action: "deploy",
      payload: { ...payload, signer: walletAddress ?? payload.signer },
    });
    if (result.contractId) loadEscrow(result.contractId);
  });

  const onApplyTemplate = () => {
    if (!walletAddress) {
      toast.error("Connect a wallet to apply the template");
      return;
    }
    form.reset(buildMultiDeployTemplate(walletAddress));
    toast.success("Template applied");
  };

  return (
    <DeployFormShell
      form={form}
      onSubmit={onSubmit}
      onApplyTemplate={onApplyTemplate}
      isPending={write.isPending}
      walletAddress={walletAddress}
      milestones={milestones}
      isSingle={false}
      stepFields={[
        [
          "engagementId",
          "title",
          "description",
          "platformFee",
          "trustline.address",
          "trustline.symbol",
        ],
        [
          "roles.admin",
          "roles.platform",
          "roles.approvers",
          "roles.serviceProviders",
          "roles.releaseSigners",
          "roles.disputeResolvers",
          "roles.observers",
        ],
        ["milestones"],
      ]}
    />
  );
};
