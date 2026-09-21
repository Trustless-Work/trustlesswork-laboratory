"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { LifecycleFlowCardSkeleton } from "@/features/escrow-lab/ui/operate/lifecycle/LifecycleFlowCard";

export const OperateSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] xl:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)]">
    <div className="flex min-w-0 flex-col gap-4">
      <LifecycleFlowCardSkeleton />
      <section className="rounded-xl bg-card/20 p-4 ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="size-4" />
          </div>
        </div>
      </section>
      <section className="rounded-xl bg-card/20 p-4 ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="size-4" />
          </div>
        </div>
      </section>
      <section className="rounded-xl bg-card/20 p-4 ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="size-4" />
          </div>
        </div>
      </section>
    </div>
    <div className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100svh-9rem)] lg:overflow-y-auto">
      <aside className="flex flex-col gap-4 lg:gap-6">
        <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-1 h-4 w-52" />
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-5 w-16 rounded-4xl" />
              </div>
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="border-t border-border pt-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="mt-1.5 h-8 w-full rounded-xl sm:rounded-full" />
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-[4px]" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-8 rounded-4xl" />
                </div>
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-2.5"
              >
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-5 rounded-4xl" />
                  </div>
                  <Skeleton className="h-7 w-full rounded-xl sm:rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  </div>
);
