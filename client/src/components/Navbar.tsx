import { Activity } from 'lucide-react'

function CompanyLogo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#0ecb81" fillOpacity="0.15" />
      <path
        d="M7 22V10h3.2l4.3 8.4L18.8 10H22v12h-2.6v-7.1l-3.9 7.1h-1.8l-3.9-7.1V22H7Z"
        fill="#0ecb81"
      />
      <path d="M24 22h2.4v-3.2H24V22Z" fill="#f6465d" />
      <path d="M24 17.2h2.4v-3.2H24v3.2Z" fill="#0ecb81" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Market Depth', href: '#order-book', active: true },
  { label: 'Chart', href: '#top-of-book', active: false },
  { label: 'Alerts', href: '#alerts', active: false },
] as const

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-panel/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <CompanyLogo />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-text">
                Market Depth
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                Terminal
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium no-underline transition-colors ${
                  link.active
                    ? 'bg-white/5 text-text'
                    : 'text-muted hover:bg-white/5 hover:text-text'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <Activity className="size-3.5 text-bid" />
            Live terminal
          </span>
          <span className="rounded-md border border-border-subtle px-2 py-1 font-mono text-[11px] text-text">
            NIFTY
          </span>
        </div>
      </div>
    </header>
  )
}
