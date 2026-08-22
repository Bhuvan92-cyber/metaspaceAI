import { FacebookApiClient } from './facebook';
import { InstagramApiClient } from './instagram';
import { WhatsAppApiClient } from './whatsapp';
import { MetaApiSimulator } from './simulator';
import { MetaPlatform, MetaPostPublishPayload, MetaPostPublishResult } from './types';
import { decryptToken } from '../encryption';
import { prisma } from '../db';

export class MetaIntegrationService {
  /**
   * Unified publishing gateway for Facebook and Instagram
   */
  static async publishPost(
    userId: string,
    accountId: string,
    payload: MetaPostPublishPayload
  ): Promise<MetaPostPublishResult> {
    // 1. Fetch user settings and connected account
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    const isSimulated = userSettings?.simulationModeEnabled ?? true;

    if (isSimulated) {
      return await MetaApiSimulator.publishPost(payload);
    }

    // 2. Fetch account and decrypt token from vault
    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
      include: { tokenVault: true },
    });

    if (!account || !account.tokenVault) {
      return {
        success: false,
        error: 'No connected account or OAuth token found in vault',
      };
    }

    const rawToken = decryptToken(account.tokenVault.encryptedAccessToken);
    if (!rawToken || rawToken === '[DECRYPTION_ERROR]') {
      return {
        success: false,
        error: 'Failed to decrypt access token from secure vault',
      };
    }

    if (payload.platform === 'FACEBOOK') {
      const fbClient = new FacebookApiClient(rawToken);
      return await fbClient.publishPost(account.platformAccountId, payload);
    } else if (payload.platform === 'INSTAGRAM') {
      const igClient = new InstagramApiClient(rawToken);
      return await igClient.publishMedia(account.platformAccountId, payload);
    } else {
      return {
        success: false,
        error: `Publishing not supported for platform ${payload.platform}`,
      };
    }
  }

  /**
   * Unified comment reply gateway
   */
  static async replyToComment(
    userId: string,
    accountId: string,
    platform: MetaPlatform,
    commentId: string,
    replyText: string
  ) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    const isSimulated = userSettings?.simulationModeEnabled ?? true;
    if (isSimulated) {
      return await MetaApiSimulator.sendCommentReply(commentId, replyText);
    }

    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
      include: { tokenVault: true },
    });

    if (!account?.tokenVault) throw new Error('OAuth token missing');
    const token = decryptToken(account.tokenVault.encryptedAccessToken);

    if (platform === 'FACEBOOK') {
      const fbClient = new FacebookApiClient(token);
      return await fbClient.replyToComment(commentId, replyText);
    } else {
      const igClient = new InstagramApiClient(token);
      return await igClient.replyToComment(commentId, replyText);
    }
  }

  /**
   * Unified messaging gateway for WhatsApp & Instagram
   */
  static async sendDirectMessage(
    userId: string,
    accountId: string,
    platform: MetaPlatform,
    recipientId: string,
    messageText: string
  ) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    const isSimulated = userSettings?.simulationModeEnabled ?? true;
    if (isSimulated) {
      return await MetaApiSimulator.sendDirectMessage(recipientId, messageText, platform);
    }

    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
      include: { tokenVault: true },
    });

    if (!account?.tokenVault) throw new Error('OAuth token missing');
    const token = decryptToken(account.tokenVault.encryptedAccessToken);

    if (platform === 'WHATSAPP') {
      const waClient = new WhatsAppApiClient(token, account.platformAccountId);
      return await waClient.sendTextMessage(recipientId, messageText);
    } else {
      const igClient = new InstagramApiClient(token);
      return await igClient.sendDirectMessage(recipientId, messageText);
    }
  }
}
