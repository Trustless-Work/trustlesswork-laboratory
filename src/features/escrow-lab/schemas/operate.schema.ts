import { z } from "zod";

const stellarAddress = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar address");

const contractId = z
  .string()
  .regex(/^C[A-Z2-7]{55}$/, "Invalid contract id");

const roleList = z
  .array(stellarAddress)
  .min(1, "At least one address required")
  .max(5, "Maximum 5 addresses");

const uniqueList = (list: string[]) => new Set(list).size === list.length;

export const singleReleaseRolesSchema = z
  .object({
    approvers: roleList,
    serviceProviders: roleList,
    releaseSigners: roleList,
    disputeResolvers: roleList,
    platform: stellarAddress,
    admin: stellarAddress,
    receiver: stellarAddress,
    observers: z.array(stellarAddress).max(5).optional(),
  })
  .superRefine((roles, ctx) => {
    const lists: Array<[string, string[]]> = [
      ["approvers", roles.approvers],
      ["serviceProviders", roles.serviceProviders],
      ["releaseSigners", roles.releaseSigners],
      ["disputeResolvers", roles.disputeResolvers],
    ];
    if (roles.observers) {
      lists.push(["observers", roles.observers]);
    }
    for (const [name, list] of lists) {
      if (!uniqueList(list)) {
        ctx.addIssue({
          code: "custom",
          message: `${name} must not contain duplicates`,
          path: [name],
        });
      }
    }

    const conflictSets: Array<[string, string]> = [
      ...roles.approvers.map((a) => ["approvers", a] as [string, string]),
      ...roles.serviceProviders.map(
        (a) => ["serviceProviders", a] as [string, string],
      ),
      ...roles.releaseSigners.map(
        (a) => ["releaseSigners", a] as [string, string],
      ),
      ["platform", roles.platform],
      ["receiver", roles.receiver],
    ];

    for (const resolver of roles.disputeResolvers) {
      for (const [role, address] of conflictSets) {
        if (resolver === address) {
          ctx.addIssue({
            code: "custom",
            message: `Dispute resolvers cannot overlap ${role}`,
            path: ["disputeResolvers"],
          });
        }
      }
    }

    const adminConflicts = [
      ...roles.approvers,
      ...roles.serviceProviders,
      ...roles.releaseSigners,
      ...roles.disputeResolvers,
      ...(roles.observers ?? []),
      roles.platform,
      roles.receiver,
    ];
    if (adminConflicts.includes(roles.admin)) {
      ctx.addIssue({
        code: "custom",
        message: "Admin cannot overlap other roles or receiver",
        path: ["admin"],
      });
    }
  });

export const multiReleaseRolesSchema = z
  .object({
    approvers: roleList,
    serviceProviders: roleList,
    releaseSigners: roleList,
    disputeResolvers: roleList,
    platform: stellarAddress,
    admin: stellarAddress,
    observers: z.array(stellarAddress).max(5).optional(),
  })
  .superRefine((roles, ctx) => {
    const lists: Array<[string, string[]]> = [
      ["approvers", roles.approvers],
      ["serviceProviders", roles.serviceProviders],
      ["releaseSigners", roles.releaseSigners],
      ["disputeResolvers", roles.disputeResolvers],
    ];
    if (roles.observers) {
      lists.push(["observers", roles.observers]);
    }
    for (const [name, list] of lists) {
      if (!uniqueList(list)) {
        ctx.addIssue({
          code: "custom",
          message: `${name} must not contain duplicates`,
          path: [name],
        });
      }
    }

    const conflictSets: Array<[string, string]> = [
      ...roles.approvers.map((a) => ["approvers", a] as [string, string]),
      ...roles.serviceProviders.map(
        (a) => ["serviceProviders", a] as [string, string],
      ),
      ...roles.releaseSigners.map(
        (a) => ["releaseSigners", a] as [string, string],
      ),
      ["platform", roles.platform],
    ];

    for (const resolver of roles.disputeResolvers) {
      for (const [role, address] of conflictSets) {
        if (resolver === address) {
          ctx.addIssue({
            code: "custom",
            message: `Dispute resolvers cannot overlap ${role}`,
            path: ["disputeResolvers"],
          });
        }
      }
    }

    const adminConflicts = [
      ...roles.approvers,
      ...roles.serviceProviders,
      ...roles.releaseSigners,
      ...roles.disputeResolvers,
      ...(roles.observers ?? []),
      roles.platform,
    ];
    if (adminConflicts.includes(roles.admin)) {
      ctx.addIssue({
        code: "custom",
        message: "Admin cannot overlap other roles",
        path: ["admin"],
      });
    }
  });

