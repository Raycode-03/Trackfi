"use client";
import React, { useState } from "react";
import {
  CalendarDays,
  ShoppingCart,
  Tag,
  List,
} from "lucide-react";
import { TransactionStats } from "@/types/transactions";
import { formatCurrency } from "@/lib/helpers/formatPrice";

type FilterType =
  | "all"
  | "pending"
  | "completed"
  | "failed"


interface TransactionStatsProps {
  stats: TransactionStats;
  period: string;
  onPeriodChange: (val: string) => void;
  onFilterChange?: (filter: FilterType) => void;
}

export function TransactionStatsSection({
  stats,
  period,
  onPeriodChange,
  onFilterChange,
}: TransactionStatsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-6">
      {/* Left — 65% */}
      <div className="w-full lg:w-[65%] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 md:mb-2">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
              Lifetime Activity
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl md:text-5xl font-bold">{stats.total}</h2>
              <span className="text-white/40 text-xs md:text-sm">
                Transactions
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-full sm:w-auto">
            <CalendarDays className="w-4 h-4 text-white/40 shrink-0" />
            <select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
              className=" text-white text-xs border-0 focus:outline-none cursor-pointer flex-1 sm:flex-none"
            >
              <option value="30" className="bg-[#111] text-white">
                Last 30 Days
              </option>
              <option value="90" className="bg-[#111] text-white">
                Last 90 Days
              </option>
              <option value="180" className="bg-[#111] text-white">
                Last 6 Months
              </option>
              <option value="365" className="bg-[#111] text-white">
                Last 12 Months
              </option>
              <option value="all" className="bg-[#111] text-white">
                All Time
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 md:gap-12 mt-auto">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <span>
              <ShoppingCart className="w-5 h-5 md:w-8 md:h-8 text-green-500 shrink-0" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                Total Volume Bought
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg md:text-xl font-bold text-primary truncate">
                  {formatCurrency(stats.totalVolumeBought)}
                </p>
                {stats.boughtChange !== 0 && (
                  <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded shrink-0">
                    +{stats.boughtChange}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <span>
              <Tag className="w-5 h-5 md:w-8 md:h-8 text-red-400 shrink-0" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                Total Volume Sold
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg md:text-xl font-bold text-red-400 truncate">
                  {formatCurrency(stats.totalVolumeSold)}
                </p>
                {stats.soldChange !== 0 && (
                  <span className="text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded shrink-0">
                    {stats.soldChange}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — 35% */}
      <div className="hidden lg:flex w-full lg:w-[35%] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col gap-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
            Quick Filters
          </p>

          {/* Status Filters */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              {
                id: "completed" as FilterType,
                label: "Completed",
                icon: "✓",
                color: "green",
              },
              {
                id: "pending" as FilterType,
                label: "Pending",
                icon: "⏳",
                color: "yellow",
              },
              {
                id: "failed" as FilterType,
                label: "Failed",
                icon: "✕",
                color: "red",
              },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                  ${
                    activeFilter === filter.id
                      ? `bg-${filter.color}-500/20 border border-${filter.color}-500/40 text-${filter.color}-400`
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  }`}
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Performance Filters */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: "all" as FilterType,
                label: "All",
                icon: <List className="w-3 h-3" />,
              },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors
                  ${
                    activeFilter === filter.id
                      ? "bg-primary/20 border border-primary/30 text-primary"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
              >
                {filter.icon}
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 mt-auto">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Network Status
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-white/60">
              {stats.networkStatus}
            </span>
            <span className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
