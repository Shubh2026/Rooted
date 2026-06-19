import { useState, useMemo, useCallback } from 'react';
import { useRootedStore } from '../store/useRootedStore';
import { LOGGABLE_ACTIONS } from '../lib/emissionFactors';

export type Category = 'all' | 'transport' | 'food' | 'energy' | 'waste';

/**
 * Custom hook to manage carbon-offsetting actions.
 * Encapsulates filtering, logging, success animations state, and cumulative statistics.
 */
export function useActions() {
  const { logAction, loggedActions } = useRootedStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [successActionId, setSuccessActionId] = useState<string | null>(null);

  // Filter actions based on selected category
  const filteredActions = useMemo(
    () =>
      LOGGABLE_ACTIONS.filter(
        (a) => selectedCategory === 'all' || a.category === selectedCategory
      ),
    [selectedCategory]
  );

  // Compute lifetime offset across all logged items
  const totalOffset = useMemo(
    () => loggedActions.reduce((sum, act) => sum + act.co2Saved, 0),
    [loggedActions]
  );

  // Compute total offset for the current calendar day
  const todayOffset = useMemo(() => {
    const today = new Date().toDateString();
    return loggedActions
      .filter((act) => new Date(act.timestamp).toDateString() === today)
      .reduce((sum, act) => sum + act.co2Saved, 0);
  }, [loggedActions]);

  // Log action with temporary visual feedback state
  const handleLogAction = useCallback(
    (actionId: string) => {
      logAction(actionId);
      setSuccessActionId(actionId);
      setTimeout(() => setSuccessActionId(null), 1600);
    },
    [logAction]
  );

  // Count instances of each action logged by the user
  const loggedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const act of loggedActions) {
      counts[act.actionId] = (counts[act.actionId] || 0) + 1;
    }
    return counts;
  }, [loggedActions]);

  return {
    selectedCategory,
    setSelectedCategory,
    successActionId,
    filteredActions,
    totalOffset,
    todayOffset,
    logAction: handleLogAction,
    loggedCounts,
  };
}
