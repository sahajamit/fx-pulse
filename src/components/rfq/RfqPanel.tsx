'use client';

import { useRfq } from '@/hooks/useRfq';
import RfqForm from './RfqForm';
import DealerQuoteCard from './DealerQuoteCard';
import RfqStatusBadge from './RfqStatusBadge';

export default function RfqPanel() {
  const { rfq, timeRemaining, submitRfq, acceptQuote, rejectRfq, resetRfq } = useRfq();

  const isActive = rfq.status === 'PENDING' || rfq.status === 'QUOTED';
  const isTerminal = rfq.status === 'ACCEPTED' || rfq.status === 'REJECTED' || rfq.status === 'EXPIRED';
  const seconds = Math.ceil(timeRemaining / 1000);

  return (
    <div className="flex flex-col h-full" data-testid="rfq-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#262730]">
        <h2 className="text-xs font-semibold text-[#8B8D97] uppercase tracking-wider">Request for Quote</h2>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="text-[10px] font-mono text-[#FFB020] tabular-nums" data-testid="rfq-timer">
              {seconds}s
            </span>
          )}
          <RfqStatusBadge status={rfq.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <RfqForm onSubmit={submitRfq} disabled={isActive} />

        {rfq.quotes.length > 0 && (
          <div className="space-y-2" data-testid="rfq-quotes">
            <div className="text-[10px] text-[#555662] uppercase">
              Dealer Quotes ({rfq.quotes.length}/4)
            </div>
            {rfq.quotes.map(quote => (
              <DealerQuoteCard
                key={quote.dealer}
                quote={quote}
                pair={rfq.pair}
                onAccept={acceptQuote}
                disabled={!isActive}
              />
            ))}
          </div>
        )}

        {isActive && rfq.quotes.length > 0 && (
          <button
            onClick={rejectRfq}
            className="w-full bg-[#FF4757]/10 hover:bg-[#FF4757]/20 text-[#FF4757] text-xs font-medium py-1.5 rounded border border-[#FF4757]/20 transition-colors cursor-pointer"
            data-testid="rfq-reject-btn"
          >
            Reject All
          </button>
        )}

        {isTerminal && (
          <div className="text-center space-y-2">
            <p className="text-xs text-[#8B8D97]">
              {rfq.status === 'ACCEPTED' && `Accepted quote from ${rfq.acceptedQuote?.dealer}`}
              {rfq.status === 'REJECTED' && 'All quotes rejected'}
              {rfq.status === 'EXPIRED' && 'RFQ expired — quotes are no longer valid'}
            </p>
            <button
              onClick={resetRfq}
              className="text-xs text-[#2962FF] hover:text-[#5C85FF] transition-colors cursor-pointer"
              data-testid="rfq-new-btn"
            >
              New RFQ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
