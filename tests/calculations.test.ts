/**
 * tests/calculations.test.ts
 *
 * Unit tests for lib/calculations.ts
 * Covers: calculateFootprint, every transport mode, diet type, energy mix,
 * flights, shopping, edge cases, and GLOBAL_AVERAGES constants.
 */

import { describe, it, expect } from 'vitest';
import { calculateFootprint, GLOBAL_AVERAGES, type OnboardingAnswers } from '../lib/calculations';

// ─── helpers ──────────────────────────────────────────────────────────────────
const base: OnboardingAnswers = {
  name: 'Test User',
  transportMode: 'none',
  transportDistance: 0,
  dietType: 'average',
  energyBill: 0,
  cleanEnergyRatio: 0,
  shortFlights: 0,
  longFlights: 0,
  shoppingStyle: 'average',
};

// ─── calculateFootprint ───────────────────────────────────────────────────────
describe('calculateFootprint', () => {

  // ── return shape ────────────────────────────────────────────────────────────
  it('returns all required keys', () => {
    const result = calculateFootprint(base);
    expect(result).toHaveProperty('transport');
    expect(result).toHaveProperty('diet');
    expect(result).toHaveProperty('energy');
    expect(result).toHaveProperty('flights');
    expect(result).toHaveProperty('shopping');
    expect(result).toHaveProperty('total');
  });

  it('total equals sum of all categories', () => {
    const r = calculateFootprint(base);
    const sum = r.transport + r.diet + r.energy + r.flights + r.shopping;
    // total is independently Math.round()-ed so allow ±2 kg rounding delta
    expect(Math.abs(r.total - sum)).toBeLessThanOrEqual(2);
  });

  it('all values are non-negative numbers', () => {
    const r = calculateFootprint(base);
    for (const key of ['transport', 'diet', 'energy', 'flights', 'shopping', 'total'] as const) {
      expect(typeof r[key]).toBe('number');
      expect(r[key]).toBeGreaterThanOrEqual(0);
    }
  });

  // ── transport modes ─────────────────────────────────────────────────────────
  describe('transport emissions', () => {
    it('none → zero transport', () => {
      const r = calculateFootprint({ ...base, transportMode: 'none', transportDistance: 100 });
      expect(r.transport).toBe(0);
    });

    it('petrol > hybrid > electric for same distance', () => {
      const km = 100;
      const petrol   = calculateFootprint({ ...base, transportMode: 'petrol',   transportDistance: km }).transport;
      const hybrid   = calculateFootprint({ ...base, transportMode: 'hybrid',   transportDistance: km }).transport;
      const electric = calculateFootprint({ ...base, transportMode: 'electric', transportDistance: km }).transport;
      expect(petrol).toBeGreaterThan(hybrid);
      expect(hybrid).toBeGreaterThan(electric);
    });

    it('public < electric for same distance', () => {
      const km = 100;
      const pub  = calculateFootprint({ ...base, transportMode: 'public',   transportDistance: km }).transport;
      const elec = calculateFootprint({ ...base, transportMode: 'electric', transportDistance: km }).transport;
      expect(pub).toBeLessThan(elec);
    });

    it('emissions scale linearly with distance', () => {
      const r50  = calculateFootprint({ ...base, transportMode: 'petrol', transportDistance: 50  }).transport;
      const r100 = calculateFootprint({ ...base, transportMode: 'petrol', transportDistance: 100 }).transport;
      // 100km should be roughly double 50km (Math.round may cause ±1)
      expect(r100).toBeCloseTo(r50 * 2, -1);
    });

    it('diesel transport is non-zero', () => {
      const r = calculateFootprint({ ...base, transportMode: 'diesel', transportDistance: 50 });
      expect(r.transport).toBeGreaterThan(0);
    });
  });

  // ── diet types ──────────────────────────────────────────────────────────────
  describe('diet emissions', () => {
    it('meatLover > average > vegetarian > vegan', () => {
      const meat  = calculateFootprint({ ...base, dietType: 'meatLover'   }).diet;
      const avg   = calculateFootprint({ ...base, dietType: 'average'     }).diet;
      const veg   = calculateFootprint({ ...base, dietType: 'vegetarian'  }).diet;
      const vegan = calculateFootprint({ ...base, dietType: 'vegan'       }).diet;
      expect(meat).toBeGreaterThan(avg);
      expect(avg).toBeGreaterThan(veg);
      expect(veg).toBeGreaterThan(vegan);
    });

    it('diet emissions are annual (≈ daily factor × 365)', () => {
      // average diet factor is 5.63 kg/day → 5.63 × 365 ≈ 2055
      const r = calculateFootprint({ ...base, dietType: 'average' });
      expect(r.diet).toBeCloseTo(5.63 * 365, -1);
    });
  });

  // ── energy ──────────────────────────────────────────────────────────────────
  describe('energy emissions', () => {
    it('zero bill → zero energy emissions', () => {
      const r = calculateFootprint({ ...base, energyBill: 0 });
      expect(r.energy).toBe(0);
    });

    it('100% clean energy produces less emissions than 0% clean', () => {
      const dirty = calculateFootprint({ ...base, energyBill: 300, cleanEnergyRatio: 0   }).energy;
      const clean = calculateFootprint({ ...base, energyBill: 300, cleanEnergyRatio: 100 }).energy;
      expect(dirty).toBeGreaterThan(clean);
    });

    it('energy emissions scale with bill size', () => {
      const r300 = calculateFootprint({ ...base, energyBill: 300, cleanEnergyRatio: 0 }).energy;
      const r600 = calculateFootprint({ ...base, energyBill: 600, cleanEnergyRatio: 0 }).energy;
      expect(r600).toBeCloseTo(r300 * 2, -1);
    });
  });

  // ── flights ─────────────────────────────────────────────────────────────────
  describe('flight emissions', () => {
    it('zero flights → zero flight emissions', () => {
      const r = calculateFootprint({ ...base, shortFlights: 0, longFlights: 0 });
      expect(r.flights).toBe(0);
    });

    it('long-haul emits more than short-haul per flight', () => {
      const short = calculateFootprint({ ...base, shortFlights: 1 }).flights;
      const long  = calculateFootprint({ ...base, longFlights:  1 }).flights;
      expect(long).toBeGreaterThan(short);
    });

    it('emissions accumulate across multiple flights', () => {
      const one  = calculateFootprint({ ...base, shortFlights: 1 }).flights;
      const four = calculateFootprint({ ...base, shortFlights: 4 }).flights;
      expect(four).toBeCloseTo(one * 4, -1);
    });
  });

  // ── shopping ─────────────────────────────────────────────────────────────────
  describe('shopping emissions', () => {
    it('eco < average < heavy', () => {
      const eco   = calculateFootprint({ ...base, shoppingStyle: 'eco'     }).shopping;
      const avg   = calculateFootprint({ ...base, shoppingStyle: 'average' }).shopping;
      const heavy = calculateFootprint({ ...base, shoppingStyle: 'heavy'   }).shopping;
      expect(eco).toBeLessThan(avg);
      expect(avg).toBeLessThan(heavy);
    });
  });

  // ── combined realistic profile ───────────────────────────────────────────────
  it('realistic profile produces a sensible total (3000–20000 kg/yr)', () => {
    const r = calculateFootprint({
      name: 'Real User',
      transportMode: 'petrol',
      transportDistance: 80,
      dietType: 'average',
      energyBill: 300,
      cleanEnergyRatio: 15,
      shortFlights: 2,
      longFlights: 1,
      shoppingStyle: 'average',
    });
    expect(r.total).toBeGreaterThan(3000);
    expect(r.total).toBeLessThan(20000);
  });

  // ── sanitized edge cases ─────────────────────────────────────────────────────
  it('handles zero-distance non-none transport gracefully', () => {
    const r = calculateFootprint({ ...base, transportMode: 'petrol', transportDistance: 0 });
    expect(r.transport).toBe(0);
  });
});

// ─── GLOBAL_AVERAGES ──────────────────────────────────────────────────────────
describe('GLOBAL_AVERAGES', () => {
  it('usa > europe > global > target ordering holds', () => {
    expect(GLOBAL_AVERAGES.usa).toBeGreaterThan(GLOBAL_AVERAGES.europe);
    expect(GLOBAL_AVERAGES.europe).toBeGreaterThan(GLOBAL_AVERAGES.global);
    expect(GLOBAL_AVERAGES.global).toBeGreaterThan(GLOBAL_AVERAGES.target);
  });

  it('all averages are positive numbers', () => {
    for (const val of Object.values(GLOBAL_AVERAGES)) {
      expect(val).toBeGreaterThan(0);
    }
  });

  it('target is below 2500 kg (Paris Agreement ~2t)', () => {
    expect(GLOBAL_AVERAGES.target).toBeLessThanOrEqual(2500);
  });
});
