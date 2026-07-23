import { memo, useCallback, useMemo, useState } from 'react'
import type { ConnectionStatus, MarketBook, OrderLevel } from '../../types/market'
import type { Theme } from '../../hooks/useTheme'
import { exportBookAsJson } from '../../utils/exportBook'
import { groupPrice } from '../../utils/format'
import { OrderBookHeader } from './OrderBookHeader'
import { OrderBookSide } from './OrderBookSide'

interface OrderBookProps {
  book: MarketBook | null
  status: ConnectionStatus
  error: string | null
  reconnectAttempt?: number
  maxReconnectAttempts?: number
  theme: Theme
  onToggleTheme: () => void
  onConnect: () => void
  onDisconnect: () => void
}

function aggregateLevels(
  levels: OrderLevel[],
  decimals: number,
  side: 'bid' | 'ask',
): OrderLevel[] {
  const map = new Map<number, number>()
  for (const level of levels) {
    const key = groupPrice(level.price, decimals)
    map.set(key, (map.get(key) ?? 0) + level.qty)
  }
  const aggregated = Array.from(map.entries()).map(([price, qty]) => ({
    price,
    qty,
  }))
  aggregated.sort((a, b) =>
    side === 'bid' ? b.price - a.price : a.price - b.price,
  )
  return aggregated
}

function OrderBookComponent({
  book,
  status,
  error,
  reconnectAttempt = 0,
  maxReconnectAttempts = 3,
  theme,
  onToggleTheme,
  onConnect,
  onDisconnect,
}: OrderBookProps) {
  const [depth, setDepth] = useState(15)
  const [groupDecimals, setGroupDecimals] = useState(2)

  const bidLevels = book?.bids
  const askLevels = book?.asks

  const bids = useMemo(
    () => (bidLevels ? aggregateLevels(bidLevels, groupDecimals, 'bid') : []),
    [bidLevels, groupDecimals],
  )
  const asks = useMemo(
    () => (askLevels ? aggregateLevels(askLevels, groupDecimals, 'ask') : []),
    [askLevels, groupDecimals],
  )

  const handleExport = useCallback(() => {
    if (book) exportBookAsJson(book)
  }, [book])

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-panel-elevated shadow-xl">
      <OrderBookHeader
        symbol={book?.symbol ?? 'NIFTY'}
        lastTradedPrice={book?.lastTradedPrice ?? null}
        depth={depth}
        onDepthChange={setDepth}
        groupDecimals={groupDecimals}
        onGroupChange={setGroupDecimals}
        status={status}
        reconnectAttempt={reconnectAttempt}
        maxReconnectAttempts={maxReconnectAttempts}
        theme={theme}
        onToggleTheme={onToggleTheme}
        canExport={!!book}
        onExport={handleExport}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />

      {error && (
        <p className="border-b border-border-subtle bg-ask/10 px-4 py-2 text-xs text-ask">
          {error}
        </p>
      )}

      <div className="flex flex-col md:flex-row">
        <OrderBookSide
          title="Buy Order"
          side="bid"
          levels={bids}
          depth={depth}
          priceDecimals={groupDecimals}
        />
        <div className="hidden w-px bg-border-subtle md:block" />
        <OrderBookSide
          title="Sell Order"
          side="ask"
          levels={asks}
          depth={depth}
          priceDecimals={groupDecimals}
        />
      </div>

      {book?.timestamp && (
        <footer className="border-t border-border-subtle px-4 py-2 text-[11px] text-muted">
          Last update: {new Date(book.timestamp).toLocaleTimeString()}
        </footer>
      )}
    </div>
  )
}

export const OrderBook = memo(OrderBookComponent)
