import { TimeRange } from "@/types";

export async function fetchMarketlist(page = 1, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    ...(search && { search }),
  });
  const res = await fetch(`/api/markets?${params}`);
  if (!res.ok) throw new Error("Failed to fetch market list");
  return res.json(); // { coins, total, page, limit, cgPage }
}

export async function fetchCoinDetail(id: string) {
  const res = await fetch(`/api/markets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch coin detail");
  return res.json();
}

export async function fetchCoinChart(
  id: string,
  range: TimeRange,
  beforeTs?: number | null,
) {
  const params = new URLSearchParams({ range });
  if (beforeTs) params.set("before", String(beforeTs));
  try {
    const res = await fetch(`/api/markets/${id}/chart?${params}`);
    if (res.status === 429) throw new Error("RATE_LIMITED");
    if (res.status === 401  || res.status === 403) throw new Error("PROVIDER_AUTH_ERROR");
    if (res.status === 502) throw new Error("UPSTREAM_DOWN");
    if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

    return res.json();
  } catch (err) {
    if (err instanceof TypeError) throw new Error("NETWORK_ERROR");
    throw err;
  }

}
