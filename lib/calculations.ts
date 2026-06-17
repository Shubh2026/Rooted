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

/**
 * Computes annual carbon footprint based on onboarding questionnaire answers
 */
export function calculateFootprint(answers: OnboardingAnswers): FootprintBreakdown {
  // 1. Transport Calculation
  let transportFactor = 0;
  switch (answers.transportMode) {
    case 'petrol':
      transportFactor = EMISSION_FACTORS.transport.petrolCar;
      break;
    case 'diesel':
      transportFactor = EMISSION_FACTORS.transport.dieselCar;
      break;
    case 'hybrid':
      transportFactor = EMISSION_FACTORS.transport.hybridCar;
      break;
    case 'electric':
      transportFactor = EMISSION_FACTORS.transport.electricCar;
      break;
    case 'public':
      transportFactor = EMISSION_FACTORS.transport.publicTransport;
      break;
    case 'none':
    default:
      transportFactor = 0;
      break;
  }
  
  const annualDistance = answers.transportDistance * 52; // 52 weeks
  const transportEmissions = annualDistance * transportFactor;

  // 2. Diet Calculation
  const dailyDietEmissions = EMISSION_FACTORS.diet[answers.dietType] || EMISSION_FACTORS.diet.average;
  const dietEmissions = dailyDietEmissions * 365; // 365 days

  // 3. Energy Calculation
  const monthlyKwh = answers.energyBill || 0;
  const cleanRatio = Math.max(0, Math.min(100, answers.cleanEnergyRatio)) / 100;
  
  const monthlyCleanKwh = monthlyKwh * cleanRatio;
  const monthlyStandardKwh = monthlyKwh * (1 - cleanRatio);
  
  const annualCleanEmissions = monthlyCleanKwh * EMISSION_FACTORS.energy.cleanGrid * 12;
  const annualStandardEmissions = monthlyStandardKwh * EMISSION_FACTORS.energy.electricity * 12;
  const energyEmissions = annualCleanEmissions + annualStandardEmissions;

  // 4. Flights Calculation
  const shortFlightEmissions = (answers.shortFlights || 0) * EMISSION_FACTORS.transport.flightShort;
  const longFlightEmissions = (answers.longFlights || 0) * EMISSION_FACTORS.transport.flightLong;
  const flightsEmissions = shortFlightEmissions + longFlightEmissions;

  // 5. Shopping Calculation
  const shoppingEmissions = EMISSION_FACTORS.shopping[answers.shoppingStyle] || EMISSION_FACTORS.shopping.average;

  const total = Math.round(
    transportEmissions + dietEmissions + energyEmissions + flightsEmissions + shoppingEmissions
  );

  return {
    transport: Math.round(transportEmissions),
    diet: Math.round(dietEmissions),
    energy: Math.round(energyEmissions),
    flights: Math.round(flightsEmissions),
    shopping: Math.round(shoppingEmissions),
    total
  };
}

/**
 * Mock national/regional annual emission averages in kg CO2e
 */
export const GLOBAL_AVERAGES = {
  usa: 16000,
  europe: 6500,
  global: 4700,
  target: 2000 // Paris Agreement target per person
};
