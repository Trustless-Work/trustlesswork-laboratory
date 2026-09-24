"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/shared/CopyButton";
import { JsonCodeBlock } from "@/components/shared/JsonCodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stringifyConsoleJson } from "@/features/escrow-lab/helpers/console-display.helper";
import { humanizeEscrowError } from "@/features/escrow-lab/helpers/error-message.helper";
import { LabApiError } from "@/features/escrow-lab/services/lab-api.service";

interface InfoEndpointResultProps {
  request: Record<string, unknown> | null;
  response: unknown;
  error: unknown;
  isPending: boolean;
  hasRun: boolean;
}

interface ResultPanel {
  id: string;
  label: string;
  copyValue: string;
  data?: unknown;
  tone?: "destructive";
}

export const InfoEndpointResult = ({
  request,
  response,
  error,
  isPending,
  hasRun,
}: InfoEndpointResultProps) => {
  const panels = useMemo(
    () => buildPanels(request, response, error),
    [request, response, error],
  );
  const defaultTab = panels[0]?.id ?? "empty";
  const [tab, setTab] = useState(defaultTab);
  const activeTab = panels.some((panel) => panel.id === tab)
    ? tab
    : defaultTab;
  const activePanel =
    panels.find((panel) => panel.id === activeTab) ?? panels[0] ?? null;

  return (
    <Card size="sm" className="flex min-h-72 flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <CardTitle>Result</CardTitle>
          <CardDescription>
            Same request / response / error layout as the transaction console
            after deploy.
          </CardDescription>
        </div>
        {error ? <Badge variant="destructive">Error</Badge> : null}
        {!error && hasRun && !isPending ? (
          <Badge variant="outline">Success</Badge>
        ) : null}
        {isPending ? <Badge variant="secondary">Loading</Badge> : null}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
        {!hasRun && !isPending ? (
          <p className="m-4 rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
            Run a request to inspect the payload and response JSON.
          </p>
        ) : null}

        {hasRun || isPending ? (
          <Tabs
            value={activeTab}
            onValueChange={setTab}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5">
              <TabsList className="h-8 min-w-0 flex-1 justify-start overflow-x-auto">
                {panels.map((panel) => (
                  <TabsTrigger
                    key={panel.id}
                    value={panel.id}
                    className="shrink-0 px-2.5 text-xs sm:text-sm"
                  >
                    {panel.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {activePanel ? (
                <CopyButton
                  value={activePanel.copyValue}
                  label={`${activePanel.label} copied`}
                  className="shrink-0"
                />
              ) : null}
            </div>

            {panels.map((panel) => (
              <TabsContent
                key={panel.id}
                value={panel.id}
                className="mt-0 min-h-48 flex-1 overflow-hidden data-[state=inactive]:hidden"
              >
                <div className="h-full max-h-96 overflow-y-auto overscroll-contain">
                  {panel.tone === "destructive" ? (
                    <p className="m-4 rounded-lg bg-destructive/10 px-2.5 py-2 text-sm text-destructive">
                      {panel.copyValue}
                    </p>
                  ) : (
                    <JsonCodeBlock value={panel.data ?? panel.copyValue} />
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : null}
      </CardContent>
    </Card>
  );
};

function buildPanels(
  request: Record<string, unknown> | null,
  response: unknown,
  error: unknown,
): ResultPanel[] {
  const panels: ResultPanel[] = [];

  if (error) {
    const message =
      error instanceof LabApiError
        ? humanizeEscrowError(error.code, error.message)
        : error instanceof Error
          ? error.message
          : "Request failed";
    panels.push({
      id: "error",
      label: "Error",
      copyValue: message,
      tone: "destructive",
    });
    if (error instanceof LabApiError && error.body !== undefined) {
      panels.push({
        id: "error-body",
        label: "Error body",
        copyValue: stringifyConsoleJson(error.body),
        data: error.body,
      });
    }
  }

  if (request) {
    panels.push({
      id: "request",
      label: "Request",
      copyValue: stringifyConsoleJson(request),
      data: request,
    });
  }

  if (response !== undefined && response !== null && !error) {
    panels.push({
      id: "response",
      label: "Response",
      copyValue: stringifyConsoleJson(response),
      data: response,
    });
  }

  if (panels.length === 0) {
    panels.push({
      id: "empty",
      label: "Waiting",
      copyValue: "…",
    });
  }

  return panels;
}
