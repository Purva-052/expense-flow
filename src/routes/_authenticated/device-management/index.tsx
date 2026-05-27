import DevicePage from "@/features/device-management";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/device-management/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DevicePage />;
}
