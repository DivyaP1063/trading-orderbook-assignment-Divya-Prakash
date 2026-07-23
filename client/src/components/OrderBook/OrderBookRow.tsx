import { memo } from 'react'
import { formatPrice, formatQty, formatTotal } from '../../utils/format'

export type Side = 'bid' | 'ask'

interface OrderBookRowProps {
  price: number
  qty: number
  sum: number
  side: Side
  priceDecimals: number
}

function OrderBookRowComponent({
  price,
  qty,
  sum,
  side,
  priceDecimals,
}: OrderBookRowProps) {
  const priceColor = side === 'bid' ? 'text-bid' : 'text-ask'

  return (
    <div className="grid grid-cols-4 gap-2 px-3 py-1 text-xs font-mono tabular-nums hover:bg-white/5">
      <span className={`${priceColor} text-left`}>
        {formatPrice(price, priceDecimals)}
      </span>
      <span className="text-right text-text">{formatQty(qty)}</span>
      <span className="text-right text-muted">{formatTotal(price, qty)}</span>
      <span className="text-right text-muted">{formatPrice(sum)}</span>
    </div>
  )
}

export const OrderBookRow = memo(OrderBookRowComponent)
