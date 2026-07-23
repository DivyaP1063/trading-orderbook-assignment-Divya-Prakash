import { memo, useEffect, useRef, useState } from 'react'
import { formatPrice, formatQty, formatTotal } from '../../utils/format'

export type Side = 'bid' | 'ask'

interface OrderBookRowProps {
  price: number
  qty: number
  sum: number
  maxSum: number
  side: Side
  priceDecimals: number
}

function OrderBookRowComponent({
  price,
  qty,
  sum,
  maxSum,
  side,
  priceDecimals,
}: OrderBookRowProps) {
  const priceColor = side === 'bid' ? 'text-bid' : 'text-ask'
  const prevRef = useRef({ price, qty })
  const [flashClass, setFlashClass] = useState<string>('')

  useEffect(() => {
    const prev = prevRef.current
    if (prev.price !== price || prev.qty !== qty) {
      // Bid changes → green flash; ask changes → red flash
      setFlashClass(side === 'bid' ? 'ob-flash-bid' : 'ob-flash-ask')
    }
    prevRef.current = { price, qty }
  }, [price, qty, side])

  const depthPct = maxSum > 0 ? Math.min(100, (sum / maxSum) * 100) : 0
  const barColor =
    side === 'bid' ? 'bg-bid/15' : 'bg-ask/15'

  return (
    <div
      className={`relative grid grid-cols-4 gap-2 px-3 py-1 text-xs font-mono tabular-nums hover:bg-white/5 ${flashClass}`}
      onAnimationEnd={() => setFlashClass('')}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 transition-[width] duration-200 ${barColor}`}
        style={{ width: `${depthPct}%` }}
        aria-hidden
      />
      <span className={`relative z-10 text-left ${priceColor}`}>
        {formatPrice(price, priceDecimals)}
      </span>
      <span className="relative z-10 text-right text-text">{formatQty(qty)}</span>
      <span className="relative z-10 text-right text-muted">
        {formatTotal(price, qty)}
      </span>
      <span className="relative z-10 text-right text-muted">
        {formatPrice(sum)}
      </span>
    </div>
  )
}

function rowPropsEqual(
  prev: OrderBookRowProps,
  next: OrderBookRowProps,
): boolean {
  return (
    prev.price === next.price &&
    prev.qty === next.qty &&
    prev.sum === next.sum &&
    prev.maxSum === next.maxSum &&
    prev.side === next.side &&
    prev.priceDecimals === next.priceDecimals
  )
}

export const OrderBookRow = memo(OrderBookRowComponent, rowPropsEqual)
