import LinodeInstanceDetail from "@/features/linode-server-dashboard/components/linode-instance-detail";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/linode-server-dashboard/detail/$id"
)({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([roles.ADMIN, roles.TEAM_LEAD, roles.PROJECT_MANAGER]),
});

function RouteComponent() {
  const { id }: { id: string } = Route.useParams();
  return <LinodeInstanceDetail instanceId={id} />;
}
