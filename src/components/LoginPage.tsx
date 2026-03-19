'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0C0D10]">
      <div
        className="w-full max-w-sm border border-[#262730] rounded-xl bg-[#13141A] shadow-2xl"
        data-testid="login-form"
      >
        <form onSubmit={handleSubmit} className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-[#2962FF] rounded-lg flex items-center justify-center text-base font-bold text-white mb-3">
              FX
            </div>
            <span className="text-lg font-semibold text-[#E8EAED] tracking-widest">
              FX PULSE
            </span>
            <span className="text-[10px] text-[#555662] tracking-[0.2em] uppercase mt-0.5">
              Electronic Trading
            </span>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-[#8B8D97] uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              data-testid="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#1A1B23] border border-[#262730] text-sm text-[#E8EAED] placeholder-[#555662] outline-none focus:border-[#2962FF] transition-colors"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-medium text-[#8B8D97] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#1A1B23] border border-[#262730] text-sm text-[#E8EAED] placeholder-[#555662] outline-none focus:border-[#2962FF] transition-colors"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              data-testid="login-error"
              className="mb-4 text-center text-sm text-[#FF4757]"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            data-testid="login-submit-btn"
            type="submit"
            className="w-full h-10 rounded-md bg-[#2962FF] hover:bg-[#1E54E6] text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
