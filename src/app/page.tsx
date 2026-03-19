'use client';

import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import { TradingProvider } from '@/context/TradingContext';
import Header from '@/components/Header';
import RateTilesPanel from '@/components/rate-tiles/RateTilesPanel';
import RfqPanel from '@/components/rfq/RfqPanel';
import TradeBlotter from '@/components/blotter/TradeBlotter';

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <TradingProvider>
      <div className="h-screen flex flex-col bg-[#0C0D10] overflow-hidden">
        <Header />

        {/* Rate tiles row */}
        <div className="border-b border-[#262730] bg-[#0C0D10]">
          <RateTilesPanel />
        </div>

        {/* Bottom row: RFQ + Blotter */}
        <div className="flex-1 grid grid-cols-[320px_1fr] min-h-0">
          <div className="border-r border-[#262730] bg-[#13141A] overflow-hidden">
            <RfqPanel />
          </div>
          <div className="bg-[#101118] overflow-hidden">
            <TradeBlotter />
          </div>
        </div>
      </div>
    </TradingProvider>
  );
}
