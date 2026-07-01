import MobileInventoryPage from "@/features/mobile-inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/mobile-inventory/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MobileInventoryPage />;
}

