'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, PlayCircle, ShieldAlert } from 'lucide-react';

export function LiveSimulationBanner() {
  const [simulationMode, setSimulationMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSimulationMode(data.settings.simulationModeEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const toggleSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationModeEnabled: !simulationMode }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationMode(!simulationMode);
        setMessage(`Switched to ${!simulationMode ? 'Sandbox Simulation' : 'Live Meta Graph API'} Mode`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage('Failed to toggle mode');
    } finally {
      setLoading(false);
    }
  };

  const runSchedulerNow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scheduler', { method: 'POST' });
      const data = await res.json();
      setMessage(`Scheduler processed ${data.result?.processed || 0} scheduled post(s)`);
      setTimeout(() => setMessage(null), 3500);
    } catch {
      setMessage('Failed to run scheduler');
    } finally {
      setLoading(false);
    }
  };

  const reseedData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message || 'Demo data loaded');
      setTimeout(() => {
        setMessage(null);
        window.location.reload();
      }, 1500);
    } catch {
      setMessage('Failed to reseed database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-b border-blue-500/20 px-6 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">
            {simulationMode ? '⚡ Interactive Simulation Sandbox' : '🌐 Live Meta Graph API Active'}
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            {simulationMode
              ? 'Testing with simulated Facebook Pages, Instagram Business, and WhatsApp numbers.'
              : 'Direct Graph API OAuth tokens active in AES-256 vault.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {message && (
            <span className="text-emerald-400 font-medium animate-pulse mr-2">
              {message}
            </span>
          )}

          <button
            onClick={runSchedulerNow}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Execute scheduled posts right now"
          >
            <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Run Scheduler</span>
          </button>

          <button
            onClick={reseedData}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Reset demo data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reseed Demo</span>
          </button>

          <button
            onClick={toggleSimulation}
            disabled={loading}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              simulationMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {simulationMode ? 'Sandbox Active' : 'Live Mode Active'}
          </button>
        </div>
      </div>
    </div>
  );
}
