'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { PriceQuote, Trade, RfqState, DealerQuote, Tenor } from '@/lib/types';
import { CURRENCY_PAIRS } from '@/lib/currencyPairs';
import { generateNextPrice, generateInitialPrices } from '@/lib/priceEngine';
import { generateSeedTrades, generateTradeId } from '@/lib/tradeUtils';
import { generateDealerQuotes, markBestQuotes } from '@/lib/rfqSimulator';
import { getPairConfig } from '@/lib/currencyPairs';

interface TradingContextType {
  prices: Map<string, PriceQuote>;
  trades: Trade[];
  rfq: RfqState;
  executeTrade: (pair: string, direction: 'BUY' | 'SELL', rate: number, notional?: number) => void;
  submitRfq: (pair: string, notional: number, tenor: Tenor) => void;
  acceptQuote: (dealer: string, direction: 'BUY' | 'SELL') => void;
  rejectRfq: () => void;
  resetRfq: () => void;
}

const TradingContext = createContext<TradingContextType | null>(null);

const INITIAL_RFQ: RfqState = {
  status: 'IDLE',
  pair: 'EUR/USD',
  notional: 1_000_000,
  tenor: 'SPOT',
  quotes: [],
  expiryTime: null,
  acceptedQuote: null,
};

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Map<string, PriceQuote>>(new Map());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [rfq, setRfq] = useState<RfqState>(INITIAL_RFQ);
  const [mounted, setMounted] = useState(false);
  const rfqTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Initialize client-side only data
  useEffect(() => {
    setPrices(generateInitialPrices());
    setTrades(generateSeedTrades(12));
    setMounted(true);
  }, []);

  // Price streaming
  useEffect(() => {
    if (!mounted) return;
    const intervals: ReturnType<typeof setInterval>[] = [];

    // Key pairs (EUR/USD, GBP/USD, USD/JPY, EUR/JPY) tick faster for visible volatility
    const FAST_PAIRS = new Set(['EUR/USD', 'GBP/USD', 'USD/JPY', 'EUR/JPY']);
    CURRENCY_PAIRS.forEach(config => {
      const interval = FAST_PAIRS.has(config.pair)
        ? 200 + Math.random() * 400   // 200ms-600ms for key pairs
        : 500 + Math.random() * 1500; // 500ms-2s for others
      const id = setInterval(() => {
        setPrices(prev => {
          const next = new Map(prev);
          const prevPrice = prev.get(config.pair);
          next.set(config.pair, generateNextPrice(config, prevPrice?.mid));
          return next;
        });
      }, interval);
      intervals.push(id);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  const executeTrade = useCallback((pair: string, direction: 'BUY' | 'SELL', rate: number, notional: number = 1_000_000) => {
    const tradeId = generateTradeId();
    const trade: Trade = {
      id: tradeId,
      timestamp: Date.now(),
      pair,
      direction,
      notional,
      rate,
      status: 'PENDING',
      counterparty: 'Market',
      source: 'ESP',
    };
    setTrades(prev => [trade, ...prev]);

    // Simulate fill after 1–3 seconds
    const fillDelay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'FILLED' } : t));
    }, fillDelay);
  }, []);

  const submitRfq = useCallback((pair: string, notional: number, tenor: Tenor) => {
    // Clear any existing timers
    rfqTimersRef.current.forEach(clearTimeout);
    rfqTimersRef.current = [];

    setRfq({
      status: 'PENDING',
      pair,
      notional,
      tenor,
      quotes: [],
      expiryTime: Date.now() + 30000,
      acceptedQuote: null,
    });

    const config = getPairConfig(pair);
    if (!config) return;

    const currentPrice = prices.get(pair);
    const mid = currentPrice?.mid ?? config.baseRate;
    const dealerQuotes = generateDealerQuotes(config, mid);

    // Stagger quote arrivals
    dealerQuotes.forEach(({ dealer, delay, bid, ask }) => {
      const timer = setTimeout(() => {
        setRfq(prev => {
          if (prev.status !== 'PENDING' && prev.status !== 'QUOTED') return prev;
          const newQuote: DealerQuote = { dealer, bid, ask, timestamp: Date.now(), isBest: false };
          const allQuotes = markBestQuotes([...prev.quotes, newQuote]);
          return { ...prev, status: 'QUOTED', quotes: allQuotes };
        });
      }, delay);
      rfqTimersRef.current.push(timer);
    });

    // Expiry timer
    const expiryTimer = setTimeout(() => {
      setRfq(prev => {
        if (prev.status === 'PENDING' || prev.status === 'QUOTED') {
          return { ...prev, status: 'EXPIRED' };
        }
        return prev;
      });
    }, 30000);
    rfqTimersRef.current.push(expiryTimer);
  }, [prices]);

  const acceptQuote = useCallback((dealer: string, direction: 'BUY' | 'SELL') => {
    // Read current rfq state synchronously to avoid nesting setTrades inside setRfq
    setRfq(prev => {
      if (prev.status !== 'QUOTED') return prev;
      const quote = prev.quotes.find(q => q.dealer === dealer);
      if (!quote) return prev;
      return { ...prev, status: 'ACCEPTED', acceptedQuote: quote };
    });

    // Create the trade outside of setRfq to avoid strict mode double-fire
    setRfq(current => {
      if (current.status !== 'ACCEPTED' || !current.acceptedQuote) return current;
      const quote = current.acceptedQuote;
      const tradeId = generateTradeId();
      const trade: Trade = {
        id: tradeId,
        timestamp: Date.now(),
        pair: current.pair,
        direction,
        notional: current.notional,
        rate: direction === 'BUY' ? quote.ask : quote.bid,
        status: 'PENDING',
        counterparty: dealer,
        source: 'RFQ',
      };
      setTrades(t => {
        // Guard against duplicates from strict mode
        if (t.length > 0 && t[0].counterparty === dealer && t[0].source === 'RFQ' && Date.now() - t[0].timestamp < 100) {
          return t;
        }
        return [trade, ...t];
      });

      // Simulate fill after 1–3 seconds
      const fillDelay = 1000 + Math.random() * 2000;
      setTimeout(() => {
        setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'FILLED' } : t));
      }, fillDelay);

      return current;
    });
  }, []);

  const rejectRfq = useCallback(() => {
    rfqTimersRef.current.forEach(clearTimeout);
    rfqTimersRef.current = [];
    setRfq(prev => ({ ...prev, status: 'REJECTED' }));
  }, []);

  const resetRfq = useCallback(() => {
    rfqTimersRef.current.forEach(clearTimeout);
    rfqTimersRef.current = [];
    setRfq(INITIAL_RFQ);
  }, []);

  return (
    <TradingContext.Provider value={{ prices, trades, rfq, executeTrade, submitRfq, acceptQuote, rejectRfq, resetRfq }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingContext() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error('useTradingContext must be used within TradingProvider');
  return ctx;
}
