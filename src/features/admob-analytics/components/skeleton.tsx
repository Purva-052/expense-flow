import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const AdMobAnalyticsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="border-slate-200 dark:border-slate-800">
            <CardContent className="space-y-4 py-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />
        </CardContent>
      </Card>
    </div>
  );
};
