import { useState, useMemo } from 'react'
import { Transaction } from '@/types/transactions'

export type StatusFilter = 'all' | 'completed' | 'pending' | 'failed'
export type TypeFilter = 'all' | 'buy' | 'sell' | 'swap' | 'deposit' | 'withdrawal'
export type TransactionSortKey = 'default' | 'date' | 'total_value' | 'pnl'
export type SortDir = 'asc' | 'desc'

export interface TransactionFilters {
  status: StatusFilter
  type: TypeFilter
  sortKey: TransactionSortKey
  sortDir: SortDir
}

const DEFAULT_FILTERS: TransactionFilters = {
  status: 'all',
  type: 'all',
  sortKey: 'default',
  sortDir: 'desc',
}

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)

  const setFilter = (patch: Partial<TransactionFilters>) =>
    setFilters(prev => ({ ...prev, ...patch }))

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const isActive =
    filters.status !== 'all' ||
    filters.type !== 'all' ||
    filters.sortKey !== 'default'

  const filtered = useMemo(() => {
    let result = [...transactions]

    // Status filter
    if (filters.status !== 'all')
      result = result.filter(tx => tx.status === filters.status)

    // Type filter
    if (filters.type !== 'all')
      result = result.filter(tx => tx.type === filters.type)

    // Sort
    if (filters.sortKey !== 'default') {
      result.sort((a, b) => {
        let aVal = 0, bVal = 0
        if (filters.sortKey === 'date') {
          aVal = new Date(a.date).getTime()
          bVal = new Date(b.date).getTime()
        }
        if (filters.sortKey === 'total_value') {
          aVal = a.total_value
          bVal = b.total_value
        }
        if (filters.sortKey === 'pnl') {
          aVal = a.unrealized_pnl ?? 0
          bVal = b.unrealized_pnl ?? 0
        }
        return filters.sortDir === 'desc' ? bVal - aVal : aVal - bVal
      })
    }

    return result
  }, [transactions, filters])

  return { filters, setFilter, resetFilters, isActive, filtered }
}