import { Download, Loader2, Moon, Plug, Sun, Unplug } from 'lucide-react'
import type { ConnectionStatus } from '../../types/market'
import type { Theme } from '../../hooks/useTheme'
import { formatPrice } from '../../utils/format'
import { SelectMenu } from '../SelectMenu'

interface OrderBookHeaderProps {
  symbol: string
  lastTradedPrice: number | null
  depth: number
  onDepthChange: (depth: number) => void
  groupDecimals: number
  onGroupChange: (decimals: number) => void
  status: ConnectionStatus
  reconnectAttempt?: number
  maxReconnectAttempts?: number
  theme: Theme
  onToggleTheme: () => void
  canExport: boolean
  onExport: () => void
  onConnect: () => void
  onDisconnect: () => void
}

const DEPTH_OPTIONS = [
  { label: '5 levels', value: 5 },
  { label: '10 levels', value: 10 },
  { label: '15 levels', value: 15 },
]

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
  reconnectAttempt = 0,
  maxReconnectAttempts = 3,
  theme,
  onToggleTheme,
  canExport,
  onExport,
  onConnect,
  onDisconnect,
}: OrderBookHeaderProps) {
  const isConnecting = status === 'connecting' || status === 'reconnecting'
  const isConnected = status === 'connected'
  const connectLabel =
    status === 'reconnecting'
      ? `Reconnecting ${reconnectAttempt}/${maxReconnectAttempts}…`
      : isConnecting
        ? 'Connecting…'
        : 'Connect'

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
        <SelectMenu
          label="Depth"
          value={depth}
          options={DEPTH_OPTIONS}
          onChange={onDepthChange}
        />
        <SelectMenu
          label="Group"
          value={groupDecimals}
          options={GROUP_OPTIONS}
          onChange={onGroupChange}
        />

        <button
          type="button"
          onClick={onExport}
          disabled={!canExport}
          title="Export book as JSON"
          className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-xs text-muted hover:bg-white/5 disabled:opacity-40"
        >
          <Download className="size-3.5" />
          Export
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          title="Toggle dark mode"
          className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-xs text-muted hover:bg-white/5"
        >
          {theme === 'dark' ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          )}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 rounded-md bg-ask/15 px-3 py-1.5 text-xs font-medium text-ask hover:bg-ask/25"
          >
            <Unplug className="size-3.5" />
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className="inline-flex items-center gap-1.5 rounded-md bg-bid/15 px-3 py-1.5 text-xs font-medium text-bid hover:bg-bid/25 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plug className="size-3.5" />
            )}
            {connectLabel}
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
