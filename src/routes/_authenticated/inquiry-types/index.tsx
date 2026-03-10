import InquiryTypePage from "@/features/inquiry-types";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inquiry-types/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN, roles.PROJECT_MANAGER]),
});

function RouteComponent() {
  return <InquiryTypePage />;
}
