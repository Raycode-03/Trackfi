// lib/hooks/usePlan.ts
import { useProfile } from "@/query/index";
import { Plan } from "@/lib/helpers/cacheTTL";

export const usePlan = (): Plan => {
  const { data: profile } = useProfile();
  return (profile?.package_type ?? "free") as Plan;
};