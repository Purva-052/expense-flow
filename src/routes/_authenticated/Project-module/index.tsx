import ProjectModulePage from "@/features/Project-module";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Project-module/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectModulePage />;
}
