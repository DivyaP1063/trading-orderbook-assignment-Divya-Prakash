import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption<T extends string | number> {
  label: string
  value: T
}

interface SelectMenuProps<T extends string | number> {
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
}

export function SelectMenu<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="flex items-center gap-2">
      <span className="text-xs text-muted">{label}</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex w-[7.5rem] items-center justify-between gap-2 rounded-md border border-border-subtle bg-panel-elevated px-3 py-1.5 text-xs text-text transition-colors hover:border-muted hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-muted"
        >
          <span className="truncate font-medium">
            {selected?.label ?? String(value)}
          </span>
          <ChevronDown
            className={`size-3.5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-[calc(100%+6px)] left-0 z-50 w-full overflow-hidden rounded-md border border-border-subtle bg-panel-elevated py-1"
          >
            {options.map((opt) => {
              const isActive = opt.value === value
              return (
                <li key={String(opt.value)} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-bid/10 text-bid'
                        : 'text-text hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isActive && <Check className="size-3.5 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
