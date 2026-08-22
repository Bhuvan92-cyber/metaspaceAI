export interface CaptionGenInput {
  topic: string;
  tone: 'professional' | 'engaging' | 'promotional' | 'humorous' | 'informative';
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP';
  targetAudience?: string;
  includeHashtags?: boolean;
}

export class FallbackAiEngine {
  /**
   * Generates realistic high quality captions based on tone & platform
   */
  static generateCaptions(input: CaptionGenInput) {
    const topic = input.topic.trim();
    const isIg = input.platform === 'INSTAGRAM';
    const isWa = input.platform === 'WHATSAPP';

    let primary = '';
    let variations: string[] = [];
    let hashtags: string[] = [];

    switch (input.tone) {
      case 'promotional':
        primary = isWa
          ? `📢 *Exclusive Announcement: ${topic}*\n\nWe're thrilled to introduce our latest offering! Experience enhanced efficiency and premium results. Tap reply or visit our link to claim your early-bird benefit today.`
          : isIg
          ? `✨ Elevate your game with ${topic}! 🚀\n\nWe’ve engineered this specifically for forward-thinking creators and teams. Ready to transform your workflow?\n\n👇 Drop a comment below or tap the link in our bio to get started!`
          : `We are excited to officially unveil ${topic}! Discover how our solution is helping organizations scale faster and smarter. Read the full release and get started on our website today.`;
        variations = [
          `🔥 Limited Time: Discover why everyone is talking about ${topic}. Click the link to learn more!`,
          `Don't miss out on ${topic} — built to streamline your daily operations with zero hassle.`,
        ];
        hashtags = ['#LaunchDay', '#Innovation', '#GrowthHacking', '#Productivity', '#Trending'];
        break;

      case 'humorous':
        primary = isIg
          ? `Me: I'm going to take it easy this week.\nAlso me: *builds and launches ${topic} at 2 AM* ☕😅\n\nWho else can relate? Tell us your chaotic work stories below! 👇`
          : `Rumor has it that ${topic} was powered by 90% coffee and 10% pure determination. ☕ Check it out and let us know what you think!`;
        variations = [
          `Nobody:\nAbsolutely nobody:\nUs: Here is ${topic} to save your entire workday! 🚀`,
        ];
        hashtags = ['#WorkHumor', '#Relatable', '#StartupLife', '#CoffeeFuelled', '#MetaSphere'];
        break;

      case 'informative':
        primary = isIg
          ? `💡 Quick Deep-Dive: 3 key things you should know about ${topic}:\n\n1️⃣ Efficiency: Automates repetitive overhead\n2️⃣ Security: Official API encryption standards\n3️⃣ Intelligence: Actionable real-time insights\n\n💾 Save this post for your next strategy session!`
          : `Understanding ${topic}: Why it matters for modern digital teams.\n\nIn our latest overview, we break down the core advantages of official API integration and AI-assisted workflows. Explore the key takeaways below:`;
        variations = [
          `Did you know? Implementing ${topic} can reduce manual response cycles by up to 60%. Here's how.`,
        ];
        hashtags = ['#TechInsights', '#DataDriven', '#BestPractices', '#IndustryNews', '#AI'];
        break;

      case 'engaging':
      default:
        primary = isIg
          ? `What’s your #1 goal with ${topic}? 🤔\n\nWhether you're looking to scale engagement, streamline communication, or unlock new growth, we'd love to hear your thoughts! Drop your ideas in the comments below! 👇💬`
          : `Let's talk about ${topic}! What strategies have worked best for your team this quarter? Join the discussion below!`;
        variations = [
          `Question for the community: How are you approaching ${topic} this season? Let's discuss!`,
          `We'd love your input on ${topic} — share your perspective with us in the comments!`,
        ];
        hashtags = ['#Community', '#Discussion', '#CreatorEconomy', '#SocialStrategy', '#TechTrends'];
        break;
    }

    if (input.includeHashtags && hashtags.length > 0 && isIg) {
      primary += `\n\n${hashtags.join(' ')}`;
    }

    return {
      primaryCaption: primary,
      variations,
      suggestedHashtags: hashtags,
      estimatedEngagementScore: '8.7 / 10',
      bestTimeToPost: 'Tomorrow at 10:30 AM (Peak Audience Window)',
    };
  }

