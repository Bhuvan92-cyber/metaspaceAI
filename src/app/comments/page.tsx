'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareText,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Facebook,
  Instagram,
  User,
  Clock,
  Filter,
} from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<'ALL' | 'FACEBOOK' | 'INSTAGRAM'>('ALL');

  const fetchComments = () => {
    setLoading(true);
    fetch('/api/comments')
      .then((r) => r.json())
      .then((data) => {
        if (data.comments) {
          setComments(data.comments);
          // populate default reply drafts
          const drafts: Record<string, string> = {};
          data.comments.forEach((c: any) => {
            if (c.suggestedReply) drafts[c.id] = c.suggestedReply;
          });
          setReplyDrafts(drafts);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSendReply = async (commentId: string) => {
    const text = replyDrafts[commentId];
    if (!text || !text.trim()) return;

    setProcessingId(commentId);
    setFeedback(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, replyText: text }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Reply submitted via official Meta API!' });
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, replyStatus: 'REPLIED', repliedText: text, repliedAt: new Date() } : c))
        );
        setActiveReplyId(null);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to submit reply' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error submitting reply' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRegenerateAi = async (commentId: string) => {
    setProcessingId(commentId);
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setReplyDrafts((prev) => ({ ...prev, [commentId]: data.comment.suggestedReply }));
        setComments((prev) => prev.map((c) => (c.id === commentId ? data.comment : c)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filterPlatform === 'ALL') return true;
    return c.platform === filterPlatform;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquareText className="w-6 h-6 text-pink-400" />
            <span>Comments & Engagement Triage</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor, categorize, and answer permitted Facebook & Instagram comments with 1-click AI drafts.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-card">
          <button
            onClick={() => setFilterPlatform('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPlatform === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setFilterPlatform('INSTAGRAM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPlatform === 'INSTAGRAM' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => setFilterPlatform('FACEBOOK')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPlatform === 'FACEBOOK' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
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

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Fetching comments stream...</div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 glass-card space-y-3">
          <MessageSquareText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No comments found</h3>
          <p className="text-xs text-slate-400">All comments are caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => {
            const isReplying = activeReplyId === comment.id;
            const currentDraft = replyDrafts[comment.id] || comment.suggestedReply || '';

            return (
              <div
                key={comment.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-4 transition hover:border-slate-700"
              >
                {/* Author Info & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{comment.authorName}</span>
                        {comment.platform === 'INSTAGRAM' ? (
                          <span className="p-1 rounded bg-pink-500/10 text-pink-400">
                            <Instagram className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                            <Facebook className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • on {comment.account?.accountName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sentiment */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        comment.sentiment === 'POSITIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : comment.sentiment === 'NEGATIVE'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {comment.sentiment || 'INQUIRY'}
                    </span>

                    {/* Priority */}
                    {comment.priority && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          comment.priority === 'URGENT'
                            ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {comment.priority}
                      </span>
                    )}

                    {/* Status */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        comment.replyStatus === 'REPLIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {comment.replyStatus === 'REPLIED' ? '✓ REPLIED' : 'UNANSWERED'}
                    </span>
                  </div>
                </div>

                {/* Comment Text */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                  "{comment.commentText}"
                </div>

                {/* Replied View */}
                {comment.replyStatus === 'REPLIED' && comment.repliedText && (
                  <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/20 space-y-1 text-xs text-blue-200">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sent Reply via Official Meta API:</span>
                    </div>
                    <p className="pl-5 leading-relaxed text-slate-300">"{comment.repliedText}"</p>
                  </div>
                )}

                {/* AI Suggestion Box & Actions */}
                {comment.replyStatus !== 'REPLIED' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-blue-300">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span>AI Suggested Response</span>
                        </div>
                        <button
                          onClick={() => handleRegenerateAi(comment.id)}
                          disabled={processingId === comment.id}
                          className="text-[11px] text-slate-400 hover:text-blue-300 flex items-center gap-1 transition"
                        >
                          <RefreshCw className={`w-3 h-3 ${processingId === comment.id ? 'animate-spin' : ''}`} />
                          <span>Regenerate</span>
                        </button>
                      </div>

                      <textarea
                        value={currentDraft}
                        onChange={(e) => setReplyDrafts({ ...replyDrafts, [comment.id]: e.target.value })}
                        rows={2}
                        className="w-full p-3 rounded-xl bg-slate-900/80 border border-blue-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                        placeholder="Edit or approve AI reply suggestion..."
                      />

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleSendReply(comment.id)}
                          disabled={processingId === comment.id || !currentDraft.trim()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{processingId === comment.id ? 'Sending...' : 'Approve & Send Reply'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
