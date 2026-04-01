import ProjectAnalyticsPage from "@/features/projects-analytics";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/projects-analytics/")({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD]),
});

function RouteComponent() {
  return <ProjectAnalyticsPage />;
}
