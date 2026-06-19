import { useState, useCallback } from 'react';
import { useRootedStore } from '../store/useRootedStore';
import { OnboardingAnswers, calculateFootprint } from '../lib/calculations';

const TOTAL_STEPS = 6;

const SPROUTING_MESSAGES = [
  'Sifting organic soil...',
  'Planting your digital seed...',
  'Watering the seedling...',
  'Nurturing with sunlight...',
  'Calculating annual footprint...',
];

/**
 * Custom hook to manage the Carbon Calculator Onboarding workflow.
 * Encapsulates quiz steps, individual question states, validation, loading animations,
 * and the final submit/calculations execution.
 */
export function useCarbonCalculator() {
  const { completeOnboarding } = useRootedStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [computedBaseline, setComputedBaseline] = useState<number>(0);

  // Individual question states
  const [name, setName] = useState('');
  const [transportMode, setTransportMode] = useState<OnboardingAnswers['transportMode']>('petrol');
  const [transportDistance, setTransportDistance] = useState(60);
  const [dietType, setDietType] = useState<OnboardingAnswers['dietType']>('average');
  const [energyBill, setEnergyBill] = useState(300);
  const [cleanEnergyRatio, setCleanEnergyRatio] = useState(15);
  const [shortFlights, setShortFlights] = useState(1);
  const [longFlights, setLongFlights] = useState(0);
  const [shoppingStyle, setShoppingStyle] = useState<OnboardingAnswers['shoppingStyle']>('average');

  // Navigate backward in quiz
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Run calculation and commit to store with simulated visual delays
  const triggerSprouting = useCallback(() => {
    setCurrentStep(TOTAL_STEPS); // Navigate to loader step

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < SPROUTING_MESSAGES.length) {
        setLoadingStage(current);
      } else {
        clearInterval(interval);

        const answers: OnboardingAnswers = {
          name,
          transportMode,
          transportDistance: transportMode === 'none' ? 0 : transportDistance,
          dietType,
          energyBill,
          cleanEnergyRatio,
          shortFlights,
          longFlights,
          shoppingStyle,
        };

        const breakdown = calculateFootprint(answers);
        setComputedBaseline(breakdown.total);

        // Commit onboarding profile to store
        completeOnboarding(answers);

        // Render success modal overlay
        setShowEncouragement(true);
      }
    }, 800);
  }, [
    name,
    transportMode,
    transportDistance,
    dietType,
    energyBill,
    cleanEnergyRatio,
    shortFlights,
    longFlights,
    shoppingStyle,
    completeOnboarding,
  ]);

  // Navigate forward in quiz
  const nextStep = useCallback(() => {
    if (currentStep === 0 && !name.trim()) return;

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      triggerSprouting();
    }
  }, [currentStep, name, triggerSprouting]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    loadingStage,
    sproutingMessages: SPROUTING_MESSAGES,
    showEncouragement,
    setShowEncouragement,
    computedBaseline,

    // Quiz inputs
    name,
    setName,
    transportMode,
    setTransportMode,
    transportDistance,
    setTransportDistance,
    dietType,
    setDietType,
    energyBill,
    setEnergyBill,
    cleanEnergyRatio,
    setCleanEnergyRatio,
    shortFlights,
    setShortFlights,
    longFlights,
    setLongFlights,
    shoppingStyle,
    setShoppingStyle,

    // Operations
    nextStep,
    prevStep,
  };
}
