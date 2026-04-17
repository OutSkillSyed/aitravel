import { jsonError, jsonOk } from '@/lib/api';
import { getRepos } from '@/repositories';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const trip = await getRepos().trips.findById(id);
  if (!trip) return jsonError(404, 'trip not found');
  return jsonOk({ trip });
}
