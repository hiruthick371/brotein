import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { DailyGoal, DailySummary, RangeSummary } from '@brotein/shared';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import MacroPieChart from '../components/MacroPieChart';
import GoalsVsTotals from '../components/GoalsVsTotals';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';
import GoalsEditorModal from '../components/GoalsEditorModal';
import AddFoodItemModal from '../components/AddFoodItemModal';
import BrandMark from '../components/BrandMark';
import { colors } from '../theme';

type ViewMode = 'daily' | 'weekly' | 'monthly';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const [date, setDate] = useState(todayStr());
  const [from, setFrom] = useState(daysAgoStr(6));
  const [to, setTo] = useState(todayStr());
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [rangeSummary, setRangeSummary] = useState<RangeSummary | null>(null);
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);
  const [showAddFoodItem, setShowAddFoodItem] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        if (viewMode === 'daily') {
          const summary = await api.getDailySummary(date);
          if (!cancelled) {
            setDailySummary(summary);
            setGoal(summary.goal);
          }
        } else if (viewMode === 'weekly') {
          const summary = await api.getWeeklySummary(from, to);
          if (!cancelled) {
            setRangeSummary(summary);
            setGoal(summary.goal);
          }
        } else {
          const summary = await api.getMonthlySummary(Number(month), Number(year));
          if (!cancelled) {
            setRangeSummary(summary);
            setGoal(summary.goal);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load summary');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [viewMode, date, from, to, month, year, refreshKey]);

  const totals = viewMode === 'daily' ? dailySummary?.totals : rangeSummary?.totals;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <BrandMark size={32} />
          <View>
            <Text style={styles.title}>Brotein</Text>
            <Text style={styles.muted}>Welcome back, {user?.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.tabBtn, viewMode === mode && styles.tabBtnActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={viewMode === mode ? styles.tabTextActive : styles.tabText}>
              {mode[0].toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'daily' && (
        <View style={styles.dateRow}>
          <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            value={date}
            onChangeText={setDate}
          />
        </View>
      )}
      {viewMode === 'weekly' && (
        <View style={styles.dateRow}>
          <Text style={styles.fieldLabel}>From</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            value={from}
            onChangeText={setFrom}
          />
          <Text style={styles.fieldLabel}>To</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            value={to}
            onChangeText={setTo}
          />
        </View>
      )}
      {viewMode === 'monthly' && (
        <View style={styles.dateRow}>
          <Text style={styles.fieldLabel}>Month (1-12)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            keyboardType="number-pad"
            value={month}
            onChangeText={setMonth}
          />
          <Text style={styles.fieldLabel}>Year</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.textFaint}
            keyboardType="number-pad"
            value={year}
            onChangeText={setYear}
          />
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editGoalsBtn} onPress={() => setShowGoalsEditor(true)}>
          <Text style={styles.editGoalsText}>Edit goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editGoalsBtn} onPress={() => setShowAddFoodItem(true)}>
          <Text style={styles.editGoalsText}>Add food item</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Macro split</Text>
        {totals && <MacroPieChart totals={totals} />}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Totals vs goals</Text>
        {totals && <GoalsVsTotals totals={totals} goal={goal} />}
      </View>

      {viewMode !== 'daily' && rangeSummary && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Daily breakdown</Text>
          {rangeSummary.days.length === 0 ? (
            <Text style={styles.muted}>No entries in this range.</Text>
          ) : (
            rangeSummary.days.map((day) => (
              <View key={day.date} style={styles.dayRow}>
                <Text style={styles.dayText}>{day.date}</Text>
                <Text style={styles.dayText}>{day.totals.calories.toFixed(0)} kcal</Text>
              </View>
            ))
          )}
        </View>
      )}

      {viewMode === 'daily' && (
        <>
          <View style={styles.panel}>
            <EntryForm onCreated={refresh} />
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Entries for {date}</Text>
            <EntryList entries={dailySummary?.entries ?? []} onChanged={refresh} />
          </View>
        </>
      )}

      {goal && (
        <GoalsEditorModal
          visible={showGoalsEditor}
          goal={goal}
          onSaved={setGoal}
          onClose={() => setShowGoalsEditor(false)}
        />
      )}

      <AddFoodItemModal
        visible={showAddFoodItem}
        onSaved={refresh}
        onClose={() => setShowAddFoodItem(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 13 },
  logoutBtn: { backgroundColor: colors.panelHover, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  logoutText: { color: colors.text, fontWeight: '600', fontSize: 12 },
  tabRow: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    padding: 4,
  },
  tabBtn: { flex: 1, padding: 8, borderRadius: 999, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: colors.accentInk, fontWeight: '700', fontSize: 13 },
  dateRow: { gap: 6 },
  fieldLabel: {
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
    color: colors.text,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  editGoalsBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  editGoalsText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  error: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    padding: 10,
  },
  panel: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    padding: 18,
    gap: 8,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.textMuted,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  dayText: { fontSize: 13, color: colors.text },
});
