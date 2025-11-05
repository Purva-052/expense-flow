import ProjectTypePage from "@/features/Project-type";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Project-type/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectTypePage />;
}
