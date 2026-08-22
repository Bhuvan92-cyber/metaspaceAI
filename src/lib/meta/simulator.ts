import { MetaPlatform, MetaPostPublishPayload, MetaPostPublishResult, MetaCommentItem } from './types';

export interface SandboxAccountData {
  platform: MetaPlatform;
  id: string;
  name: string;
  type: string;
  avatarUrl: string;
  metrics: {
    followers: number;
    reach7d: number;
    engagementRate: string;
    totalPosts: number;
  };
  scopes: string[];
}

export const MOCK_ACCOUNTS: SandboxAccountData[] = [
  {
    platform: 'FACEBOOK',
    id: 'fb_page_109283749',
    name: 'TechInnovate Solutions',
    type: 'PAGE',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    metrics: {
      followers: 28450,
      reach7d: 142000,
      engagementRate: '4.8%',
      totalPosts: 342,
    },
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_user_content',
      'pages_manage_metadata',
    ],
  },
  {
    platform: 'INSTAGRAM',
    id: 'ig_user_88239102',
    name: '@techinnovate_ai',
    type: 'BUSINESS',
    avatarUrl: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=150&auto=format&fit=crop&q=80',
    metrics: {
      followers: 64200,
      reach7d: 310500,
      engagementRate: '6.2%',
      totalPosts: 512,
    },
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_messages',
      'instagram_manage_insights',
    ],
  },
  {
    platform: 'WHATSAPP',
    id: 'wa_phone_99182374',
    name: '+1 (555) 019-META (Support & Sales)',
    type: 'WHATSAPP_BUSINESS',
    avatarUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=150&auto=format&fit=crop&q=80',
    metrics: {
      followers: 1820,
      reach7d: 8450,
      engagementRate: '94.2% Open Rate',
      totalPosts: 85,
    },
    scopes: [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ],
  },
];

export const MOCK_COMMENTS: MetaCommentItem[] = [
  {
    id: 'comm_fb_101',
    text: 'Is this new AI automation integration compatible with our custom CRM or Shopify store?',
    created_time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    from: { id: 'usr_fb_901', name: 'Marcus Sterling' },
    post_id: 'post_fb_1',
    platform: 'FACEBOOK',
  },
  {
    id: 'comm_ig_202',
    text: 'How much does the enterprise tier cost for small teams? Looking to deploy next month 🔥',
    created_time: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    from: { id: 'usr_ig_802', name: 'elena_rodriguez_tech' },
    post_id: 'post_ig_1',
    platform: 'INSTAGRAM',
  },
  {
    id: 'comm_fb_103',
    text: 'Great update! Does it support automated comment moderation out of the box?',
    created_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    from: { id: 'usr_fb_903', name: 'Sarah Jenkins' },
    post_id: 'post_fb_1',
    platform: 'FACEBOOK',
  },
  {
    id: 'comm_ig_204',
    text: 'Tried setting this up yesterday but received an authorization timeout error on page connect.',
    created_time: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    from: { id: 'usr_ig_804', name: 'dev_alex_k' },
    post_id: 'post_ig_1',
    platform: 'INSTAGRAM',
  },
];

export const MOCK_MESSAGES = [
  {
    platform: 'WHATSAPP',
    conversationId: 'conv_wa_1',
    senderId: '+14155552671',
    senderName: 'David Chen (Chief Architect)',
    messageText: 'Hello, we are evaluating MetaSphere AI for our marketing team of 25. Could you share a compliance whitepaper regarding official API boundaries and OAuth security?',
    intentCategory: 'SALES_INQUIRY',
    priority: 'HIGH',
    suggestedReply: 'Hello David! Thank you for reaching out. MetaSphere AI strictly communicates via official Meta Graph APIs and AES-256 encrypted OAuth tokens. We’d be delighted to share our security and API boundary whitepaper. Could you provide the best email address to send it to?',
  },
  {
    platform: 'INSTAGRAM',
    conversationId: 'conv_ig_2',
    senderId: 'sarah_design_co',
    senderName: 'Sarah Designs',
    messageText: 'Hey! I saw your post on Instagram scheduling. Can MetaSphere handle carousel posts and Reels auto-publishing?',
    intentCategory: 'QUESTION',
    priority: 'NORMAL',
    suggestedReply: 'Hi Sarah! Yes, MetaSphere AI fully supports Instagram single images, carousels, and Reels scheduling through the official Instagram Content Publishing API. Would you like a quick walkthrough?',
  },
  {
    platform: 'WHATSAPP',
    conversationId: 'conv_wa_3',
    senderId: '+447911123456',
    senderName: 'Liam O’Connor',
    messageText: 'Urgent: I need to update our billing payment method before the monthly billing cycle closes tonight.',
    intentCategory: 'COMPLAINT',
    priority: 'URGENT',
    suggestedReply: 'Hi Liam, no worries! You can update your payment method directly in Settings > Billing or via the direct customer billing portal link. I will also flag our finance desk immediately to ensure no service interruption.',
  },
];

