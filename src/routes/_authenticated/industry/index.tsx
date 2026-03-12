import IndustryPage from "@/features/industry";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/industry/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <IndustryPage />;
}
