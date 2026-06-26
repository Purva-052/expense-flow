import ClientInventoryPage from "@/features/client-inventory";
import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/utils/requireRole";
import { roles } from "@/utils/constant";

export const Route = createFileRoute("/_authenticated/client-inventory/")({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD], {
      allowedTech: [29, 37],
    }),
});

function RouteComponent() {
  return <ClientInventoryPage />;
}
