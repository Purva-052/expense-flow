import { createFileRoute } from "@tanstack/react-router";
import AdMobAnalyticsDashboard from "@/features/admob-analytics";
import { roles } from "@/utils/constant";
import { requireRole } from "@/utils/requireRole";

export const Route = createFileRoute("/_authenticated/admob-analytics/")({
  beforeLoad: () => requireRole([roles.ADMIN], { allowUserIDs: [134] }),
  component: AdMobAnalyticsDashboard,
});
