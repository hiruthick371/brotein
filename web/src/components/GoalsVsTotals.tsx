import type { DailyGoal, MacroTotals } from '@brotein/shared';

interface GoalsVsTotalsProps {
  totals: MacroTotals;
  goal: DailyGoal | null;
}

interface RowProps {
  label: string;
  value: number;
  target?: number;
  unit: string;
}

function Row({ label, value, target, unit }: RowProps) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <div className="goal-row">
      <div className="goal-row-header">
        <span>{label}</span>
        <span>
          {value.toFixed(0)}
          {unit}
          {target ? ` / ${target.toFixed(0)}${unit}` : ''}
        </span>
      </div>
      {pct !== null && (
        <div className="goal-bar">
          <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

export default function GoalsVsTotals({ totals, goal }: GoalsVsTotalsProps) {
  return (
    <div className="goals-vs-totals">
      <Row label="Calories" value={totals.calories} target={goal?.calorieTarget} unit=" kcal" />
      <Row label="Protein" value={totals.proteinG} target={goal?.proteinTarget} unit="g" />
      <Row label="Carbs" value={totals.carbsG} target={goal?.carbsTarget} unit="g" />
      <Row label="Fat" value={totals.fatG} target={goal?.fatTarget} unit="g" />
      <Row label="Fiber" value={totals.fiberG} unit="g" />
    </div>
  );
}
