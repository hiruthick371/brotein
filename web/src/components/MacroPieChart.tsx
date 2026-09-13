import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { MACRO_COLORS } from '@brotein/shared';
import type { MacroTotals } from '@brotein/shared';

interface MacroPieChartProps {
  totals: MacroTotals;
}

export default function MacroPieChart({ totals }: MacroPieChartProps) {
  const data = [
    { name: 'Protein', value: Number(totals.proteinG.toFixed(1)), color: MACRO_COLORS.protein },
    { name: 'Carbs', value: Number(totals.carbsG.toFixed(1)), color: MACRO_COLORS.carbs },
    { name: 'Fat', value: Number(totals.fatG.toFixed(1)), color: MACRO_COLORS.fat },
  ];

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return <div className="empty-state">No macro data yet for this range.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          stroke="#14181c"
          strokeWidth={2}
          label={({ name, value }) => `${name}: ${value}g`}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value}g`}
          contentStyle={{
            background: '#1c2228',
            border: '1px solid #2c343c',
            borderRadius: 8,
            color: '#f4f5f6',
          }}
          itemStyle={{ color: '#f4f5f6' }}
          labelStyle={{ color: '#8a9199' }}
        />
        <Legend wrapperStyle={{ color: '#8a9199', fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
