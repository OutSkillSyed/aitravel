/**
 * Demo session — signed cookie, mock user only.
 *
 * Real auth (Supabase) arrives at Phase 5. Until then we just issue a cookie
 * with a session identifier so the UI has a returning-user state to react to.
 * Nothing in the cookie is trusted server-side beyond the presence check.
 *
 * NOTE: `SESSION_COOKIE` lives in `./cookie.ts` so Edge middleware can import
 * just the constant without pulling in Node's `next/headers` or `Buffer`.
 */

import { cookies } from 'next/headers';

import { SESSION_COOKIE } from './cookie';

export { SESSION_COOKIE } from './cookie';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface DemoSession {
  email: string;
  startedAt: string;
}

function encode(session: DemoSession): string {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
}

function decode(raw: string): DemoSession | null {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as DemoSession;
    if (typeof parsed.email !== 'string' || typeof parsed.startedAt !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setDemoSession(session: DemoSession): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encode(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearDemoSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decode(raw);
}
