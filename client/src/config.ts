/** Local backend (npm run dev in /server). */
const LOCAL_SERVER = 'http://localhost:5000'

/** Deployed backend (Render). */
const PROD_SERVER =
  'https://trading-orderbook-assignment-divya.onrender.com'

/**
 * Pick API/WS base URL from where the UI is running:
 * - localhost / 127.0.0.1 → local server
 * - Vercel (or any other host) → Render
 */
export function getServerBaseUrl(): string {
  if (typeof window === 'undefined') return LOCAL_SERVER

  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return LOCAL_SERVER
  }

  return PROD_SERVER
}
