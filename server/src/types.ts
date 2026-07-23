export interface OrderLevel {
  price: number;
  qty: number;
}

export interface MarketBook {
  symbol: string;
  lastTradedPrice: number;
  timestamp: string;
  numOfLevels: number;
  bids: OrderLevel[];
  asks: OrderLevel[];
}
