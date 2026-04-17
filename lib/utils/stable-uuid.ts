import { createHash } from 'node:crypto';

/**
 * Deterministic UUID-v4-shaped id derived from an input key.
 *
 * Serverless invocations on Vercel are ephemeral and may use a fresh Node
 * process per request. `randomUUID()` at module init time would give every
 * instance different ids for the same seed data, breaking `/hotels/[id]`
 * lookups (list in process A, click → process B doesn't know the id).
 *
 * Using a hash of a stable key (e.g. `supplier-name`) guarantees every
 * process generates the same id. Not cryptographic; just uniqueness +
 * determinism for mock fixtures.
 */
export function stableUuid(key: string): string {
  const hash = createHash('sha1').update(key).digest('hex');
  // Format as UUID 8-4-4-4-12. Not a real v4 — we don't set the version bits
  // — but it's the right shape for our zod UuidSchema.
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    // Force version-4 nibble so `z.string().uuid()` validators accept it.
    `4${hash.slice(13, 16)}`,
    // Force variant bits (8/9/a/b) on the first nibble of the 4th group.
    `${(['8', '9', 'a', 'b'] as const)[parseInt(hash.slice(16, 17), 16) % 4]}${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join('-');
}
