import InquiryPage from "@/features/Inquiry";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/Inquiry/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <InquiryPage />;
}
