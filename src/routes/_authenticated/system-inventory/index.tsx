import SystemInventoryPage from "@/features/system-inventory";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/system-inventory/")({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole(
      [
        roles.ADMIN,
        roles.TEAM_LEAD,
        roles.PROJECT_MANAGER,
        roles.DEVELOPER,
        roles.BDE,
      ],
      { allowedTech: [29, 37] }
    ),
});

function RouteComponent() {
  return <SystemInventoryPage />;
}
