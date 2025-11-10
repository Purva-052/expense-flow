import InquiryTypePage from "@/features/Inquiry-type";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Inquiry-type/")({
  component: RouteComponent,
  beforeLoad: () => requireRole(["admin"]),
});

function RouteComponent() {
  return <InquiryTypePage/>;
}
