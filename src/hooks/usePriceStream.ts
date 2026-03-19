'use client';

import { useTradingContext } from '@/context/TradingContext';
import { PriceQuote } from '@/lib/types';

export function usePriceStream(pair: string): PriceQuote | undefined {
  const { prices } = useTradingContext();
  return prices.get(pair);
}
