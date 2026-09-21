"use client";

import { useState } from "react";
import { KeyRoundIcon, LockIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { maskApiKey } from "@/features/escrow-lab/lib/lab-api-key";
import { useLabApiKey } from "@/features/escrow-lab/hooks/useLabApiKey";

export const LabApiKeyButton = () => {
  const { apiKey, hasKey, save, clear } = useLabApiKey();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setDraft("");
  };

  const handleSave = () => {
    if (!draft.trim()) {
      toast.error("Enter an API key");
      return;
    }
    save(draft);
    setOpen(false);
    toast.success("API key saved for this session");
  };

  const handleClear = () => {
    clear();
    setDraft("");
    setOpen(false);
    toast.success("API key cleared — using server default");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="bg-transparent"
              aria-label={hasKey ? "API key configured" : "Configure API key"}
            >
              {hasKey ? (
                <ShieldCheckIcon className="size-4" />
              ) : (
                <KeyRoundIcon className="size-4" />
              )}
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {hasKey ? "API key active" : "Set API key"}
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API key</DialogTitle>
          <DialogDescription>
            Optional tab override. Stored in session storage and sent only to
            this app&apos;s BFF.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {hasKey && apiKey ? (
            <p className="rounded-lg border border-border bg-muted/40 px-2.5 py-2 font-mono text-xs text-muted-foreground">
              Active: {maskApiKey(apiKey)}
            </p>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-2.5 py-2 text-sm text-muted-foreground">
              No custom key — using server default.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lab-api-key">API key</Label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lab-api-key"
                type="password"
                autoComplete="off"
                placeholder="tw_…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="pl-8 font-mono"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {hasKey ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClear}
            >
              Clear
            </Button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
