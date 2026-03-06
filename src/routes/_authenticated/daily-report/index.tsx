import DailyReportPage from "@/features/daily-report";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/daily-report/")({
  component: DailyReportPage,
  validateSearch: (search: Record<string, unknown>) => {
    const openPendingReports =
      search.openPendingReports === true ||
      search.openPendingReports === "true"
        ? true
        : undefined;

    const type =
      search.type === "pending" ||
      search.type === "incomplete" ||
      search.type === "holiday"
        ? search.type
        : undefined;

    const userId =
      typeof search.userId === "string" || typeof search.userId === "number"
        ? String(search.userId)
        : undefined;

    const openPendingReportsAtRaw = search.openPendingReportsAt;
    const openPendingReportsAtParsed =
      typeof openPendingReportsAtRaw === "number"
        ? openPendingReportsAtRaw
        : typeof openPendingReportsAtRaw === "string" &&
            openPendingReportsAtRaw.trim() !== ""
          ? Number(openPendingReportsAtRaw)
          : undefined;

    const openPendingReportsAt =
      typeof openPendingReportsAtParsed === "number" &&
      Number.isFinite(openPendingReportsAtParsed)
        ? openPendingReportsAtParsed
        : undefined;

    return {
      openPendingReports,
      openPendingReportsAt,
      type,
      userId,
    };
  },
  beforeLoad: () =>
    requireRole([
      roles.ADMIN,
      roles.TEAM_LEAD,
      roles.PROJECT_MANAGER,
      roles.DEVELOPER,
      roles.BDE,
    ]),
});
