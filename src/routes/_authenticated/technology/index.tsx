import TechnologyPage from "@/features/technology";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/technology/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TechnologyPage />;
}
