import UsersPage from "@/features/users";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/New-joinees/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN]),
});

function RouteComponent() {
  return <UsersPage />;
}
