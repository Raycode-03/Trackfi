"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Skeleton className="w-full h-10 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["User", "Package", "Role", "Joined", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: count }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
          >
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function DashboardSkeleton() {
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 h-28"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl h-80" />
        <Skeleton className="bg-white/5 border border-white/10 rounded-2xl h-80" />
      </div>
    </div>
  );
}
export function WatchlistSkeleton() {
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white animate-pulse">
      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 h-24"
          />
        ))}
      </div>
      {/* table card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <Skeleton className="h-6 w-32 bg-white/10 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <Skeleton className="flex-1 h-4 bg-white/10 rounded" />
              <Skeleton className="w-20 h-4 bg-white/10 rounded" />
              <Skeleton className="w-16 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function MarketsSkeleton() {
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white animate-pulse">
      {/* table card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="h-6 w-32 bg-white/10 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <Skeleton className="flex-1 h-4 bg-white/10 rounded" />
              <Skeleton className="w-20 h-4 bg-white/10 rounded" />
              <Skeleton className="w-16 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2 bg-white/5 rounded-lg" />
        <Skeleton className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Profile card skeleton */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <Skeleton className="h-6 w-32 bg-white/5 rounded-lg" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-2 bg-white/5 rounded" />
                  <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <Skeleton className="flex-1 h-10 bg-white/5 rounded-lg" />
              <Skeleton className="flex-1 h-10 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function CoinDetailSkeleton() {
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white animate-pulse">
      {/* Back link */}
      <Skeleton className="h-4 w-28 bg-white/10 rounded mb-6" />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-7 w-36 bg-white/10 rounded" />
              <Skeleton className="h-5 w-12 bg-white/10 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-28 bg-white/10 rounded" />
              <Skeleton className="h-6 w-20 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 w-36 bg-white/10 rounded-xl" />
          <Skeleton className="h-10 w-28 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Chart card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-11 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="h-72 w-full bg-white/10 rounded-lg" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <Skeleton className="h-3 w-20 bg-white/10 rounded mb-2.5" />
            <Skeleton className="h-4 w-24 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Description card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-white/10 rounded" />
          <Skeleton className="h-3 w-[92%] bg-white/10 rounded" />
          <Skeleton className="h-3 w-[80%] bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CoinChartSkeleton() {
  return(
    <div className="h-full w-full bg-white/10 rounded-lg animate-pulse" />
  )

}

export function TransactionSkeleton() {
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-48 bg-white/10 rounded-lg mb-2" />
          <Skeleton className="h-4 w-56 bg-white/10 rounded" />
        </div>
        <Skeleton className="h-10 w-24 bg-white/10 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-6">
        {/* Left 65% */}
        <div className="w-full lg:w-[65%] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <Skeleton className="h-3 w-32 bg-white/10 rounded mb-3" />
              <Skeleton className="h-12 w-40 bg-white/10 rounded" />
            </div>
            <Skeleton className="h-9 w-44 bg-white/10 rounded-lg" />
          </div>
          <div className="flex flex-col sm:flex-row gap-6 md:gap-12">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 flex-1">
                <Skeleton className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-2.5 w-28 bg-white/10 rounded mb-2" />
                  <Skeleton className="h-6 w-32 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 35% */}
        <div className="w-full lg:w-[35%] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
          <Skeleton className="h-3 w-24 bg-white/10 rounded mb-4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full bg-white/10 rounded-xl" />
            ))}
          </div>
          <div className="border-t border-white/10 mt-6 pt-4">
            <Skeleton className="h-2.5 w-28 bg-white/10 rounded mb-2" />
            <Skeleton className="h-4 w-36 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-16 h-8 bg-white/10 rounded shrink-0" />
              <Skeleton className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <Skeleton className="flex-1 h-4 bg-white/10 rounded" />
              <Skeleton className="w-16 h-6 bg-white/10 rounded-full" />
              <Skeleton className="w-20 h-4 bg-white/10 rounded hidden md:block" />
              <Skeleton className="w-20 h-4 bg-white/10 rounded hidden md:block" />
              <Skeleton className="w-16 h-4 bg-white/10 rounded hidden lg:block" />
              <Skeleton className="w-16 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <Skeleton className="h-3 w-48 bg-white/10 rounded" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}