import { Card } from '@/components/ui/card';
import { formatInr } from '@/lib/utils';
import type { PlannedOption } from '@/domain/trip';

export function DayPlanList({ option }: { option: PlannedOption }) {
  return (
    <ol className="space-y-4">
      {option.days.map((d) => (
        <li key={d.day}>
          <Card className="grid gap-4 md:grid-cols-[120px_1fr_160px]">
            <div className="font-display text-2xl text-primary">Day {d.day}</div>
            <div>
              <h3 className="font-display text-xl">{d.location}</h3>
              <p className="mt-1 text-sm text-ink-muted">{d.transport} · Stay: {d.accommodation}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {d.activities.map((a, i) => (
                  <li key={i} className="before:mr-2 before:text-primary before:content-['◆']">{a}</li>
                ))}
              </ul>
            </div>
            <div className="text-right text-sm text-ink-muted md:text-right">
              Estimated spend
              <div className="mt-1 font-display text-xl text-ink-dark">
                {formatInr(d.estimated_cost)}
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ol>
  );
}
