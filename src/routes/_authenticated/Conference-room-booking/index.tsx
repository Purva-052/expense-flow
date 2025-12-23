import ConferenceRoomBookingPage from "@/features/conference-room-booking";
// import InterviewsPage from "@/features/Interviews";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/Conference-room-booking/"
)({
  component: RouteComponent,
  beforeLoad: () =>
    requireRole([
      roles.ADMIN,
      roles.TEAM_LEAD,
      roles.PROJECT_MANAGER,
      roles.BDE,
    ]),
});

function RouteComponent() {
  return <ConferenceRoomBookingPage />;
}
