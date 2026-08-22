import { prisma } from './db';

export type ActorType = 'USER' | 'AI' | 'SCHEDULER' | 'META_WEBHOOK';
export type ActionType =
  | 'OAUTH_CONNECT'
  | 'OAUTH_DISCONNECT'
  | 'POST_CREATE'
  | 'POST_SCHEDULE'
  | 'POST_PUBLISH'
  | 'COMMENT_REPLY'
  | 'MESSAGE_SEND'
  | 'AI_GENERATE'
  | 'AI_ANALYSIS'
  | 'PERMISSION_UPDATE'
  | 'SETTINGS_UPDATE';

export type PlatformType = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'SYSTEM';
export type ActionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'BLOCKED';

interface LogEventParams {
  userId: string;
  actorType: ActorType;
  actionType: ActionType;
  platform?: PlatformType;
  actionStatus: ActionStatus;
  details?: string | Record<string, any>;
  ipAddress?: string;
}

/**
 * Records an immutable security audit and activity log entry
 */
export async function logActivity(params: LogEventParams) {
  try {
    const detailsString =
      typeof params.details === 'object'
        ? JSON.stringify(params.details)
        : params.details || '';

    return await prisma.activityLog.create({
      data: {
        userId: params.userId,
        actorType: params.actorType,
        actionType: params.actionType,
        platform: params.platform || 'SYSTEM',
        actionStatus: params.actionStatus,
        details: detailsString,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Error writing activity log:', error);
    return null;
  }
}
