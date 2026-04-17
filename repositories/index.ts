/**
 * The single place where concrete repository implementations are chosen.
 * Today: in-memory mocks. Phase 5 handoff: replace `mockRepos()` with
 * `supabaseRepos()` here and the rest of the app keeps working unchanged.
 */

import { mockRepos } from './mock';
import type { RepoBundle } from './types';

let override: RepoBundle | null = null;

export function setReposForTest(bundle: RepoBundle) {
  override = bundle;
}

export function getRepos(): RepoBundle {
  return override ?? mockRepos();
}
