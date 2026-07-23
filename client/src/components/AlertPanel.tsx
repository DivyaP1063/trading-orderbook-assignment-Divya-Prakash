import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import type { MarketBook } from '../types/market'
import { formatPrice } from '../utils/format'

/** Approximate tick size for NIFTY-style quotes. */
const TICK_SIZE = 0.05

interface AlertPanelProps {
  book: MarketBook | null
  onAlert: (message: string) => void
}

function AlertPanelComponent({ book, onAlert }: AlertPanelProps) {
  const [thresholdTicks, setThresholdTicks] = useState(20)
  const [armed, setArmed] = useState(false)
  const lastFiredRef = useRef(0)

  const { spread, spreadTicks, bestBid, bestAsk } = useMemo(() => {
    const bid = book?.bids[0]?.price ?? null
    const ask = book?.asks[0]?.price ?? null
    if (bid == null || ask == null) {
      return { spread: null, spreadTicks: null, bestBid: null, bestAsk: null }
    }
    const s = ask - bid
    return {
      bestBid: bid,
      bestAsk: ask,
      spread: s,
      spreadTicks: s / TICK_SIZE,
    }
  }, [book])

  useEffect(() => {
    if (!armed || spreadTicks == null) return
    if (spreadTicks <= thresholdTicks) return

    const now = Date.now()
    // Debounce toasts to once per 5s while condition holds
    if (now - lastFiredRef.current < 5000) return
    lastFiredRef.current = now
    onAlert(
      `Spread ${spreadTicks.toFixed(1)} ticks (> ${thresholdTicks}) — bid ${formatPrice(bestBid!)} / ask ${formatPrice(bestAsk!)}`,
    )
  }, [armed, spreadTicks, thresholdTicks, bestBid, bestAsk, onAlert])

  const handleSetAlert = useCallback(() => {
    setArmed(true)
    lastFiredRef.current = 0
  }, [])

  const handleClear = useCallback(() => {
    setArmed(false)
  }, [])

  return (
    <aside className="flex w-full flex-col gap-4 rounded-lg border border-border-subtle bg-panel-elevated p-4 lg:w-72 lg:shrink-0">
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-muted" />
        <h2 className="text-sm font-semibold text-text">Alerts</h2>
      </div>

      <div className="space-y-1 text-xs text-muted">
        <p>
          Best bid:{' '}
          <span className="font-mono text-bid">
            {bestBid != null ? formatPrice(bestBid) : '—'}
          </span>
        </p>
        <p>
          Best ask:{' '}
          <span className="font-mono text-ask">
            {bestAsk != null ? formatPrice(bestAsk) : '—'}
          </span>
        </p>
        <p>
          Spread:{' '}
          <span className="font-mono text-text">
            {spread != null
              ? `${formatPrice(spread)} (${spreadTicks!.toFixed(1)} ticks)`
              : '—'}
          </span>
        </p>
        <p className="text-[10px] text-muted/80">Tick size = {TICK_SIZE}</p>
      </div>

      <label className="block space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Alert if spread &gt; X ticks</span>
          <span className="font-mono text-text">{thresholdTicks}</span>
        </div>
        <input
          type="range"
          min={1}
          max={200}
          step={1}
          value={thresholdTicks}
          onChange={(e) => setThresholdTicks(Number(e.target.value))}
          className="w-full accent-bid"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSetAlert}
          className="flex-1 rounded bg-bid/15 px-3 py-2 text-xs font-medium text-bid hover:bg-bid/25"
        >
          Set Alert
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!armed}
          className="rounded border border-border-subtle px-3 py-2 text-xs text-muted hover:bg-white/5 disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      <p
        className={`text-[11px] ${armed ? 'text-bid' : 'text-muted'}`}
      >
        {armed
          ? `Armed — toast when spread > ${thresholdTicks} ticks`
          : 'Alert inactive'}
      </p>
    </aside>
  )
}

export const AlertPanel = memo(AlertPanelComponent)
