'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Calendar,
  Save,
  Image as ImageIcon,
  Facebook,
  Instagram,
  Phone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Hash,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from 'lucide-react';

export default function ContentStudioPage() {
  const [platform, setPlatform] = useState<'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP'>('INSTAGRAM');
  const [topic, setTopic] = useState('Next-gen AI assistant for Meta platforms with official API compliance');
  const [tone, setTone] = useState<'engaging' | 'professional' | 'promotional' | 'humorous' | 'informative'>('engaging');
  const [targetAudience, setTargetAudience] = useState('Tech entrepreneurs, digital marketers & creators');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  
  // Post Editor state
  const [caption, setCaption] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [aiScore, setAiScore] = useState('');
  const [bestTime, setBestTime] = useState('');
  
  // Scheduling state
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // Accounts state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Status & Feedback
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/meta/accounts')
      .then((r) => r.json())
      .then((data) => {
        if (data.accounts) {
          setAccounts(data.accounts);
          const matched = data.accounts.find((a: any) => a.platform === platform);
          if (matched) setSelectedAccountId(matched.id);
        }
      })
      .catch(() => {});
  }, [platform]);

  const handleGenerateAI = async () => {
    setGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_CONTENT',
          payload: {
            topic,
            tone,
            platform,
            targetAudience,
            includeHashtags,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setCaption(data.result.primaryCaption);
        setVariations(data.result.variations || []);
        setSuggestedHashtags(data.result.suggestedHashtags || []);
        setAiScore(data.result.estimatedEngagementScore || '9.0 / 10');
        setBestTime(data.result.bestTimeToPost || 'Tomorrow at 10:30 AM');
      } else {
        setFeedback({ type: 'error', message: data.error || 'AI generation failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to contact AI engine' });
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishOrSchedule = async (action: 'PUBLISH_NOW' | 'SCHEDULE' | 'SAVE_DRAFT') => {
    if (!caption.trim()) {
      setFeedback({ type: 'error', message: 'Please write or generate post content first' });
      return;
    }

    if (action === 'SCHEDULE' && !scheduleDate) {
      setFeedback({ type: 'error', message: 'Please select a future date and time for scheduled posting' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId || accounts.find((a) => a.platform === platform)?.id,
          platform,
          contentText: caption,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          actionType: action,
          scheduledAt: action === 'SCHEDULE' ? scheduleDate : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const msg =
          action === 'PUBLISH_NOW'
            ? `Post published successfully to ${platform}! (ID: ${data.post?.externalPostId || 'meta_ok'})`
            : action === 'SCHEDULE'
            ? `Post scheduled for ${new Date(scheduleDate).toLocaleString()}!`
            : 'Draft saved successfully!';
        setFeedback({ type: 'success', message: msg });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Publishing failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network request error' });
    } finally {
      setSubmitting(false);
    }
  };

  const addHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => `${prev.trim()} ${tag}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>AI Content Studio</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Draft, generate, and officially publish AI-assisted content across authorized Meta platforms.
          </p>
        </div>

        {/* Platform Selector Buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-card">
          <button
            onClick={() => setPlatform('INSTAGRAM')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              platform === 'INSTAGRAM'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => setPlatform('FACEBOOK')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              platform === 'FACEBOOK'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook Page</span>
          </button>
          <button
            onClick={() => setPlatform('WHATSAPP')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              platform === 'WHATSAPP'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp</span>
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

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Generator & Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Generator Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Prompt & Tone Configuration</span>
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Gemini 2.0 Powered
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Topic / Campaign Concept
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g. Unveiling our new customer support automation with Meta official API"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Desired Brand Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e: any) => setTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="engaging">Engaging & Community</option>
                    <option value="professional">Professional & Direct</option>
                    <option value="promotional">Promotional & Conversion</option>
                    <option value="informative">Educational & Informative</option>
                    <option value="humorous">Casual & Humorous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. B2B, Creators, Shoppers"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                  />
                  <span>Suggest relevant hashtags</span>
                </label>

                <button
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>{generating ? 'Crafting Content...' : 'Generate with AI'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Post Caption Editor */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Post Editor & Media</h2>
              <span className="text-xs text-slate-400 font-mono">
                {caption.length} chars | ~{Math.ceil(caption.split(/\s+/).filter(Boolean).length)} words
              </span>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              className="w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              placeholder="Your finalized post caption will appear here. Edit freely or choose variations below..."
            />

            {/* AI Variations */}
            {variations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">Alternative AI Hooks:</span>
                <div className="space-y-1.5">
                  {variations.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => setCaption(v)}
                      className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white cursor-pointer transition flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{v}</span>
                      <span className="text-[10px] text-blue-400 font-semibold flex-shrink-0">Use This</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Hashtags */}
            {suggestedHashtags.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-400">Click to Add Hashtags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedHashtags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => addHashtag(tag)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Media Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Media Attachment URL (Image / Reel)</span>
              </label>
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="https://..."
              />
            </div>

            {/* Scheduling Form */}
            {isScheduling && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Select Publication Date & Time</span>
                  </span>
                  {bestTime && <span className="text-[11px] text-emerald-400">Recommended: {bestTime}</span>}
                </div>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handlePublishOrSchedule('SAVE_DRAFT')}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsScheduling(!isScheduling)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
                    isScheduling
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isScheduling ? 'Cancel Schedule' : 'Schedule Post'}</span>
                </button>

                {isScheduling ? (
                  <button
                    onClick={() => handlePublishOrSchedule('SCHEDULE')}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Confirm Schedule</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handlePublishOrSchedule('PUBLISH_NOW')}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish via Official API</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mock Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Live Platform Preview</h3>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold">
                {platform} Post
              </span>
            </div>

            {/* Simulated Instagram Post Card */}
            {platform === 'INSTAGRAM' && (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl max-w-sm mx-auto">
                {/* IG Header */}
                <div className="p-3 flex items-center justify-between border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white">
                        TI
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">techinnovate_ai</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Original audio</div>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs font-bold">•••</span>
                </div>

                {/* IG Image */}
                {mediaUrl && (
                  <div className="aspect-square bg-slate-900 relative overflow-hidden">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* IG Action Bar */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer" />
                      <MessageCircle className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
                      <Share2 className="w-5 h-5 hover:text-green-400 cursor-pointer" />
                    </div>
                    <Bookmark className="w-5 h-5 hover:text-amber-400 cursor-pointer" />
                  </div>

                  <div className="text-xs font-bold text-white">1,248 likes</div>

                  {/* Caption */}
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    <span className="font-bold mr-1.5 text-white">techinnovate_ai</span>
                    {caption || 'Your AI generated Instagram caption will be rendered here in real time...'}
                  </div>

                  <div className="text-[10px] text-slate-500 uppercase mt-2">Just now • Meta Graph API</div>
                </div>
              </div>
            )}

            {/* Simulated Facebook Post Card */}
            {platform === 'FACEBOOK' && (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl max-w-sm mx-auto">
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      FB
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">TechInnovate Solutions</div>
                      <div className="text-[10px] text-slate-400">Just now • 🌐 Public</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {caption || 'Your Facebook Page update will appear here...'}
                  </div>
                </div>

                {mediaUrl && (
                  <div className="aspect-video bg-slate-900 overflow-hidden">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-2.5 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400 font-semibold">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>↗️ Share</span>
                </div>
              </div>
            )}

            {/* Simulated WhatsApp Broadcast Card */}
            {platform === 'WHATSAPP' && (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl max-w-sm mx-auto p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs text-emerald-400 font-bold">
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp Business Message</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-100 leading-relaxed whitespace-pre-line">
                  {caption || 'Your WhatsApp customer notification message will render here...'}
                </div>
                <div className="text-[10px] text-slate-400 text-right">Official Cloud API Gateway ✓✓</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
