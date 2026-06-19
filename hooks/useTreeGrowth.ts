import { useMemo } from 'react';
import { useRootedStore } from '../store/useRootedStore';
import { getTreeStage, TreeStageInfo } from '../components/tree/AnimatedTreeSVG';

export interface HealthStatus {
  label: 'Flourishing' | 'Vibrant' | 'Withered' | 'Critical';
  color: string;
}

/**
 * Computes growth progress percentage based on:
 * - Footprint reduction (50% weight, target 35%)
 * - Actions count (40% weight, target 50 actions)
 * - Streak consistency (10% weight, target 7 days)
 */
export function computeGrowthProgress(
  baselineTotal: number,
  currentTotal: number,
  actionsCount: number,
  streak: number
): number {
  const saved = Math.max(0, baselineTotal - currentTotal);
  const reductionPct = baselineTotal > 0 ? (saved / baselineTotal) * 100 : 0;
  const footprintFactor = Math.min(100, (reductionPct / 35) * 100);
  const actionFactor = Math.min(100, (actionsCount / 50) * 100);
  const streakFactor = Math.min(100, (streak / 7) * 100);
  return Math.min(
    100,
    Math.round(footprintFactor * 0.5 + actionFactor * 0.4 + streakFactor * 0.1)
  );
}

/**
 * Retrieves the health label and text color based on numeric health value.
 */
export function getHealthStatus(health: number): HealthStatus {
  if (health >= 80) return { label: 'Flourishing', color: 'text-emerald-400' };
  if (health >= 55) return { label: 'Vibrant', color: 'text-forest-400' };
  if (health >= 35) return { label: 'Withered', color: 'text-amber-500' };
  return { label: 'Critical', color: 'text-red-500' };
}

/**
 * Custom hook to encapsulate all tree growth, level progress, contributions,
 * and health computations from the Zustand store.
 */
export function useTreeGrowth() {
  const {
    currentFootprint,
    baselineFootprint,
    loggedActions,
    streak,
    treeHealth,
  } = useRootedStore();

  const currentTotal = useMemo(() => currentFootprint?.total ?? 0, [currentFootprint]);
  const baselineTotal = useMemo(
    () => baselineFootprint?.total ?? currentTotal,
    [baselineFootprint, currentTotal]
  );
  const savedTotal = useMemo(() => Math.max(0, baselineTotal - currentTotal), [baselineTotal, currentTotal]);
  
  const reductionPercent = useMemo(
    () => (baselineTotal > 0 ? (savedTotal / baselineTotal) * 100 : 0),
    [savedTotal, baselineTotal]
  );

  const growthProgress = useMemo(
    () => computeGrowthProgress(baselineTotal, currentTotal, loggedActions.length, streak),
    [baselineTotal, currentTotal, loggedActions.length, streak]
  );

  const stageInfo = useMemo(() => getTreeStage(growthProgress), [growthProgress]);
  const isAncient = stageInfo.stage === 5;
  const healthStatus = useMemo(() => getHealthStatus(treeHealth), [treeHealth]);

  // Memoized XP contribution breakdown
  const contributions = useMemo(() => {
    const reductionPct = baselineTotal > 0 ? (savedTotal / baselineTotal) * 100 : 0;
    return {
      footprintContrib: Math.round(Math.min(100, (reductionPct / 35) * 100) * 0.5),
      actionContrib: Math.round(Math.min(100, (loggedActions.length / 50) * 100) * 0.4),
      streakContrib: Math.round(Math.min(100, (streak / 7) * 100) * 0.1),
    };
  }, [savedTotal, baselineTotal, loggedActions.length, streak]);

  return {
    growthProgress,
    stageInfo,
    isAncient,
    healthStatus,
    reductionPercent,
    savedTotal,
    baselineTotal,
    currentTotal,
    contributions,
  };
}
