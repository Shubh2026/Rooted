/**
 * tests/utils/badgeUtils.test.ts
 *
 * Unit tests for badge unlocking utility (shouldUnlockBadge).
 */

import { describe, it, expect } from 'vitest';
import { shouldUnlockBadge, type ActionHistoryEntry } from '../../utils/badgeUtils';

describe('shouldUnlockBadge utility', () => {
  describe('first_steps badge', () => {
    it('unlocks on exactly 1 action', () => {
      const history: ActionHistoryEntry[] = [{ actionId: 'ate_vegan', category: 'food' }];
      expect(shouldUnlockBadge('first_steps', 1, history)).toBe(true);
    });

    it('remains locked on 0 actions', () => {
      expect(shouldUnlockBadge('first_steps', 1, [])).toBe(false);
    });
  });

  describe('streak_3 badge', () => {
    it('unlocks when streak is exactly 3', () => {
      expect(shouldUnlockBadge('streak_3', 3, [])).toBe(true);
    });

    it('unlocks when streak is 5', () => {
      expect(shouldUnlockBadge('streak_3', 5, [])).toBe(true);
    });

    it('remains locked when streak is 2', () => {
      expect(shouldUnlockBadge('streak_3', 2, [])).toBe(false);
    });
  });

  describe('vegan_vanguard badge', () => {
    const makeVegan = (n: number): ActionHistoryEntry[] =>
      Array.from({ length: n }, () => ({ actionId: 'ate_vegan', category: 'food' }));

    it('unlocks at exactly 5 vegan meals', () => {
      expect(shouldUnlockBadge('vegan_vanguard', 1, makeVegan(5))).toBe(true);
    });

    it('remains locked at 4 vegan meals', () => {
      expect(shouldUnlockBadge('vegan_vanguard', 1, makeVegan(4))).toBe(false);
    });

    it('ignores vegetarian meals', () => {
      const mixed = [
        ...makeVegan(3),
        { actionId: 'ate_vegetarian', category: 'food' },
        { actionId: 'ate_vegetarian', category: 'food' },
      ];
      expect(shouldUnlockBadge('vegan_vanguard', 1, mixed)).toBe(false);
    });
  });

  describe('transit_pro badge', () => {
    const makeTransit = (n: number): ActionHistoryEntry[] =>
      Array.from({ length: n }, () => ({ actionId: 'walk_bike_trip', category: 'transport' }));

    it('unlocks at exactly 5 transport logs', () => {
      expect(shouldUnlockBadge('transit_pro', 1, makeTransit(5))).toBe(true);
    });

    it('remains locked at 4 transport logs', () => {
      expect(shouldUnlockBadge('transit_pro', 1, makeTransit(4))).toBe(false);
    });
  });

  describe('energy_saver badge', () => {
    const makeEnergy = (n: number): ActionHistoryEntry[] =>
      Array.from({ length: n }, () => ({ actionId: 'line_dry_laundry', category: 'energy' }));

    it('unlocks at exactly 5 energy logs', () => {
      expect(shouldUnlockBadge('energy_saver', 1, makeEnergy(5))).toBe(true);
    });

    it('remains locked at 4 energy logs', () => {
      expect(shouldUnlockBadge('energy_saver', 1, makeEnergy(4))).toBe(false);
    });
  });

  it('returns false for unknown badge IDs', () => {
    expect(shouldUnlockBadge('mythical_badge', 10, [])).toBe(false);
  });
});
