'use client';

import { useState } from 'react';
import { CURRENCY_PAIRS } from '@/lib/currencyPairs';
import { Tenor } from '@/lib/types';

const TENORS: Tenor[] = ['SPOT', '1W', '1M', '2M', '3M'];

interface RfqFormProps {
  onSubmit: (pair: string, notional: number, tenor: Tenor) => void;
  disabled: boolean;
}

export default function RfqForm({ onSubmit, disabled }: RfqFormProps) {
  const [pair, setPair] = useState('EUR/USD');
  const [notional, setNotional] = useState('1000000');
  const [tenor, setTenor] = useState<Tenor>('SPOT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(notional.replace(/[^0-9]/g, ''), 10);
    if (n > 0) {
      onSubmit(pair, n, tenor);
    }
  };

  const formatInput = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="rfq-form">
      <div>
        <label className="text-[10px] text-[#555662] uppercase block mb-1">Currency Pair</label>
        <select
          value={pair}
          onChange={e => setPair(e.target.value)}
          disabled={disabled}
          className="w-full bg-[#1A1B23] border border-[#262730] rounded px-2 py-1.5 text-sm text-[#E8EAED] focus:border-[#2962FF] focus:outline-none disabled:opacity-50"
          data-testid="rfq-pair-select"
        >
          {CURRENCY_PAIRS.map(c => (
            <option key={c.pair} value={c.pair}>{c.pair}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] text-[#555662] uppercase block mb-1">Notional</label>
        <input
          type="text"
          value={formatInput(notional)}
          onChange={e => setNotional(e.target.value)}
          disabled={disabled}
          className="w-full bg-[#1A1B23] border border-[#262730] rounded px-2 py-1.5 text-sm text-[#E8EAED] font-mono focus:border-[#2962FF] focus:outline-none disabled:opacity-50"
          data-testid="rfq-notional-input"
        />
      </div>

      <div>
        <label className="text-[10px] text-[#555662] uppercase block mb-1">Tenor</label>
        <div className="flex gap-1" data-testid="rfq-tenor-pills">
          {TENORS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTenor(t)}
              disabled={disabled}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                tenor === t
                  ? 'bg-[#2962FF]/15 text-[#5C85FF] border border-[#2962FF]/40'
                  : 'bg-[#1A1B23] text-[#8B8D97] border border-[#262730] hover:border-[#363740]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              data-testid={`tenor-${t}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-[#2962FF] hover:bg-[#1E54E6] text-white text-sm font-semibold py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        data-testid="rfq-submit-btn"
      >
        Request Quote
      </button>
    </form>
  );
}
