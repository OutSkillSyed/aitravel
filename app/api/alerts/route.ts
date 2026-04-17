import { z } from 'zod';

import { AlertTypeSchema } from '@/domain/alert';
import { isResponse, jsonOk, readJson } from '@/lib/api';
import { getRepos } from '@/repositories';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const CreateAlertSchema = z.object({
  entity_key: z.string().min(3),
  threshold_inr: z.number().positive(),
  alert_type: AlertTypeSchema,
});

export async function GET() {
  return jsonOk({ alerts: await getRepos().alerts.listByUser(DEMO_USER_ID) });
}

export async function POST(request: Request) {
  const body = await readJson(request, CreateAlertSchema);
  if (isResponse(body)) return body;
  const alert = await getRepos().alerts.create({
    user_id: DEMO_USER_ID,
    is_active: true,
    ...body,
  });
  return jsonOk({ alert }, { status: 201 });
}
