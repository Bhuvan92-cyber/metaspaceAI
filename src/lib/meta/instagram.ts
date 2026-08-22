import { MetaPostPublishPayload, MetaPostPublishResult } from './types';

const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Instagram Graph API integration layer
 */
export class InstagramApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Publish media via official Instagram Content Publishing API
   * Step 1: Create media container
   * Step 2: Publish media container
   */
  async publishMedia(igUserId: string, payload: MetaPostPublishPayload): Promise<MetaPostPublishResult> {
    try {
      const mediaUrl = payload.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
      
      // Step 1: Create media container
      const containerEndpoint = `${META_GRAPH_BASE}/${igUserId}/media`;
      const containerRes = await fetch(containerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption: payload.message,
          access_token: this.accessToken,
        }),
      });

      const containerData = await containerRes.json();
      if (!containerRes.ok || !containerData.id) {
        return {
          success: false,
          error: containerData.error?.message || 'Failed to create Instagram media container',
          details: containerData.error,
        };
      }

      const creationId = containerData.id;

      // Step 2: Publish container
      const publishEndpoint = `${META_GRAPH_BASE}/${igUserId}/media_publish`;
      const publishRes = await fetch(publishEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: this.accessToken,
        }),
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok || !publishData.id) {
        return {
          success: false,
          error: publishData.error?.message || 'Failed to publish Instagram media container',
          details: publishData.error,
        };
      }

      return {
        success: true,
        postId: publishData.id,
        details: publishData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Instagram API network error',
      };
    }
  }

  /**
   * Reply to an Instagram comment
   */
  async replyToComment(commentId: string, replyText: string) {
    const endpoint = `${META_GRAPH_BASE}/${commentId}/replies`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: replyText,
        access_token: this.accessToken,
      }),
    });
    return await response.json();
  }

  /**
   * Send Instagram Direct Message to supported business contact
   */
  async sendDirectMessage(recipientId: string, messageText: string) {
    const endpoint = `${META_GRAPH_BASE}/me/messages`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText },
        access_token: this.accessToken,
      }),
    });
    return await response.json();
  }

  /**
   * Fetch Instagram Account Insights
   */
  async getInsights(igUserId: string, metric = 'impressions,reach,profile_views') {
    const endpoint = `${META_GRAPH_BASE}/${igUserId}/insights?metric=${metric}&period=day&access_token=${this.accessToken}`;
    const response = await fetch(endpoint);
    return await response.json();
  }
}
