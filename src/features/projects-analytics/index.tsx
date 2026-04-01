import { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import TablePageHeader from "@/components/table/table-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Timer,
} from "lucide-react";
import {
  ProjectAnalyticsItem,
  ProjectAnalyticsSummary,
  useGetProjectAnalytics,
} from "./services";

const SUMMARY_CARD_STYLES: Record<
  keyof ProjectAnalyticsSummary,
  {
    label: string;
    icon: typeof FolderKanban;
    iconClassName: string;
    iconWrapperClassName: string;
    helperText: string;
    selectedCardClassName?: string;
    selectedLabelClassName?: string;
    selectedNumberClassName?: string;
    selectedIconWrapperClassName?: string;
    selectedIconClassName?: string;
  }
> = {
  total: {
    label: "Total Projects",
    icon: BriefcaseBusiness,
    iconClassName: "text-slate-700",
    iconWrapperClassName: "bg-slate-100",
    helperText: "All tracked projects",
    // selectedCardClassName: "bg-amber-50 border-amber-200 ring-2 ring-amber-100",
    // selectedLabelClassName: "text-amber-700",
    // selectedNumberClassName: "text-amber-900",
    // selectedIconWrapperClassName: "bg-amber-200",
    // selectedIconClassName: "text-amber-700",
  },
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    iconClassName: "text-rose-700",
    iconWrapperClassName: "bg-rose-100",
    helperText: "Need immediate attention",
    selectedCardClassName: "bg-red-50 border-red-200 ring-2 ring-red-100",
    selectedLabelClassName: "text-red-700",
    selectedNumberClassName: "text-red-900",
    selectedIconWrapperClassName: "bg-red-200",
    selectedIconClassName: "text-red-700",
  },
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    iconClassName: "text-emerald-700",
    iconWrapperClassName: "bg-emerald-100",
    helperText: "Performing as expected",
    selectedCardClassName: "bg-green-50 border-green-200 ring-2 ring-green-100",
    selectedLabelClassName: "text-green-700",
    selectedNumberClassName: "text-green-900",
    selectedIconWrapperClassName: "bg-green-200",
    selectedIconClassName: "text-green-700",
  },
  on_track: {
    label: "On Track",
    icon: Activity,
    iconClassName: "text-sky-700",
    iconWrapperClassName: "bg-sky-100",
    helperText: "Progress is stable",
    selectedCardClassName: "bg-blue-50 border-blue-200 ring-2 ring-blue-100",
    selectedLabelClassName: "text-blue-700",
    selectedNumberClassName: "text-blue-900",
    selectedIconWrapperClassName: "bg-blue-200",
    selectedIconClassName: "text-blue-700",
  },
  // not_started: {
  //   label: "Not Started",
  //   icon: Clock3,
  //   iconClassName: "text-amber-700",
  //   iconWrapperClassName: "bg-amber-100",
  //   helperText: "Waiting to begin",
  // },
};

const HEALTH_COLORS: Record<string, string> = {
  critical: "#f43f5e",
  healthy: "#10b981",
  on_track: "#0ea5e9",
  // not_started: "#f59e0b",
};

const formatHours = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

const CLICKABLE_SUMMARY_KEYS = [
  "total",
  "critical",
  "healthy",
  "on_track",
  // "not_started",
] as const;

type SummaryFilterKey = (typeof CLICKABLE_SUMMARY_KEYS)[number];

const ProjectAnalyticsPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedHealthFilter, setSelectedHealthFilter] =
    useState<SummaryFilterKey>("total");
  const { data, isPending } = useGetProjectAnalytics();

  const summary = data?.data?.summary;
  const projectItems = data?.data?.data ?? [];

  useEffect(() => {
    if (!projectItems.length || selectedProjectId === "all") {
      return;
    }

    const hasSelectedProject = projectItems.some(
      (item) => String(item.projectId) === selectedProjectId
    );

    if (!hasSelectedProject) {
      setSelectedProjectId("all");
    }
  }, [projectItems, selectedProjectId]);

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All Projects" },
      ...projectItems
        .map((item) => ({
          value: String(item.projectId),
          label: item.projectName,
        }))
        .sort((first, second) => first.label.localeCompare(second.label)),
    ],
    [projectItems]
  );

  const filteredProjects = useMemo(() => {
    const projectsForSelection =
      selectedProjectId === "all"
        ? projectItems
        : projectItems.filter(
            (item) => String(item.projectId) === selectedProjectId
          );

    if (selectedHealthFilter === "total") {
      return projectsForSelection;
    }

    return projectsForSelection.filter(
      (item) => item.projectHealth === selectedHealthFilter
    );
  }, [projectItems, selectedHealthFilter, selectedProjectId]);

  const chartProjects = useMemo(() => {
    if (selectedProjectId === "all" && selectedHealthFilter === "total") {
      return [...filteredProjects]
        .sort(
          (first, second) =>
            Math.max(second.actualHours, second.plannedHours) -
            Math.max(first.actualHours, first.plannedHours)
        )
        .slice(0, 12);
    }

    return [...filteredProjects].sort((first, second) =>
      first.projectName.localeCompare(second.projectName)
    );
  }, [filteredProjects, selectedHealthFilter, selectedProjectId]);

  const totalPlannedHours = chartProjects.reduce(
    (sum, item) => sum + item.plannedHours,
    0
  );
  const totalActualHours = chartProjects.reduce(
    (sum, item) => sum + item.actualHours,
    0
  );

  const selectedProject = projectItems.find(
    (item) => String(item.projectId) === selectedProjectId
  );

  const chartTitle =
    selectedProjectId === "all" && selectedHealthFilter === "total"
      ? "Top workload comparison"
      : selectedProjectId !== "all"
        ? `${selectedProject?.projectName ?? "Project"} hour comparison`
        : `${SUMMARY_CARD_STYLES[selectedHealthFilter].label} project comparison`;

  const chartDescription =
    selectedProjectId === "all" && selectedHealthFilter === "total"
      ? `Showing the top ${chartProjects.length} projects by workload to keep the graph readable.`
      : selectedProjectId !== "all"
        ? `Planned and actual hours for ${selectedProject?.projectName ?? "the selected project"}${
            selectedHealthFilter === "total"
              ? "."
              : ` in ${SUMMARY_CARD_STYLES[selectedHealthFilter].label.toLowerCase()} state.`
          }`
        : `Showing ${chartProjects.length} ${SUMMARY_CARD_STYLES[selectedHealthFilter].label.toLowerCase()} project${
            chartProjects.length === 1 ? "" : "s"
          } in the comparison graph.`;

  return (
    <PageLayout>
      <div className="space-y-6">
        <TablePageHeader title="Project Analytics" showActionButton={false}>
          Track planned hours against actual hours with project-level filtering.
        </TablePageHeader>

        {isPending ? (
          <ProjectAnalyticsSkeleton />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summary ? (
                (
                  Object.keys(SUMMARY_CARD_STYLES) as Array<
                    keyof ProjectAnalyticsSummary
                  >
                ).map((key) => {
                  const config = SUMMARY_CARD_STYLES[key];
                  const Icon = config.icon;

                  return (
                    <Card
                      key={key}
                      className={cn(
                        "border-slate-200 px-0 py-0 transition-all hover:shadow-md",
                        "cursor-pointer",
                        selectedHealthFilter === key &&
                          config.selectedCardClassName
                      )}
                      onClick={() => setSelectedHealthFilter(key)}
                    >
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p
                              className={cn(
                                "text-xs font-semibold uppercase tracking-wide",
                                selectedHealthFilter === key
                                  ? config.selectedLabelClassName
                                  : "text-slate-400"
                              )}
                            >
                              {config.label}
                            </p>
                            <p
                              className={cn(
                                "mt-3 text-3xl font-bold tracking-tight",
                                selectedHealthFilter === key
                                  ? config.selectedNumberClassName
                                  : "text-slate-900"
                              )}
                            >
                              {summary[key]}
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {config.helperText}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "rounded-xl p-2",
                              selectedHealthFilter === key
                                ? config.selectedIconWrapperClassName
                                : config.iconWrapperClassName
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                selectedHealthFilter === key
                                  ? config.selectedIconClassName
                                  : config.iconClassName
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="col-span-full border-dashed">
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    Summary data is not available right now.
                  </CardContent>
                </Card>
              )}
            </section>

            <Card className="border-slate-200 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{chartTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {chartDescription}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="grid gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Filter by project
                    </span>
                    <SimpleDropDownSearchable
                      options={projectOptions}
                      value={selectedProjectId || "all"}
                      onChange={(value) => setSelectedProjectId(value ?? "all")}
                      placeholder="All Projects"
                      className="min-w-[220px] sm:w-[280px]"
                      maxHeight={320}
                      allowClear={false}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                    <MetricPill
                      label="Planned"
                      value={`${formatHours(totalPlannedHours)} hrs`}
                      tone="planned"
                    />
                    <MetricPill
                      label="Actual"
                      value={`${formatHours(totalActualHours)} hrs`}
                      tone="actual"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {chartProjects.length > 0 ? (
                  <>
                    <div className="h-[420px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartProjects}
                          margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
                          barGap={10}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="projectName"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={chartProjects.length > 6 ? -20 : 0}
                            textAnchor={
                              chartProjects.length > 6 ? "end" : "middle"
                            }
                            height={chartProjects.length > 6 ? 70 : 40}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}h`}
                          />
                          <Tooltip
                            cursor={{ fill: "#f8fafc" }}
                            formatter={(value: number, name: string) => [
                              `${formatHours(value)} hrs`,
                              name === "plannedHours"
                                ? "Planned Hours"
                                : "Actual Hours",
                            ]}
                            labelFormatter={(label) => `Project: ${label}`}
                          />
                          <Legend
                            formatter={(value) =>
                              value === "plannedHours"
                                ? "Planned Hours"
                                : "Actual Hours"
                            }
                          />
                          <Bar
                            dataKey="plannedHours"
                            name="plannedHours"
                            fill="#2563eb"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={42}
                          />
                          <Bar
                            dataKey="actualHours"
                            name="actualHours"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={42}
                          >
                            {chartProjects.map((item: ProjectAnalyticsItem) => (
                              <Cell
                                key={`actual-${item.projectId}`}
                                fill={
                                  HEALTH_COLORS[item.projectHealth] ?? "#64748b"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium text-slate-700">
                        Actual hour color indicates project health:
                      </span>
                      {Object.entries(HEALTH_COLORS).map(([health, color]) => (
                        <span
                          key={health}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {health.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground">
                    No analytics data found for the selected project.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
};

const MetricPill = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "planned" | "actual";
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition-shadow hover:shadow-sm",
        tone === "planned"
        // ? "border-blue-200 bg-blue-50"
        // : "border-emerald-200 bg-emerald-50"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label} Hours
          </p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg p-2",
            tone === "planned"
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700"
          )}
        >
          {tone === "planned" ? (
            <CalendarClock className="h-4 w-4" />
          ) : (
            <Timer className="h-4 w-4" />
          )}
        </div>
      </div>
      <p className="text-[11px] font-medium leading-4 text-slate-400">
        {tone === "planned"
          ? "Estimated effort in selected view"
          : "Tracked effort in selected view"}
      </p>
    </div>
  );
};

const ProjectAnalyticsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="gap-4 border-slate-200">
            <CardContent className="space-y-3 py-5">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              <div className="h-1.5 w-full animate-pulse rounded bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-[280px] animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-[120px] animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-[120px] animate-pulse rounded bg-slate-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[420px] w-full animate-pulse rounded-xl bg-slate-100" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalyticsPage;
