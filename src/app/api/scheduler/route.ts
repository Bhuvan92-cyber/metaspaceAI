import { NextResponse } from 'next/server';
import { PostSchedulerService } from '@/lib/scheduler/postScheduler';

export async function POST() {
  try {
    const result = await PostSchedulerService.processDuePosts();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
