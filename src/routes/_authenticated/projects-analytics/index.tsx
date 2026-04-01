import ProjectAnalyticsPage from "@/features/projects-analytics";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/projects-analytics/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectAnalyticsPage />;
}
