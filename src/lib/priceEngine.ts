import { CurrencyPairConfig, PriceQuote } from './types';
import { CURRENCY_PAIRS } from './currencyPairs';

const currentPrices: Map<string, number> = new Map();

function initPrices() {
  CURRENCY_PAIRS.forEach(config => {
    currentPrices.set(config.pair, config.baseRate);
  });
}

initPrices();

export function generateNextPrice(config: CurrencyPairConfig, previousMid?: number): PriceQuote {
  const prev = previousMid ?? currentPrices.get(config.pair) ?? config.baseRate;

  // Random walk: Gaussian-ish via Box-Muller
  const u1 = Math.random();
  const u2 = Math.random();
  const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Scale movement based on pip size and volatility
  const movement = gaussian * config.pipSize * config.volatility * 0.5;
  const mid = prev + movement;

  // Mean reversion: gently pull towards base rate
  const reversion = (config.baseRate - mid) * 0.001;
  const adjustedMid = mid + reversion;

  const halfSpread = (config.spreadPips * config.pipSize) / 2;
  // Add slight spread jitter
  const spreadJitter = (Math.random() - 0.5) * config.pipSize * 0.2;

  const bid = adjustedMid - halfSpread + spreadJitter;
  const ask = adjustedMid + halfSpread - spreadJitter;

  currentPrices.set(config.pair, adjustedMid);

  const direction: PriceQuote['direction'] =
    adjustedMid > prev ? 'up' : adjustedMid < prev ? 'down' : 'unchanged';

  return {
    pair: config.pair,
    bid: roundToDecimals(bid, config.pipSize === 0.01 ? 3 : 5),
    ask: roundToDecimals(ask, config.pipSize === 0.01 ? 3 : 5),
    mid: roundToDecimals(adjustedMid, config.pipSize === 0.01 ? 3 : 5),
    spread: roundToDecimals(ask - bid, config.pipSize === 0.01 ? 3 : 5),
    timestamp: Date.now(),
    direction,
  };
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function generateInitialPrices(): Map<string, PriceQuote> {
  const prices = new Map<string, PriceQuote>();
  CURRENCY_PAIRS.forEach(config => {
    prices.set(config.pair, generateNextPrice(config));
  });
  return prices;
}
