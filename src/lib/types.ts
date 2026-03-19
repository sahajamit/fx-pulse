export interface CurrencyPairConfig {
  pair: string;
  base: string;
  quote: string;
  baseRate: number;
  pipSize: number;       // e.g., 0.0001 for most, 0.01 for JPY pairs
  spreadPips: number;
  volatility: number;    // multiplier for price movement
}

export interface PriceQuote {
  pair: string;
  bid: number;
  ask: number;
  mid: number;
  spread: number;
  timestamp: number;
  direction: 'up' | 'down' | 'unchanged';
}

export interface Trade {
  id: string;
  timestamp: number;
  pair: string;
  direction: 'BUY' | 'SELL';
  notional: number;
  rate: number;
  status: 'FILLED' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  counterparty: string;
  source: 'ESP' | 'RFQ' | 'VOICE';
}

export type RfqStatus = 'IDLE' | 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type Tenor = 'SPOT' | '1W' | '1M' | '2M' | '3M';

export interface DealerQuote {
  dealer: string;
  bid: number;
  ask: number;
  timestamp: number;
  isBest: boolean;
}

export interface RfqState {
  status: RfqStatus;
  pair: string;
  notional: number;
  tenor: Tenor;
  quotes: DealerQuote[];
  expiryTime: number | null;
  acceptedQuote: DealerQuote | null;
}
