'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Leaf, Sparkles, Check } from 'lucide-react';
import { useCarbonCalculator } from '../../hooks/useCarbonCalculator';
import ForestBackground from '../../components/tree/ForestBackground';
import OrganicCard from '../../components/ui/OrganicCard';
import OrganicButton from '../../components/ui/OrganicButton';

// --- Custom Inline SVGs for illustrated option cards ---
const PetrolCarSVG = () => (
  <svg viewBox="0 0 100 60" className="w-16 h-12 text-[#8d6e63]">
    <path fill="currentColor" d="M10 30 L15 15 Q18 10 30 10 L70 10 Q82 10 85 15 L90 30 Q95 32 95 38 L95 48 Q95 50 90 50 L85 50 A 8 8 0 0 1 70 50 L30 50 A 8 8 0 0 1 15 50 L10 50 Q5 50 5 45 L5 38 Q5 32 10 30 Z" />
    <circle cx="25" cy="50" r="7" fill="#3e2723" />
    <circle cx="75" cy="50" r="7" fill="#3e2723" />
    <path d="M78 20 L86 30 L65 30 L65 20 Z" fill="#fff" opacity="0.6" />
    {/* Smoke puff */}
    <circle cx="2" cy="45" r="3" fill="#a1887f" opacity="0.5" className="animate-pulse" />
    <circle cx="-3" cy="43" r="4" fill="#a1887f" opacity="0.3" />
  </svg>
);

const ElectricCarSVG = () => (
  <svg viewBox="0 0 100 60" className="w-16 h-12 text-teal-500">
    <path fill="currentColor" d="M10 30 L15 15 Q18 10 30 10 L70 10 Q82 10 85 15 L90 30 Q95 32 95 38 L95 48 Q95 50 90 50 L85 50 A 8 8 0 0 1 70 50 L30 50 A 8 8 0 0 1 15 50 L10 50 Q5 50 5 45 L5 38 Q5 32 10 30 Z" />
    <circle cx="25" cy="50" r="7" fill="#004d40" />
    <circle cx="75" cy="50" r="7" fill="#004d40" />
    <path d="M48 15 L43 28 L53 28 L48 42" fill="none" stroke="#ffe082" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrainTransitSVG = () => (
  <svg viewBox="0 0 100 60" className="w-16 h-12 text-forest-600">
    <rect x="15" y="10" width="70" height="38" rx="8" fill="currentColor" />
    <rect x="20" y="15" width="18" height="15" rx="3" fill="#fff" opacity="0.8" />
    <rect x="42" y="15" width="16" height="15" rx="3" fill="#fff" opacity="0.8" />
    <rect x="62" y="15" width="18" height="15" rx="3" fill="#fff" opacity="0.8" />
    <rect x="15" y="38" width="70" height="4" fill="#1b4d3e" />
    <circle cx="30" cy="52" r="5" fill="#3e2723" />
    <circle cx="70" cy="52" r="5" fill="#3e2723" />
  </svg>
);

const WalkBikeSVG = () => (
  <svg viewBox="0 0 100 60" className="w-16 h-12 text-forest-400">
    <circle cx="25" cy="35" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="75" cy="35" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M25 35 L50 20 L75 35 M50 20 L45 5 M50 20 L62 8 M45 5 L55 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Little leaf */}
    <path d="M72 15 Q82 5 78 20 Q70 18 72 15 Z" fill="#a8e6cf" />
  </svg>
);

const SteakSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-[#ff8b94]">
    <ellipse cx="40" cy="30" rx="32" ry="22" fill="#d0583b" />
    <ellipse cx="40" cy="30" rx="26" ry="16" fill="#e76f51" />
    <path d="M30 25 Q35 15 45 25 T60 25" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="35" r="2.5" fill="#fff" />
  </svg>
);

const SaladSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-forest-500">
    <path d="M8 26 C8 45 22 50 40 50 C58 50 72 45 72 26 Z" fill="#eae2b7" />
    <circle cx="30" cy="20" r="12" fill="#52b788" />
    <circle cx="45" cy="18" r="10" fill="#74c69d" />
    <circle cx="38" cy="24" r="9" fill="#2d6a4f" />
    <circle cx="55" cy="22" r="7" fill="#ff6b6b" />
  </svg>
);

const CheeseSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-amber-400">
    <path d="M10 45 L70 45 L70 20 Q55 10 10 32 Z" fill="currentColor" />
    <circle cx="30" cy="32" r="4" fill="#fff" opacity="0.6" />
    <circle cx="50" cy="38" r="5" fill="#fff" opacity="0.6" />
    <circle cx="42" cy="25" r="3" fill="#fff" opacity="0.6" />
  </svg>
);

const VeganLeafSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-teal-400">
    <path fill="currentColor" d="M40 5 Q70 15 65 40 Q55 52 40 55 Q25 52 15 40 Q10 15 40 5 Z" />
    <path d="M40 5 L40 55" fill="none" stroke="#fff" strokeWidth="2.5" />
    <path d="M40 20 Q55 18 55 18" fill="none" stroke="#fff" strokeWidth="2" />
    <path d="M40 32 Q25 30 25 30" fill="none" stroke="#fff" strokeWidth="2" />
  </svg>
);

const CleanHangerSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-emerald-500">
    <path d="M40 10 Q35 10 35 15 Q35 20 40 20 Q43 20 43 24 L20 45 L60 45 L40 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M25 45 C25 35 55 35 55 45" fill="none" stroke="currentColor" strokeWidth="3" />
    {/* Tag leaf */}
    <circle cx="40" cy="35" r="4" fill="#a8e6cf" />
  </svg>
);

const CartSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-amber-500">
    <circle cx="28" cy="50" r="5" fill="currentColor" />
    <circle cx="58" cy="50" r="5" fill="currentColor" />
    <path d="M15 15 L25 15 L35 40 L65 40 L72 20 L27 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BoxSVG = () => (
  <svg viewBox="0 0 80 60" className="w-14 h-12 text-[#8d6e63]">
    <path d="M15 25 L40 12 L65 25 L40 38 Z" fill="currentColor" opacity="0.8" />
    <path d="M15 25 L15 48 L40 58 L40 38 Z" fill="currentColor" />
    <path d="M65 25 L65 48 L40 58 L40 38 Z" fill="currentColor" opacity="0.9" />
    <path d="M40 12 L40 38" stroke="#fff" strokeWidth="1.5" />
  </svg>
);

