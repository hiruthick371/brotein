import { FormEvent, useEffect, useRef, useState } from 'react';
import type { FoodItem, MealType } from '@brotein/shared';
import { MEAL_TYPE_LABELS, MEAL_TYPES } from '@brotein/shared';
import { api } from '../api';
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
  const [loggedAt, setLoggedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // search mode state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [amountGrams, setAmountGrams] = useState(100);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // custom mode state
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
    setServings(1);
    setAmountGrams(100);
    setFoodName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setFiberG('');
  }

  function selectItem(item: FoodItem) {
    setSelected(item);
    setServings(1);
    setAmountGrams(item.servingSize);
  }

  function effectiveMultiplier(item: FoodItem): number {
    return isGramBased(item) ? amountGrams / item.servingSize : servings;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
          loggedAt: new Date(loggedAt).toISOString(),
          servingMultiplier: effectiveMultiplier(selected),
        });
      } else {
        if (!foodName.trim()) {
          throw new Error('Food name is required');
        }
        await api.createEntry({
          foodName,
          mealType,
          loggedAt: new Date(loggedAt).toISOString(),
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
    <form className="entry-form" onSubmit={handleSubmit}>
      <h3>Log food</h3>
      {error && <div className="error-banner">{error}</div>}

      <div className="mode-toggle">
        <button
          type="button"
          className={mode === 'search' ? 'active' : ''}
          onClick={() => setMode('search')}
        >
          Search database
        </button>
        <button
          type="button"
          className={mode === 'custom' ? 'active' : ''}
          onClick={() => setMode('custom')}
        >
          Custom entry
        </button>
      </div>

      <div className="form-row">
        <label>
          Meal
          <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            {MEAL_TYPES.map((mt) => (
              <option key={mt} value={mt}>
                {MEAL_TYPE_LABELS[mt]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Logged at
          <input
            type="datetime-local"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
          />
        </label>
      </div>

      {mode === 'search' ? (
        <div className="search-block">
          <label>
            Food item
            <input
              type="text"
              placeholder="Search e.g. rice, dal, chicken..."
              value={selected ? selected.name : query}
              onChange={(e) => {
                setSelected(null);
                setQuery(e.target.value);
              }}
            />
          </label>
          {!selected && results.length > 0 && (
            <ul className="autocomplete-list">
              {results.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => selectItem(item)}>
                    <span>{item.name}</span>
                    <span className="muted">
                      {item.calories} kcal / {item.servingSize} {item.servingUnit}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selected && (
            <div className="selected-food">
              <p>
                {selected.name} — {selected.calories} kcal, {selected.proteinG}g protein per{' '}
                {selected.servingSize} {selected.servingUnit}
              </p>
              {isGramBased(selected) ? (
                <label>
                  Amount (g)
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={amountGrams}
                    onChange={(e) => setAmountGrams(Number(e.target.value))}
                  />
                </label>
              ) : (
                <label>
                  Servings
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                  />
                </label>
              )}
              <p className="muted">
                = {(selected.calories * effectiveMultiplier(selected)).toFixed(0)} kcal,{' '}
                {(selected.proteinG * effectiveMultiplier(selected)).toFixed(1)}g protein,{' '}
                {(selected.carbsG * effectiveMultiplier(selected)).toFixed(1)}g carbs,{' '}
                {(selected.fatG * effectiveMultiplier(selected)).toFixed(1)}g fat
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="custom-block">
          <label>
            Food name
            <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Calories
              <input type="number" min={0} step="any" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </label>
            <label>
              Protein (g)
              <input type="number" min={0} step="any" value={proteinG} onChange={(e) => setProteinG(e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Carbs (g)
              <input type="number" min={0} step="any" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} />
            </label>
            <label>
              Fat (g)
              <input type="number" min={0} step="any" value={fatG} onChange={(e) => setFatG(e.target.value)} />
            </label>
            <label>
              Fiber (g)
              <input type="number" min={0} step="any" value={fiberG} onChange={(e) => setFiberG(e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add entry'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowAddFoodItem(true)}
            >
              Add as food item
            </button>
          </div>
          <p className="muted">
            "Add entry" logs this once. "Add as food item" saves it to the food database
            (per 100g) so you can search and reuse it next time.
          </p>
        </div>
      )}

      {mode === 'search' && (
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add entry'}
        </button>
      )}

      {showAddFoodItem && (
        <AddFoodItemModal
          initial={{
            name: foodName,
            calories,
            proteinG,
            carbsG,
            fatG,
            fiberG,
          }}
          onSaved={() => setShowAddFoodItem(false)}
          onClose={() => setShowAddFoodItem(false)}
        />
      )}
    </form>
  );
}
