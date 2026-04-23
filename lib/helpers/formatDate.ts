import { TimeRange } from '@/types/markets'

export function formatDate(iso: string, range?: TimeRange): string {
  const d = new Date(iso)
  if (range === '1D') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (range === '1Y') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}