export const deployTrustlineSchema = z.object({
  contractId: contractId,
  symbol: z.string().min(1).max(12),
});

export const singleReleaseMilestoneSchema = z.object({
  description: z.string().min(1).max(500),
  status: z.string().max(50).optional(),
  approvalsTarget: z.number().int().positive(),
});

export const multiReleaseMilestoneSchema = singleReleaseMilestoneSchema.extend({
  amount: z.number().positive(),
  receiver: stellarAddress,
});

export const deploySingleSchema = z.object({
  signer: stellarAddress,
  engagementId: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  platformFee: z.number().int().min(0).max(99),
  roles: singleReleaseRolesSchema,
  milestones: z.array(singleReleaseMilestoneSchema).max(50),
  trustline: deployTrustlineSchema,
  receiverMemo: z.number().int().nonnegative().optional(),
});

export const deployMultiSchema = z.object({
  signer: stellarAddress,
  engagementId: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  platformFee: z.number().int().min(0).max(99),
  roles: multiReleaseRolesSchema,
  milestones: z.array(multiReleaseMilestoneSchema).max(50),
  trustline: deployTrustlineSchema,
  receiverMemo: z.number().int().nonnegative().optional(),
});

export const fundSchema = z.object({
  contractId: contractId,
  signer: stellarAddress,
  amount: z.number().positive(),
});

export const approveMilestonesSchema = z.object({
  contractId: contractId,
  approver: stellarAddress,
  milestoneIndexes: z.array(z.number().int().nonnegative()).min(1).max(50),
});

export const approveAndReleaseSchema = z.object({
  contractId: contractId,
  signer: stellarAddress,
  milestoneIndexes: z.array(z.number().int().nonnegative()).min(1).max(50),
});

export const changeMilestoneStatusSchema = z.object({
  contractId: contractId,
  serviceProvider: stellarAddress,
  updates: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        newStatus: z.string().min(1).max(50),
        newEvidence: z.string().max(500).optional(),
      }),
    )
    .min(1)
    .max(50),
});

export const releaseSingleSchema = z.object({
  contractId: contractId,
  releaseSigner: stellarAddress,
});

export const releaseMultiSchema = z.object({
  contractId: contractId,
  releaseSigner: stellarAddress,
  milestoneIndexes: z.array(z.number().int().nonnegative()).min(1).max(50),
});

export const disputeSingleSchema = z.object({
  contractId: contractId,
  signer: stellarAddress,
  reason: z.string().min(1).max(500),
});

export const disputeMultiSchema = z.object({
  contractId: contractId,
  signer: stellarAddress,
  reason: z.string().min(1).max(500),
  milestoneIndexes: z.array(z.number().int().nonnegative()).min(1).max(50),
});

export const distributionSchema = z.object({
  address: stellarAddress,
  amount: z.number().positive(),
});

export const resolveDisputeSingleSchema = z.object({
  contractId: contractId,
  disputeResolver: stellarAddress,
  distributions: z.array(distributionSchema).min(1).max(50),
});

export const resolveDisputeMultiSchema = resolveDisputeSingleSchema.extend({
  milestoneIndexes: z.array(z.number().int().nonnegative()).min(1).max(50),
});

export const withdrawSchema = z.object({
  contractId: contractId,
  disputeResolver: stellarAddress,
  distributions: z.array(distributionSchema).min(1).max(50),
});

export const extendTtlSchema = z.object({
  contractId: contractId,
  admin: stellarAddress,
  ledgersToExtend: z.number().int().positive(),
});

export const manageMilestonesSingleSchema = z.object({
  contractId: contractId,
  admin: stellarAddress,
  newMilestones: z.array(singleReleaseMilestoneSchema),
  milestoneUpdates: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      newDescription: z.string().min(1).max(500),
    }),
  ),
});

export const manageMilestonesMultiSchema = z.object({
  contractId: contractId,
  admin: stellarAddress,
  newMilestones: z.array(multiReleaseMilestoneSchema),
  milestoneUpdates: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      newDescription: z.string().min(1).max(500).optional(),
      newAmount: z.number().positive().optional(),
    }),
  ),
});

