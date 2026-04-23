"use client";
import { Zap, Upload, ScrollText, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TransactionStatsSection } from "./transactionStats";

const Actionicons = [
  {
    href: "/settings/integrations",
    icon: <Zap className="w-6 h-6 text-blue-400" />,
    bg: "bg-blue-500/10",
    border: "hover:border-blue-500/40",
    label: "Import from Exchange",
    sub: "Connect via API keys",
  },
  {
    href: "/settings/integrations",
    icon: <Upload className="w-6 h-6 text-cyan-400" />,
    bg: "bg-cyan-500/10",
    border: "hover:border-cyan-500/40",
    label: "Upload CSV",
    sub: "Bulk import records",
  },
];

function TransactionEmpty() {
  const [period, setPeriod] = useState("30");

  const stats = {
    total: 0,
    buyOrders: 0,
    sellOrders: 0,
    totalVolumeBought: 0,
    totalVolumeSold: 0,
    boughtChange: 0,
    soldChange: 0,
    networkStatus: "Not Connected",
  };

  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white">
      <div className="flex-1 flex flex-col gap-6">
        <TransactionStatsSection
          stats={stats}
          period={period}
          onPeriodChange={setPeriod}
          onFilterChange={() => {}}
        />

        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <ScrollText className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No transactions yet</h3>
          <p className="text-white/40 text-sm max-w-xs mb-8 leading-relaxed">
            Your ledger is still clean. Add your first transaction to start
            tracking your financial journey.
          </p>
          <Link href="/settings/integrations">
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold rounded-full px-6 py-6 mb-10">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Transaction
            </Button>
          </Link>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 mt-8 w-full max-w-md">
            {Actionicons.map((item) => (
              <Link key={item.label} href={item.href}>
                <div
                  className={`group border border-white/10 ${item.border} rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer hover:bg-white/5`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4 transition-transform duration-200 group-hover:-translate-y-1`}
                  >
                    {item.icon}
                  </div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs mt-1">{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionEmpty;
