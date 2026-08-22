'use client';

import React, { useState, useEffect } from 'react';
import {
  MessagesSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Instagram,
  User,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState<'ALL' | 'WHATSAPP' | 'INSTAGRAM'>('ALL');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/messages')
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
          if (data.messages.length > 0 && !selectedThread) {
            setSelectedThread(data.messages[0].conversationId);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Group messages by conversation
  const conversationsMap = messages.reduce((acc: any, msg: any) => {
    const cid = msg.conversationId || msg.senderId;
    if (!acc[cid]) {
      acc[cid] = {
        conversationId: cid,
        platform: msg.platform,
        senderName: msg.senderName || msg.senderId,
        senderId: msg.senderId,
        accountId: msg.accountId,
        accountName: msg.account?.accountName,
        latestMessage: msg,
        items: [],
      };
    }
    acc[cid].items.push(msg);
    return acc;
  }, {});

  const conversationList: any[] = Object.values(conversationsMap).filter((c: any) => {
    if (activePlatformFilter === 'ALL') return true;
    return c.platform === activePlatformFilter;
  });

  const activeConversation = selectedThread ? conversationsMap[selectedThread] : conversationList[0];

  useEffect(() => {
    if (activeConversation?.latestMessage?.suggestedReply) {
      setReplyText(activeConversation.latestMessage.suggestedReply);
    }
  }, [selectedThread]);

  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeConversation) return;

    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: activeConversation.latestMessage?.id,
          replyText,
          recipientId: activeConversation.senderId,
          accountId: activeConversation.accountId,
          platform: activeConversation.platform,
          conversationId: activeConversation.conversationId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Direct message dispatched via official ${activeConversation.platform} API!`,
        });
        setReplyText('');
        fetchMessages();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to dispatch message' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error sending message' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessagesSquare className="w-6 h-6 text-emerald-400" />
            <span>Business Messaging Hub</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authorized WhatsApp Business and Instagram Direct communication with AI intent routing and suggested replies.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-card">
          <button
            onClick={() => setActivePlatformFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activePlatformFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setActivePlatformFilter('WHATSAPP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activePlatformFilter === 'WHATSAPP' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Business</span>
          </button>
          <button
            onClick={() => setActivePlatformFilter('INSTAGRAM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activePlatformFilter === 'INSTAGRAM' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram DMs</span>
          </button>
        </div>
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

      {/* Split-Pane Inbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Thread List (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Conversations ({conversationList.length})
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Gateways
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">Loading inbox...</div>
            ) : conversationList.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">No active message threads</div>
            ) : (
              conversationList.map((c: any) => {
                const isSelected = activeConversation?.conversationId === c.conversationId;
                const latest = c.latestMessage;

                return (
                  <div
                    key={c.conversationId}
                    onClick={() => setSelectedThread(c.conversationId)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition border text-left space-y-2 ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500/50 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {c.platform === 'WHATSAPP' ? (
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">{c.senderName}</span>
                      </div>

                      {latest?.intentCategory && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">
                          {latest.intentCategory.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{latest?.messageText}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{c.platform}</span>
                      <span>{new Date(latest?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation & AI Suggested Reply Pane (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card p-6 flex flex-col justify-between space-y-6">
          {activeConversation ? (
            <>
              {/* Header of Active Thread */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                    {activeConversation.senderName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeConversation.senderName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{activeConversation.senderId}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{activeConversation.platform} Cloud API</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeConversation.latestMessage?.priority && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        activeConversation.latestMessage.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      Priority: {activeConversation.latestMessage.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Message Transcript Bubbles */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-72">
                {activeConversation.items.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex flex-col ${item.direction === 'OUTBOUND' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        item.direction === 'OUTBOUND'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                          : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80'
                      }`}
                    >
                      {item.messageText}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {item.direction === 'OUTBOUND' ? 'Sent via Meta API' : 'Received'} •{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Suggested Response Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>AI Suggested Reply Draft</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Review & approve before sending</span>
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/30 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400 leading-relaxed"
                  placeholder="Draft your reply or approve the AI suggestion..."
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">🔒 AES-256 encrypted channel</span>

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Dispatching...' : `Send via ${activeConversation.platform}`}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-500 text-sm">Select a conversation on the left</div>
          )}
        </div>
      </div>
    </div>
  );
}