export const MOCK_ANALYTICS = {
  overview: {
    totalReach: 460950,
    reachChange: '+18.4%',
    totalEngagement: 38400,
    engagementChange: '+12.6%',
    netFollowers: 94470,
    followersChange: '+1,240 this week',
    totalInteractions: 14200,
    responseRate: '98.6%',
    avgResponseTime: '4m 12s',
  },
  timeseries: [
    { date: 'Mon', reachFB: 18200, reachIG: 39400, engagement: 4200 },
    { date: 'Tue', reachFB: 21500, reachIG: 44100, engagement: 5300 },
    { date: 'Wed', reachFB: 19800, reachIG: 41200, engagement: 4800 },
    { date: 'Thu', reachFB: 24600, reachIG: 48900, engagement: 6100 },
    { date: 'Fri', reachFB: 28900, reachIG: 56300, engagement: 7400 },
    { date: 'Sat', reachFB: 31200, reachIG: 62000, engagement: 8200 },
    { date: 'Sun', reachFB: 26800, reachIG: 52100, engagement: 6900 },
  ],
  topPosts: [
    {
      id: 'post_1',
      platform: 'INSTAGRAM',
      caption: '🚀 Unlocking 10x social productivity with official Meta APIs & AI suggested replies. See how it works!',
      publishedAt: '2 days ago',
      reach: 64200,
      likes: 3840,
      comments: 184,
      shares: 420,
      engagementRate: '6.9%',
    },
    {
      id: 'post_2',
      platform: 'FACEBOOK',
      caption: 'Announcing our verified WhatsApp Business Platform integration — direct customer care without leaving your dashboard.',
      publishedAt: '4 days ago',
      reach: 41900,
      likes: 1920,
      comments: 92,
      shares: 210,
      engagementRate: '5.3%',
    },
    {
      id: 'post_3',
      platform: 'INSTAGRAM',
      caption: 'Top 5 mistakes brands make when managing Meta OAuth tokens (and how to fix them with AES-256 token vaults).',
      publishedAt: '6 days ago',
      reach: 58100,
      likes: 4100,
      comments: 245,
      shares: 610,
      engagementRate: '8.5%',
    },
  ],
};

export class MetaApiSimulator {
  static async publishPost(payload: MetaPostPublishPayload): Promise<MetaPostPublishResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedPostId = `${payload.platform.toLowerCase()}_post_${Date.now()}`;
    return {
      success: true,
      postId: simulatedPostId,
      details: {
        timestamp: new Date().toISOString(),
        published_to: payload.accountId,
        platform: payload.platform,
        status: payload.scheduledPublishTime ? 'SCHEDULED_OFFICIALLY' : 'PUBLISHED_LIVE',
      },
    };
  }

  static async sendCommentReply(commentId: string, replyText: string) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      replyId: `reply_${Date.now()}`,
      created_time: new Date().toISOString(),
      parent_comment_id: commentId,
    };
  }

  static async sendDirectMessage(recipientId: string, messageText: string, platform: MetaPlatform) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      messageId: `msg_${platform.toLowerCase()}_${Date.now()}`,
      recipient_id: recipientId,
      status: 'SENT_TO_META_GATEWAY',
      timestamp: new Date().toISOString(),
    };
  }
}
