import DomainPage from "@/features/domain";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/domain/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DomainPage />;
}
