'use client';

import { CURRENCY_PAIRS } from '@/lib/currencyPairs';
import RateTile from './RateTile';

export default function RateTilesPanel() {
  return (
    <div className="p-3" data-testid="rate-tiles-panel">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[#8B8D97] uppercase tracking-wider">Live Rates</h2>
        <span className="text-[10px] text-[#555662]">ESP &bull; Click to trade</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {CURRENCY_PAIRS.map(config => (
          <RateTile key={config.pair} pair={config.pair} />
        ))}
      </div>
    </div>
  );
}
