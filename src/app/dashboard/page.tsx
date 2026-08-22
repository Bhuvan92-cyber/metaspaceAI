'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  Instagram,
  Facebook,
  Phone,
} from 'lucide-react';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/meta/accounts').then((r) => r.json()),
      fetch('/api/audit?limit=6').then((r) => r.json()),
    ])
      .then(([analyticsData, accountsData, logsData]) => {
        if (analyticsData.success) setAnalytics(analyticsData);
        if (accountsData.success) setAccounts(accountsData.accounts);
        if (logsData.success) setRecentLogs(logsData.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const overview = analytics?.rawApiData?.overview;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-slate-900/80 p-8 border border-blue-500/20 glass-card">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Official Meta Graph API Integration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Welcome to <span className="meta-gradient-text">MetaSphere AI</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Your centralized, permission-based command center for authorized Facebook Pages, Instagram Creator accounts, and WhatsApp Business channels.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/content-studio"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create AI Post</span>
            </Link>
            <Link
              href="/messages"
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-semibold border border-slate-700 flex items-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Inbox & WhatsApp</span>
            </Link>
            <Link
              href="/accounts"
              className="px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700/60 flex items-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Token Vault</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reach (7d)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {overview?.totalReach ? Number(overview.totalReach).toLocaleString() : '460,950'}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              {overview?.reachChange || '+18.4%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Across Facebook & Instagram media</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Engagement</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">6.2%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +1.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">38,400 likes, comments & shares</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Response Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {overview?.responseRate || '98.6%'}
            </span>
            <span className="text-xs font-medium text-slate-400">Avg {overview?.avgResponseTime || '4m 12s'}</span>
          </div>
          <p className="text-[11px] text-slate-500">WhatsApp & Instagram DMs combined</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Queue</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {overview?.activeSchedules || 1}
            </span>
            <span className="text-xs font-medium text-blue-400">Auto-publishing</span>
          </div>
          <p className="text-[11px] text-slate-500">Next post: Tomorrow 10:30 AM</p>
        </div>
      </div>

      {/* Connected Accounts Quick Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Connected Meta Ecosystem</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {accounts.length} Active
            </span>
          </h2>
          <Link href="/accounts" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
            <span>Manage Permissions & Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Facebook */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-blue-500/20 glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Facebook className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">TechInnovate Solutions</h3>
                  <p className="text-xs text-slate-400">Connected Facebook Page</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>28,450 Page Fans</span>
              <span>142k Weekly Reach</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-pink-500/20 glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">@techinnovate_ai</h3>
                  <p className="text-xs text-slate-400">Instagram Creator / Business</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>64,200 Followers</span>
              <span>6.2% Engagement</span>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-emerald-500/20 glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">+1 (555) 019-META</h3>
                  <p className="text-xs text-slate-400">WhatsApp Business Cloud</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Verified Number</span>
              <span>98.6% Open Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations & Live Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Strategic Insights & Recommendations</span>
            </h2>
            <Link href="/analytics" className="text-xs text-blue-400 hover:text-blue-300">
              Full Analytics →
            </Link>
          </div>

          <div className="space-y-3">
            {(analytics?.aiGeneratedInsights || []).map((insight: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 glass-card hover:border-blue-500/40 transition flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {insight.confidence} Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit & Activity Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Live Audit Trail</span>
            </h2>
            <Link href="/audit" className="text-xs text-blue-400 hover:text-blue-300">
              View All →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">No recent events logged.</div>
            ) : (
              recentLogs.map((log: any) => (
                <div key={log.id} className="text-xs space-y-1 pb-2.5 border-b border-slate-800/60 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        log.actorType === 'AI'
                          ? 'bg-purple-500/20 text-purple-300'
                          : log.actorType === 'USER'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {log.actorType}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
