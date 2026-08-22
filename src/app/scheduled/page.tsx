'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Sparkles,
  PlayCircle,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Facebook,
  Phone,
  Clock,
  Eye,
  Plus,
} from 'lucide-react';

export default function ScheduledContentPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPosts = () => {
    setLoading(true);
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePublishNow = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: post.accountId,
          platform: post.platform,
          contentText: post.contentText,
          mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
          actionType: 'PUBLISH_NOW',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // delete original scheduled post
        await fetch(`/api/content?id=${postId}`, { method: 'DELETE' });
        setFeedback({ type: 'success', message: 'Post published immediately via official API!' });
        fetchPosts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Publishing failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to remove this post?')) return;
    try {
      await fetch(`/api/content?id=${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setFeedback({ type: 'success', message: 'Post deleted successfully' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete post' });
    }
  };

  const handleRunScheduler = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/scheduler', { method: 'POST' });
      const data = await res.json();
      setFeedback({
        type: 'success',
        message: `Scheduler ran: Processed ${data.result?.processed || 0} due item(s).`,
      });
      fetchPosts();
    } catch {
      setFeedback({ type: 'error', message: 'Failed to run scheduler' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarClock className="w-6 h-6 text-indigo-400" />
            <span>Scheduled Content & Queue</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated publication queue powered by official Meta background workers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunScheduler}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4 text-blue-400" />
            <span>Run Scheduler Worker</span>
          </button>

          <Link
            href="/content-studio"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New</span>
          </Link>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['ALL', 'SCHEDULED', 'PUBLISHED', 'DRAFT'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab} ({posts.filter((p) => tab === 'ALL' || p.status === tab).length})
          </button>
        ))}
      </div>

      {/* Post Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading queue...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 glass-card space-y-3">
          <CalendarClock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No posts in this queue</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Use the Content Studio to draft and schedule AI-optimized posts for Instagram and Facebook.
          </p>
          <Link
            href="/content-studio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md mt-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Content Studio</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            let mediaUrls = [];
            try {
              if (post.mediaUrls) mediaUrls = JSON.parse(post.mediaUrls);
            } catch {
              mediaUrls = [post.mediaUrls];
            }

            return (
              <div
                key={post.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.platform === 'INSTAGRAM' && (
                        <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          <Instagram className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {post.platform === 'FACEBOOK' && (
                        <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Facebook className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {post.platform === 'WHATSAPP' && (
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Phone className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="text-xs font-bold text-white">{post.account?.accountName || post.platform}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : post.status === 'SCHEDULED'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  {/* Media Thumbnail */}
                  {mediaUrls && mediaUrls[0] && (
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-950">
                      <img src={mediaUrls[0]} alt="Post media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Content Preview */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {post.contentText}
                  </p>
                </div>

                {/* Footer and Timing */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {post.status === 'SCHEDULED' && post.scheduledAt
                        ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
                        : post.publishedAt
                        ? `Published: ${new Date(post.publishedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
                        : `Drafted: ${new Date(post.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {post.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handlePublishNow(post.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publish Now</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition ml-auto"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
