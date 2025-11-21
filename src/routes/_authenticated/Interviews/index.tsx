import InterviewsPage from "@/features/Interviews";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Interviews/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN]),
});

function RouteComponent() {
  return <InterviewsPage />;
}

