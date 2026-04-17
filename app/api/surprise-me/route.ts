import { jsonOk } from '@/lib/api';
import { getRepos } from '@/repositories';
import { detectDeals } from '@/services/deal-detector';

export async function GET() {
  const repos = getRepos();
  const samples = await repos.priceHistory.seriesFor('flight_route', 'DEL-GOI');
  const deals = detectDeals(samples, { stddevK: 1.5 });
  return jsonOk({ deals, source: 'price_history', route: 'DEL-GOI' });
}
