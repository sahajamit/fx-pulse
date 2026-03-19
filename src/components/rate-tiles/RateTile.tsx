'use client';

import { useState, useEffect, useRef } from 'react';
import { usePriceStream } from '@/hooks/usePriceStream';
import { useTradingContext } from '@/context/TradingContext';
import PriceDisplay from './PriceDisplay';

interface RateTileProps {
  pair: string;
}

export default function RateTile({ pair }: RateTileProps) {
  const price = usePriceStream(pair);
  const { executeTrade } = useTradingContext();
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevMidRef = useRef<number | undefined>(undefined);
  const isJpy = pair.includes('JPY');

  useEffect(() => {
    if (!price) return;
    if (prevMidRef.current !== undefined && price.mid !== prevMidRef.current) {
      setFlash(price.mid > prevMidRef.current ? 'up' : 'down');
      const timer = setTimeout(() => setFlash(null), 300);
      return () => clearTimeout(timer);
    }
    prevMidRef.current = price.mid;
  }, [price]);

  if (!price) return null;

  const spreadPips = isJpy
    ? ((price.ask - price.bid) * 100).toFixed(1)
    : ((price.ask - price.bid) * 10000).toFixed(1);

  const flashBorder = flash === 'up'
    ? 'border-[#00C48C]/50 shadow-[0_0_8px_rgba(0,196,140,0.1)]'
    : flash === 'down'
    ? 'border-[#FF4757]/50 shadow-[0_0_8px_rgba(255,71,87,0.1)]'
    : 'border-[#262730]';

  const handleTrade = (direction: 'BUY' | 'SELL') => {
    const rate = direction === 'BUY' ? price.ask : price.bid;
    executeTrade(pair, direction, rate);
  };

  return (
    <div
      className={`bg-[#13141A] border ${flashBorder} rounded-lg p-3 transition-all duration-300`}
      data-testid={`rate-tile-${pair.replace('/', '')}`}
    >
      {/* Pair name and spread */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#E8EAED]" data-testid="pair-name">{pair}</span>
        <span className="text-[10px] text-[#555662] font-mono">{spreadPips} pips</span>
      </div>

      {/* Bid / Ask buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="group bg-[#0C0D10] hover:bg-[#FF4757]/5 border border-[#262730] hover:border-[#FF4757]/40 rounded px-2 py-2 transition-all cursor-pointer"
          onClick={() => handleTrade('SELL')}
          data-testid={`sell-btn-${pair.replace('/', '')}`}
        >
          <div className="text-[10px] text-[#FF4757]/70 uppercase mb-0.5 font-medium">Sell</div>
          <PriceDisplay price={price.bid} isJpy={isJpy} direction={price.direction} side="bid" />
        </button>
        <button
          className="group bg-[#0C0D10] hover:bg-[#00C48C]/5 border border-[#262730] hover:border-[#00C48C]/40 rounded px-2 py-2 transition-all cursor-pointer"
          onClick={() => handleTrade('BUY')}
          data-testid={`buy-btn-${pair.replace('/', '')}`}
        >
          <div className="text-[10px] text-[#00C48C]/70 uppercase mb-0.5 font-medium">Buy</div>
          <PriceDisplay price={price.ask} isJpy={isJpy} direction={price.direction} side="ask" />
        </button>
      </div>
    </div>
  );
}
