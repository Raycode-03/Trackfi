"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  DeepPartial,
  CandlestickStyleOptions,
  SeriesOptionsCommon,
} from "lightweight-charts";
import { CoinChartSkeleton } from "./skeleton";
import { useCoinChart } from "@/lib/query/index";
import { fetchCoinChart } from "@/lib/api/index";
import { TimeRange } from "@/types/markets";
import { toast } from "sonner";

const errorMessages: Record<string, string> = {
  RATE_LIMITED: "Too many requests — wait a moment.",
  TIER_UNAVAILABLE: "1Y chart requires a Pro plan.",
  UNAUTHORIZED: "Unauthorized access. Please log in.",
  UPSTREAM_DOWN: "Price data temporarily unavailable.",
  NETWORK_ERROR: "Check your internet connection.",
};

function getErrorMessage(code: string): string {
  return errorMessages[code] ?? "Failed to load chart data.";
}

interface Props {
  id: string;
  range: string;
}

export function CandlestickChart({ id, range }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const isFetchingMore = useRef(false);
  const oldestTs = useRef<number | null>(null);
  const hasMore = useRef(true);
  const errorToastShown = useRef(false);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const [isInitialError, setIsInitialError] = useState(false);
  // query
  const { data, isLoading, error } = useCoinChart(id, range);

  // ✅ Handle initial query errors
  useEffect(() => {
    if (error && !errorToastShown.current) {
      errorToastShown.current = true;
      toast.error(getErrorMessage(error.message));
      setIsInitialError(true);
    }
    // reset when error clears (e.g. range change)
    if (!error) {
      errorToastShown.current = false;
      setIsInitialError(false);
    }
  }, [error]);

  // ✅ populate chart when initial query
  useEffect(() => {
    if (!data?.candles?.length || !seriesRef.current) return;

    const candles: CandlestickData<Time>[] = data.candles.map(
      (d: {
        date: number;
        open: number;
        high: number;
        low: number;
        close: number;
      }) => ({
        time: Math.floor(d.date / 1000) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }),
    );

    seriesRef.current.setData(candles);
    oldestTs.current = data.pagination.oldestTs;
    hasMore.current = data.pagination.hasMore;
  }, [data]);

  const fetchOlder = useCallback(async () => {
    if (isFetchingMore.current || !hasMore.current || !oldestTs.current) return;
    isFetchingMore.current = true;
    setIsFetchingOlder(true);

    try {
      const older = await fetchCoinChart(
        id,
        range as TimeRange,
        oldestTs.current,
      );

      if (older?.error) {
        toast.error(getErrorMessage(older.error));
        return;
      }

      if (!older?.candles?.length || !seriesRef.current) {
        hasMore.current = false;
        return;
      }

      const newCandles: CandlestickData<Time>[] = older.candles.map(
        (d: {
          date: number;
          open: number;
          high: number;
          low: number;
          close: number;
        }) => ({
          time: Math.floor(d.date / 1000) as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }),
      );

      const existing =
        (seriesRef.current.data() as CandlestickData<Time>[]) ?? [];
      const merged = [...newCandles, ...existing]
        .sort((a, b) => (a.time as number) - (b.time as number))
        .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time);

      seriesRef.current.setData(merged);
      oldestTs.current = older.pagination.oldestTs;
      hasMore.current = older.pagination.hasMore;
    } catch (err) {
      console.error("Chart fetch older error:", err);
      toast.error("Failed to fetch older chart data. Please try again.");
    } finally {
      isFetchingMore.current = false;
      setIsFetchingOlder(false);
    }
  }, [id, range]);

  // ✅ chart
  useEffect(() => {
    if (!containerRef.current) return;

    oldestTs.current = null;
    hasMore.current = true;
    isFetchingMore.current = false;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(255,255,255,0.4)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.2)" },
        horzLine: { color: "rgba(255,255,255,0.2)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 288,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    } satisfies DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon>);

    chartRef.current = chart;
    seriesRef.current = series;

    chart.timeScale().subscribeVisibleLogicalRangeChange((visibleRange) => {
      if (!visibleRange) return;
      if (visibleRange.from < 10 && oldestTs.current && hasMore.current) {
        fetchOlder();
      }
    });

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [id, range, fetchOlder]);

  return (
    <div className="relative h-72 w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <CoinChartSkeleton />
        </div>
      )}

      {isInitialError && !isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="text-center">
            <p className="text-white/70 text-sm">Unable to load chart</p>
            <p className="text-white/40 text-xs mt-1">
              Please refresh the page or try again later
            </p>
          </div>
        </div>
      )}

      {isFetchingOlder && (
        <div className="absolute top-2 left-3 z-10 text-xs text-white/30 animate-pulse">
          Loading older data...
        </div>
      )}

      <div ref={containerRef} className="h-72 w-full" />
    </div>
  );
}
