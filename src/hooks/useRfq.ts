'use client';

import { useState, useEffect } from 'react';
import { useTradingContext } from '@/context/TradingContext';

export function useRfq() {
  const { rfq, submitRfq, acceptQuote, rejectRfq, resetRfq } = useTradingContext();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!rfq.expiryTime || (rfq.status !== 'PENDING' && rfq.status !== 'QUOTED')) {
      setTimeRemaining(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, rfq.expiryTime! - Date.now());
      setTimeRemaining(remaining);
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [rfq.expiryTime, rfq.status]);

  return {
    rfq,
    timeRemaining,
    submitRfq,
    acceptQuote,
    rejectRfq,
    resetRfq,
  };
}
