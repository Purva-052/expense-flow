import ClientInventoryTypePage from "@/features/client-inventory-type";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/client-inventory-type/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ClientInventoryTypePage />;
}
