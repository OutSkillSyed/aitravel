import { z } from 'zod';

export const TripStatusSchema = z.enum(['draft', 'planning', 'ready', 'booked', 'cancelled']);
export type TripStatus = z.infer<typeof TripStatusSchema>;

export const TripInputSchema = z.object({
  budget_inr: z.number().positive(),
  days: z.number().int().min(1).max(60),
  traveller_count: z.number().int().min(1).max(9).default(1),
  origin: z.string().min(2),
  trip_style: z.string().optional(),
  depart_flex: z.string().optional(),
  optional_destinations: z.array(z.string()).optional(),
});
export type TripInput = z.infer<typeof TripInputSchema>;

export const DayPlanSchema = z.object({
  day: z.number().int().min(1),
  location: z.string(),
  accommodation: z.string(),
  transport: z.string(),
  activities: z.array(z.string()),
  estimated_cost: z.number().nonnegative(),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

export const OptionTypeSchema = z.enum(['best', 'cheapest', 'comfort']);
export type OptionType = z.infer<typeof OptionTypeSchema>;

export const BreakdownSchema = z.object({
  transport: z.number().nonnegative(),
  hotels: z.number().nonnegative(),
  food: z.number().nonnegative(),
  activities: z.number().nonnegative(),
});
export type Breakdown = z.infer<typeof BreakdownSchema>;

export const PlannedOptionSchema = z.object({
  type: OptionTypeSchema,
  total_cost_inr: z.number().nonnegative(),
  score: z.number(),
  breakdown: BreakdownSchema,
  days: z.array(DayPlanSchema),
});
export type PlannedOption = z.infer<typeof PlannedOptionSchema>;

export const PlannerOutputSchema = z.object({
  options: z.array(PlannedOptionSchema).length(3),
});
export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

export const TripSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  budget_inr: z.number().positive(),
  days: z.number().int().positive(),
  traveller_count: z.number().int().min(1),
  origin: z.string(),
  trip_style: z.string().nullable().optional(),
  itinerary_json: PlannerOutputSchema.nullable().optional(),
  status: TripStatusSchema.default('draft'),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});
export type Trip = z.infer<typeof TripSchema>;

export const TripOptionRowSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  option_type: OptionTypeSchema,
  score: z.number(),
  price_total_inr: z.number(),
  breakdown_json: BreakdownSchema,
  option_json: PlannedOptionSchema,
  created_at: z.string().datetime({ offset: true }),
});
export type TripOptionRow = z.infer<typeof TripOptionRowSchema>;
