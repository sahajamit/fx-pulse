'use client';

import { DealerQuote } from '@/lib/types';

interface DealerQuoteCardProps {
  quote: DealerQuote;
  pair: string;
  onAccept: (dealer: string, direction: 'BUY' | 'SELL') => void;
  disabled: boolean;
}

export default function DealerQuoteCard({ quote, pair, onAccept, disabled }: DealerQuoteCardProps) {
  const isJpy = pair.includes('JPY');
  const decimals = isJpy ? 3 : 5;

  return (
    <div
      className={`bg-[#0C0D10] border rounded-lg p-3 transition-all ${
        quote.isBest ? 'border-[#2962FF]/40 shadow-[0_0_8px_rgba(41,98,255,0.1)]' : 'border-[#262730]'
      }`}
      data-testid={`dealer-quote-${quote.dealer.replace(/\s/g, '')}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#E8EAED]">{quote.dealer}</span>
        {quote.isBest && (
          <span className="text-[9px] bg-[#2962FF]/15 text-[#5C85FF] border border-[#2962FF]/30 px-1.5 py-0.5 rounded font-semibold">
            BEST
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="bg-[#13141A] hover:bg-[#FF4757]/5 border border-[#262730] hover:border-[#FF4757]/40 rounded px-2 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          onClick={() => onAccept(quote.dealer, 'SELL')}
          disabled={disabled}
          data-testid={`accept-sell-${quote.dealer.replace(/\s/g, '')}`}
        >
          <div className="text-[9px] text-[#FF4757]/70 uppercase font-medium">Sell</div>
          <div className="text-sm font-mono font-bold text-[#E8EAED]">{quote.bid.toFixed(decimals)}</div>
        </button>
        <button
          className="bg-[#13141A] hover:bg-[#00C48C]/5 border border-[#262730] hover:border-[#00C48C]/40 rounded px-2 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          onClick={() => onAccept(quote.dealer, 'BUY')}
          disabled={disabled}
          data-testid={`accept-buy-${quote.dealer.replace(/\s/g, '')}`}
        >
          <div className="text-[9px] text-[#00C48C]/70 uppercase font-medium">Buy</div>
          <div className="text-sm font-mono font-bold text-[#E8EAED]">{quote.ask.toFixed(decimals)}</div>
        </button>
      </div>
    </div>
  );
}
