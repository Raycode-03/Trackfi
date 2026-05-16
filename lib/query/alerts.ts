import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/api/alerts";
import { getStaleTime } from "../helpers/cacheTTL";
import { usePlan } from "../helpers/usePlan";

export const useAlerts = () =>{
  const plan = usePlan()
  return useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: getStaleTime("alerts",  plan),
    retry: false,
  });
}

