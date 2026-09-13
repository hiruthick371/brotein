import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FoodEntry } from '@brotein/shared';
import { MEAL_TYPE_LABELS } from '@brotein/shared';
import { api } from '../api';
import { colors } from '../theme';

interface EntryListProps {
  entries: FoodEntry[];
  onChanged: () => void;
}

export default function EntryList({ entries, onChanged }: EntryListProps) {
  async function handleDelete(id: string) {
    await api.deleteEntry(id);
    onChanged();
  }

  if (entries.length === 0) {
    return <Text style={styles.empty}>No entries logged yet.</Text>;
  }

  return (
    <View style={{ gap: 8 }}>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.row}>
          <View style={styles.rowTop}>
            <Text style={styles.meal}>{MEAL_TYPE_LABELS[entry.mealType]}</Text>
            <Text style={styles.name}>{entry.foodName}</Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={styles.macro}>{entry.calories.toFixed(0)} kcal</Text>
            <Text style={styles.macro}>P {entry.proteinG.toFixed(1)}g</Text>
            <Text style={styles.macro}>C {entry.carbsG.toFixed(1)}g</Text>
            <Text style={styles.macro}>F {entry.fatG.toFixed(1)}g</Text>
            <TouchableOpacity onPress={() => handleDelete(entry.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textFaint, fontSize: 14 },
  row: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    padding: 12,
  },
  rowTop: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' },
  meal: {
    backgroundColor: 'rgba(0, 224, 84, 0.12)',
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  rowBottom: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  macro: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  delete: { fontSize: 12, color: colors.danger, fontWeight: '600' },
});
