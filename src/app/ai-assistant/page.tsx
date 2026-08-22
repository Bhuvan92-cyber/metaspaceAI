'use client';

import React, { useState } from 'react';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  User,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Lightbulb,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  metrics?: { label: string; value: string }[];
  recommendation?: string;
  source?: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  'Show me my best-performing Instagram content this month.',
  'When is my audience most active based on available data?',
  'Summarize recent customer inquiries and feedback trends.',
  'Give me 3 viral content concepts for Facebook & WhatsApp.',
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'AI',
      text: 'Hello! I am your MetaSphere AI Command Assistant. I can analyze your connected Facebook, Instagram, and WhatsApp metrics, identify engagement trends, and generate strategic recommendations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'USER',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ANALYTICS_QUERY',
          payload: { query: q },
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'AI',
          text: data.result.summary,
          metrics: data.result.metrics,
          recommendation: data.result.recommendation,
          source: data.result.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'AI',
            text: 'I could not process that query. Please verify your connected accounts or try a different phrasing.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'AI',
          text: 'Network error communicating with AI engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BotMessageSquare className="w-6 h-6 text-blue-400" />
          <span>AI Command Interface</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Query account performance, extract actionable insights, and brainstorm campaigns via conversational AI.
        </p>
      </div>

      {/* Preset Query Pills */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400">Try asking:</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((pq, i) => (
            <button
              key={i}
              onClick={() => handleSendQuery(pq)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{pq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card p-6 flex flex-col justify-between min-h-[500px] space-y-6">
        {/* Messages Transcript */}
        <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                  msg.sender === 'USER'
                    ? 'bg-blue-600 shadow-md shadow-blue-600/30'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-purple-600/30'
                }`}
              >
                {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Box */}
              <div
                className={`max-w-2xl space-y-3 ${
                  msg.sender === 'USER'
                    ? 'p-4 rounded-2xl bg-blue-600 text-white rounded-tr-none text-xs md:text-sm shadow-md shadow-blue-600/20'
                    : 'p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none text-xs md:text-sm leading-relaxed'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Metric Cards if returned */}
                {msg.metrics && msg.metrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {msg.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5"
                      >
                        <div className="text-[10px] uppercase font-bold text-slate-400">{m.label}</div>
                        <div className="text-sm font-extrabold text-blue-400">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendation Callout */}
                {msg.recommendation && (
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Actionable Recommendation:</span>
                    </div>
                    <p className="text-xs text-slate-300 pl-5">{msg.recommendation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{msg.source ? `Generated with ${msg.source}` : 'MetaSphere Intelligence'}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/40 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Analyzing Meta ecosystem metrics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(inputQuery);
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about your Facebook, Instagram, or WhatsApp accounts..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
