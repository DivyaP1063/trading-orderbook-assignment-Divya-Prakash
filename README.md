# Trading Order Book — Market Depth Panel

Professional **Market Depth / Order Book** panel for a trading terminal.  
A Node.js backend simulates live NIFTY order-book data over Socket.io; a React + TypeScript frontend renders a performant two-column ladder with visual feedback.

## Stack

| Layer | Tech |
|--------|------|
| Backend | Node.js, Express, Socket.io, TypeScript |
| Frontend | React 18+, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts (bonus) |
| Icons | Lucide React |

No external market APIs — all data is simulated in memory.

---

## Project structure

```
Trading/
├── server/          # Express + Socket.io market simulator
│   └── src/
│       ├── index.ts
│       ├── simulator.ts
│       └── types.ts
└── client/          # React order-book UI
    └── src/
        ├── components/
        ├── hooks/
        ├── types/
        └── utils/
```

---

## How to run

### Prerequisites

- Node.js 18+ (tested on Node 22)
- Two terminal windows

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Server starts at **http://localhost:5000**  
WebSocket namespace: **`/marketbook`**

| Endpoint | Description |
|----------|-------------|
| `POST /start-market` | Starts the in-memory simulator → `{ status: "running" }` |
| `GET /` | Health / status |
| WS `/marketbook` | Emits `book-update` on connect, then every 300–500 ms |

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** → click **Connect**.

### Production build (optional)

```bash
# backend
cd server && npm run build && npm start

# frontend
cd client && npm run build && npm run preview
```

---

## Data shape

Every tick broadcasts:

```json
{
  "symbol": "NIFTY",
  "lastTradedPrice": 102347.65,
  "timestamp": "2026-03-16T13:45:22.345Z",
  "numOfLevels": 15,
  "bids": [{ "price": 102345.10, "qty": 12.45 }],
  "asks": [{ "price": 102350.00, "qty": 5.80 }]
}
```

- Bids sorted **descending**, asks **ascending**
- Exactly **15** levels per side
- Simulator mutates 2–4 levels per tick (±0.05–0.20%)
- Resets to seed if LTP drifts beyond **±2%**
- Timer stops when the last WebSocket client disconnects

---

## Design decisions & trade-offs

### Real-time updates without UI jitter

- Rows are **`React.memo`**’d with a custom props comparator so unchanged levels skip re-render.
- Stable **index keys** keep DOM nodes warm for flash animations.
- Aggregation (depth / group decimals) is **`useMemo`**’d per side.
- Flash detection lives inside each row (local previous price/qty) so the parent does not rebuild flash maps every tick.

**Trade-off:** Index-based keys can briefly show a “shift” if levels reorder aggressively. Price-based keys would remount more often and kill flash animations — index keys win for this assignment’s update rate.

### Connection lifecycle

- Manual **Connect / Disconnect** with loading states.
- Custom auto-reconnect (max **3** attempts, backoff), Socket.io’s built-in reconnection disabled to keep attempt counting explicit.
- `POST /start-market` is called on connect so the simulator is always running when a client needs data.

### Depth bars

- Bar width = row’s cumulative **Sum** / max visible Sum.
- Bars grow from the **right**; prices stay green (bid) / red (ask).

### Simulator interval

- Recursive `setTimeout` with a fresh 300–500 ms delay each tick (not a fixed `setInterval`) for realistic jitter.

---

## Bonus features

| Feature | Details |
|---------|---------|
| **Mini candlestick chart** | Recharts OHLC built from LTP ticks (2s buckets) |
| **Spread alert panel** | Slider “alert if spread > X ticks”; **Set Alert** → toast (debounced) |
| **Dark / light mode** | Tailwind CSS variables + `localStorage` persistence |
| **Export JSON** | Downloads the current book snapshot |

---

## Known limitations

- Simulated data only — not a real exchange feed.
- Candles are derived from LTP, not true trade OHLC / volume.
- Tick size for alerts is fixed at `0.05` (configurable in code).
- Mobile layout is usable but optimized for **1440px+** desktops.
- No auth, persistence, or multi-symbol switching.
- High update rates are simulated at ~2–3 Hz (300–500 ms); the UI path is built to stay smooth if the feed is pushed harder.

---

## Scripts reference

| Package | Script | Purpose |
|---------|--------|---------|
| `server` | `npm run dev` | tsx watch |
| `server` | `npm run build` / `npm start` | compile + run |
| `client` | `npm run dev` | Vite HMR |
| `client` | `npm run build` | production bundle |

---

## License

Assignment / portfolio project — use freely for evaluation.