  /**
   * Generates suggested reply and intent analysis for comments & messages
   */
  static analyzeMessage(text: string, platform: string) {
    const lower = text.toLowerCase();

    let intentCategory = 'QUESTION';
    let priority = 'NORMAL';
    let suggestedReply = 'Thank you for reaching out! We appreciate your interest and will get back to you shortly with full details.';

    if (lower.includes('cost') || lower.includes('price') || lower.includes('tier') || lower.includes('enterprise') || lower.includes('quote') || lower.includes('buy')) {
      intentCategory = 'SALES_INQUIRY';
      priority = 'HIGH';
      suggestedReply = 'Hi there! We would love to discuss our pricing tiers and tailor a package for your requirements. Could you share your expected volume or team size?';
    } else if (lower.includes('error') || lower.includes('issue') || lower.includes('broken') || lower.includes('problem') || lower.includes('urgent') || lower.includes('timeout')) {
      intentCategory = 'COMPLAINT';
      priority = 'URGENT';
      suggestedReply = 'We apologize for the inconvenience! Our engineering team is looking into this. Could you share any screenshot or error message details so we can resolve this right away?';
    } else if (lower.includes('how to') || lower.includes('can it') || lower.includes('support') || lower.includes('compatible') || lower.includes('available')) {
      intentCategory = 'QUESTION';
      priority = 'NORMAL';
      suggestedReply = 'Great question! Yes, this capability is fully supported through our official API integrations. Let us know if you would like a quick demo or documentation link!';
    } else if (lower.includes('great') || lower.includes('love') || lower.includes('awesome') || lower.includes('kudos') || lower.includes('🔥')) {
      intentCategory = 'FEEDBACK';
      priority = 'NORMAL';
      suggestedReply = 'Thank you so much for the love and positive feedback! We are constantly working on exciting updates. Stay tuned! 🚀';
    }

    return {
      intentCategory,
      priority,
      suggestedReply,
      sentiment: intentCategory === 'COMPLAINT' ? 'NEGATIVE' : intentCategory === 'FEEDBACK' ? 'POSITIVE' : 'NEUTRAL',
    };
  }

  /**
   * Answers natural language analytics and conversational commands
   */
  static processNaturalLanguageQuery(query: string) {
    const lower = query.toLowerCase();

    if (lower.includes('best') || lower.includes('top performing') || lower.includes('highest engagement')) {
      return {
        summary: 'Your top performing content this period is the Instagram post on "Unlocking 10x social productivity with official Meta APIs", which generated a 6.9% engagement rate and 3,840 likes.',
        metrics: [
          { label: 'Top Post Reach', value: '64,200 accounts' },
          { label: 'Likes & Comments', value: '4,024 interactions' },
          { label: 'Primary Driver', value: 'Engaging carousel format + technical tips' },
        ],
        recommendation: 'Replicate this format by sharing more carousel tutorials focusing on API workflows and actionable tips.',
      };
    } else if (lower.includes('reach') || lower.includes('traffic') || lower.includes('impressions')) {
      return {
        summary: 'Total reach across Facebook and Instagram accounts increased by +18.4% over the last 7 days, totaling 460,950 impressions.',
        metrics: [
          { label: 'Instagram Reach', value: '310,500' },
          { label: 'Facebook Reach', value: '142,000' },
          { label: 'WhatsApp Interactions', value: '8,450' },
        ],
        recommendation: 'Instagram Reels and carousel posts are driving 67% of total reach. Maintain 3-4 visual posts per week.',
      };
    } else if (lower.includes('when') || lower.includes('time') || lower.includes('active')) {
      return {
        summary: 'Your audience is most active on weekdays between 10:00 AM – 1:00 PM and 6:30 PM – 8:30 PM UTC.',
        metrics: [
          { label: 'Peak Weekday', value: 'Friday (8,200 peak engagements)' },
          { label: 'Peak Hour', value: '11:00 AM UTC' },
        ],
        recommendation: 'Schedule your upcoming major announcements for Friday morning at 10:30 AM to maximize organic impressions.',
      };
    } else {
      return {
        summary: `Based on your connected Facebook, Instagram, and WhatsApp accounts, overall account health is strong with a 98.6% response rate and consistent +14% monthly engagement growth.`,
        metrics: [
          { label: 'Active Channels', value: '3 Platforms Connected' },
          { label: 'Response Health', value: 'Avg 4m 12s' },
          { label: 'Engagement Health', value: '6.2% IG / 4.8% FB' },
        ],
        recommendation: 'Consider activating automated FAQ reply approvals for WhatsApp Business to handle off-hours inquiries seamlessly.',
      };
    }
  }
}
