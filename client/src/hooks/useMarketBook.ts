import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { ConnectionStatus, MarketBook } from '../types/market'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:5000'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export function useMarketBook() {
  const [book, setBook] = useState<MarketBook | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setStatus('disconnected')
  }, [])

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return

    setError(null)
    setStatus('connecting')

    try {
      await fetch(`${API_URL}/start-market`, { method: 'POST' })
    } catch {
      // Simulator may already be running via another client — continue to WS
    }

    disconnect()

    const socket = io(`${WS_URL}/marketbook`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setStatus('connected')
      setError(null)
    })

    socket.on('book-update', (data: MarketBook) => {
      setBook(data)
    })

    socket.on('connect_error', (err) => {
      setStatus('error')
      setError(err.message || 'Connection failed')
    })

    socket.on('disconnect', () => {
      setStatus((prev) => (prev === 'connecting' ? 'error' : 'disconnected'))
    })
  }, [disconnect])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { book, status, error, connect, disconnect }
}
