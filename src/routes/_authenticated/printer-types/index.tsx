import PrinterTypePage from "@/features/printer-type";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/printer-types/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PrinterTypePage />;
}
