import type { MarketBook } from '../types/market'

export function exportBookAsJson(book: MarketBook): void {
  const blob = new Blob([JSON.stringify(book, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = book.timestamp.replace(/[:.]/g, '-')
  a.href = url
  a.download = `orderbook-${book.symbol}-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}