export const updateSingleSchema = z.object({
  contractId: contractId,
  admin: stellarAddress,
  escrow: z.object({
    engagementId: z.string().min(1).max(100),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    amount: z.number().min(0),
    platformFee: z.number().int().min(0).max(100),
    roles: singleReleaseRolesSchema,
    milestones: z.array(singleReleaseMilestoneSchema).min(1).max(50),
    trustline: z.object({
      address: z.string().min(1),
      symbol: z.string().optional(),
      contractId: z.string().optional(),
    }),
    receiverMemo: z.number().int().nonnegative().optional(),
  }),
});

export const updateMultiSchema = z.object({
  contractId: contractId,
  admin: stellarAddress,
  escrow: z.object({
    engagementId: z.string().min(1).max(100),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    platformFee: z.number().int().min(0).max(100),
    roles: multiReleaseRolesSchema,
    milestones: z.array(multiReleaseMilestoneSchema).min(1).max(50),
    trustline: z.object({
      address: z.string().min(1),
      symbol: z.string().optional(),
      contractId: z.string().optional(),
    }),
    receiverMemo: z.number().int().nonnegative().optional(),
  }),
});

export const submitSchema = z.object({
  signedXdr: z.string().min(1),
});

export const escrowTypeSchema = z.enum(["single-release", "multi-release"]);

export const operateLabFormSchema = z.object({
  updateEngagementId: z.string().max(100),
  updateTitle: z.string().max(100),
  updateDescription: z.string().max(500),
  updateAmount: z.number().min(0).optional(),
  updatePlatformFee: z.number().int().min(0).max(100).optional(),
  updateReceiverMemo: z.number().int().nonnegative().optional(),
  updateTrustlineAddress: z.string(),
  updateTrustlineSymbol: z.string(),
  updateTrustlineIsCustom: z.boolean(),
  updateApprovers: z.array(z.string()).max(5),
  updateServiceProviders: z.array(z.string()).max(5),
  updateReleaseSigners: z.array(z.string()).max(5),
  updateDisputeResolvers: z.array(z.string()).max(5),
  updateObservers: z.array(z.string()).max(5),
  updateReceiver: z.string(),
  milestoneDesc: z.string().min(1, "Description is required").max(500),
  milestoneAmount: z.number().positive().optional(),
  milestoneReceiver: z.string().optional(),
  milestoneApprovalsTarget: z.number().int().positive().optional(),
  editMilestoneIndex: z.number().int().nonnegative().optional(),
  editMilestoneDesc: z.string().max(500).optional(),
  editMilestoneAmount: z.number().positive().optional(),
  ledgers: z.number().int().positive("Ledgers must be positive"),
  fundAmount: z.number().positive("Amount must be positive"),
  status: z.string().min(1, "Status is required").max(50),
  evidence: z.string().max(500).optional(),
  reason: z.string().min(1, "Reason is required").max(500),
  distributions: z.string().min(1, "Distributions are required"),
});

export type OperateLabFormValues = z.infer<typeof operateLabFormSchema>;

const trimmedRoleList = z
  .array(z.string())
  .transform((list) => list.map((item) => item.trim()).filter(Boolean))
  .pipe(roleList);

const trimmedObserverList = z
  .array(z.string())
  .transform((list) => list.map((item) => item.trim()).filter(Boolean))
  .pipe(z.array(stellarAddress).max(5, "Maximum 5 observers"));

const updateEscrowLabFieldsBaseSchema = z.object({
  updateEngagementId: z
    .string()
    .trim()
    .min(1, "Engagement id is required")
    .max(100),
  updateTitle: z.string().trim().min(1, "Title is required").max(100),
  updateDescription: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500),
  updateAmount: z.number().min(0).optional(),
  updatePlatformFee: z.number().int().min(0).max(100),
  updateTrustlineAddress: contractId,
  updateTrustlineSymbol: z.string().trim().min(1, "Symbol is required").max(12),
  updateApprovers: trimmedRoleList,
  updateServiceProviders: trimmedRoleList,
  updateReleaseSigners: trimmedRoleList,
  updateDisputeResolvers: trimmedRoleList,
  updateObservers: trimmedObserverList,
  updateReceiver: z.string().optional(),
});

