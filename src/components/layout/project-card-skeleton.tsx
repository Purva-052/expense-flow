import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ProjectCardSkeletonProps = {
  view?: "board" | "grid" | "list";
  className?: string;
};

export function ProjectCardSkeleton({
  view = "grid",
  className,
}: ProjectCardSkeletonProps) {
  if (view === "list") {
    return (
      <div
        className={cn(
          "min-w-[860px] bg-card border-b py-4 px-6 flex items-center gap-4",
          className
        )}
      >
        <Skeleton className="w-1 h-8 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="w-32 shrink-0 flex justify-center">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="w-48 shrink-0 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="w-28 shrink-0 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="w-24 shrink-0 flex gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="w-[64px] shrink-0 flex justify-end">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    );
  }

  if (view === "board") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card shadow-md",
          className
        )}
      >
        <div className="grid grid-cols-1 items-start lg:grid-cols-[180px_1fr]">
          <div className="flex flex-col gap-3 border-l-8 border-l-gray-200 bg-secondary/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="mt-auto flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="relative flex min-h-[168px] flex-col gap-3 p-4">
            <div className="absolute right-4 top-4">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card border-l-4 border-l-muted rounded-lg shadow-sm p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="flex gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <div className="flex justify-between mb-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>

      <Skeleton className="h-2 w-full rounded-full mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
