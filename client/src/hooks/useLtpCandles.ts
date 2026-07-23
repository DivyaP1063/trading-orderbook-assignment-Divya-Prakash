import { useEffect, useRef, useState } from 'react'

export interface Candle {
  time: string
  open: number
  high: number
  low: number
  close: number
}

const MAX_CANDLES = 40
const CANDLE_MS = 2000

/**
 * Builds a rolling OHLC series from last-traded-price ticks (top-of-book proxy).
 */
export function useLtpCandles(ltp: number | null | undefined): Candle[] {
  const [candles, setCandles] = useState<Candle[]>([])
  const bucketStartRef = useRef<number>(0)
  const currentRef = useRef<Candle | null>(null)

  useEffect(() => {
    if (ltp == null || Number.isNaN(ltp)) return

    const now = Date.now()

    if (
      !currentRef.current ||
      now - bucketStartRef.current >= CANDLE_MS
    ) {
      if (currentRef.current) {
        const sealed = currentRef.current
        setCandles((prev) => [...prev, sealed].slice(-MAX_CANDLES))
      }
      bucketStartRef.current = now
      currentRef.current = {
        time: new Date(now).toLocaleTimeString(),
        open: ltp,
        high: ltp,
        low: ltp,
        close: ltp,
      }
      return
    }

    const c = currentRef.current
    c.high = Math.max(c.high, ltp)
    c.low = Math.min(c.low, ltp)
    c.close = ltp
    // Trigger re-render of the in-progress candle
    setCandles((prev) => {
      if (prev.length === 0) return [{ ...c }]
      const next = prev.slice()
      // Live candle is not in `prev` until sealed — append a live copy for chart
      const live = { ...c }
      if (next[next.length - 1]?.time === live.time) {
        next[next.length - 1] = live
        return next
      }
      return [...next, live].slice(-MAX_CANDLES)
    })
  }, [ltp])

  return candles
}
