import { prisma } from '../db';
import { MetaIntegrationService } from '../meta/client';
import { logActivity } from '../audit';
import { MetaPlatform } from '../meta/types';

/**
 * Background Scheduler Worker to process queued & scheduled social media posts
 */
export class PostSchedulerService {
  private static isRunning = false;

  /**
   * Process all pending scheduled posts whose scheduledAt has elapsed
   */
  static async processDuePosts() {
    if (this.isRunning) return { processed: 0, message: 'Scheduler already in progress' };
    this.isRunning = true;

    try {
      const now = new Date();
      const duePosts = await prisma.contentItem.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now },
        },
        include: {
          account: true,
        },
      });

      let processedCount = 0;

      for (const post of duePosts) {
        if (!post.accountId) {
          await prisma.contentItem.update({
            where: { id: post.id },
            data: { status: 'FAILED', errorDetails: 'No connected account linked for post' },
          });
          continue;
        }

        let mediaUrlsParsed: string[] = [];
        if (post.mediaUrls) {
          try {
            mediaUrlsParsed = JSON.parse(post.mediaUrls);
          } catch {
            mediaUrlsParsed = [post.mediaUrls];
          }
        }

        const publishResult = await MetaIntegrationService.publishPost(
          post.userId,
          post.accountId,
          {
            platform: post.platform as MetaPlatform,
            accountId: post.accountId,
            message: post.contentText,
            mediaUrls: mediaUrlsParsed,
          }
        );

        if (publishResult.success) {
          await prisma.contentItem.update({
            where: { id: post.id },
            data: {
              status: 'PUBLISHED',
              publishedAt: new Date(),
              externalPostId: publishResult.postId,
            },
          });

          await logActivity({
            userId: post.userId,
            actorType: 'SCHEDULER',
            actionType: 'POST_PUBLISH',
            platform: post.platform as any,
            actionStatus: 'SUCCESS',
            details: {
              contentId: post.id,
              postId: publishResult.postId,
              scheduledAt: post.scheduledAt,
            },
          });

          processedCount++;
        } else {
          await prisma.contentItem.update({
            where: { id: post.id },
            data: {
              status: 'FAILED',
              errorDetails: publishResult.error || 'Failed during scheduled publication',
            },
          });

          await logActivity({
            userId: post.userId,
            actorType: 'SCHEDULER',
            actionType: 'POST_PUBLISH',
            platform: post.platform as any,
            actionStatus: 'FAILED',
            details: {
              contentId: post.id,
              error: publishResult.error,
            },
          });
        }
      }

      return { processed: processedCount, totalFound: duePosts.length };
    } catch (error) {
      console.error('Error in post scheduler runner:', error);
      return { processed: 0, error };
    } finally {
      this.isRunning = false;
    }
  }
}
