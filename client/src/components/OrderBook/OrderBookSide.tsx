import { memo, useMemo } from 'react'
import type { OrderLevel } from '../../types/market'
import { OrderBookRow, type Side } from './OrderBookRow'

interface OrderBookSideProps {
  title: string
  side: Side
  levels: OrderLevel[]
  depth: number
  priceDecimals: number
}

function OrderBookSideComponent({
  title,
  side,
  levels,
  depth,
  priceDecimals,
}: OrderBookSideProps) {
  const { rows, maxSum } = useMemo(() => {
    const visible = levels.slice(0, depth)
    let running = 0
    const mapped = visible.map((level) => {
      running += level.price * level.qty
      return { ...level, sum: running }
    })
    return {
      rows: mapped,
      maxSum: mapped.length ? mapped[mapped.length - 1].sum : 0,
    }
  }, [levels, depth])

  const titleColor = side === 'bid' ? 'text-bid' : 'text-ask'

  return (
    <section className="min-w-0 flex-1">
      <h2 className={`px-3 py-2 text-sm font-semibold ${titleColor}`}>{title}</h2>
      <div className="grid grid-cols-4 gap-2 border-b border-border-subtle px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted">
        <span className="text-left">Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
        <span className="text-right">Sum</span>
      </div>
      <div className="py-1">
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted">No data</p>
        ) : (
          rows.map((level, index) => (
            <OrderBookRow
              // Stable index key keeps DOM nodes warm for flash animations
              key={`${side}-${index}`}
              price={level.price}
              qty={level.qty}
              sum={level.sum}
              maxSum={maxSum}
              side={side}
              priceDecimals={priceDecimals}
            />
          ))
        )}
      </div>
    </section>
  )
}

export const OrderBookSide = memo(OrderBookSideComponent)
