import ClientsPage from "@/features/clients";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/clients/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ClientsPage />;
}
