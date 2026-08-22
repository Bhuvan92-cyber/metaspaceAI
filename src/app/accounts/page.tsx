'use client';

import React, { useState, useEffect } from 'react';
import {
  Link2,
  ShieldCheck,
  Facebook,
  Instagram,
  Phone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trash2,
  Lock,
  Plus,
  RefreshCw,
  Info,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const SUPPORTED_PLATFORMS = [
  {
    platform: 'FACEBOOK',
    name: 'Facebook Pages API',
    description: 'Manage authorized Facebook Page posts, schedule updates, view page engagement metrics, and answer public comments.',
    icon: Facebook,
    color: 'blue',
    defaultScopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'pages_read_user_content', 'pages_manage_metadata'],
  },
  {
    platform: 'INSTAGRAM',
    name: 'Instagram Graph API',
    description: 'Publish media, auto-schedule Reels/Carousels, retrieve permitted comments, and manage authorized business direct messages.',
    icon: Instagram,
    color: 'pink',
    defaultScopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments', 'instagram_manage_messages', 'instagram_manage_insights'],
  },
  {
    platform: 'WHATSAPP',
    name: 'WhatsApp Business Cloud Platform',
    description: 'Official API integration for authorized business phone numbers. Receive inbound customer inquiries, send AI-assisted replies.',
    icon: Phone,
    color: 'emerald',
    defaultScopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalPlatform, setActiveModalPlatform] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Custom Live Credentials state
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');
  const [customToken, setCustomToken] = useState('');
  const [connectTab, setConnectTab] = useState<'SANDBOX' | 'LIVE'>('SANDBOX');

  const fetchAccounts = () => {
    setLoading(true);
    fetch('/api/meta/accounts')
      .then((r) => r.json())
      .then((data) => {
        if (data.accounts) setAccounts(data.accounts);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openConnectModal = (platform: string) => {
    setActiveModalPlatform(platform);
    setCustomName('');
    setCustomId('');
    setCustomToken('');
    setConnectTab('SANDBOX');
  };

  const handleConnect = async (platform: string, isLive = false) => {
    setConnectingPlatform(platform);
    setFeedback(null);
    try {
      const payload: any = { platform };
      if (isLive) {
        if (!customToken.trim()) {
          setFeedback({ type: 'error', message: 'Please provide a valid Meta Access Token' });
          setConnectingPlatform(null);
          return;
        }
        payload.liveCredentials = {
          accountName: customName.trim() || `${platform} Live Account`,
          platformAccountId: customId.trim() || `live_${Date.now()}`,
          accessToken: customToken.trim(),
        };
      }

      const res = await fetch('/api/meta/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Official ${platform} account connected! Access tokens encrypted & stored in AES-256 vault.`,
        });
        setActiveModalPlatform(null);
        fetchAccounts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Connection failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error connecting account' });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}? Tokens will be permanently purged from the secure vault.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/meta/accounts?id=${accountId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `${platform} disconnected and token vault keys wiped.` });
        fetchAccounts();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to disconnect account' });
    }
  };

  const handleTogglePermission = async (permissionId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/meta/accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionId, grantedStatus: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAccounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-blue-400" />
            <span>Connected Accounts & Secure Token Vault</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your authorized Meta platforms, active OAuth permissions, and AES-256 encrypted access tokens.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold glass-card">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>AES-256-GCM Hardware Vault Active</span>
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

      {/* Principle Callout */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-white">Strict Security Principle:</strong> MetaSphere AI only accesses data that you explicitly authorize through official Meta OAuth dialogues. Tokens are never exposed in plaintext to frontend clients and are decrypted only in memory during authenticated API calls.
        </p>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 gap-6">
        {SUPPORTED_PLATFORMS.map((plat) => {
          const Icon = plat.icon;
          const connectedAccount = accounts.find((a) => a.platform === plat.platform);
          const isConnected = !!connectedAccount;
          const vault = connectedAccount?.tokenVault;
          const permissions = connectedAccount?.permissions || [];

          return (
            <div
              key={plat.platform}
              className={`p-6 rounded-3xl border glass-card space-y-6 transition ${
                isConnected
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-80'
              }`}
            >
              {/* Account Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      plat.color === 'blue'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : plat.color === 'pink'
                        ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                        : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">
                        {connectedAccount ? connectedAccount.accountName : plat.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isConnected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isConnected ? '✓ AUTHORIZED' : 'NOT CONNECTED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{plat.description}</p>
                  </div>
                </div>

                {/* Connect / Disconnect Action */}
                <div>
                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(connectedAccount.id, plat.name)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Disconnect & Purge Tokens</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openConnectModal(plat.platform)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Connect via Meta OAuth</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Connected Details & Vault Info */}
              {isConnected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  {/* Token Vault Details */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Token Vault Status</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">Encrypted (AES-256-GCM)</span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Identifier:</span>
                        <span className="font-mono text-slate-200">{connectedAccount.platformAccountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token Type:</span>
                        <span className="font-mono text-slate-200">{vault?.tokenType || 'BEARER'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiry:</span>
                        <span className="text-emerald-400 font-semibold">60 Days (Auto-renewing)</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Permission Scopes */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Authorized Scopes ({permissions.length})</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Toggle Access</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {permissions.map((perm: any) => (
                        <button
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id, perm.grantedStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition border flex items-center gap-1.5 ${
                            perm.grantedStatus
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                              : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${perm.grantedStatus ? 'bg-blue-400' : 'bg-slate-600'}`} />
                          <span>{perm.permissionName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Account Connection Modal */}
      {activeModalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Connect {activeModalPlatform} Account
                </h3>
              </div>
              <button
                onClick={() => setActiveModalPlatform(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setConnectTab('SANDBOX')}
                className={`py-2 rounded-lg transition ${
                  connectTab === 'SANDBOX'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Instant Sandbox (Demo)
              </button>
              <button
                onClick={() => setConnectTab('LIVE')}
                className={`py-2 rounded-lg transition ${
                  connectTab === 'LIVE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌐 Official Live API Token
              </button>
            </div>

            {connectTab === 'SANDBOX' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Simulated OAuth Flow</span>
                  </div>
                  <p className="leading-relaxed">
                    Connects a pre-configured verified mock {activeModalPlatform} account with authorized permissions. Ideal for testing AI content generation, comments, scheduling, and analytics without waiting for Meta App Review.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleConnect(activeModalPlatform, false)}
                    disabled={connectingPlatform === activeModalPlatform}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {connectingPlatform === activeModalPlatform
                      ? 'Authorizing...'
                      : `Authorize & Connect ${activeModalPlatform}`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account / Page Display Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. My Business Page"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform Account / Page ID / Phone ID
                  </label>
                  <input
                    type="text"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="e.g. 109283749817263"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meta Graph API Access Token (Stored in AES-256 Vault)
                  </label>
                  <textarea
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    rows={3}
                    placeholder="EAAB..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-500">
                    Get from Meta Graph API Explorer or Facebook Login dialog.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleConnect(activeModalPlatform, true)}
                    disabled={connectingPlatform === activeModalPlatform}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                  >
                    {connectingPlatform === activeModalPlatform
                      ? 'Securing in Vault...'
                      : `Save to Vault & Connect ${activeModalPlatform}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
