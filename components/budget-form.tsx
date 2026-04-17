'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TripInputSchema, type TripInput } from '@/domain/trip';
import type { Trip } from '@/domain/trip';

async function createPlan(input: TripInput): Promise<Trip> {
  const res = await fetch('/api/trips/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? 'planner failed');
  }
  const data = (await res.json()) as { trip: Trip };
  return data.trip;
}

export function BudgetForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<TripInput>({
    resolver: zodResolver(TripInputSchema),
    defaultValues: {
      budget_inr: 50000,
      days: 4,
      traveller_count: 2,
      origin: 'DEL',
      trip_style: 'adventure',
    },
  });

  const style = watch('trip_style');
  const origin = watch('origin');

  const mutation = useMutation({
    mutationFn: createPlan,
    onSuccess: (trip) => router.push(`/plan/${trip.id}` as never),
    onError: (err: Error) => setSubmitError(err.message),
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    mutation.mutate(values);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="budget">Budget (INR)</Label>
          <Input id="budget" type="number" inputMode="numeric" {...register('budget_inr', { valueAsNumber: true })} />
          {errors.budget_inr && <p className="mt-1 text-xs text-danger">{errors.budget_inr.message}</p>}
        </div>
        <div>
          <Label htmlFor="days">Days</Label>
          <Input id="days" type="number" inputMode="numeric" min={1} max={60} {...register('days', { valueAsNumber: true })} />
          {errors.days && <p className="mt-1 text-xs text-danger">{errors.days.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="origin">Origin (IATA)</Label>
          <Select value={origin} onValueChange={(v) => setValue('origin', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DEL">Delhi (DEL)</SelectItem>
              <SelectItem value="BOM">Mumbai (BOM)</SelectItem>
              <SelectItem value="BLR">Bengaluru (BLR)</SelectItem>
              <SelectItem value="HYD">Hyderabad (HYD)</SelectItem>
              <SelectItem value="CCU">Kolkata (CCU)</SelectItem>
              <SelectItem value="MAA">Chennai (MAA)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="traveller_count">Travellers</Label>
          <Input id="traveller_count" type="number" min={1} max={9} {...register('traveller_count', { valueAsNumber: true })} />
        </div>
      </div>
      <div>
        <Label htmlFor="trip_style">Vibe</Label>
        <Select value={style ?? 'adventure'} onValueChange={(v) => setValue('trip_style', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="relaxed">Relaxed</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="romantic">Romantic</SelectItem>
            <SelectItem value="backpacker">Backpacker</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {submitError && <p className="text-sm text-danger">{submitError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Assembling trip…' : 'Plan my trip'}
      </Button>
      <p className="text-xs text-ink-muted">
        Built on mock inventory · Amadeus is used when credentials are configured.
      </p>
    </form>
  );
}
