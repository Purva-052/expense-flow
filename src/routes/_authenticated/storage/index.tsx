import SystemInventoryPage from "@/features/system-inventory-masters";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/storage/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN]),
});

function RouteComponent() {
  return <SystemInventoryPage masterType="storage" />;
}
