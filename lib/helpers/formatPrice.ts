export function formatCurrency(value: number): string {
  if (value == null || isNaN(value)) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toLocaleString()}`
}

export function formatCrypto(value?: number): string {
    if(value === undefined) return "N/A"
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (value >= 1) return value.toFixed(4)
  return value.toFixed(6)
}