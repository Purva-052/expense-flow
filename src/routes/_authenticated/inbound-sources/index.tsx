import InboundSourcePage from "@/features/inbound-sources";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inbound-sources/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <InboundSourcePage />;
}
