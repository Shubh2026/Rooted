/**
 * tests/store.test.ts
 *
 * Unit tests for streak logic and badge unlocking
 * extracted from useRootedStore.ts into pure testable functions.
 *
 * NOTE: We test the business-logic functions directly (not Zustand internals)
 * so no browser/DOM environment is required.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Pure streak calculation (mirrors useRootedStore logic) ───────────────────
function computeStreak(currentStreak: number, lastLoggedDate: string | null): number {
  const todayStr = new Date().toDateString();
  if (!lastLoggedDate) return 1;

  const lastDate = new Date(lastLoggedDate);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate.toDateString() === yesterday.toDateString()) return currentStreak + 1;
  if (lastDate.toDateString() === todayStr) return currentStreak; // same day — no change
  return 1; // gap > 1 day — reset
}

// ─── Pure badge unlock logic (mirrors useRootedStore) ─────────────────────────
type ActionEntry = { actionId: string; category: string };

function shouldUnlockBadge(
  badgeId: string,
  streak: number,
  actionHistory: ActionEntry[]
): boolean {
  switch (badgeId) {
    case 'first_steps':
      return actionHistory.length >= 1;
    case 'streak_3':
      return streak >= 3;
    case 'vegan_vanguard':
      return actionHistory.filter(a => a.actionId === 'ate_vegan').length >= 5;
    case 'transit_pro':
      return actionHistory.filter(a => a.category === 'transport').length >= 5;
    case 'energy_saver':
      return actionHistory.filter(a => a.category === 'energy').length >= 5;
    default:
      return false;
  }
}

// ─── XP calculation ───────────────────────────────────────────────────────────
function computeXPGain(
  actionPoints: number,
  newlyCompletedChallenge: boolean,
  newlyUnlockedBadge: boolean
): number {
  return actionPoints + (newlyCompletedChallenge ? 50 : 0) + (newlyUnlockedBadge ? 100 : 0);
}

// ─── tree health update ───────────────────────────────────────────────────────
function computeNewHealth(currentHealth: number, actionPoints: number): number {
  return Math.min(100, currentHealth + Math.ceil(actionPoints / 5));
}

// ─── STREAK TESTS ─────────────────────────────────────────────────────────────
describe('computeStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T10:00:00Z'));
  });

  it('returns 1 when no previous log exists', () => {
    expect(computeStreak(1, null)).toBe(1);
  });

  it('increments streak when last log was yesterday', () => {
    // Use midnight UTC on June 14 so it's genuinely 'yesterday' in all timezones
    const yesterday = new Date('2024-06-14T00:00:00Z').toISOString();
    expect(computeStreak(3, yesterday)).toBe(4);
  });

  it('resets streak to 1 when there is a gap of 2+ days', () => {
    const twoDaysAgo = new Date('2024-06-13T10:00:00Z').toISOString();
    expect(computeStreak(5, twoDaysAgo)).toBe(1);
  });

  it('preserves streak when logging again on same day', () => {
    const todayEarlier = new Date('2024-06-15T08:00:00Z').toISOString();
    expect(computeStreak(4, todayEarlier)).toBe(4);
  });

  it('resets streak to 1 when last log was a week ago', () => {
    const weekAgo = new Date('2024-06-08T10:00:00Z').toISOString();
    expect(computeStreak(7, weekAgo)).toBe(1);
  });

  it('builds streak correctly over simulated consecutive days', () => {
    let streak = 1;
    let lastLog: string | null = null;

    // Day 1
    vi.setSystemTime(new Date('2024-06-10T10:00:00Z'));
    lastLog = new Date().toISOString();
    streak = computeStreak(streak, lastLog);
    expect(streak).toBe(1); // same day

    // Day 2
    vi.setSystemTime(new Date('2024-06-11T10:00:00Z'));
    streak = computeStreak(streak, lastLog);
    lastLog = new Date().toISOString();
    expect(streak).toBe(2);

    // Day 3
    vi.setSystemTime(new Date('2024-06-12T10:00:00Z'));
    streak = computeStreak(streak, lastLog);
    expect(streak).toBe(3);
  });
});

// ─── BADGE UNLOCK TESTS ───────────────────────────────────────────────────────
describe('shouldUnlockBadge', () => {

  describe('first_steps', () => {
    it('unlocks on the very first logged action', () => {
      expect(shouldUnlockBadge('first_steps', 1, [{ actionId: 'walk_bike_trip', category: 'transport' }])).toBe(true);
    });

    it('does NOT unlock with empty history', () => {
      expect(shouldUnlockBadge('first_steps', 1, [])).toBe(false);
    });
  });

  describe('streak_3', () => {
    it('unlocks when streak reaches 3', () => {
      expect(shouldUnlockBadge('streak_3', 3, [])).toBe(true);
    });

    it('unlocks when streak exceeds 3', () => {
      expect(shouldUnlockBadge('streak_3', 7, [])).toBe(true);
    });

    it('does NOT unlock when streak is 2', () => {
      expect(shouldUnlockBadge('streak_3', 2, [])).toBe(false);
    });
  });

  describe('vegan_vanguard', () => {
    const makeVegan = (n: number): ActionEntry[] =>
      Array.from({ length: n }, () => ({ actionId: 'ate_vegan', category: 'food' }));

    it('unlocks at exactly 5 vegan actions', () => {
      expect(shouldUnlockBadge('vegan_vanguard', 1, makeVegan(5))).toBe(true);
    });

    it('unlocks with more than 5 vegan actions', () => {
      expect(shouldUnlockBadge('vegan_vanguard', 1, makeVegan(8))).toBe(true);
    });

    it('does NOT unlock with only 4 vegan actions', () => {
      expect(shouldUnlockBadge('vegan_vanguard', 1, makeVegan(4))).toBe(false);
    });

    it('only counts ate_vegan — not vegetarian', () => {
      const mixed: ActionEntry[] = [
        ...makeVegan(3),
        { actionId: 'ate_vegetarian', category: 'food' },
        { actionId: 'ate_vegetarian', category: 'food' },
      ];
      expect(shouldUnlockBadge('vegan_vanguard', 1, mixed)).toBe(false);
    });
  });

  describe('transit_pro', () => {
    const makeTransport = (n: number): ActionEntry[] =>
      Array.from({ length: n }, () => ({ actionId: 'walk_bike_trip', category: 'transport' }));

    it('unlocks at exactly 5 transport actions', () => {
      expect(shouldUnlockBadge('transit_pro', 1, makeTransport(5))).toBe(true);
    });

    it('does NOT unlock at 4 transport actions', () => {
      expect(shouldUnlockBadge('transit_pro', 1, makeTransport(4))).toBe(false);
    });

    it('counts all transport category actions, not just one ID', () => {
      const mixed: ActionEntry[] = [
        { actionId: 'walk_bike_trip', category: 'transport' },
        { actionId: 'public_transit', category: 'transport' },
        { actionId: 'carpool', category: 'transport' },
        { actionId: 'walk_bike_trip', category: 'transport' },
        { actionId: 'public_transit', category: 'transport' },
      ];
      expect(shouldUnlockBadge('transit_pro', 1, mixed)).toBe(true);
    });
  });

  describe('energy_saver', () => {
    const makeEnergy = (n: number): ActionEntry[] =>
      Array.from({ length: n }, () => ({ actionId: 'line_dry_laundry', category: 'energy' }));

    it('unlocks at exactly 5 energy actions', () => {
      expect(shouldUnlockBadge('energy_saver', 1, makeEnergy(5))).toBe(true);
    });

    it('does NOT unlock at 4 energy actions', () => {
      expect(shouldUnlockBadge('energy_saver', 1, makeEnergy(4))).toBe(false);
    });
  });

  it('returns false for unknown badge ID', () => {
    expect(shouldUnlockBadge('unknown_badge', 10, [])).toBe(false);
  });
});

// ─── XP GAIN TESTS ────────────────────────────────────────────────────────────
describe('computeXPGain', () => {
  it('returns base action points when no bonuses', () => {
    expect(computeXPGain(15, false, false)).toBe(15);
  });

  it('adds 50 XP bonus for completing a challenge', () => {
    expect(computeXPGain(10, true, false)).toBe(60);
  });

  it('adds 100 XP bonus for unlocking a badge', () => {
    expect(computeXPGain(10, false, true)).toBe(110);
  });

  it('stacks all bonuses together', () => {
    expect(computeXPGain(20, true, true)).toBe(170);
  });

  it('works with zero action points', () => {
    expect(computeXPGain(0, true, true)).toBe(150);
  });
});

// ─── TREE HEALTH TESTS ────────────────────────────────────────────────────────
describe('computeNewHealth', () => {
  it('increases health by ceil(points / 5)', () => {
    expect(computeNewHealth(60, 15)).toBe(63); // ceil(15/5) = 3
  });

  it('does not exceed 100', () => {
    expect(computeNewHealth(98, 20)).toBe(100); // would be 102 → capped at 100
  });

  it('works with 1-point actions', () => {
    expect(computeNewHealth(50, 1)).toBe(51); // ceil(1/5) = 1
  });

  it('stays at 100 if already maxed', () => {
    expect(computeNewHealth(100, 15)).toBe(100);
  });
});
