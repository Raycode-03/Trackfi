"use client";
import React, { useState } from "react";
import { Download, Plus, SlidersHorizontal } from "lucide-react";
import { Transaction, TransactionStats } from "@/types/index";
import { TransactionStatsSection } from "./transactionStats";
import { TransactionTable } from "./transactionTable";
import { TransactionFilterSection } from "./transactionFilterSection";
import { exportTransactionsToCSV } from "@/lib/helpers/transactionExport";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import Link from "next/link";

interface TransactionFullProps {
  transactions: Transaction[];
  stats: TransactionStats;
  page: number;
  total: number;
  period: string;
  onPageChange: (page: number) => void;
  onPeriodChange: (period: string) => void;
}

export function TransactionFull({
  transactions,
  stats,
  page,
  total,
  period,
  onPageChange,
  onPeriodChange,
}: TransactionFullProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const { filters, setFilter, resetFilters, isActive, filtered } =
    useTransactionFilters(transactions);

  function handleQuickFilter(f: string) {
    if (f === "biggest-wins") { setFilter({ sortKey: "pnl", sortDir: "desc" }); return; }
    if (f === "worst-loss")   { setFilter({ sortKey: "pnl", sortDir: "asc"  }); return; }
    if (f === "all")          { resetFilters(); return; }
    setFilter({ status: f as "pending" | "completed" | "failed" });
  }

  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white/50 text-sm">Live ledger monitoring active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors
              ${isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 hover:border-white/20 text-white/60 hover:text-white"
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
          <button
            onClick={() => exportTransactionsToCSV(transactions)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <TransactionStatsSection
        stats={stats}
        period={period}
        onPeriodChange={onPeriodChange}
        onFilterChange={handleQuickFilter}
      />

      <TransactionTable
        transactions={filtered}
        page={page}
        total={total}
        limit={20}
        onPageChange={onPageChange}
      />

      {filterOpen && (
        <TransactionFilterSection
          filters={filters}
          onChange={setFilter}
          onReset={resetFilters}
          onClose={() => setFilterOpen(false)}
          totalCount={transactions.length}
          filteredCount={filtered.length}
        />
      )}

      {/* FAB */}
      <Link href="/settings/integrations">
        <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-black flex items-center justify-center shadow-lg transition-colors z-20 cursor-pointer">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}