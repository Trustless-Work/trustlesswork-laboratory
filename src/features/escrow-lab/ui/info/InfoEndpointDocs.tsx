"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/shared/CopyButton";
import type { InfoEndpointDef } from "@/features/escrow-lab/constants/info-endpoints";
import { Icon } from "@/features/escrow-lab/ui/Icon";

interface InfoEndpointDocsProps {
  endpoint: InfoEndpointDef;
  maskedApiKey: string;
}

export const InfoEndpointDocs = ({
  endpoint,
  maskedApiKey,
}: InfoEndpointDocsProps) => (
  <Card size="sm">
    <CardHeader className="gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
              <Icon
                icon={endpoint.icon}
                className="size-4 text-muted-foreground"
              />
            </span>
            <CardTitle className="text-base sm:text-lg">
              {endpoint.title}
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[11px]">
              {endpoint.method}
            </Badge>
          </div>
          <CardDescription>
            Authenticated with API key{" "}
            <span className="font-mono text-foreground">{maskedApiKey}</span>.
            Lab BFF forwards to Core.
          </CardDescription>
        </div>
      </div>

      <CodeSnippet
        label="HTTP"
        value={`${endpoint.method} ${endpoint.corePath}`}
      />
      <CodeSnippet label="Lab BFF" value={endpoint.labPath} />
    </CardHeader>

    <CardContent className="grid gap-4 text-sm">
      <ProseBlock label="What it is for" value={endpoint.purpose} />
      <ProseBlock label="How to use it" value={endpoint.howToUse} />
      <CodeSnippet label="Request" value={endpoint.requestShape} />
      <CodeSnippet label="Response" value={endpoint.responseShape} />
    </CardContent>
  </Card>
);

const ProseBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 leading-relaxed text-foreground">{value}</p>
  </div>
);

const CodeSnippet = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="min-w-0">
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <CopyButton value={value} label={`${label} copied`} />
    </div>
    <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre sm:text-xs">
      {value}
    </pre>
  </div>
);
