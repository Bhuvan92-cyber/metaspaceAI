'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Filter,
  Search,
  User,
  Sparkles,
  PlayCircle,
  Radio,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    let url = '/api/audit?limit=100';
    if (actorFilter !== 'ALL') url += `&actorType=${actorFilter}`;
    if (platformFilter !== 'ALL') url += `&platform=${platformFilter}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [actorFilter, platformFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actionType.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      log.actorType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Activity & Security Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of user actions, AI generations, scheduled executions, and official Meta API events.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold glass-card">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audit Log Tamper-Proof</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit actions, details, post IDs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Actor Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Actor:</span>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actors</option>
            <option value="USER">User (Manual)</option>
            <option value="AI">AI Assistant</option>
            <option value="SCHEDULER">Background Scheduler</option>
            <option value="META_WEBHOOK">Meta Webhook Ingest</option>
          </select>
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Platform:</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Platforms</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="SYSTEM">System / Vault</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No matching log entries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor Type</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.actorType === 'AI'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : log.actorType === 'USER'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : log.actorType === 'SCHEDULER'
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {log.actorType === 'AI' && <Sparkles className="w-2.5 h-2.5" />}
                        {log.actorType === 'USER' && <User className="w-2.5 h-2.5" />}
                        {log.actorType === 'SCHEDULER' && <PlayCircle className="w-2.5 h-2.5" />}
                        {log.actorType === 'META_WEBHOOK' && <Radio className="w-2.5 h-2.5" />}
                        <span>{log.actorType}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap font-mono text-[11px]">
                      {log.actionType}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                      {log.platform || 'SYSTEM'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.actionStatus === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {log.actionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 leading-relaxed font-sans max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
