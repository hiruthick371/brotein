import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { DailyGoal } from '@brotein/shared';
import { api } from '../api';
import { colors } from '../theme';

interface GoalsEditorModalProps {
  visible: boolean;
  goal: DailyGoal;
  onSaved: (goal: DailyGoal) => void;
  onClose: () => void;
}

export default function GoalsEditorModal({ visible, goal, onSaved, onClose }: GoalsEditorModalProps) {
  const [calorieTarget, setCalorieTarget] = useState(String(goal.calorieTarget));
  const [proteinTarget, setProteinTarget] = useState(String(goal.proteinTarget));
  const [carbsTarget, setCarbsTarget] = useState(String(goal.carbsTarget));
  const [fatTarget, setFatTarget] = useState(String(goal.fatTarget));
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    setSubmitting(true);
    try {
      const updated = await api.updateGoals({
        calorieTarget: Number(calorieTarget),
        proteinTarget: Number(proteinTarget),
        carbsTarget: Number(carbsTarget),
        fatTarget: Number(fatTarget),
      });
      onSaved(updated);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit daily goals</Text>
          <Text style={styles.label}>Calorie target</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={calorieTarget}
            onChangeText={setCalorieTarget}
          />
          <Text style={styles.label}>Protein target (g)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={proteinTarget}
            onChangeText={setProteinTarget}
          />
          <Text style={styles.label}>Carbs target (g)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={carbsTarget}
            onChangeText={setCarbsTarget}
          />
          <Text style={styles.label}>Fat target (g)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={fatTarget}
            onChangeText={setFatTarget}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
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
  title: { fontSize: 17, fontWeight: '800', marginBottom: 4, color: colors.text },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
    color: colors.text,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.panelHover },
  cancelText: { color: colors.textMuted, fontWeight: '600' },
  saveBtn: { padding: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.accent },
  saveText: { color: colors.accentInk, fontWeight: '700' },
});
