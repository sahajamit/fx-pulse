'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState('');
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' ' +
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      );
    };
    update();
    const id = setInterval(update, 1000);

    const connId = setInterval(() => {
      if (Math.random() < 0.02) {
        setConnected(false);
        setTimeout(() => setConnected(true), 800);
      }
    }, 5000);

    return () => { clearInterval(id); clearInterval(connId); };
  }, []);

  return (
    <header className="h-12 bg-[#0A0B0E] border-b border-[#262730] flex items-center justify-between px-4" data-testid="header">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#2962FF] rounded flex items-center justify-center text-[10px] font-bold text-white">
            FX
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="text-sm font-semibold text-[#E8EAED] tracking-widest">FX PULSE</span>
            <span className="text-[8px] text-[#555662] tracking-[0.2em] uppercase">Electronic Trading</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2" data-testid="connection-status">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${connected ? 'bg-[#00C48C] shadow-[0_0_6px_rgba(0,196,140,0.5)]' : 'bg-[#FF4757] shadow-[0_0_6px_rgba(255,71,87,0.5)]'}`} />
          <span className={`text-xs font-medium ${connected ? 'text-[#00C48C]' : 'text-[#FF4757]'}`}>
            {connected ? 'CONNECTED' : 'RECONNECTING...'}
          </span>
        </div>
        <div className="h-4 w-px bg-[#262730]" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8B8D97]" data-testid="logged-in-user">{user}</span>
          <button
            onClick={logout}
            className="text-[11px] text-[#555662] hover:text-[#8B8D97] transition-colors cursor-pointer"
            data-testid="logout-btn"
          >
            Logout
          </button>
        </div>
        <div className="h-4 w-px bg-[#262730]" />
        <span className="text-xs text-[#8B8D97] font-mono tabular-nums" data-testid="clock">{time}</span>
      </div>
    </header>
  );
}
