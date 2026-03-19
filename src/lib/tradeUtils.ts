import { Trade } from './types';
import { DEALERS, CURRENCY_PAIRS } from './currencyPairs';

let tradeCounter = 1000;

export function generateTradeId(): string {
  tradeCounter++;
  return `FX${tradeCounter.toString().padStart(6, '0')}`;
}

export function formatNotional(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export function formatRate(rate: number, pair: string): string {
  const isJpyPair = pair.includes('JPY');
  return rate.toFixed(isJpyPair ? 3 : 5);
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const NOTIONALS = [1_000_000, 2_000_000, 5_000_000, 10_000_000, 500_000, 3_000_000];
const SOURCES: Trade['source'][] = ['ESP', 'RFQ', 'VOICE'];

export function generateSeedTrades(count: number = 12): Trade[] {
  const now = Date.now();
  const trades: Trade[] = [];

  for (let i = 0; i < count; i++) {
    const config = CURRENCY_PAIRS[Math.floor(Math.random() * CURRENCY_PAIRS.length)];
    const direction: Trade['direction'] = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const notional = NOTIONALS[Math.floor(Math.random() * NOTIONALS.length)];
    const dealer = DEALERS[Math.floor(Math.random() * DEALERS.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

    // Vary the rate slightly from base
    const rateJitter = (Math.random() - 0.5) * config.pipSize * 20;
    const rate = config.baseRate + rateJitter;

    trades.push({
      id: generateTradeId(),
      timestamp: now - (count - i) * 45000 - Math.random() * 30000, // stagger over ~10 mins
      pair: config.pair,
      direction,
      notional,
      rate: parseFloat(rate.toFixed(config.pipSize === 0.01 ? 3 : 5)),
      status: 'FILLED',
      counterparty: dealer,
      source,
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
}
