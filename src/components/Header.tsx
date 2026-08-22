'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Plus, Bell, ShieldCheck } from 'lucide-react';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setAccounts(data.user.accounts || []);
        }
      })
      .catch(() => {});
  }, []);

  const hasFB = accounts.some((a) => a.platform === 'FACEBOOK' && a.connectionStatus === 'ACTIVE');
  const hasIG = accounts.some((a) => a.platform === 'INSTAGRAM' && a.connectionStatus === 'ACTIVE');
  const hasWA = accounts.some((a) => a.platform === 'WHATSAPP' && a.connectionStatus === 'ACTIVE');

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Platform Status Pills */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Channels:</span>
          
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
              hasFB
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasFB ? 'bg-blue-500' : 'bg-slate-400'}`} />
            <span>Facebook Page</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
              hasIG
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasIG ? 'bg-pink-500' : 'bg-slate-400'}`} />
            <span>Instagram Creator</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
              hasWA
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 opacity-60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasWA ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>WhatsApp Business</span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/content-studio"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Post</span>
        </Link>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/30">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {user?.name || 'Alex Sterling'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Account Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
