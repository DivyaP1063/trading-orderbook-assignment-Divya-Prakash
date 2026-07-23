import { Loader2, Plug, Unplug } from 'lucide-react'
import type { ConnectionStatus } from '../../types/market'
import { formatPrice } from '../../utils/format'

interface OrderBookHeaderProps {
  symbol: string
  lastTradedPrice: number | null
  depth: number
  onDepthChange: (depth: number) => void
  groupDecimals: number
  onGroupChange: (decimals: number) => void
  status: ConnectionStatus
  onConnect: () => void
  onDisconnect: () => void
}

const DEPTH_OPTIONS = [5, 10, 15]
const GROUP_OPTIONS = [
  { label: '0 decimals', value: 0 },
  { label: '1 decimal', value: 1 },
  { label: '2 decimals', value: 2 },
]

export function OrderBookHeader({
  symbol,
  lastTradedPrice,
  depth,
  onDepthChange,
  groupDecimals,
  onGroupChange,
  status,
  onConnect,
  onDisconnect,
}: OrderBookHeaderProps) {
  const isConnecting = status === 'connecting' || status === 'reconnecting'
  const isConnected = status === 'connected'

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-lg font-semibold text-text">
          Order Book — {symbol}
        </h1>
        {lastTradedPrice !== null && (
          <span className="font-mono text-sm text-muted">
            LTP{' '}
            <span className="text-text">{formatPrice(lastTradedPrice)}</span>
          </span>
        )}
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          Depth
          <select
            className="rounded border border-border-subtle bg-panel-elevated px-2 py-1.5 text-xs text-text outline-none focus:border-muted"
            value={depth}
            onChange={(e) => onDepthChange(Number(e.target.value))}
          >
            {DEPTH_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-muted">
          Group
          <select
            className="rounded border border-border-subtle bg-panel-elevated px-2 py-1.5 text-xs text-text outline-none focus:border-muted"
            value={groupDecimals}
            onChange={(e) => onGroupChange(Number(e.target.value))}
          >
            {GROUP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 rounded bg-ask/15 px-3 py-1.5 text-xs font-medium text-ask hover:bg-ask/25"
          >
            <Unplug className="size-3.5" />
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className="inline-flex items-center gap-1.5 rounded bg-bid/15 px-3 py-1.5 text-xs font-medium text-bid hover:bg-bid/25 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plug className="size-3.5" />
            )}
            {isConnecting ? 'Connecting…' : 'Connect'}
          </button>
        )}
      </div>
    </header>
  )
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const styles: Record<ConnectionStatus, string> = {
    disconnected: 'bg-muted/20 text-muted',
    connecting: 'bg-amber-500/20 text-amber-400',
    reconnecting: 'bg-amber-500/20 text-amber-400',
    connected: 'bg-bid/20 text-bid',
    error: 'bg-ask/20 text-ask',
  }

  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  )
}
