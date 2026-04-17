/**
 * Shared fetch helpers. Every supplier adapter funnels through `fetchWithPolicy`
 * so timeouts, retries, and circuit breakers behave identically everywhere.
 *
 * Policy (from doc 3):
 *   - Timeout: 8s
 *   - Retry: 2 retries with exponential backoff
 *   - Circuit breaker: open after 3 failures in 60s
 *   - Fallback: caller returns [] (we just throw a typed error)
 */

export class AdapterError extends Error {
  constructor(
    message: string,
    readonly kind: 'timeout' | 'http' | 'network' | 'parse' | 'circuit_open',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}

interface BreakerState {
  failures: { at: number }[];
  openedAt?: number;
}
const breakers = new Map<string, BreakerState>();
const BREAKER_WINDOW_MS = 60_000;
const BREAKER_FAIL_THRESHOLD = 3;
const BREAKER_OPEN_MS = 30_000;

function breakerOpen(key: string): boolean {
  const state = breakers.get(key);
  if (!state) return false;
  if (state.openedAt && Date.now() - state.openedAt < BREAKER_OPEN_MS) return true;
  if (state.openedAt && Date.now() - state.openedAt >= BREAKER_OPEN_MS) {
    // half-open: reset and allow a probe
    breakers.delete(key);
  }
  return false;
}

function recordFailure(key: string) {
  const now = Date.now();
  const state = breakers.get(key) ?? { failures: [] };
  state.failures = state.failures.filter((f) => now - f.at < BREAKER_WINDOW_MS);
  state.failures.push({ at: now });
  if (state.failures.length >= BREAKER_FAIL_THRESHOLD) {
    state.openedAt = now;
  }
  breakers.set(key, state);
}

function recordSuccess(key: string) {
  breakers.delete(key);
}

export interface FetchWithPolicyOptions {
  /** Logical name used for circuit breaker bucket and logging. */
  adapter: string;
  /** Total timeout per attempt, default 8_000 ms per doc 3. */
  timeoutMs?: number;
  /** Number of retries (default 2 → up to 3 total attempts). */
  retries?: number;
  /** Parse the response body. Defaults to `res.json()`. */
  parse?: (res: Response) => Promise<unknown>;
}

export async function fetchWithPolicy<T>(
  input: string | URL,
  init: RequestInit,
  opts: FetchWithPolicyOptions,
): Promise<T> {
  const key = opts.adapter;
  if (breakerOpen(key)) {
    throw new AdapterError(`${key} circuit is open`, 'circuit_open');
  }

  const timeoutMs = opts.timeoutMs ?? 8_000;
  const retries = opts.retries ?? 2;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        // 4xx are not worth retrying (except 429). Let callers see the message.
        if (res.status < 500 && res.status !== 429) {
          recordFailure(key);
          throw new AdapterError(`${key} ${res.status}`, 'http', res.status);
        }
        throw new AdapterError(`${key} ${res.status}`, 'http', res.status);
      }
      const parsed = opts.parse ? await opts.parse(res) : await res.json();
      recordSuccess(key);
      return parsed as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (err instanceof AdapterError && err.kind === 'http' && err.status && err.status < 500 && err.status !== 429) {
        // Non-retryable
        throw err;
      }
      recordFailure(key);
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
    }
  }

  if (lastErr instanceof AdapterError) throw lastErr;
  throw new AdapterError(`${key} failed`, 'network');
}

export async function runWithFallback<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[adapter:${label}] using fallback:`, (err as Error).message);
    return fallback;
  }
}
