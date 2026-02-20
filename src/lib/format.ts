export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateInput(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
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

export function formatCurrency(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
    style: 'currency',
  }).format(value)
}
