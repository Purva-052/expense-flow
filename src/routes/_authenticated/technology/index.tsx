import TechnologyPage from "@/features/technology";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/technology/")({
  component: RouteComponent,
  beforeLoad: () => requireRole(["admin", "team_lead", "project_manager"]),
});

function RouteComponent() {
  return <TechnologyPage />;
}
