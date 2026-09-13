import { StyleSheet, Text, View } from 'react-native';
import type { DailyGoal, MacroTotals } from '@brotein/shared';
import { colors } from '../theme';

interface GoalsVsTotalsProps {
  totals: MacroTotals;
  goal: DailyGoal | null;
}

function Row({ label, value, target, unit }: { label: string; value: number; target?: number; unit: string }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value.toFixed(0)}
          {unit}
          {target ? ` / ${target.toFixed(0)}${unit}` : ''}
        </Text>
      </View>
      {pct !== null && (
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      )}
    </View>
  );
}

export default function GoalsVsTotals({ totals, goal }: GoalsVsTotalsProps) {
  return (
    <View>
      <Row label="Calories" value={totals.calories} target={goal?.calorieTarget} unit=" kcal" />
      <Row label="Protein" value={totals.proteinG} target={goal?.proteinTarget} unit="g" />
      <Row label="Carbs" value={totals.carbsG} target={goal?.carbsTarget} unit="g" />
      <Row label="Fat" value={totals.fatG} target={goal?.fatTarget} unit="g" />
      <Row label="Fiber" value={totals.fiberG} unit="g" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: colors.text, fontWeight: '600' },
  value: { fontSize: 14, color: colors.text, fontWeight: '600' },
  bar: { height: 6, backgroundColor: colors.border, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 999 },
});
