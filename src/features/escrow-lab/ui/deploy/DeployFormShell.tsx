"use client";

import { useState, type BaseSyntheticEvent } from "react";
import type {
  FieldValues,
  Path,
  UseFieldArrayReturn,
  UseFormReturn,
} from "react-hook-form";
import { CheckIcon, LayoutTemplateIcon, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/shared/Container";
import {
  IdentityFields,
  RolesFields,
  TermsFields,
} from "@/features/escrow-lab/ui/deploy/DeployFields";
import { MilestonesFields } from "@/features/escrow-lab/ui/deploy/DeployMilestones";
import { cn } from "@/lib/utils";

type DeployStep = 0 | 1 | 2;

const STEPS = [
  { id: 0 as const, label: "Details" },
  { id: 1 as const, label: "Roles" },
  { id: 2 as const, label: "Milestones" },
] as const;

export interface DeployFormShellProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  onApplyTemplate: () => void;
  isPending: boolean;
  walletAddress: string | null;
  milestones: UseFieldArrayReturn<T, never>;
  isSingle: boolean;
  stepFields: Path<T>[][];
}

export const DeployFormShell = <T extends FieldValues>({
  form,
  onSubmit,
  onApplyTemplate,
  isPending,
  walletAddress,
  milestones,
  isSingle,
  stepFields,
}: DeployFormShellProps<T>) => {
  const [step, setStep] = useState<DeployStep>(0);

  const goNext = async () => {
    const fields = stepFields[step] ?? [];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((prev) => Math.min(2, prev + 1) as DeployStep);
  };

  const goBack = () => {
    setStep((prev) => Math.max(0, prev - 1) as DeployStep);
  };

  const handleFormSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    if (step !== 2) return;
    void onSubmit(event);
  };

  return (
    <Container className="gap-0 p-0 sm:p-0">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav
                className="flex min-w-0 flex-1 items-center gap-0"
                aria-label="Deploy steps"
              >
                {STEPS.map((item, index) => {
                  const done = index < step;
                  const active = index === step;
                  return (
                    <div key={item.id} className="flex min-w-0 flex-1 items-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (index <= step) setStep(item.id);
                        }}
                        aria-current={active ? "step" : undefined}
                        aria-label={`${item.label}, step ${index + 1} of ${STEPS.length}`}
                        className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors duration-100",
                            done &&
                              "bg-primary text-primary-foreground",
                            active &&
                              "border-2 border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
                            !done &&
                              !active &&
                              "border border-border text-muted-foreground",
                          )}
                        >
                          {done ? (
                            <CheckIcon className="size-4" />
                          ) : (
                            <span className="tabular-nums">{index + 1}</span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "hidden truncate text-sm font-medium sm:inline",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                      {index < STEPS.length - 1 ? (
                        <span
                          className={cn(
                            "mx-2 h-0.5 min-w-4 flex-1 rounded-full",
                            done ? "bg-primary" : "bg-border",
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  );
                })}
              </nav>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!walletAddress}
                onClick={onApplyTemplate}
              >
                <LayoutTemplateIcon data-icon="inline-start" />
                Template
              </Button>
            </div>

            {step === 1 ? (
              <Alert>
                <AlertTitle>Role separation</AlertTitle>
                <AlertDescription>
                  Admin and dispute resolvers must not overlap operational
                  roles. The template uses placeholder addresses for admin,
                  dispute resolver, and observer.
                </AlertDescription>
              </Alert>
            ) : null}

            {!walletAddress ? (
              <Alert>
                <WalletIcon />
                <AlertTitle>Wallet required</AlertTitle>
                <AlertDescription>
                  Connect a wallet to deploy this escrow.
                </AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup className="gap-5">
              {step === 0 ? (
                <div className="flex flex-col gap-5">
                  <section className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Identity</h3>
                      <p className="text-xs text-muted-foreground">
                        Engagement reference and copy.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <IdentityFields form={form} />
                    </div>
                  </section>
                  <section className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Fees & asset</h3>
                      <p className="text-xs text-muted-foreground">
                        Amount, platform fee, and trustline.
                      </p>
                    </div>
                    <TermsFields form={form} isSingle={isSingle} />
                  </section>
                </div>
              ) : null}

              {step === 1 ? (
                <RolesFields form={form} isSingle={isSingle} />
              ) : null}

              {step === 2 ? (
                <MilestonesFields
                  form={form}
                  milestones={milestones}
                  isSingle={isSingle}
                  walletAddress={walletAddress}
                />
              ) : null}
            </FieldGroup>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goBack}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button type="button" size="sm" onClick={() => void goNext()}>
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={isPending || !walletAddress}
                onClick={() => void onSubmit()}
              >
                {isPending ? "Deploying…" : "Deploy escrow"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </Container>
  );
};
