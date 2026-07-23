import { MarketBook, OrderLevel } from "./types";

const SYMBOL = "NIFTY";
const NUM_LEVELS = 15;
const SEED_LTP = 102347.65;
const PRICE_STEP = 5; // approx tick between levels
const RESET_THRESHOLD = 0.02; // ±2%

function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

function roundQty(qty: number): number {
  return Math.round(qty * 100) / 100;
}

function buildSeedBook(): MarketBook {
  const mid = SEED_LTP;
  const bids: OrderLevel[] = [];
  const asks: OrderLevel[] = [];

  for (let i = 0; i < NUM_LEVELS; i++) {
    bids.push({
      price: roundPrice(mid - PRICE_STEP * (i + 1) + (i === 0 ? 2.55 : 0)),
      qty: roundQty(5 + Math.random() * 20),
    });
    asks.push({
      price: roundPrice(mid + PRICE_STEP * (i + 1) - (i === 0 ? 2.35 : 0)),
      qty: roundQty(5 + Math.random() * 20),
    });
  }

  // Ensure correct sort order
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  return {
    symbol: SYMBOL,
    lastTradedPrice: SEED_LTP,
    timestamp: new Date().toISOString(),
    numOfLevels: NUM_LEVELS,
    bids,
    asks,
  };
}

function cloneBook(book: MarketBook): MarketBook {
  return {
    ...book,
    bids: book.bids.map((l) => ({ ...l })),
    asks: book.asks.map((l) => ({ ...l })),
  };
}

export class MarketSimulator {
  private seed: MarketBook;
  private book: MarketBook;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(book: MarketBook) => void>();

  constructor() {
    this.seed = buildSeedBook();
    this.book = cloneBook(this.seed);
  }

  getBook(): MarketBook {
    return cloneBook(this.book);
  }

  isRunning(): boolean {
    return this.timer !== null;
  }

  onUpdate(listener: (book: MarketBook) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): void {
    if (this.timer) return;
    this.scheduleNextTick();
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextTick(): void {
    this.timer = setTimeout(() => {
      this.tick();
      this.emit();
      if (this.timer !== null) {
        this.scheduleNextTick();
      }
    }, this.randomInterval());
  }

  /** Stop only if no connected clients remain. */
  stopIfIdle(activeConnections: number): void {
    if (activeConnections <= 0) {
      this.stop();
    }
  }

  private randomInterval(): number {
    return 300 + Math.floor(Math.random() * 201); // 300–500 ms
  }

  private emit(): void {
    const snapshot = this.getBook();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private tick(): void {
    // Drift check — reset if LTP moved too far from seed
    const drift =
      Math.abs(this.book.lastTradedPrice - this.seed.lastTradedPrice) /
      this.seed.lastTradedPrice;
    if (drift > RESET_THRESHOLD) {
      this.book = cloneBook(this.seed);
      this.book.timestamp = new Date().toISOString();
      return;
    }

    const changes = 2 + Math.floor(Math.random() * 3); // 2–4 levels
    for (let i = 0; i < changes; i++) {
      this.mutateRandomLevel();
    }

    // Soft LTP drift toward mid of best bid/ask
    const bestBid = this.book.bids[0]?.price ?? this.book.lastTradedPrice;
    const bestAsk = this.book.asks[0]?.price ?? this.book.lastTradedPrice;
    const mid = (bestBid + bestAsk) / 2;
    const ltpMove = (Math.random() - 0.5) * 0.001; // ±0.05%
    this.book.lastTradedPrice = roundPrice(
      mid * (1 + ltpMove) * 0.3 + this.book.lastTradedPrice * 0.7
    );

    this.book.timestamp = new Date().toISOString();
    this.book.numOfLevels = NUM_LEVELS;

    // Re-sort & trim to exactly 15 levels
    this.book.bids.sort((a, b) => b.price - a.price);
    this.book.asks.sort((a, b) => a.price - b.price);
    this.book.bids = this.book.bids.slice(0, NUM_LEVELS);
    this.book.asks = this.book.asks.slice(0, NUM_LEVELS);

    // Keep bids below asks
    if (
      this.book.bids[0] &&
      this.book.asks[0] &&
      this.book.bids[0].price >= this.book.asks[0].price
    ) {
      this.book.bids[0].price = roundPrice(this.book.asks[0].price - PRICE_STEP);
      this.book.bids.sort((a, b) => b.price - a.price);
    }
  }

  private mutateRandomLevel(): void {
    const side = Math.random() < 0.5 ? "bids" : "asks";
    const levels = this.book[side];
    const idx = Math.floor(Math.random() * levels.length);
    const level = levels[idx];

    // ±0.05%–0.20% price move
    const pct = 0.0005 + Math.random() * 0.0015;
    const sign = Math.random() < 0.5 ? -1 : 1;
    level.price = roundPrice(level.price * (1 + sign * pct));

    // Quantity jitter ±5–25%
    const qtyPct = 0.05 + Math.random() * 0.2;
    const qtySign = Math.random() < 0.5 ? -1 : 1;
    level.qty = Math.max(0.01, roundQty(level.qty * (1 + qtySign * qtyPct)));
  }
}
