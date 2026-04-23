'use client'
import React from 'react'
import { X, ArrowUpDown } from 'lucide-react'
import {
  TransactionFilters,
  StatusFilter,
  TypeFilter,
  TransactionSortKey,
} from '@/hooks/useTransactionFilters'

interface TransactionFilterProps {
  filters: TransactionFilters
  onChange: (patch: Partial<TransactionFilters>) => void
  onReset: () => void
  onClose: () => void
  totalCount: number
  filteredCount: number
}

export function TransactionFilterSection({
  filters,
  onChange,
  onReset,
  onClose,
  totalCount,
  filteredCount,
}: TransactionFilterProps) {

  const statusOpts: { label: string; value: StatusFilter; icon: string }[] = [
    { label: 'All',       value: 'all',       icon: '·' },
    { label: 'Completed', value: 'completed', icon: '✓' },
    { label: 'Pending',   value: 'pending',   icon: '⏳' },
    { label: 'Failed',    value: 'failed',    icon: '✕' },
  ]

  const typeOpts: { label: string; value: TypeFilter }[] = [
    { label: 'All',        value: 'all' },
    { label: 'Buy',        value: 'buy' },
    { label: 'Sell',       value: 'sell' },
    { label: 'Swap',       value: 'swap' },
    { label: 'Deposit',    value: 'deposit' },
    { label: 'Withdrawal', value: 'withdrawal' },
  ]

  const sortOpts: { label: string; value: TransactionSortKey }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Date',    value: 'date' },
    { label: 'Value',   value: 'total_value' },
    { label: 'P&L',     value: 'pnl' },
  ]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed z-50 bottom-0 left-0 right-0 rounded-t-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:rounded-2xl bg-[#1a1a1a] border border-white/10 p-4 md:p-6 animate-in fade-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <p className="text-sm font-semibold text-white">Filter & Sort</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">
              {filteredCount} of {totalCount}
            </span>
            <button onClick={onReset} className="text-xs text-primary hover:underline">
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 md:mb-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2 md:mb-3">Status</p>
          <div className="grid grid-cols-4 gap-2">
            {statusOpts.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ status: opt.value })}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors border
                  ${filters.status === opt.value
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                  }`}
              >
                <span className="mr-1">{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="mb-4 md:mb-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2 md:mb-3">Type</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {typeOpts.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ type: opt.value })}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap
                  ${filters.type === opt.value
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + Direction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2 md:mb-3">Sort By</p>
            <div className="grid grid-cols-4 gap-2">
              {sortOpts.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ sortKey: opt.value })}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors border
                    ${filters.sortKey === opt.value
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2 md:mb-3">Direction</p>
            <button
              onClick={() => onChange({ sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc' })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors w-full sm:w-auto"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {filters.sortDir === 'desc' ? 'High → Low' : 'Low → High'}
            </button>
          </div>
        </div>
      </div>  
    </>
  )
}