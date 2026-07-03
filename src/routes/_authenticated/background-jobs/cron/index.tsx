import CronJobsPage from "@/features/background-jobs/cron";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/background-jobs/cron/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN, roles.PROJECT_MANAGER]),
});

function RouteComponent() {
  return <CronJobsPage />;
}
