import { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';

export interface AddFoodItemInitialValues {
  name?: string;
  calories?: string;
  proteinG?: string;
  carbsG?: string;
  fatG?: string;
  fiberG?: string;
}

interface AddFoodItemModalProps {
  initial?: AddFoodItemInitialValues;
  onSaved: () => void;
  onClose: () => void;
}

export default function AddFoodItemModal({ initial, onSaved, onClose }: AddFoodItemModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [calories, setCalories] = useState(initial?.calories ?? '');
  const [proteinG, setProteinG] = useState(initial?.proteinG ?? '');
  const [carbsG, setCarbsG] = useState(initial?.carbsG ?? '');
  const [fatG, setFatG] = useState(initial?.fatG ?? '');
  const [fiberG, setFiberG] = useState(initial?.fiberG ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save food item');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Add food item</h3>
        <p className="muted">Enter macros for a 100g serving. You'll enter grams eaten when logging it.</p>
        {error && <div className="error-banner">{error}</div>}
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            Calories / 100g
            <input type="number" min={0} step="any" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </label>
          <label>
            Protein (g) / 100g
            <input type="number" min={0} step="any" value={proteinG} onChange={(e) => setProteinG(e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Carbs (g) / 100g
            <input type="number" min={0} step="any" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} />
          </label>
          <label>
            Fat (g) / 100g
            <input type="number" min={0} step="any" value={fatG} onChange={(e) => setFatG(e.target.value)} />
          </label>
          <label>
            Fiber (g) / 100g
            <input type="number" min={0} step="any" value={fiberG} onChange={(e) => setFiberG(e.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save food item'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
