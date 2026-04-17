import { NextResponse } from 'next/server';

import { clearDemoSession } from '@/lib/auth/session';
import { clientEnv } from '@/lib/env';

export async function GET() {
  await clearDemoSession();
  return NextResponse.redirect(`${clientEnv.NEXT_PUBLIC_APP_URL}/sign-in`);
}

export async function POST() {
  await clearDemoSession();
  return NextResponse.redirect(`${clientEnv.NEXT_PUBLIC_APP_URL}/sign-in`, { status: 303 });
}
