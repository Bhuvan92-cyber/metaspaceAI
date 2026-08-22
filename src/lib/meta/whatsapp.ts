const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0';

/**
 * WhatsApp Business Cloud API Integration Layer
 */
export class WhatsAppApiClient {
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  /**
   * Send text message to an authorized customer phone number
   */
  async sendTextMessage(toPhoneNumber: string, text: string) {
    try {
      const endpoint = `${META_GRAPH_BASE}/${this.phoneNumberId}/messages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toPhoneNumber,
          type: 'text',
          text: { preview_url: true, body: text },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
          details: data.error,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        details: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'WhatsApp Cloud API network error',
      };
    }
  }

  /**
   * Send WhatsApp Business Template message
   */
  async sendTemplateMessage(toPhoneNumber: string, templateName: string, languageCode = 'en_US') {
    try {
      const endpoint = `${META_GRAPH_BASE}/${this.phoneNumberId}/messages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toPhoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
          },
        }),
      });

      const data = await response.json();
      return {
        success: response.ok && !data.error,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
