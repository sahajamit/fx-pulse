import { DealerQuote, CurrencyPairConfig } from './types';
import { DEALERS } from './currencyPairs';

export function generateDealerQuotes(
  config: CurrencyPairConfig,
  midRate: number,
): { dealer: string; delay: number; bid: number; ask: number }[] {
  const decimals = config.pipSize === 0.01 ? 3 : 5;

  const rawQuotes = DEALERS.map(dealer => {
    // Each dealer has slightly different spread and skew
    const spreadMultiplier = 0.8 + Math.random() * 0.8; // 0.8x to 1.6x
    const halfSpread = (config.spreadPips * config.pipSize * spreadMultiplier) / 2;
    const skew = (Math.random() - 0.5) * config.pipSize * 1.5;

    const bid = parseFloat((midRate + skew - halfSpread).toFixed(decimals));
    const ask = parseFloat((midRate + skew + halfSpread).toFixed(decimals));

    // Stagger arrival: 500ms to 3000ms
    const delay = 500 + Math.random() * 2500;

    return { dealer, delay, bid, ask };
  });

  // Mark the best ask (lowest) and best bid (highest)
  return rawQuotes;
}

export function markBestQuotes(quotes: DealerQuote[]): DealerQuote[] {
  if (quotes.length === 0) return quotes;

  const bestAsk = Math.min(...quotes.map(q => q.ask));
  const bestBid = Math.max(...quotes.map(q => q.bid));

  return quotes.map(q => ({
    ...q,
    isBest: q.ask === bestAsk || q.bid === bestBid,
  }));
}
