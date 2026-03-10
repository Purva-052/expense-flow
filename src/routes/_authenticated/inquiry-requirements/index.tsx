import InquiryRequirementPage from "@/features/Inquiry-requirements";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inquiry-requirements/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN, roles.PROJECT_MANAGER]),
});

function RouteComponent() {
  return <InquiryRequirementPage />;
}
