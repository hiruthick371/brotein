import { useCallback, useEffect, useState } from 'react';
import type { DailyGoal, DailySummary, RangeSummary } from '@brotein/shared';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import MacroPieChart from '../components/MacroPieChart';
import GoalsVsTotals from '../components/GoalsVsTotals';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';
import GoalsEditor from '../components/GoalsEditor';
import AddFoodItemModal from '../components/AddFoodItemModal';
import BrandMark from '../components/BrandMark';

type ViewMode = 'daily' | 'weekly' | 'monthly';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const [date, setDate] = useState(todayStr());
  const [from, setFrom] = useState(daysAgoStr(6));
  const [to, setTo] = useState(todayStr());
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [rangeSummary, setRangeSummary] = useState<RangeSummary | null>(null);
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);
  const [showAddFoodItem, setShowAddFoodItem] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
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
          const summary = await api.getMonthlySummary(month, year);
          if (!cancelled) {
            setRangeSummary(summary);
            setGoal(summary.goal);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load summary');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [viewMode, date, from, to, month, year, refreshKey]);

  const totals =
    viewMode === 'daily' ? dailySummary?.totals : rangeSummary?.totals;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>
            <BrandMark size={28} />
            Brotein
          </h1>
          <p className="muted">Welcome back, {user?.name}</p>
        </div>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <div className="view-tabs">
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            className={viewMode === mode ? 'active' : ''}
            onClick={() => setViewMode(mode)}
          >
            {mode[0].toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="date-controls">
        {viewMode === 'daily' && (
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        )}
        {viewMode === 'weekly' && (
          <>
            <label>
              From
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        )}
        {viewMode === 'monthly' && (
          <>
            <label>
              Month
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString(undefined, { month: 'long' })}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Year
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </label>
          </>
        )}
        <button type="button" onClick={() => setShowGoalsEditor(true)}>
          Edit goals
        </button>
        <button type="button" onClick={() => setShowAddFoodItem(true)}>
          Add food item
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="muted">Loading...</div>}

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Macro split</h2>
          {totals && <MacroPieChart totals={totals} />}
        </section>

        <section className="panel">
          <h2>Totals vs goals</h2>
          {totals && <GoalsVsTotals totals={totals} goal={goal} />}
        </section>

        {viewMode !== 'daily' && rangeSummary && (
          <section className="panel panel-wide">
            <h2>Daily breakdown</h2>
            {rangeSummary.days.length === 0 ? (
              <div className="empty-state">No entries in this range.</div>
            ) : (
              <ul className="day-breakdown">
                {rangeSummary.days.map((day) => (
                  <li key={day.date}>
                    <span>{day.date}</span>
                    <span>{day.totals.calories.toFixed(0)} kcal</span>
                    <span>P {day.totals.proteinG.toFixed(0)}g</span>
                    <span>C {day.totals.carbsG.toFixed(0)}g</span>
                    <span>F {day.totals.fatG.toFixed(0)}g</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {viewMode === 'daily' && (
          <>
            <section className="panel panel-wide">
              <EntryForm onCreated={refresh} />
            </section>
            <section className="panel panel-wide">
              <h2>Entries for {date}</h2>
              <EntryList entries={dailySummary?.entries ?? []} onChanged={refresh} />
            </section>
          </>
        )}
      </div>

      {showGoalsEditor && goal && (
        <GoalsEditor
          goal={goal}
          onSaved={(updated) => setGoal(updated)}
          onClose={() => setShowGoalsEditor(false)}
        />
      )}

      {showAddFoodItem && (
        <AddFoodItemModal onSaved={refresh} onClose={() => setShowAddFoodItem(false)} />
      )}
    </div>
  );
}
