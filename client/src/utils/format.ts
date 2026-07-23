export function formatPrice(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatQty(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatTotal(price: number, qty: number): string {
  return formatPrice(price * qty, 2)
}

/** Round price to a fixed decimal grouping (e.g. 2 → 0.01). */
export function groupPrice(price: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(price * factor) / factor
}
