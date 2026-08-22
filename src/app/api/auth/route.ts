import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get or create the active user (default demo user)
    let user = await prisma.user.findFirst({
      include: {
        settings: true,
        accounts: {
          include: {
            permissions: true,
            tokenVault: {
              select: {
                id: true,
                tokenType: true,
                scopes: true,
                expiresAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'alex@metasphere.ai',
          name: 'Alex Sterling',
          role: 'ADMIN',
          settings: {
            create: {
              simulationModeEnabled: true,
              autoReplyApprovalReq: true,
              emailNotifications: true,
            },
          },
        },
        include: {
          settings: true,
          accounts: {
            include: {
              permissions: true,
              tokenVault: {
                select: {
                  id: true,
                  tokenType: true,
                  scopes: true,
                  expiresAt: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
