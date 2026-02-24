import DailyReportPage from "@/features/daily-report";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/daily-report/")({
  component: DailyReportPage,
  validateSearch: (search: Record<string, unknown>) => ({
    openPendingReports:
      search.openPendingReports === true ||
      search.openPendingReports === "true",
  }),
  beforeLoad: () =>
    requireRole([
      roles.ADMIN,
      roles.TEAM_LEAD,
      roles.PROJECT_MANAGER,
      roles.DEVELOPER,
      roles.BDE,
    ]),
});
