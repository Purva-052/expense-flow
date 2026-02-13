import ExtraWorkReport from "@/features/extra-work-report";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/extra-work-report/")({
  component: ExtraWorkReport,
  beforeLoad: () => requireRole([roles.ADMIN]),
});
