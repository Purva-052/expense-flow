import ClientNDAPage from "@/features/client-nda";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/client-nda/")({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([roles.ADMIN, roles.BDE], { allowUserIDs: [134] }),
});

function RouteComponent() {
  return <ClientNDAPage />;
}
