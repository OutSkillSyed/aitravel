import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdapterError, fetchWithPolicy, runWithFallback } from '@/adapters/http';

const originalFetch = global.fetch;

describe('fetchWithPolicy', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('returns parsed JSON on success', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const out = await fetchWithPolicy<{ ok: boolean }>('http://example.test/ping', {}, {
      adapter: 'test-success',
    });
    expect(out.ok).toBe(true);
  });

  it('retries on 500 and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce(new Response('boom', { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: 1 }), { status: 200 }));
    global.fetch = fn as unknown as typeof fetch;
    const out = await fetchWithPolicy<{ ok: number }>('http://example.test/retry', {}, {
      adapter: 'test-retry',
      retries: 2,
    });
    expect(out.ok).toBe(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 404', async () => {
    const fn = vi.fn().mockResolvedValue(new Response('nope', { status: 404 }));
    global.fetch = fn as unknown as typeof fetch;
    await expect(
      fetchWithPolicy('http://example.test/nf', {}, { adapter: 'test-404', retries: 3 }),
    ).rejects.toBeInstanceOf(AdapterError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('runWithFallback', () => {
  it('returns fallback when the primary throws', async () => {
    const value = await runWithFallback(async () => {
      throw new Error('broken');
    }, [] as number[], 'fallback-test');
    expect(value).toEqual([]);
  });

  it('returns primary result when it succeeds', async () => {
    const value = await runWithFallback(async () => [1, 2, 3], [] as number[], 'ok');
    expect(value).toEqual([1, 2, 3]);
  });
});
