import { FormEvent, useState } from 'react';
import type { DailyGoal } from '@brotein/shared';
import { api } from '../api';

interface GoalsEditorProps {
  goal: DailyGoal;
  onSaved: (goal: DailyGoal) => void;
  onClose: () => void;
}

export default function GoalsEditor({ goal, onSaved, onClose }: GoalsEditorProps) {
  const [calorieTarget, setCalorieTarget] = useState(String(goal.calorieTarget));
  const [proteinTarget, setProteinTarget] = useState(String(goal.proteinTarget));
  const [carbsTarget, setCarbsTarget] = useState(String(goal.carbsTarget));
  const [fatTarget, setFatTarget] = useState(String(goal.fatTarget));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Edit daily goals</h3>
        <label>
          Calorie target
          <input type="number" min={0} step="any" value={calorieTarget} onChange={(e) => setCalorieTarget(e.target.value)} />
        </label>
        <label>
          Protein target (g)
          <input type="number" min={0} step="any" value={proteinTarget} onChange={(e) => setProteinTarget(e.target.value)} />
        </label>
        <label>
          Carbs target (g)
          <input type="number" min={0} step="any" value={carbsTarget} onChange={(e) => setCarbsTarget(e.target.value)} />
        </label>
        <label>
          Fat target (g)
          <input type="number" min={0} step="any" value={fatTarget} onChange={(e) => setFatTarget(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save goals'}
          </button>
        </div>
      </form>
    </div>
  );
}
