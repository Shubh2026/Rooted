/**
 * tests/lib/calculateFootprint.test.ts
 *
 * Unit tests for lib/calculations.ts
 * Covers: calculateFootprint, transport modes, diet types, energy mix, flights, shopping, and input sanitization.
 */

import { describe, it, expect } from 'vitest';
import { calculateFootprint, GLOBAL_AVERAGES, type OnboardingAnswers } from '../../lib/calculations';

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

describe('calculateFootprint scenarios', () => {
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
    expect(Math.abs(r.total - sum)).toBeLessThanOrEqual(2);
  });

  it('petrol > hybrid > electric for same distance', () => {
    const km = 100;
    const petrol   = calculateFootprint({ ...base, transportMode: 'petrol',   transportDistance: km }).transport;
    const hybrid   = calculateFootprint({ ...base, transportMode: 'hybrid',   transportDistance: km }).transport;
    const electric = calculateFootprint({ ...base, transportMode: 'electric', transportDistance: km }).transport;
    expect(petrol).toBeGreaterThan(hybrid);
    expect(hybrid).toBeGreaterThan(electric);
  });

  it('meatLover > average > vegetarian > vegan diet emissions', () => {
    const meat  = calculateFootprint({ ...base, dietType: 'meatLover'   }).diet;
    const avg   = calculateFootprint({ ...base, dietType: 'average'     }).diet;
    const veg   = calculateFootprint({ ...base, dietType: 'vegetarian'  }).diet;
    const vegan = calculateFootprint({ ...base, dietType: 'vegan'       }).diet;
    expect(meat).toBeGreaterThan(avg);
    expect(avg).toBeGreaterThan(veg);
    expect(veg).toBeGreaterThan(vegan);
  });

  it('higher energy bill increases energy emissions', () => {
    const r100 = calculateFootprint({ ...base, energyBill: 100 }).energy;
    const r300 = calculateFootprint({ ...base, energyBill: 300 }).energy;
    expect(r300).toBeGreaterThan(r100);
  });

  it('clean energy ratio reduces energy emissions', () => {
    const standard = calculateFootprint({ ...base, energyBill: 200, cleanEnergyRatio: 0   }).energy;
    const mixed    = calculateFootprint({ ...base, energyBill: 200, cleanEnergyRatio: 50  }).energy;
    const clean    = calculateFootprint({ ...base, energyBill: 200, cleanEnergyRatio: 100 }).energy;
    expect(standard).toBeGreaterThan(mixed);
    expect(mixed).toBeGreaterThan(clean);
  });

  it('flights emissions scale with counts', () => {
    const noFlights = calculateFootprint({ ...base, shortFlights: 0, longFlights: 0 }).flights;
    const shortOne  = calculateFootprint({ ...base, shortFlights: 1, longFlights: 0 }).flights;
    const longOne   = calculateFootprint({ ...base, shortFlights: 0, longFlights: 1 }).flights;
    
    expect(noFlights).toBe(0);
    expect(shortOne).toBeGreaterThan(0);
    expect(longOne).toBeGreaterThan(shortOne);
  });

  it('sanitizes input boundary values and out-of-range inputs safely', () => {
    const badAnswers = {
      name: ' A '.repeat(100),
      transportMode: 'spaceship' as any,
      transportDistance: -500, // should clamp to 0
      dietType: 'carnivore' as any,
      energyBill: 99999, // should clamp to 5000
      cleanEnergyRatio: 150, // should clamp to 100
      shortFlights: -5, // should clamp to 0
      longFlights: 60, // should clamp to 50
      shoppingStyle: 'excessive' as any,
    };
    
    const r = calculateFootprint(badAnswers);
    expect(r.total).toBeGreaterThan(0);
    expect(r.transport).toBe(0); // spaceship falls back to none -> 0
    expect(r.energy).toBeLessThan(120000); // clamped energy Bill
  });
});
