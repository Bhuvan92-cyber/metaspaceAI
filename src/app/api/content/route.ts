import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MetaIntegrationService } from '@/lib/meta/client';
import { logActivity } from '@/lib/audit';
import { MetaPlatform } from '@/lib/meta/types';

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const whereClause: any = { userId: user.id };
    if (status) whereClause.status = status;
    if (platform) whereClause.platform = platform;

    const posts = await prisma.contentItem.findMany({
      where: whereClause,
      include: {
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const {
      accountId,
      platform,
      title,
      contentText,
      mediaUrls,
      actionType, // 'PUBLISH_NOW' | 'SCHEDULE' | 'SAVE_DRAFT'
      scheduledAt,
    } = body;

    if (!contentText || !platform) {
      return NextResponse.json({ success: false, error: 'Content text and platform required' }, { status: 400 });
    }

    const mediaUrlsJson = mediaUrls ? JSON.stringify(Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls]) : null;

    if (actionType === 'PUBLISH_NOW') {
      if (!accountId) {
        return NextResponse.json({ success: false, error: 'Connected account is required to publish' }, { status: 400 });
      }

      // Execute immediate publish via official API layer
      const publishResult = await MetaIntegrationService.publishPost(
        user.id,
        accountId,
        {
          platform: platform as MetaPlatform,
          accountId,
          message: contentText,
          mediaUrls: mediaUrls ? (Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls]) : [],
        }
      );

      if (!publishResult.success) {
        // Save as failed
        const failedPost = await prisma.contentItem.create({
          data: {
            userId: user.id,
            accountId,
            platform,
            title: title || 'Untitled Post',
            contentText,
            mediaUrls: mediaUrlsJson,
            status: 'FAILED',
            errorDetails: publishResult.error,
          },
        });

        await logActivity({
          userId: user.id,
          actorType: 'USER',
          actionType: 'POST_PUBLISH',
          platform: platform as any,
          actionStatus: 'FAILED',
          details: { error: publishResult.error, contentId: failedPost.id },
        });

        return NextResponse.json({ success: false, error: publishResult.error, post: failedPost }, { status: 400 });
      }

      // Success
      const publishedPost = await prisma.contentItem.create({
        data: {
          userId: user.id,
          accountId,
          platform,
          title: title || 'Published Post',
          contentText,
          mediaUrls: mediaUrlsJson,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          externalPostId: publishResult.postId,
        },
        include: { account: true },
      });

      await logActivity({
        userId: user.id,
        actorType: 'USER',
        actionType: 'POST_PUBLISH',
        platform: platform as any,
        actionStatus: 'SUCCESS',
        details: `Published post to ${platform} (Post ID: ${publishResult.postId})`,
      });

      return NextResponse.json({ success: true, post: publishedPost });
    } else if (actionType === 'SCHEDULE') {
      if (!scheduledAt) {
        return NextResponse.json({ success: false, error: 'Schedule date and time required' }, { status: 400 });
      }

      const scheduledPost = await prisma.contentItem.create({
        data: {
          userId: user.id,
          accountId,
          platform,
          title: title || 'Scheduled Post',
          contentText,
          mediaUrls: mediaUrlsJson,
          status: 'SCHEDULED',
          scheduledAt: new Date(scheduledAt),
        },
        include: { account: true },
      });

      await logActivity({
        userId: user.id,
        actorType: 'USER',
        actionType: 'POST_SCHEDULE',
        platform: platform as any,
        actionStatus: 'SUCCESS',
        details: `Scheduled post for ${new Date(scheduledAt).toLocaleString()} on ${platform}`,
      });

      return NextResponse.json({ success: true, post: scheduledPost });
    } else {
      // SAVE_DRAFT
      const draftPost = await prisma.contentItem.create({
        data: {
          userId: user.id,
          accountId,
          platform,
          title: title || 'Draft Post',
          contentText,
          mediaUrls: mediaUrlsJson,
          status: 'DRAFT',
        },
        include: { account: true },
      });

      await logActivity({
        userId: user.id,
        actorType: 'USER',
        actionType: 'POST_CREATE',
        platform: platform as any,
        actionStatus: 'SUCCESS',
        details: `Saved content draft for ${platform}`,
      });

      return NextResponse.json({ success: true, post: draftPost });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Post ID required' }, { status: 400 });

    await prisma.contentItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Content item deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
