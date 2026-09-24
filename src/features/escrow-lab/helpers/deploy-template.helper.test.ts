import { describe, expect, it } from "vitest";
import {
  buildMultiDeployTemplate,
  buildSingleDeployTemplate,
  LAB_ADMIN,
  LAB_DISPUTE_RESOLVER,
  LAB_OBSERVER,
} from "./deploy-template.helper";
import {
  deployMultiFormSchema,
  deployMultiSchema,
  deploySingleFormSchema,
  deploySingleSchema,
} from "@/features/escrow-lab/schemas/operate.schema";
import { stripDeployFormUiFields } from "@/features/escrow-lab/helpers/deploy-defaults.helper";

const WALLET = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

describe("deploy templates", () => {
  it("builds a valid single-release template", () => {
    const template = buildSingleDeployTemplate(WALLET);
    expect(deploySingleFormSchema.safeParse(template).success).toBe(true);
    const parsed = deploySingleSchema.safeParse(
      stripDeployFormUiFields(template),
    );
    expect(
      parsed.success,
      parsed.success ? undefined : JSON.stringify(parsed.error.issues),
    ).toBe(true);
    expect(template.roles.admin).toBe(LAB_ADMIN);
    expect(template.roles.disputeResolvers[0]).toBe(LAB_DISPUTE_RESOLVER);
    expect(template.roles.observers).toEqual([LAB_OBSERVER]);
    expect(template.roles.receiver).toBe(WALLET);
    expect(template.trustlineIsCustom).toBe(false);
  });

  it("builds a valid multi-release template", () => {
    const template = buildMultiDeployTemplate(WALLET);
    expect(deployMultiFormSchema.safeParse(template).success).toBe(true);
    const parsed = deployMultiSchema.safeParse(
      stripDeployFormUiFields(template),
    );
    expect(
      parsed.success,
      parsed.success ? undefined : JSON.stringify(parsed.error.issues),
    ).toBe(true);
    expect(template.roles.admin).toBe(LAB_ADMIN);
    expect(template.roles.disputeResolvers[0]).toBe(LAB_DISPUTE_RESOLVER);
    expect(template.roles.observers).toEqual([LAB_OBSERVER]);
    expect(template.milestones).toHaveLength(2);
    expect(template.trustlineIsCustom).toBe(false);
  });
});
