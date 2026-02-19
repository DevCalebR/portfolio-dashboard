export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 1,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${formatNumber(value * 100, 1)}%`
}
