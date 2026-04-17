'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { setDemoSession } from '@/lib/auth/session';

const EmailSchema = z.string().email().max(200);

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signInWithEmail(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const email = EmailSchema.safeParse(formData.get('email'));
  if (!email.success) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  await setDemoSession({ email: email.data, startedAt: new Date().toISOString() });
  redirect('/plan');
}

export async function signUpWithEmail(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const email = EmailSchema.safeParse(formData.get('email'));
  if (!email.success) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  await setDemoSession({ email: email.data, startedAt: new Date().toISOString() });
  redirect('/plan?welcome=1');
}
