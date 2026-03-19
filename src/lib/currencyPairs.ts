import { CurrencyPairConfig } from './types';

export const CURRENCY_PAIRS: CurrencyPairConfig[] = [
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', baseRate: 1.0845, pipSize: 0.0001, spreadPips: 0.8, volatility: 3.5 },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', baseRate: 1.2634, pipSize: 0.0001, spreadPips: 1.0, volatility: 3.0 },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', baseRate: 149.85, pipSize: 0.01, spreadPips: 1.2, volatility: 3.5 },
  { pair: 'AUD/USD', base: 'AUD', quote: 'USD', baseRate: 0.6542, pipSize: 0.0001, spreadPips: 1.0, volatility: 2.5 },
  { pair: 'USD/CHF', base: 'USD', quote: 'CHF', baseRate: 0.8812, pipSize: 0.0001, spreadPips: 1.2, volatility: 1.5 },
  { pair: 'USD/CAD', base: 'USD', quote: 'CAD', baseRate: 1.3567, pipSize: 0.0001, spreadPips: 1.4, volatility: 1.5 },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', baseRate: 0.8585, pipSize: 0.0001, spreadPips: 0.9, volatility: 1.2 },
  { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', baseRate: 162.45, pipSize: 0.01, spreadPips: 1.5, volatility: 3.0 },
];

export const DEALERS = ['Deutsche Bank', 'Barclays', 'Citi', 'JPMorgan'];

export function getPairConfig(pair: string): CurrencyPairConfig | undefined {
  return CURRENCY_PAIRS.find(p => p.pair === pair);
}
