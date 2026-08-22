import { PrismaClient } from '@prisma/client';
import { encryptToken } from './encryption';
import { MOCK_ACCOUNTS, MOCK_COMMENTS, MOCK_MESSAGES } from './meta/simulator';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting MetaSphere AI database seeding...');

  // 1. Create or find default user
  let user = await prisma.user.findUnique({
    where: { email: 'alex@metasphere.ai' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'alex@metasphere.ai',
        name: 'Alex Sterling',
        role: 'ADMIN',
      },
    });
    console.log(`👤 Created user: ${user.name} (${user.email})`);
  }

  // 2. Create UserSettings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      simulationModeEnabled: true,
      autoReplyApprovalReq: true,
      emailNotifications: true,
    },
    update: {},
  });

  // 3. Create Connected Accounts & Token Vaults
  for (const acc of MOCK_ACCOUNTS) {
    const existingAccount = await prisma.connectedAccount.findFirst({
      where: {
        userId: user.id,
        platform: acc.platform,
        platformAccountId: acc.id,
      },
    });

    let accountId = existingAccount?.id;

    if (!existingAccount) {
      const createdAccount = await prisma.connectedAccount.create({
        data: {
          userId: user.id,
          platform: acc.platform,
          platformAccountId: acc.id,
          accountName: acc.name,
          accountType: acc.type,
          avatarUrl: acc.avatarUrl,
          connectionStatus: 'ACTIVE',
        },
      });
      accountId = createdAccount.id;

      // Encrypt sample access token in vault
      const mockRawToken = `EAAB_mock_oauth_${acc.platform.toLowerCase()}_token_${Date.now()}`;
      await prisma.oAuthTokenVault.create({
        data: {
          accountId: createdAccount.id,
          encryptedAccessToken: encryptToken(mockRawToken),
          tokenType: 'BEARER',
          scopes: JSON.stringify(acc.scopes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days
        },
      });

      // Add permissions
      for (const scope of acc.scopes) {
        await prisma.accountPermission.create({
          data: {
            accountId: createdAccount.id,
            permissionName: scope,
            grantedStatus: true,
          },
        });
      }

      console.log(`🔗 Connected ${acc.platform} account: ${acc.name}`);
    }

    // 4. Seed sample posts
    if (acc.platform === 'INSTAGRAM' && accountId) {
      const existingPost = await prisma.contentItem.findFirst({
        where: { userId: user.id, accountId },
      });

      if (!existingPost) {
        // Published Post
        await prisma.contentItem.create({
          data: {
            userId: user.id,
            accountId,
            platform: 'INSTAGRAM',
            title: 'Official Meta APIs & AI Launch',
            contentText: '🚀 Unlocking 10x social productivity with official Meta APIs & AI suggested replies. See how it works!\n\n#AI #MetaGraphAPI #Productivity',
            mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80']),
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            externalPostId: 'ig_post_991823746',
          },
        });

        // Scheduled Post
        await prisma.contentItem.create({
          data: {
            userId: user.id,
            accountId,
            platform: 'INSTAGRAM',
            title: 'Upcoming Weekend Feature Teaser',
            contentText: '✨ Sneak peek: Next-gen business messaging intelligence with zero manual triage. Are you ready?\n\nDrop a comment if you want early beta access! 👇🔥 #TechInnovation #FutureOfWork',
            mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&auto=format&fit=crop&q=80']),
            status: 'SCHEDULED',
            scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
          },
        });
      }
    }

    // 5. Seed sample comments
    if (accountId && (acc.platform === 'FACEBOOK' || acc.platform === 'INSTAGRAM')) {
      const filteredComments = MOCK_COMMENTS.filter((c) => c.platform === acc.platform);
      for (const mockComm of filteredComments) {
        const existingComment = await prisma.comment.findFirst({
          where: { accountId, externalCommentId: mockComm.id },
        });

        if (!existingComment) {
          await prisma.comment.create({
            data: {
              accountId,
              platform: mockComm.platform,
              externalCommentId: mockComm.id,
              externalPostId: mockComm.post_id,
              authorName: mockComm.from.name,
              authorId: mockComm.from.id,
              commentText: mockComm.text,
              sentiment: mockComm.text.includes('🔥') || mockComm.text.includes('Great') ? 'POSITIVE' : mockComm.text.includes('error') ? 'NEGATIVE' : 'INQUIRY',
              priority: mockComm.text.includes('error') ? 'URGENT' : mockComm.text.includes('cost') ? 'HIGH' : 'LOW',
              suggestedReply: mockComm.text.includes('cost')
                ? 'Hi! Our starter plans begin at $29/mo with full official Meta API integration. Sending you details!'
                : mockComm.text.includes('error')
                ? 'We apologize! Our support desk has logged this and we are investigating immediately.'
                : 'Thanks for asking! Yes, this is 100% supported.',
              replyStatus: 'UNREPLIED',
            },
          });
        }
      }
    }

    // 6. Seed sample messages
    if (accountId && (acc.platform === 'WHATSAPP' || acc.platform === 'INSTAGRAM')) {
      const filteredMsgs = MOCK_MESSAGES.filter((m) => m.platform === acc.platform);
      for (const mockMsg of filteredMsgs) {
        const existingMsg = await prisma.message.findFirst({
          where: { accountId, senderId: mockMsg.senderId },
        });

        if (!existingMsg) {
          await prisma.message.create({
            data: {
              accountId,
              platform: mockMsg.platform,
              conversationId: mockMsg.conversationId,
              senderId: mockMsg.senderId,
              senderName: mockMsg.senderName,
              messageText: mockMsg.messageText,
              direction: 'INBOUND',
              intentCategory: mockMsg.intentCategory,
              priority: mockMsg.priority,
              suggestedReply: mockMsg.suggestedReply,
              status: 'RECEIVED',
            },
          });
        }
      }
    }
  }

  // 7. Seed Initial Activity Logs
  const logCount = await prisma.activityLog.count({ where: { userId: user.id } });
  if (logCount === 0) {
    await prisma.activityLog.createMany({
      data: [
        {
          userId: user.id,
          actorType: 'USER',
          actionType: 'OAUTH_CONNECT',
          platform: 'INSTAGRAM',
          actionStatus: 'SUCCESS',
          details: 'Connected Instagram Business account @techinnovate_ai via official OAuth flow.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
          userId: user.id,
          actorType: 'AI',
          actionType: 'AI_GENERATE',
          platform: 'INSTAGRAM',
          actionStatus: 'SUCCESS',
          details: 'Generated 3 post caption variations with tone "Engaging" for product launch.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        },
        {
          userId: user.id,
          actorType: 'USER',
          actionType: 'POST_PUBLISH',
          platform: 'INSTAGRAM',
          actionStatus: 'SUCCESS',
          details: 'User approved AI caption and published media post (ID: ig_post_991823746).',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ],
    });
  }

  console.log('✅ MetaSphere AI database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
