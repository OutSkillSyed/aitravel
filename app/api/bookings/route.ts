import { z } from 'zod';

import { BookingTypeSchema } from '@/domain/booking';
import { isResponse, jsonOk, readJson } from '@/lib/api';
import { getRepos } from '@/repositories';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const CreateBookingSchema = z.object({
  trip_id: z.string().uuid().nullable().optional(),
  booking_type: BookingTypeSchema,
  supplier_ref: z.string().min(1),
  amount_inr: z.number().nonnegative(),
  booking_json: z.record(z.unknown()).default({}),
});

export async function POST(request: Request) {
  const body = await readJson(request, CreateBookingSchema);
  if (isResponse(body)) return body;
  const booking = await getRepos().bookings.create({
    user_id: DEMO_USER_ID,
    status: 'pending',
    trip_id: body.trip_id ?? null,
    booking_type: body.booking_type,
    supplier_ref: body.supplier_ref,
    amount_inr: body.amount_inr,
    booking_json: body.booking_json,
  });
  return jsonOk({ booking }, { status: 201 });
}

export async function GET() {
  const bookings = await getRepos().bookings.listByUser(DEMO_USER_ID);
  return jsonOk({ bookings });
}
