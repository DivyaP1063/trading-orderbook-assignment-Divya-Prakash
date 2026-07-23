import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { ConnectionStatus, MarketBook } from '../types/market'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:5000'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_DELAY_MS = 1000

export function useMarketBook() {
  const [book, setBook] = useState<MarketBook | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  const socketRef = useRef<Socket | null>(null)
  const intentionalCloseRef = useRef(false)
  const attemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const teardownSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const attachSocket = useCallback(() => {
    teardownSocket()

    const socket = io(`${WS_URL}/marketbook`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      attemptsRef.current = 0
      setReconnectAttempt(0)
      setStatus('connected')
      setError(null)
    })

    socket.on('book-update', (data: MarketBook) => {
      setBook(data)
    })

    const scheduleReconnect = (reason: string) => {
      if (intentionalCloseRef.current) {
        setStatus('disconnected')
        return
      }

      if (attemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setStatus('error')
        setError(
          `Connection lost after ${MAX_RECONNECT_ATTEMPTS} reconnect attempts. ${reason}`,
        )
        setReconnectAttempt(MAX_RECONNECT_ATTEMPTS)
        return
      }

      attemptsRef.current += 1
      setReconnectAttempt(attemptsRef.current)
      setStatus('reconnecting')
      setError(
        `Reconnecting… attempt ${attemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`,
      )

      clearReconnectTimer()
      reconnectTimerRef.current = setTimeout(() => {
        void fetch(`${API_URL}/start-market`, { method: 'POST' }).catch(
          () => undefined,
        )
        attachSocket()
      }, RECONNECT_DELAY_MS * attemptsRef.current)
    }

    socket.on('connect_error', (err) => {
      teardownSocket()
      scheduleReconnect(err.message || 'Connection failed')
    })

    socket.on('disconnect', (reason) => {
      if (intentionalCloseRef.current) {
        setStatus('disconnected')
        return
      }
      // Server/client drop — try reconnect
      scheduleReconnect(reason)
    })
  }, [clearReconnectTimer, teardownSocket])

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true
    clearReconnectTimer()
    attemptsRef.current = 0
    setReconnectAttempt(0)
    teardownSocket()
    setStatus('disconnected')
    setError(null)
  }, [clearReconnectTimer, teardownSocket])

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return

    intentionalCloseRef.current = false
    clearReconnectTimer()
    attemptsRef.current = 0
    setReconnectAttempt(0)
    setError(null)
    setStatus('connecting')

    try {
      await fetch(`${API_URL}/start-market`, { method: 'POST' })
    } catch {
      // Simulator may already be running — still try WS
    }

    attachSocket()
  }, [attachSocket, clearReconnectTimer])

  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true
      clearReconnectTimer()
      teardownSocket()
    }
  }, [clearReconnectTimer, teardownSocket])

  return {
    book,
    status,
    error,
    reconnectAttempt,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    connect,
    disconnect,
  }
}
