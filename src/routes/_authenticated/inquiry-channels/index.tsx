import InquiryCategoryPage from "@/features/inquiry-channels";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inquiry-channels/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <InquiryCategoryPage />;
}
