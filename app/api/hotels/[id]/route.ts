import { jsonError, jsonOk } from '@/lib/api';
import { getRepos } from '@/repositories';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const hotel = await getRepos().hotels.findById(id);
  if (!hotel) return jsonError(404, 'hotel not found');
  return jsonOk({ hotel });
}
