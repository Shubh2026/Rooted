/**
 * tests/hooks.test.ts
 *
 * Unit tests for custom hooks utilities (computeGrowthProgress, getHealthStatus)
 */

import { describe, it, expect } from 'vitest';
import { computeGrowthProgress, getHealthStatus } from '../hooks/useTreeGrowth';

describe('computeGrowthProgress', () => {
  it('calculates 0% growth for baseline', () => {
    const progress = computeGrowthProgress(5000, 5000, 0, 1);
    // 0% reduction, 0 actions, 1 streak
    // footprintFactor = 0, actionFactor = 0, streakFactor = 1/7 = 14%
    // 14 * 0.1 = 1.4%
    expect(progress).toBe(1);
  });

  it('calculates 100% growth for excellent stats', () => {
    // 35%+ reduction (5000 baseline -> 3000 current = 40% reduction, which is >= 35% target)
    // 50+ actions (55 actions)
    // 7+ streak (10 streak)
    const progress = computeGrowthProgress(5000, 3000, 55, 10);
    expect(progress).toBe(100);
  });

  it('bounds growth progress between 0 and 100', () => {
    const progressOver = computeGrowthProgress(5000, 0, 1000, 100);
    expect(progressOver).toBe(100);

    const progressUnder = computeGrowthProgress(0, 5000, 0, 0);
    expect(progressUnder).toBe(0);
  });
});

describe('getHealthStatus', () => {
  it('returns Flourishing for health >= 80', () => {
    const status = getHealthStatus(85);
    expect(status.label).toBe('Flourishing');
    expect(status.color).toBe('text-emerald-400');
  });

  it('returns Vibrant for health >= 55 and < 80', () => {
    const status = getHealthStatus(60);
    expect(status.label).toBe('Vibrant');
    expect(status.color).toBe('text-forest-400');
  });

  it('returns Withered for health >= 35 and < 55', () => {
    const status = getHealthStatus(40);
    expect(status.label).toBe('Withered');
    expect(status.color).toBe('text-amber-500');
  });

  it('returns Critical for health < 35', () => {
    const status = getHealthStatus(20);
    expect(status.label).toBe('Critical');
    expect(status.color).toBe('text-red-500');
  });
});
