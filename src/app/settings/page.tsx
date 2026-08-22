'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Key,
  Bot,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  const [simulationMode, setSimulationMode] = useState(true);
  const [autoReplyApproval, setAutoReplyApproval] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSimulationMode(data.settings.simulationModeEnabled);
          setAutoReplyApproval(data.settings.autoReplyApprovalReq);
          setEmailNotifications(data.settings.emailNotifications);
          if (data.settings.metaAppId) setMetaAppId(data.settings.metaAppId);
          if (data.settings.metaAppSecret) setMetaAppSecret(data.settings.metaAppSecret);
          if (data.settings.geminiApiKey) setGeminiApiKey(data.settings.geminiApiKey);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationModeEnabled: simulationMode,
          autoReplyApprovalReq: autoReplyApproval,
          emailNotifications,
          metaAppId,
          metaAppSecret,
          geminiApiKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Settings successfully saved!' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save settings' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-slate-300" />
            <span>Settings & Integration Configuration</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure official Meta Developer App credentials, AI model keys, and supervision rules.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs md:text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Section 1: Execution Mode & Supervision */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span>Execution Engine & Human Supervision</span>
        </h2>

        <div className="space-y-5">
          {/* Simulation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-1 pr-4">
              <div className="text-sm font-bold text-white">Interactive Sandbox Simulation Mode</div>
              <p className="text-xs text-slate-400">
                When enabled, MetaSphere simulates Facebook Pages, Instagram Creators, and WhatsApp Business without requiring live Meta App Review approval.
              </p>
            </div>
            <button
              onClick={() => setSimulationMode(!simulationMode)}
              className="text-blue-500 hover:text-blue-400 transition flex-shrink-0"
            >
              {simulationMode ? (
                <ToggleRight className="w-10 h-10 text-blue-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>

          {/* Supervised Approval Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-1 pr-4">
              <div className="text-sm font-bold text-white">Require User Approval for AI Auto-Replies</div>
              <p className="text-xs text-slate-400">
                Enforces explicit user review before any AI-generated response is dispatched to WhatsApp or Instagram customer channels (Section 6 & 14 requirement).
              </p>
            </div>
            <button
              onClick={() => setAutoReplyApproval(!autoReplyApproval)}
              className="text-emerald-500 hover:text-emerald-400 transition flex-shrink-0"
            >
              {autoReplyApproval ? (
                <ToggleRight className="w-10 h-10 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Meta App Credentials */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          <span>Official Meta Developer App Credentials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meta App ID</label>
            <input
              type="text"
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
              placeholder="e.g. 109283749817263"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meta App Secret</label>
            <input
              type="password"
              value={metaAppSecret}
              onChange={(e) => setMetaAppSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 3: AI Model Configuration */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span>AI Intelligence Engine (Google Gemini 2.0)</span>
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Leave blank to utilize the high-accuracy built-in deterministic NLP engine.
          </p>
        </div>
      </div>
    </div>
  );
}
