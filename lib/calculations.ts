import { EMISSION_FACTORS } from './emissionFactors';

export interface OnboardingAnswers {
  name: string;
  transportMode: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'public' | 'none';
  transportDistance: number; // km per week
  dietType: 'meatLover' | 'average' | 'vegetarian' | 'vegan';
  energyBill: number; // kWh per month
  cleanEnergyRatio: number; // 0 to 100 (%)
  shortFlights: number; // flights per year
  longFlights: number; // flights per year
  shoppingStyle: 'eco' | 'average' | 'heavy';
}

export interface FootprintBreakdown {
  transport: number; // kg CO2e / year
  diet: number;      // kg CO2e / year
  energy: number;    // kg CO2e / year
  flights: number;   // kg CO2e / year
  shopping: number;  // kg CO2e / year
  total: number;     // kg CO2e / year
}

// ─── Input sanitization ───────────────────────────────────────────────────────
// All numeric inputs are clamped to safe ranges before any arithmetic.
// Invalid or missing values fall back to 0 / the safest default.
const VALID_TRANSPORT_MODES = ['petrol', 'diesel', 'hybrid', 'electric', 'public', 'none'] as const;
const VALID_DIET_TYPES       = ['meatLover', 'average', 'vegetarian', 'vegan'] as const;
const VALID_SHOPPING_STYLES  = ['eco', 'average', 'heavy'] as const;

function sanitizeAnswers(raw: OnboardingAnswers): OnboardingAnswers {
  return {
    // name: strip leading/trailing whitespace, limit to 80 chars
    name: typeof raw.name === 'string'
      ? raw.name.trim().slice(0, 80)
      : 'Anonymous',

    // enum fields: fall back to safest default if value is unrecognised
    transportMode: (VALID_TRANSPORT_MODES as readonly string[]).includes(raw.transportMode)
      ? raw.transportMode
      : 'none',

    dietType: (VALID_DIET_TYPES as readonly string[]).includes(raw.dietType)
      ? raw.dietType
      : 'average',

    shoppingStyle: (VALID_SHOPPING_STYLES as readonly string[]).includes(raw.shoppingStyle)
      ? raw.shoppingStyle
      : 'average',

    // numeric fields: parse, reject NaN/Infinity, clamp to valid ranges
    transportDistance: clampNum(raw.transportDistance, 0, 2000),   // 0 – 2000 km/week
    energyBill:        clampNum(raw.energyBill,        0, 5000),   // 0 – 5000 kWh/month
    cleanEnergyRatio:  clampNum(raw.cleanEnergyRatio,  0, 100),    // 0 – 100 %
    shortFlights:      clampInt(raw.shortFlights,      0, 100),    // 0 – 100 flights/yr
    longFlights:       clampInt(raw.longFlights,       0, 50),     // 0 – 50  flights/yr
  };
}

function clampNum(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clampInt(value: unknown, min: number, max: number): number {
  return Math.round(clampNum(value, min, max));
}

/**
 * Computes annual carbon footprint from onboarding answers.
 * All inputs are sanitized and range-checked before calculation.
 */
export function calculateFootprint(rawAnswers: OnboardingAnswers): FootprintBreakdown {
  const answers = sanitizeAnswers(rawAnswers);

  // 1. Transport
  let transportFactor = 0;
  switch (answers.transportMode) {
    case 'petrol':   transportFactor = EMISSION_FACTORS.transport.petrolCar;      break;
    case 'diesel':   transportFactor = EMISSION_FACTORS.transport.dieselCar;      break;
    case 'hybrid':   transportFactor = EMISSION_FACTORS.transport.hybridCar;      break;
    case 'electric': transportFactor = EMISSION_FACTORS.transport.electricCar;    break;
    case 'public':   transportFactor = EMISSION_FACTORS.transport.publicTransport; break;
    case 'none':
    default:         transportFactor = 0; break;
  }
  const annualDistance     = answers.transportDistance * 52;
  const transportEmissions = annualDistance * transportFactor;

  // 2. Diet
  const dailyDietEmissions = EMISSION_FACTORS.diet[answers.dietType] ?? EMISSION_FACTORS.diet.average;
  const dietEmissions      = dailyDietEmissions * 365;

  // 3. Energy
  const monthlyKwh          = answers.energyBill;
  const cleanRatio          = answers.cleanEnergyRatio / 100;
  const annualCleanEmissions    = monthlyKwh * cleanRatio       * EMISSION_FACTORS.energy.cleanGrid   * 12;
  const annualStandardEmissions = monthlyKwh * (1 - cleanRatio) * EMISSION_FACTORS.energy.electricity * 12;
  const energyEmissions     = annualCleanEmissions + annualStandardEmissions;

  // 4. Flights
  const flightsEmissions =
    answers.shortFlights * EMISSION_FACTORS.transport.flightShort +
    answers.longFlights  * EMISSION_FACTORS.transport.flightLong;

  // 5. Shopping
  const shoppingEmissions = EMISSION_FACTORS.shopping[answers.shoppingStyle] ?? EMISSION_FACTORS.shopping.average;

  const total = Math.round(
    transportEmissions + dietEmissions + energyEmissions + flightsEmissions + shoppingEmissions,
  );

  return {
    transport: Math.round(transportEmissions),
    diet:      Math.round(dietEmissions),
    energy:    Math.round(energyEmissions),
    flights:   Math.round(flightsEmissions),
    shopping:  Math.round(shoppingEmissions),
    total,
  };
}

/**
 * Mock national/regional annual emission averages in kg CO2e
 */
export const GLOBAL_AVERAGES = {
  usa:    16000,
  europe:  6500,
  global:  4700,
  target:  2000, // Paris Agreement target per person
};
