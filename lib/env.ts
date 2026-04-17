import { z } from 'zod';

const serverSchema = z.object({
  AMADEUS_API_KEY: z.string().optional(),
  AMADEUS_API_SECRET: z.string().optional(),
  AMADEUS_BASE_URL: z.string().url().default('https://test.api.amadeus.com'),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  BOOKING_COM_AFFILIATE_ID: z.string().optional(),
  BOOKING_COM_API_KEY: z.string().optional(),
  RAILYATRI_API_KEY: z.string().optional(),
  REDBUS_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-pro-latest'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  FCM_SERVER_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_MAPS_API_KEY: z.string().optional(),
});

export const serverEnv = (() => {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv cannot be imported in client components');
  }
  return serverSchema.parse(process.env);
})();

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_MAPS_API_KEY: process.env.NEXT_PUBLIC_MAPS_API_KEY,
});
