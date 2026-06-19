/**
 * tests/neighbors.test.ts
 *
 * Unit tests for lib/neighbors.ts
 */

import { describe, it, expect } from 'vitest';
import { getDynamicNeighbors } from '../lib/neighbors';

describe('getDynamicNeighbors', () => {
  it('returns exactly 6 neighbors', () => {
    const list = getDynamicNeighbors();
    expect(list).toHaveLength(6);
  });

  it('returns neighbors with all required properties', () => {
    const list = getDynamicNeighbors();
    for (const neighbor of list) {
      expect(neighbor).toHaveProperty('name');
      expect(typeof neighbor.name).toBe('string');
      expect(neighbor.name.length).toBeGreaterThan(0);

      expect(neighbor).toHaveProperty('avatar');
      expect(typeof neighbor.avatar).toBe('string');

      expect(neighbor).toHaveProperty('emissions');
      expect(typeof neighbor.emissions).toBe('number');
      expect(neighbor.emissions).toBeGreaterThan(0);

      expect(neighbor).toHaveProperty('xp');
      expect(typeof neighbor.xp).toBe('number');
      expect(neighbor.xp).toBeGreaterThan(0);

      expect(neighbor).toHaveProperty('treeType');
      expect(typeof neighbor.treeType).toBe('string');

      expect(neighbor).toHaveProperty('leafColor');
      expect(typeof neighbor.leafColor).toBe('string');
      expect(neighbor.leafColor).toMatch(/^bg-/);

      expect(neighbor).toHaveProperty('swayDelay');
      expect(typeof neighbor.swayDelay).toBe('string');
    }
  });

  it('is deterministic during the same execution day', () => {
    const run1 = getDynamicNeighbors();
    const run2 = getDynamicNeighbors();
    expect(run1).toEqual(run2);
  });
});
