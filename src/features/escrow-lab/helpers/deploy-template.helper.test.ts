import { describe, expect, it } from "vitest";
import {
  buildMultiDeployTemplate,
  buildSingleDeployTemplate,
  LAB_ADMIN,
  LAB_DISPUTE_RESOLVER,
  LAB_OBSERVER,
} from "./deploy-template.helper";
import {
  deployMultiSchema,
  deploySingleSchema,
} from "@/features/escrow-lab/schemas/operate.schema";

const WALLET = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

describe("deploy templates", () => {
  it("builds a valid single-release template", () => {
    const template = buildSingleDeployTemplate(WALLET);
    const parsed = deploySingleSchema.safeParse(template);
    expect(
      parsed.success,
      parsed.success ? undefined : JSON.stringify(parsed.error.issues),
    ).toBe(true);
    expect(template.roles.admin).toBe(LAB_ADMIN);
    expect(template.roles.disputeResolvers[0]).toBe(LAB_DISPUTE_RESOLVER);
    expect(template.roles.observers).toEqual([LAB_OBSERVER]);
    expect(template.roles.receiver).toBe(WALLET);
  });

  it("builds a valid multi-release template", () => {
    const template = buildMultiDeployTemplate(WALLET);
    const parsed = deployMultiSchema.safeParse(template);
    expect(
      parsed.success,
      parsed.success ? undefined : JSON.stringify(parsed.error.issues),
    ).toBe(true);
    expect(template.roles.admin).toBe(LAB_ADMIN);
    expect(template.roles.disputeResolvers[0]).toBe(LAB_DISPUTE_RESOLVER);
    expect(template.roles.observers).toEqual([LAB_OBSERVER]);
    expect(template.milestones).toHaveLength(2);
  });
});
