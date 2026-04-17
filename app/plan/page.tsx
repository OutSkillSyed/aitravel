import { BudgetForm } from '@/components/budget-form';
import { Card } from '@/components/ui/card';

export const metadata = { title: 'Plan your trip' };

export default function PlanIndex() {
  return (
    <div className="container-app py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl">Plan your trip</h1>
        <p className="mt-2 text-ink-muted">
          Pick a budget, origin and vibe. We&apos;ll return three ranked options — Best, Cheapest
          and Comfort — each with a day-by-day plan.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
        <Card className="self-start"><BudgetForm /></Card>
        <aside className="rounded-2xl border border-dashed border-border bg-surface-alt p-6">
          <h2 className="font-display text-xl">How the three options work</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><strong className="text-ink">Best</strong> balances rating, price and convenience.</li>
            <li><strong className="text-ink">Cheapest</strong> minimizes total spend while staying above a quality floor.</li>
            <li><strong className="text-ink">Comfort</strong> maximizes hotel rating and shortest transport.</li>
          </ul>
          <p className="mt-4 text-xs text-ink-muted">
            All pricing comes from adapters (Amadeus / Booking / etc.) — Gemini only writes the
            day-by-day narrative.
          </p>
        </aside>
      </div>
    </div>
  );
}
