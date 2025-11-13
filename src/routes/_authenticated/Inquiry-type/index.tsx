import InquiryTypePage from "@/features/Inquiry-type";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Inquiry-type/")({
  component: RouteComponent,
  beforeLoad: () => requireRole([roles.ADMIN]),
});

function RouteComponent() {
  return <InquiryTypePage />;
}
