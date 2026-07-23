import { OrderBook } from './components/OrderBook/OrderBook'
import { useMarketBook } from './hooks/useMarketBook'

function App() {
  const { book, status, error, connect, disconnect } = useMarketBook()

  return (
    <div className="min-h-full bg-panel px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <OrderBook
          book={book}
          status={status}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </div>
    </div>
  )
}

export default App
