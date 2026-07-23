import { memo, useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
  onClose: () => void
  durationMs?: number
}

function ToastComponent({ message, onClose, durationMs = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setVisible(false)
      return
    }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      onClose()
    }, durationMs)
    return () => clearTimeout(t)
  }, [message, durationMs, onClose])

  if (!message || !visible) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-border-subtle bg-panel-elevated px-4 py-3 text-sm text-text shadow-2xl"
    >
      <p className="font-medium text-ask">Spread alert</p>
      <p className="mt-1 text-muted">{message}</p>
    </div>
  )
}

export const Toast = memo(ToastComponent)