export type UpdateEscrowLabValidatedFields = {
  engagementId: string;
  title: string;
  description: string;
  amount?: number;
  platformFee: number;
  trustline: { address: string; symbol: string };
  roles: {
    approvers: string[];
    serviceProviders: string[];
    releaseSigners: string[];
    disputeResolvers: string[];
    observers: string[];
    receiver?: string;
  };
};

export type UpdateEscrowLabValidationResult =
  | { success: true; data: UpdateEscrowLabValidatedFields }
  | { success: false; fieldErrors: Partial<Record<keyof OperateLabFormValues, string>> };

export function validateUpdateEscrowLabFields(
  values: Pick<
    OperateLabFormValues,
    | "updateEngagementId"
    | "updateTitle"
    | "updateDescription"
    | "updateAmount"
    | "updatePlatformFee"
    | "updateTrustlineAddress"
    | "updateTrustlineSymbol"
    | "updateApprovers"
    | "updateServiceProviders"
    | "updateReleaseSigners"
    | "updateDisputeResolvers"
    | "updateObservers"
    | "updateReceiver"
  >,
  type: "single-release" | "multi-release",
  storedAdmin: string,
  storedPlatform: string,
): UpdateEscrowLabValidationResult {
  const parsed = updateEscrowLabFieldsBaseSchema.safeParse({
    ...values,
    updatePlatformFee: values.updatePlatformFee ?? 0,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof OperateLabFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof OperateLabFormValues] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  const data = parsed.data;
  const fieldErrors: Partial<Record<keyof OperateLabFormValues, string>> = {};

  if (type === "single-release") {
    if (typeof data.updateAmount !== "number" || Number.isNaN(data.updateAmount)) {
      fieldErrors.updateAmount = "Amount is required";
    }
    const receiverResult = stellarAddress.safeParse(
      (data.updateReceiver ?? "").trim(),
    );
    if (!receiverResult.success) {
      fieldErrors.updateReceiver = "Valid receiver address is required";
    }
  }

  const rolesInput =
    type === "single-release"
      ? {
          approvers: data.updateApprovers,
          serviceProviders: data.updateServiceProviders,
          releaseSigners: data.updateReleaseSigners,
          disputeResolvers: data.updateDisputeResolvers,
          observers: data.updateObservers,
          platform: storedPlatform,
          admin: storedAdmin,
          receiver: (data.updateReceiver ?? "").trim(),
        }
      : {
          approvers: data.updateApprovers,
          serviceProviders: data.updateServiceProviders,
          releaseSigners: data.updateReleaseSigners,
          disputeResolvers: data.updateDisputeResolvers,
          observers: data.updateObservers,
          platform: storedPlatform,
          admin: storedAdmin,
        };

  const rolesParsed =
    type === "single-release"
      ? singleReleaseRolesSchema.safeParse(rolesInput)
      : multiReleaseRolesSchema.safeParse(rolesInput);

  if (!rolesParsed.success) {
    for (const issue of rolesParsed.error.issues) {
      const path = issue.path[0];
      const map: Record<string, keyof OperateLabFormValues> = {
        approvers: "updateApprovers",
        serviceProviders: "updateServiceProviders",
        releaseSigners: "updateReleaseSigners",
        disputeResolvers: "updateDisputeResolvers",
        observers: "updateObservers",
        receiver: "updateReceiver",
        admin: "updateApprovers",
        platform: "updateDisputeResolvers",
      };
      if (typeof path === "string" && map[path] && !fieldErrors[map[path]]) {
        fieldErrors[map[path]] = issue.message;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      engagementId: data.updateEngagementId,
      title: data.updateTitle,
      description: data.updateDescription,
      amount: type === "single-release" ? data.updateAmount : undefined,
      platformFee: data.updatePlatformFee,
      trustline: {
        address: data.updateTrustlineAddress,
        symbol: data.updateTrustlineSymbol,
      },
      roles: {
        approvers: data.updateApprovers,
        serviceProviders: data.updateServiceProviders,
        releaseSigners: data.updateReleaseSigners,
        disputeResolvers: data.updateDisputeResolvers,
        observers: data.updateObservers,
        receiver:
          type === "single-release"
            ? (data.updateReceiver ?? "").trim()
            : undefined,
      },
    },
  };
}

export {
  stellarAddress,
  contractId,
};
