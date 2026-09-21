"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export const LabShellSkeleton = () => (
  <div className="relative flex min-h-svh flex-col">
    <header className="sticky top-0 z-40 border-b border-border bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 md:h-16 md:px-8">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-7 rounded" />
          <Skeleton className="h-5 w-px" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Skeleton className="size-9 rounded-4xl" />
          <Skeleton className="h-9 w-28 rounded-4xl" />
          <Skeleton className="h-9 w-40 rounded-4xl" />
          <Skeleton className="size-9 rounded-4xl" />
        </div>
      </div>
    </header>

    <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:min-h-[calc(100svh-4rem)] md:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="size-12 shrink-0 rounded-lg sm:size-14" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-52 md:h-8 md:w-64" />
              <Skeleton className="h-4 w-64 md:h-5 md:w-80" />
            </div>
          </div>
          <Skeleton className="h-9 w-44 rounded-4xl" />
        </div>
        <Separator />
      </div>

      <Skeleton className="h-9 w-56 rounded-4xl" />

      <div className="rounded-xl ring-1 ring-foreground/10">
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-1 items-center gap-2">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <Skeleton className="hidden h-4 w-20 sm:block" />
                  {index < 2 ? <Skeleton className="h-0.5 flex-1" /> : null}
                </div>
              ))}
            </div>
            <Skeleton className="h-8 w-28 rounded-4xl" />
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-48" />
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/50 p-4 sm:px-6">
          <Skeleton className="h-8 w-20 rounded-4xl" />
          <Skeleton className="h-8 w-24 rounded-4xl" />
        </div>
      </div>
    </main>
  </div>
);
