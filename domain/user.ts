import { z } from 'zod';

export const PreferencesSchema = z
  .object({
    style: z.string().optional(),
    diet: z.string().optional(),
    accessibility: z.array(z.string()).optional(),
  })
  .passthrough();

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  preferences_json: PreferencesSchema.default({}),
  created_at: z.string().datetime({ offset: true }),
});
export type User = z.infer<typeof UserSchema>;

export const TravellerSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  passport_number: z.string().nullable().optional(),
  passport_country: z.string().length(2).nullable().optional(),
  created_at: z.string().datetime({ offset: true }),
});
export type Traveller = z.infer<typeof TravellerSchema>;
