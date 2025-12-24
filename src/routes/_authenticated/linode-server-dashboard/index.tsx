import LinodeDashboard from "@/features/linode-server-dashboard";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/linode-server-dashboard/"
)({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER]),
});

function RouteComponent() {
  return <LinodeDashboard />;
}