export default function Onboarding() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    loadingStage,
    sproutingMessages,
    showEncouragement,
    setShowEncouragement,
    computedBaseline,

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

    nextStep,
    prevStep,
  } = useCarbonCalculator();

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, type: 'spring' as const, stiffness: 120 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.25 } }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-6 overflow-hidden rounded-3xl">
      <ForestBackground />

      <div className="relative z-10 w-full max-w-xl mx-auto px-4">
        
        {/* Stepper Header */}
        {currentStep < totalSteps && (
          <div className="mb-6 bg-[#11261D]/65 backdrop-blur-sm p-3 rounded-full border border-[#2A4A3A]/50 flex items-center justify-between shadow-sm">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`p-1.5 rounded-full ${
                currentStep === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-[#A3C4B1] hover:bg-white/5 cursor-pointer'
              }`}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Steps indicator dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-6 bg-forest-400'
                      : 'w-2 bg-forest-950/70 border border-[#2A4A3A]/40'
                  }`}
                />
              ))}
            </div>

            <span className="text-xs font-bold text-[#A3C4B1] px-2.5 py-0.5 rounded-full bg-forest-900/40 border border-[#2A4A3A]/30">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
        )}

        <OrganicCard hoverEffect={false} className="min-h-[410px] flex flex-col justify-between p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: Welcome & Name */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col justify-center text-center"
              >
                <div className="flex justify-center mb-4 text-forest-400">
                  <Leaf className="w-12 h-12 fill-current animate-bounce" />
                </div>
                <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#E8EDE9] mb-2">
                  Welcome to Rooted
                </h2>
                <p className="text-xs text-[#A3C4B1] mb-6 max-w-sm mx-auto">
                  Every journey starts with a name. What should we call you in our digital garden?
                </p>
                <div className="max-w-xs mx-auto w-full">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    autoFocus
                    required
                    className="w-full px-5 py-3 rounded-full border border-[#2A4A3A] bg-forest-900/60 text-[#E8EDE9] placeholder-[#A3C4B1]/50 text-center text-base font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 1: Commute Mode (Illustrated option cards) */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-serif font-bold text-xl md:text-2xl text-[#E8EDE9] mb-1">
                    How do you commute?
                  </h2>
                  <p className="text-[10px] text-[#A3C4B1] mb-4">
                    Choose the primary vehicle option that carries you to work or trips.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { id: 'petrol', label: 'Petrol/Diesel', svg: PetrolCarSVG },
                      { id: 'hybrid', label: 'Hybrid Car', svg: ElectricCarSVG },
                      { id: 'electric', label: 'Electric Car', svg: ElectricCarSVG },
                      { id: 'public', label: 'Bus / Train', svg: TrainTransitSVG },
                      { id: 'none', label: 'Walk / Cycle', svg: WalkBikeSVG },
                    ].map((mode) => {
                      const SvgIcon = mode.svg;
                      const isSelected = transportMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setTransportMode(mode.id as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'bg-forest-400 text-forest-900 border-forest-400 shadow-md'
                              : 'bg-[#11261D] border-[#2A4A3A] text-[#A3C4B1] hover:bg-forest-800 hover:text-white'
                          }`}
                        >
                          <div className="mb-2">
                            <SvgIcon />
                          </div>
                          <span className="font-bold text-xs">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {transportMode !== 'none' && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-[#E8EDE9]">
                      <span>Weekly Distance:</span>
                      <span className="bg-forest-900 border border-[#2A4A3A] px-2 py-0.5 rounded text-[#E8EDE9]">
                        {transportDistance} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={transportDistance}
                      onChange={(e) => setTransportDistance(parseInt(e.target.value))}
                      className="w-full accent-forest-600 cursor-pointer h-2 bg-forest-950/70 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] text-[#A3C4B1] mt-1">
                      <span>10 km</span>
                      <span>150 km</span>
                      <span>300+ km</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Diet style (Illustrated cards) */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col justify-center"
              >
                <h2 className="font-serif font-bold text-xl md:text-2xl text-[#E8EDE9] mb-1 text-center">
                  What is your dietary style?
                </h2>
                <p className="text-[10px] text-center text-[#A3C4B1] mb-5">
                  Meat production and dairy farming account for heavy methane and deforestation footprint scores.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'meatLover', label: 'Meat Lover', desc: 'Frequent meat eats', svg: SteakSVG },
                    { id: 'average', label: 'Average Diet', desc: 'Balanced mixed diet', svg: SaladSVG },
                    { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat, eats dairy', svg: CheeseSVG },
                    { id: 'vegan', label: 'Vegan', desc: 'Strictly plant-based', svg: VeganLeafSVG },
                  ].map((diet) => {
                    const SvgIcon = diet.svg;
                    const isSelected = dietType === diet.id;
                    return (
                      <button
                        key={diet.id}
                        onClick={() => setDietType(diet.id as any)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-forest-400 text-forest-900 border-forest-400 shadow-md'
                            : 'bg-[#11261D] border-[#2A4A3A] text-[#A3C4B1] hover:bg-forest-800 hover:text-white'
                        }`}
                      >
                        <div className="mb-2">
                          <SvgIcon />
                        </div>
                        <span className="font-bold text-xs">{diet.label}</span>
                        <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-forest-900/80' : 'text-[#A3C4B1]'}`}>
                          {diet.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Home Energy */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-serif font-bold text-xl md:text-2xl text-[#E8EDE9] mb-1">
                    How is your home powered?
                  </h2>
                  <p className="text-[10px] text-[#A3C4B1] mb-5">
                    Your electricity bills and whether you purchase clean grid energy changes emissions rates.
                  </p>

                  <div className="mb-5 bg-[#11261D] p-4 rounded-2xl border border-[#2A4A3A]">
                    <div className="flex justify-between items-center text-xs font-bold mb-2 text-[#E8EDE9]">
                      <span>Monthly Electricity Bill:</span>
                      <span className="bg-forest-900 border border-[#2A4A3A] px-3 py-0.5 rounded text-xs text-[#E8EDE9]">
                        {energyBill} kWh
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="25"
                      value={energyBill}
                      onChange={(e) => setEnergyBill(parseInt(e.target.value))}
                      className="w-full accent-forest-600 cursor-pointer h-2 bg-forest-950/70 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] text-[#A3C4B1] mt-1.5">
                      <span>50 kWh (Eco apt)</span>
                      <span>300 kWh (Avg family)</span>
                      <span>1000 kWh (Large home)</span>
                    </div>
                  </div>

                  <div className="bg-[#11261D] p-4 rounded-2xl border border-[#2A4A3A]">
                    <div className="flex justify-between items-center text-xs font-bold mb-2 text-[#E8EDE9]">
                      <span>Renewable Clean Energy ratio:</span>
                      <span className="bg-teal-950 border border-teal-900/40 text-teal-300 px-3 py-0.5 rounded text-xs">
                        {cleanEnergyRatio}% Clean
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={cleanEnergyRatio}
                      onChange={(e) => setCleanEnergyRatio(parseInt(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-forest-950/70 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] text-[#A3C4B1] mt-1.5">
                      <span>0% (Standard Grid)</span>
                      <span>50% (Eco mix)</span>
                      <span>100% (Solar panels)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Airline Flight Frequencies */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col justify-center"
              >
                <h2 className="font-serif font-bold text-xl md:text-2xl text-[#E8EDE9] mb-1">
                  How often do you travel by air?
                </h2>
                <p className="text-[10px] text-[#A3C4B1] mb-5">
                  Aviation produces high levels of carbon dioxide. Enter typical annual trip frequencies.
                </p>

                <div className="flex flex-col gap-4">
                  {/* Short Flights */}
                  <div className="flex items-center justify-between bg-[#11261D] p-4 rounded-2xl border border-[#2A4A3A]">
                    <div className="max-w-[70%]">
                      <div className="text-xs font-bold text-[#E8EDE9]">Short-Haul Flights</div>
                      <div className="text-[9px] text-[#A3C4B1]">Domestic/regional trips under 1,500km</div>
                    </div>
                    <div className="flex items-center gap-2 bg-forest-950 px-3 py-1.5 rounded-full border border-[#2A4A3A]">
                      <button
                        onClick={() => setShortFlights(prev => Math.max(0, prev - 1))}
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm bg-[#11261D] text-[#A3C4B1] rounded-full hover:bg-forest-800 hover:text-white cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-5 text-center text-[#E8EDE9]">{shortFlights}</span>
                      <button
                        onClick={() => setShortFlights(prev => prev + 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm bg-[#11261D] text-[#A3C4B1] rounded-full hover:bg-forest-800 hover:text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Long Flights */}
                  <div className="flex items-center justify-between bg-[#11261D] p-4 rounded-2xl border border-[#2A4A3A]">
                    <div className="max-w-[70%]">
                      <div className="text-xs font-bold text-[#E8EDE9]">Long-Haul Flights</div>
                      <div className="text-[9px] text-[#A3C4B1]">Continental/international trips over 1,500km</div>
                    </div>
                    <div className="flex items-center gap-2 bg-forest-950 px-3 py-1.5 rounded-full border border-[#2A4A3A]">
                      <button
                        onClick={() => setLongFlights(prev => Math.max(0, prev - 1))}
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm bg-[#11261D] text-[#A3C4B1] rounded-full hover:bg-forest-800 hover:text-white cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-5 text-center text-[#E8EDE9]">{longFlights}</span>
                      <button
                        onClick={() => setLongFlights(prev => prev + 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-sm bg-[#11261D] text-[#A3C4B1] rounded-full hover:bg-forest-800 hover:text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Shopping Habits (Illustrated cards) */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col justify-center text-center"
              >
                <h2 className="font-serif font-bold text-xl md:text-2xl text-[#E8EDE9] mb-1">
                  What are your shopping habits?
                </h2>
                <p className="text-[10px] text-[#A3C4B1] mb-5">
                  Buying pre-owned goods and repair culture reduces global manufacturing output emissions.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'eco', label: 'Eco Conscious', desc: 'Secondhand, repairs', svg: CleanHangerSVG },
                    { id: 'average', label: 'Standard', desc: 'Buy standard items', svg: CartSVG },
                    { id: 'heavy', label: 'Frequent Buyer', desc: 'Fast fashion, tech updates', svg: BoxSVG },
                  ].map((shop) => {
                    const SvgIcon = shop.svg;
                    const isSelected = shoppingStyle === shop.id;
                    return (
                      <button
                        key={shop.id}
                        onClick={() => setShoppingStyle(shop.id as any)}
                        className={`flex flex-col items-center justify-between p-3 rounded-2xl border text-center min-h-[140px] transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-forest-400 text-forest-900 border-forest-400 shadow-md scale-102'
                            : 'bg-[#11261D] border-[#2A4A3A] text-[#A3C4B1] hover:bg-forest-800 hover:text-white'
                        }`}
                      >
                        <div className="my-auto">
                          <SvgIcon />
                        </div>
                        <div className="w-full">
                          <span className="font-bold text-[10px] block leading-tight">{shop.label}</span>
                          <span className={`text-[7px] mt-0.5 block leading-none ${isSelected ? 'text-forest-900/80' : 'text-[#A3C4B1]'}`}>
                            {shop.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Loading / Sprouting Loader Screen */}
            {currentStep === totalSteps && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center min-h-[300px]"
              >
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-forest-800 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
                  <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-forest-400 fill-current" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-serif font-bold text-lg text-[#E8EDE9]"
                  >
                    {sproutingMessages[loadingStage]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[10px] text-[#A3C4B1] mt-1.5">
                  Calculating carbon footprint values...
                </p>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Stepper Footer Controls */}
          {currentStep < totalSteps && (
            <div className="mt-6 flex justify-end">
              <OrganicButton
                onClick={nextStep}
                disabled={currentStep === 0 && !name.trim()}
                className="px-6 py-2.5 flex items-center gap-1 shadow-sm font-bold text-xs"
              >
                {currentStep === totalSteps - 1 ? 'Meet Your Sprout' : 'Next Question'}
                <ArrowRight className="w-4 h-4" />
              </OrganicButton>
            </div>
          )}
        </OrganicCard>
      </div>

      {/* Sprouting Success / Encouragement Modal Popup */}
      <AnimatePresence>
        {showEncouragement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#11261D] border border-[#2A4A3A] max-w-md w-full rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Animated decorative sparks */}
              <div className="absolute top-4 left-4 text-teal-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="absolute bottom-4 right-4 text-coral-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              <div className="w-16 h-16 rounded-full bg-forest-400 text-forest-900 flex items-center justify-center mx-auto mb-6 shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h3 className="font-serif font-bold text-2xl text-[#E8EDE9] mb-2">
                Seedling Planted!
              </h3>
              
              <p className="text-sm text-[#A3C4B1] font-bold mb-4">
                Welcome to the Grove, {name}!
              </p>

              <div className="p-4 bg-[#0B1C12]/50 rounded-2xl border border-[#2A4A3A] mb-6">
                <div className="text-[10px] text-[#A3C4B1] uppercase font-bold tracking-wider">
                  Baseline Carbon Footprint
                </div>
                <div className="font-serif font-bold text-3xl text-[#E8EDE9] mt-1">
                  {(computedBaseline / 1000).toFixed(1)} <span className="text-sm font-sans font-medium text-[#A3C4B1]">tonnes/yr</span>
                </div>
                <p className="text-[9px] text-[#A3C4B1] mt-1.5">
                  This baseline represents your lifestyle carbon index. Watch your tree grow and transform as you offset this score.
                </p>
              </div>

              <p className="text-xs text-[#A3C4B1] mb-6 leading-relaxed">
                Remember, a carbon-conscious lifestyle grows a lush, flourishing tree. Take active challenges, log green choices, and let&apos;s build a healthier garden together!
              </p>

              <OrganicButton
                onClick={() => {
                  setShowEncouragement(false);
                  router.push('/dashboard');
                }}
                className="w-full py-3 text-sm font-bold shadow-md"
              >
                Enter Your Garden Dashboard
              </OrganicButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
