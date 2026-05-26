import ClientInventoryPage from "@/features/client-inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/client-inventory/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ClientInventoryPage />;
}
