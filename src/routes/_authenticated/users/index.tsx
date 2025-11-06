import UsersPage from "@/features/users";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/users/")({
  component: RouteComponent,
   beforeLoad: () => requireRole(["admin", "team_lead", "project_manager"]),
});

function RouteComponent() {
  return <UsersPage />;
}
