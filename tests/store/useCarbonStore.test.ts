/**
 * tests/store/useCarbonStore.test.ts
 *
 * Integration and unit tests for the Zustand store (useRootedStore).
 * Covers: Onboarding completion, action logging, streak calculation, tree growth stages,
 * XP calculation, and reset actions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRootedStore } from '../../store/useRootedStore';
import { OnboardingAnswers } from '../../lib/calculations';

const dummyAnswers: OnboardingAnswers = {
  name: 'Carbon Hero',
  transportMode: 'electric',
  transportDistance: 120,
  dietType: 'vegan',
  energyBill: 150,
  cleanEnergyRatio: 100,
  shortFlights: 1,
  longFlights: 0,
  shoppingStyle: 'eco',
};

describe('useRootedStore (Zustand Carbon Store)', () => {
  beforeEach(() => {
    useRootedStore.getState().resetProgress();
    vi.useFakeTimers();
  });

  it('initializes with default state', () => {
    const state = useRootedStore.getState();
    expect(state.user).toBeNull();
    expect(state.baselineFootprint).toBeNull();
    expect(state.currentFootprint).toBeNull();
    expect(state.loggedActions).toHaveLength(0);
    expect(state.streak).toBe(1);
    expect(state.growthPoints).toBe(100);
    expect(state.treeHealth).toBe(50);
  });

  it('completes onboarding and calculates baseline carbon footprint', () => {
    const store = useRootedStore.getState();
    store.completeOnboarding(dummyAnswers);

    const updatedState = useRootedStore.getState();
    expect(updatedState.user).toEqual({ name: 'Carbon Hero', onboardingComplete: true });
    expect(updatedState.baselineFootprint).not.toBeNull();
    expect(updatedState.currentFootprint).not.toBeNull();
    expect(updatedState.baselineFootprint?.total).toBe(updatedState.currentFootprint?.total);
  });

  it('logs actions, offsets footprint, increases XP/growthPoints and updates tree health', () => {
    const store = useRootedStore.getState();
    store.completeOnboarding(dummyAnswers);

    const initialCurrent = useRootedStore.getState().currentFootprint!;
    const initialXP = useRootedStore.getState().growthPoints;
    const initialHealth = useRootedStore.getState().treeHealth;

    // Log walk/cycle trip action
    useRootedStore.getState().logAction('walk_bike_trip');

    const updatedState = useRootedStore.getState();
    expect(updatedState.loggedActions).toHaveLength(1);
    expect(updatedState.loggedActions[0].actionId).toBe('walk_bike_trip');
    expect(updatedState.currentFootprint!.total).toBeLessThan(initialCurrent.total);
    expect(updatedState.growthPoints).toBeGreaterThan(initialXP);
    expect(updatedState.treeHealth).toBeGreaterThanOrEqual(initialHealth);
  });

  it('preserves or increments streak on sequential daily logs', () => {
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
    const store = useRootedStore.getState();
    store.completeOnboarding(dummyAnswers);

    // Day 1
    store.logAction('walk_bike_trip');
    expect(useRootedStore.getState().streak).toBe(1);

    // Move to next day
    vi.setSystemTime(new Date('2026-06-16T12:00:00Z'));
    useRootedStore.getState().logAction('ate_vegan');
    expect(useRootedStore.getState().streak).toBe(2);

    // Skip to 3 days later (streak should break and reset)
    vi.setSystemTime(new Date('2026-06-19T12:00:00Z'));
    useRootedStore.getState().logAction('line_dry_laundry');
    expect(useRootedStore.getState().streak).toBe(1);
  });

  it('resets progress cleanly to initial state', () => {
    const store = useRootedStore.getState();
    store.completeOnboarding(dummyAnswers);
    store.logAction('walk_bike_trip');

    store.resetProgress();

    const clearedState = useRootedStore.getState();
    expect(clearedState.user).toBeNull();
    expect(clearedState.loggedActions).toHaveLength(0);
    expect(clearedState.growthPoints).toBe(100);
    expect(clearedState.treeHealth).toBe(50);
  });
});
