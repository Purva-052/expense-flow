import { ColumnDef } from "@tanstack/react-table";
import { AdMobAppPerformance, AdMobPlatform } from "../types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const parseAdMobDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 8) return new Date();
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
};

const PlatformBadge = ({ platform }: { platform: AdMobPlatform }) => {
  const isAndroid = platform === "Android";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isAndroid
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
      }`}
    >
      {isAndroid ? (
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zm-2.5-1C2.67 17 2 17.67 2 18.5v5c0 .83.67 1.5 1.5 1.5S5 24.33 5 23.5v-5C5 17.67 4.33 17 3.5 17zm17 0c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5zm-4.97-15l1.96-1.96c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-2.24 2.23C13.09 1.21 12.56 1 12 1s-1.09.21-1.54.56L8.22.33c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71L9.47 3C8.01 3.82 7 5.3 7 7h10c0-1.7-1.01-3.18-2.47-4z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.2 1.28-2.18 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      )}
      {platform}
    </span>
  );
};

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  let colorClass = "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
  if (status === "APPROVED") {
    colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  } else if (status === "ACTION_REQUIRED") {
    colorClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
  } else if (status === "IN_REVIEW") {
    colorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass)}>
      {label}
    </span>
  );
};

export const columns: ColumnDef<AdMobAppPerformance>[] = [
  {
    accessorKey: "appName",
    header: "App Name",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white bg-primary/20 text-primary"
          >
            {app.appName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{app.appName}</p>
            <p className="text-[11px] text-muted-foreground font-mono leading-tight mt-0.5 truncate max-w-[240px]">
              {app.appId}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => <PlatformBadge platform={row.original.platform} />,
  },
  {
    accessorKey: "earnings",
    header: "Earnings",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600 dark:text-green-400">
        {row.original.displayEarnings}
      </span>
    ),
  },
  {
    accessorKey: "impressions",
    header: "Impressions",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.impressions.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
    cell: ({ row }) => <span className="font-medium">{row.original.clicks}</span>,
  },
  {
    accessorKey: "displayCtr",
    header: "CTR",
    cell: ({ row }) => {
      const ctr = row.original.displayCtr;
      return (
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {ctr}
        </span>
      );
    },
  },
];

export const appColumns: ColumnDef<any>[] = [
  {
    accessorKey: "appName",
    header: "App Name",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white bg-primary/20 text-primary">
            {app.appName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{app.appName}</p>
            <p className="text-[11px] text-muted-foreground font-mono leading-tight mt-0.5 truncate max-w-[240px]">
              {app.appId}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => <PlatformBadge platform={row.original.platform} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} label={row.original.statusLabel} />,
  },
  {
    accessorKey: "estimatedEarnings",
    header: "Earnings",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600 dark:text-green-400">
        {row.original.displayEstimatedEarnings}
      </span>
    ),
  },
  {
    accessorKey: "fillRate",
    header: "Fill Rate",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.displayFillRate}</span>
    ),
  },
  {
    accessorKey: "lastReportDate",
    header: "Last Report Date",
    cell: ({ row }) => format(parseAdMobDate(row.original.lastReportDate), "dd/MM/yyyy"),
  },
];
