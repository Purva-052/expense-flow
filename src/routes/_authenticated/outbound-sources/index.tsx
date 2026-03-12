import OutboundSourcePage from "@/features/outbound-sources";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/outbound-sources/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <OutboundSourcePage />
    </>
  );
}
