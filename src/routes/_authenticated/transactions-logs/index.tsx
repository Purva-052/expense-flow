import TransactionPage from "@/features/transaction-logs";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/transactions-logs/")({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([roles.ADMIN, roles.PROJECT_MANAGER, roles.TEAM_LEAD]),
});

function RouteComponent() {
  return <TransactionPage />;
}
