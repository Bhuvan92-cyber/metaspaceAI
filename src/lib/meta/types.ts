export type MetaPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP';

export interface MetaPage {
  id: string;
  name: string;
  category?: string;
  access_token?: string;
  tasks?: string[];
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
}

export interface WhatsAppBusinessAccount {
  id: string;
  name: string;
  currency?: string;
  timezone_id?: string;
  phone_numbers?: {
    id: string;
    display_phone_number: string;
    verified_name: string;
    quality_rating: string;
  }[];
}

export interface MetaPostPublishPayload {
  platform: MetaPlatform;
  accountId: string;
  message: string;
  mediaUrls?: string[];
  scheduledPublishTime?: number; // UNIX timestamp in seconds
}

export interface MetaPostPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
  details?: any;
}

export interface MetaCommentItem {
  id: string;
  text: string;
  created_time: string;
  from: {
    id: string;
    name: string;
  };
  post_id: string;
  platform: MetaPlatform;
}

export interface MetaInsightMetric {
  name: string;
  period: string;
  values: {
    value: number | Record<string, number>;
    end_time: string;
  }[];
  title: string;
  description: string;
}

export interface MetaWebhookPayload {
  object: 'page' | 'instagram' | 'whatsapp_business_account';
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: any;
    }>;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message: {
        mid: string;
        text: string;
      };
    }>;
  }>;
}
