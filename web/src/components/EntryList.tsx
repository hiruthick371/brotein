import type { FoodEntry } from '@brotein/shared';
import { MEAL_TYPE_LABELS } from '@brotein/shared';
import { api } from '../api';

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
    return <div className="empty-state">No entries logged yet.</div>;
  }

  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.id} className="entry-row">
          <div className="entry-main">
            <span className="entry-meal">{MEAL_TYPE_LABELS[entry.mealType]}</span>
            <span className="entry-name">{entry.foodName}</span>
            <span className="entry-time">
              {new Date(entry.loggedAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="entry-macros">
            <span>{entry.calories.toFixed(0)} kcal</span>
            <span>P {entry.proteinG.toFixed(1)}g</span>
            <span>C {entry.carbsG.toFixed(1)}g</span>
            <span>F {entry.fatG.toFixed(1)}g</span>
          </div>
          <button type="button" className="delete-btn" onClick={() => handleDelete(entry.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
