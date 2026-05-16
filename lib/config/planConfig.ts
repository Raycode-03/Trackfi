import { PLAN_LIMITS } from "@/lib/config/planLimits";

const plan = profile.package_type as Plan;
const limit = PLAN_LIMITS[plan].chart_views_per_day;

// null = unlimited, skip check
if (limit !== null && profile.chart_views_today >= limit) {
  return NextResponse.json(
    { error: "Daily chart view limit reached, upgrade your plan" },
    { status: 403 },
  );
}
