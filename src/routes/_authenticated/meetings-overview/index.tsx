// import InquiryTypePage from "@/features/Inquiry-type";
import MeetingsOverviewPage from "@/features/meetings-overview";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/meetings-overview/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN, roles.PROJECT_MANAGER]),
});

function RouteComponent() {
  return <MeetingsOverviewPage />;
}
