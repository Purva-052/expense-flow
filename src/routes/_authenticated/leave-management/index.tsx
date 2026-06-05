import LeaveManagementPage from "@/features/leave-management";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/leave-management/")({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([
      roles.ADMIN,
      roles.TEAM_LEAD,
      roles.PROJECT_MANAGER,
      roles.DEVELOPER,
      roles.BDE,
    ]),
});

function RouteComponent() {
  return <LeaveManagementPage />;
}
