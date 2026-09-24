"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const InfoSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
    <aside className="rounded-xl border border-border p-3">
      <Skeleton className="mb-3 h-3 w-20" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </aside>
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="rounded-xl border border-border p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-3 h-32 w-full" />
      </div>
      <div className="rounded-xl border border-border p-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="mt-3 h-48 w-full" />
      </div>
    </div>
  </div>
);
