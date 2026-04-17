import { PlanResultClient } from '@/components/plan-result-client';

export const metadata = { title: 'Your trip' };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ option?: string }>;
};

/**
 * Thin server shell. Actual rendering is client-side so it can read from
 * sessionStorage — our mocks-first persistence layer doesn't survive across
 * Vercel serverless invocations. The sessionStorage cache is populated by
 * the budget form immediately after POST /api/trips/plan succeeds.
 */
export default async function PlanResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { option } = await searchParams;
  return <PlanResultClient id={id} defaultOption={option} />;
}
