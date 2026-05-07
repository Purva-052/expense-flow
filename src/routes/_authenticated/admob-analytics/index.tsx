import { createFileRoute } from "@tanstack/react-router";
import AdMobAnalyticsDashboard from "@/features/admob-analytics";

export const Route = createFileRoute("/_authenticated/admob-analytics/")({
  component: AdMobAnalyticsDashboard,
});
