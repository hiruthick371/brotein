import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { colors } from '../theme';

export interface AddFoodItemInitialValues {
  name?: string;
  calories?: string;
  proteinG?: string;
  carbsG?: string;
  fatG?: string;
  fiberG?: string;
}

interface AddFoodItemModalProps {
  visible: boolean;
  initial?: AddFoodItemInitialValues;
  onSaved: () => void;
  onClose: () => void;
}

export default function AddFoodItemModal({ visible, initial, onSaved, onClose }: AddFoodItemModalProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setCalories(initial?.calories ?? '');
      setProteinG(initial?.proteinG ?? '');
      setCarbsG(initial?.carbsG ?? '');
      setFatG(initial?.fatG ?? '');
      setFiberG(initial?.fiberG ?? '');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function reset() {
    setName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setFiberG('');
    setError(null);
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      await api.createFoodItem({
        name: name.trim(),
        servingSize: 100,
        servingUnit: 'g',
        calories: Number(calories) || 0,
        proteinG: Number(proteinG) || 0,
        carbsG: Number(carbsG) || 0,
        fatG: Number(fatG) || 0,
        fiberG: Number(fiberG) || 0,
      });
      onSaved();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save food item');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Add food item</Text>
          <Text style={styles.hint}>
            Enter macros for a 100g serving. You'll enter grams eaten when logging it.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories / 100g"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={calories}
            onChangeText={setCalories}
          />
          <TextInput
            style={styles.input}
            placeholder="Protein (g) / 100g"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={proteinG}
            onChangeText={setProteinG}
          />
          <TextInput
            style={styles.input}
            placeholder="Carbs (g) / 100g"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={carbsG}
            onChangeText={setCarbsG}
          />
          <TextInput
            style={styles.input}
            placeholder="Fat (g) / 100g"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={fatG}
            onChangeText={setFatG}
          />
          <TextInput
            style={styles.input}
            placeholder="Fiber (g) / 100g"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={fiberG}
            onChangeText={setFiberG}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
              <Text style={styles.saveText}>{submitting ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    padding: 22,
    gap: 8,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  hint: { fontSize: 12, color: colors.textFaint, marginBottom: 4 },
  error: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    padding: 8,
  },
  input: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    color: colors.text,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.panelHover },
  cancelText: { color: colors.textMuted, fontWeight: '600' },
  saveBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.accent },
  saveText: { color: colors.accentInk, fontWeight: '700' },
});
