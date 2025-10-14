import CouponsPage from "@/features/coupons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/coupons/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CouponsPage />;
}
