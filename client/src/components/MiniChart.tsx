import { memo, useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Candle } from '../hooks/useLtpCandles'
import { formatPrice } from '../utils/format'

interface MiniChartProps {
  candles: Candle[]
  symbol: string
}

interface ChartPoint extends Candle {
  body: [number, number]
  wick: [number, number]
  bullish: boolean
}

function MiniChartComponent({ candles, symbol }: MiniChartProps) {
  const data = useMemo<ChartPoint[]>(
    () =>
      candles.map((c) => ({
        ...c,
        body: [Math.min(c.open, c.close), Math.max(c.open, c.close)] as [
          number,
          number,
        ],
        wick: [c.low, c.high] as [number, number],
        bullish: c.close >= c.open,
      })),
    [candles],
  )

  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-lg border border-border-subtle bg-panel-elevated text-xs text-muted">
        Connect to stream LTP candles for {symbol}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-panel-elevated p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">
          Top of book — {symbol}
        </h2>
        <span className="text-[11px] text-muted">2s candles from LTP</span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--color-muted)', fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--color-muted)', fontSize: 10 }}
              width={72}
              tickFormatter={(v: number) => formatPrice(v)}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-panel-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--color-text)',
              }}
              labelStyle={{ color: 'var(--color-muted)' }}
              itemStyle={{ color: 'var(--color-text)' }}
              formatter={(value, name) => {
                if (name === 'wick' && Array.isArray(value)) {
                  return [`${formatPrice(value[0])} – ${formatPrice(value[1])}`, 'Range']
                }
                if (name === 'body' && Array.isArray(value)) {
                  return [`${formatPrice(value[0])} – ${formatPrice(value[1])}`, 'Body']
                }
                return [String(value), String(name)]
              }}
            />
            {/* Wicks */}
            <Bar dataKey="wick" barSize={2} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell
                  key={`wick-${i}`}
                  fill={entry.bullish ? 'var(--color-bid)' : 'var(--color-ask)'}
                />
              ))}
            </Bar>
            {/* Bodies */}
            <Bar dataKey="body" barSize={8} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell
                  key={`body-${i}`}
                  fill={entry.bullish ? 'var(--color-bid)' : 'var(--color-ask)'}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export const MiniChart = memo(MiniChartComponent)
