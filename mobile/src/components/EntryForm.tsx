import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { FoodItem, MealType } from '@brotein/shared';
import { MEAL_TYPE_LABELS, MEAL_TYPES } from '@brotein/shared';
import { api } from '../api';
import { colors } from '../theme';
import AddFoodItemModal from './AddFoodItemModal';

interface EntryFormProps {
  onCreated: () => void;
}

function isGramBased(item: FoodItem): boolean {
  return item.servingUnit.trim().toLowerCase() === 'g';
}

export default function EntryForm({ onCreated }: EntryFormProps) {
  const [mode, setMode] = useState<'search' | 'custom'>('search');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');
  const [amountGrams, setAmountGrams] = useState('100');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [showAddFoodItem, setShowAddFoodItem] = useState(false);

  useEffect(() => {
    if (mode !== 'search' || selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await api.searchFoodItems(query);
        setResults(items);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, selected]);

  function resetForm() {
    setQuery('');
    setResults([]);
    setSelected(null);
    setServings('1');
    setAmountGrams('100');
    setFoodName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setFiberG('');
  }

  function selectItem(item: FoodItem) {
    setSelected(item);
    setServings('1');
    setAmountGrams(String(item.servingSize));
  }

  function effectiveMultiplier(item: FoodItem): number {
    return isGramBased(item)
      ? (Number(amountGrams) || 0) / item.servingSize
      : Number(servings) || 0;
  }

  async function handleSubmit() {
    setError(null);
    try {
      setSubmitting(true);
      if (mode === 'search') {
        if (!selected) {
          throw new Error('Select a food item from the search results');
        }
        await api.createEntry({
          foodItemId: selected.id,
          foodName: selected.name,
          mealType,
          servingMultiplier: effectiveMultiplier(selected),
        });
      } else {
        if (!foodName.trim()) {
          throw new Error('Food name is required');
        }
        await api.createEntry({
          foodName,
          mealType,
          calories: Number(calories) || 0,
          proteinG: Number(proteinG) || 0,
          carbsG: Number(carbsG) || 0,
          fatG: Number(fatG) || 0,
          fiberG: Number(fiberG) || 0,
        });
      }
      resetForm();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Log food</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'search' && styles.toggleBtnActive]}
          onPress={() => setMode('search')}
        >
          <Text style={mode === 'search' ? styles.toggleTextActive : styles.toggleText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'custom' && styles.toggleBtnActive]}
          onPress={() => setMode('custom')}
        >
          <Text style={mode === 'custom' ? styles.toggleTextActive : styles.toggleText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>Meal</Text>
      <View style={styles.mealRow}>
        {MEAL_TYPES.map((mt) => (
          <TouchableOpacity
            key={mt}
            style={[styles.mealChip, mealType === mt && styles.mealChipActive]}
            onPress={() => setMealType(mt)}
          >
            <Text style={mealType === mt ? styles.mealChipTextActive : styles.mealChipText}>
              {MEAL_TYPE_LABELS[mt]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'search' ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Search e.g. rice, dal, chicken..."
            placeholderTextColor={colors.textFaint}
            value={selected ? selected.name : query}
            onChangeText={(text) => {
              setSelected(null);
              setQuery(text);
            }}
          />
          {!selected &&
            results.slice(0, 8).map((item) => (
              <TouchableOpacity key={item.id} style={styles.resultRow} onPress={() => selectItem(item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>
                  {item.calories} kcal / {item.servingSize} {item.servingUnit}
                </Text>
              </TouchableOpacity>
            ))}
          {selected && (
            <View style={styles.selectedBox}>
              <Text style={styles.resultName}>{selected.name}</Text>
              {isGramBased(selected) ? (
                <>
                  <Text style={styles.fieldLabel}>Amount (g)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={amountGrams}
                    onChangeText={setAmountGrams}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>Servings</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={servings}
                    onChangeText={setServings}
                  />
                </>
              )}
              <Text style={styles.resultMeta}>
                = {(selected.calories * effectiveMultiplier(selected)).toFixed(0)} kcal,{' '}
                {(selected.proteinG * effectiveMultiplier(selected)).toFixed(1)}g protein
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Food name"
            placeholderTextColor={colors.textFaint}
            value={foodName}
            onChangeText={setFoodName}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={calories}
            onChangeText={setCalories}
          />
          <TextInput
            style={styles.input}
            placeholder="Protein (g)"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={proteinG}
            onChangeText={setProteinG}
          />
          <TextInput
            style={styles.input}
            placeholder="Carbs (g)"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={carbsG}
            onChangeText={setCarbsG}
          />
          <TextInput
            style={styles.input}
            placeholder="Fat (g)"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={fatG}
            onChangeText={setFatG}
          />
          <TextInput
            style={styles.input}
            placeholder="Fiber (g)"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={fiberG}
            onChangeText={setFiberG}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.submitBtn, styles.flexBtn]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.accentInk} />
              ) : (
                <Text style={styles.submitText}>Add entry</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.flexBtn]}
              onPress={() => setShowAddFoodItem(true)}
            >
              <Text style={styles.secondaryText}>Add as food item</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            "Add entry" logs this once. "Add as food item" saves it to the food database (per
            100g) so you can search and reuse it next time.
          </Text>
        </View>
      )}

      {mode === 'search' && (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.accentInk} />
          ) : (
            <Text style={styles.submitText}>Add entry</Text>
          )}
        </TouchableOpacity>
      )}

      <AddFoodItemModal
        visible={showAddFoodItem}
        initial={{ name: foodName, calories, proteinG, carbsG, fatG, fiberG }}
        onSaved={() => setShowAddFoodItem(false)}
        onClose={() => setShowAddFoodItem(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  heading: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: colors.text },
  error: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    padding: 10,
  },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  toggleBtn: { flex: 1, padding: 8, borderRadius: 999, backgroundColor: colors.panelHover, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.accent },
  toggleText: { color: colors.textMuted, fontWeight: '600' },
  toggleTextActive: { color: colors.accentInk, fontWeight: '700' },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 4,
  },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  mealChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.panelHover },
  mealChipActive: { backgroundColor: colors.accent },
  mealChipText: { color: colors.textMuted, fontSize: 13 },
  mealChipTextActive: { color: colors.accentInk, fontSize: 13, fontWeight: '700' },
  input: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    color: colors.text,
  },
  resultRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  resultName: { fontSize: 14, fontWeight: '600', color: colors.text },
  resultMeta: { fontSize: 12, color: colors.textMuted },
  hint: { fontSize: 12, color: colors.textFaint },
  selectedBox: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 10,
    padding: 10,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    padding: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: {
    color: colors.accentInk,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 13,
  },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  flexBtn: { flex: 1, marginTop: 0 },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 999,
    padding: 13,
    alignItems: 'center',
  },
  secondaryText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
});
