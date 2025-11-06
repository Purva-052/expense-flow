import ProjectTypePage from "@/features/Project-type";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Project-type/")({
  component: RouteComponent,
   beforeLoad: () => requireRole(["admin", "team_lead", "project_manager"]),
});

function RouteComponent() {
  return <ProjectTypePage />;
}
