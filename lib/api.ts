import { NextResponse } from 'next/server';
import { ZodError, type ZodTypeAny, type z } from 'zod';

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function readJson<T extends ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<z.infer<T> | NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'invalid JSON body');
  }
  const result = schema.safeParse(body);
  if (!result.success) return zodBadRequest(result.error);
  return result.data;
}

export function readQuery<T extends ZodTypeAny>(request: Request, schema: T): z.infer<T> | NextResponse {
  const url = new URL(request.url);
  const entries = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(entries);
  if (!result.success) return zodBadRequest(result.error);
  return result.data;
}

export function zodBadRequest(err: ZodError) {
  return jsonError(400, 'validation failed', {
    issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
  });
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof Response;
}
