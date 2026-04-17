/**
 * Deterministic option scoring — given a cost breakdown + quality signals,
 * produce a numeric score per persona. Higher is better. The planner uses
 * this to pick which of the 3 persona-tuned candidates wins.
 */

import type { Breakdown, OptionType } from '@/domain/trip';

export interface ScoreInputs {
  totalCostInr: number;
  budgetInr: number;
  avgHotelRating: number; // 0-5
  transportStops: number;
  transportHours: number;
}

export function scoreOption(persona: OptionType, x: ScoreInputs): number {
  const spendRatio = x.totalCostInr / x.budgetInr;
  const budgetRoom = Math.max(0, 1 - spendRatio);
  const rating = x.avgHotelRating / 5;
  const stopsPenalty = 1 / (1 + x.transportStops);
  const travelTimePenalty = Math.max(0, 1 - x.transportHours / 24);
  const overBudgetPenalty = Math.max(0, spendRatio - 1);

  switch (persona) {
    case 'cheapest':
      return 0.7 * budgetRoom + 0.2 * rating + 0.1 * stopsPenalty;
    case 'comfort':
      return 0.5 * rating + 0.3 * stopsPenalty + 0.2 * travelTimePenalty - 0.5 * overBudgetPenalty;
    case 'best':
    default:
      return 0.35 * budgetRoom + 0.35 * rating + 0.2 * stopsPenalty + 0.1 * travelTimePenalty;
  }
}

export function allocateBreakdown(totalInr: number, style: string | undefined): Breakdown {
  // Rough heuristic allocation — planner may override once day plan is generated.
  const isAdventure = style === 'adventure' || style === 'backpacker';
  const transportShare = 0.35;
  const hotelShare = isAdventure ? 0.28 : 0.35;
  const foodShare = 0.18;
  const activityShare = Math.max(0, 1 - transportShare - hotelShare - foodShare);
  return {
    transport: Math.round(totalInr * transportShare),
    hotels: Math.round(totalInr * hotelShare),
    food: Math.round(totalInr * foodShare),
    activities: Math.round(totalInr * activityShare),
  };
}
