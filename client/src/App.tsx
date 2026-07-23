import { useCallback, useState } from 'react'
import { AlertPanel } from './components/AlertPanel'
import { MiniChart } from './components/MiniChart'
import { Navbar } from './components/Navbar'
import { OrderBook } from './components/OrderBook/OrderBook'
import { Toast } from './components/Toast'
import { useLtpCandles } from './hooks/useLtpCandles'
import { useMarketBook } from './hooks/useMarketBook'
import { useTheme } from './hooks/useTheme'

function App() {
  const {
    book,
    status,
    error,
    reconnectAttempt,
    maxReconnectAttempts,
    connect,
    disconnect,
  } = useMarketBook()
  const { theme, toggleTheme } = useTheme()
  const candles = useLtpCandles(book?.lastTradedPrice)
  const [toast, setToast] = useState<string | null>(null)

  const handleAlert = useCallback((message: string) => {
    setToast(message)
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  return (
    <div className="min-h-full bg-panel">
      <Navbar />

      <main className="px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <div id="top-of-book">
            <MiniChart candles={candles} symbol={book?.symbol ?? 'NIFTY'} />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div id="order-book" className="min-w-0 flex-1">
              <OrderBook
                book={book}
                status={status}
                error={error}
                reconnectAttempt={reconnectAttempt}
                maxReconnectAttempts={maxReconnectAttempts}
                theme={theme}
                onToggleTheme={toggleTheme}
                onConnect={connect}
                onDisconnect={disconnect}
              />
            </div>
            <div id="alerts">
              <AlertPanel book={book} onAlert={handleAlert} />
            </div>
          </div>
        </div>
      </main>

      <Toast message={toast} onClose={clearToast} />
    </div>
  )
}

export default App
