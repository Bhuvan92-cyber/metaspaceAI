import { MetaPostPublishPayload, MetaPostPublishResult } from './types';

const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Facebook Pages API integration layer
 */
export class FacebookApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Publish a text or photo post to a Facebook Page feed
   */
  async publishPost(pageId: string, payload: MetaPostPublishPayload): Promise<MetaPostPublishResult> {
    try {
      const endpoint = `${META_GRAPH_BASE}/${pageId}/feed`;
      const bodyParams: Record<string, any> = {
        message: payload.message,
        access_token: this.accessToken,
      };

      if (payload.scheduledPublishTime) {
        bodyParams.published = false;
        bodyParams.scheduled_publish_time = payload.scheduledPublishTime;
      }

      if (payload.mediaUrls && payload.mediaUrls.length > 0) {
        bodyParams.link = payload.mediaUrls[0];
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParams),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || 'Facebook API post publication failed',
          details: data.error,
        };
      }

      return {
        success: true,
        postId: data.id,
        details: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error communicating with Facebook Graph API',
      };
    }
  }

  /**
   * Reply to a comment on Facebook
   */
  async replyToComment(commentId: string, replyText: string) {
    const endpoint = `${META_GRAPH_BASE}/${commentId}/comments`;
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
   * Fetch Page Insights (e.g. page_impressions, page_engaged_users)
   */
  async getPageInsights(pageId: string, metrics = 'page_impressions,page_engaged_users,page_fans') {
    const endpoint = `${META_GRAPH_BASE}/${pageId}/insights?metric=${metrics}&access_token=${this.accessToken}`;
    const response = await fetch(endpoint);
    return await response.json();
  }
}
