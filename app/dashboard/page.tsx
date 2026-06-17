'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Award, ArrowRight, Flame, Footprints, Sparkles, Check, ChevronDown, Calendar, Info } from 'lucide-react';
import { useRootedStore } from '../../store/useRootedStore';
import AnimatedTreeSVG, { getTreeStage, TREE_STAGES } from '../../components/tree/AnimatedTreeSVG';
import OrganicCard from '../../components/ui/OrganicCard';
import OrganicButton from '../../components/ui/OrganicButton';
import ProgressRing from '../../components/ui/ProgressRing';

// ─────────────────────────────────────────────────────────────────────────────
// Growth progress computation
// Weights:  footprint reduction 50%  |  actions count 40%  |  streak 10%
// Targets:  35% reduction            |  50 actions         |  7-day streak
// ─────────────────────────────────────────────────────────────────────────────
function computeGrowthProgress(
  baselineTotal: number,
  currentTotal:  number,
  actionsCount:  number,
  streak:        number
): number {
  const savedTotal        = Math.max(0, baselineTotal - currentTotal);
  const reductionPct      = baselineTotal > 0 ? (savedTotal / baselineTotal) * 100 : 0;
  const footprintFactor   = Math.min(100, (reductionPct  / 35) * 100);  // target 35% reduction = 100
  const actionFactor      = Math.min(100, (actionsCount  / 50) * 100);  // target 50 actions    = 100
  const streakFactor      = Math.min(100, (streak        / 7)  * 100);  // target 7-day streak  = 100
  return Math.min(100, Math.round(footprintFactor * 0.5 + actionFactor * 0.4 + streakFactor * 0.1));
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage colour accents for the progress bar fill
// ─────────────────────────────────────────────────────────────────────────────
const STAGE_BAR_COLORS: Record<number, string> = {
  1: '#6aab7c',  // pale green  — Sapling
  2: '#4a9e62',  // fresh green — Young Tree
  3: '#2d8a4e',  // vibrant     — Growing Tree
  4: '#1a7a3c',  // deep        — Mature Tree
  5: '#0fa832',  // electric    — Ancient Tree
};

export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    currentFootprint,
    baselineFootprint,
    loggedActions,
    challenges,
    badges,
    streak,
    growthPoints,
    treeHealth,
    logAction,
  } = useRootedStore();

  const [mounted,        setMounted]        = useState(false);
  const [expandedPetal,  setExpandedPetal]  = useState<string | null>(null);
  const [hoveredBadge,   setHoveredBadge]   = useState<string | null>(null);
  const [toastMessage,   setToastMessage]   = useState<string | null>(null);
  const [showTreeTip,    setShowTreeTip]    = useState(false);
  const [prevProgress,   setPrevProgress]   = useState(0);
  const [stageUpBanner,  setStageUpBanner]  = useState<string | null>(null);

  // ── Footprint calculations (safe defaults so hooks run before early return) ─
  const currentTotal   = currentFootprint?.total ?? 0;
  const baselineTotal  = baselineFootprint?.total ?? currentTotal;
  const totalTonnes    = (currentTotal  / 1000).toFixed(1);
  const baselineTonnes = (baselineTotal / 1000).toFixed(1);
  const savedTotal     = Math.max(0, baselineTotal - currentTotal);
  const reductionPercent = baselineTotal > 0
    ? (savedTotal / baselineTotal) * 100
    : 0;

  // ── Tree Growth Progress ────────────────────────────────────────────────────
  const growthProgress = computeGrowthProgress(
    baselineTotal,
    currentTotal,
    loggedActions.length,
    streak,
  );

  const stageInfo = getTreeStage(growthProgress);
  const isAncient = stageInfo.stage === 5;
  const barColor  = STAGE_BAR_COLORS[stageInfo.stage];

  // ── All hooks must be declared before any early return ─────────────────────
  // Split into two effects: one for mount flag, one for auth guard.
  // Combining them caused "Rendered more hooks" violations on ErrorBoundary reset.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || !currentFootprint)) {
      router.replace('/');
    }
  }, [mounted, user, currentFootprint, router]);

  // Stage-up notification
  useEffect(() => {
    if (!mounted) return;
    const currentStage = getTreeStage(growthProgress).stage;
    const prevStage    = getTreeStage(prevProgress).stage;
    if (currentStage > prevStage && prevProgress !== 0) {
      const info = TREE_STAGES.find(s => s.stage === currentStage);
      if (info) {
        setStageUpBanner(`🌿 Your tree leveled up to ${info.name}!`);
        setTimeout(() => setStageUpBanner(null), 4000);
      }
    }
    setPrevProgress(growthProgress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [growthProgress]);

  // ── Early return after all hooks ───────────────────────────────────────────
  if (!mounted || !user || !currentFootprint) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-forest-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Health label ────────────────────────────────────────────────────────────
  const getTreeHealthStatus = (h: number) => {
    if (h >= 80) return { label: 'Flourishing', color: 'text-emerald-400' };
    if (h >= 55) return { label: 'Vibrant',     color: 'text-forest-400' };
    if (h >= 35) return { label: 'Withered',    color: 'text-amber-500'  };
    return              { label: 'Critical',    color: 'text-red-500'    };
  };
  const healthStatus = getTreeHealthStatus(treeHealth);

  // ── Trend chart data ────────────────────────────────────────────────────────
  const monthlyTrendData = [
    { month: 'Jan', emissions: parseFloat(baselineTonnes) },
    { month: 'Feb', emissions: parseFloat(baselineTonnes) * 0.96 },
    { month: 'Mar', emissions: parseFloat(baselineTonnes) * 0.91 },
    { month: 'Apr', emissions: parseFloat(totalTonnes) },
  ];

  // ── Emission category petals ─────────────────────────────────────────────────
  const petals = [
    {
      id: 'transport', name: 'Transport',    icon: '🚗',
      value: currentFootprint.transport ?? 0,
      color: 'bg-emerald-600',
      actionId: 'walk_bike_trip',  actionLabel: 'Walk or Cycle (5km)',
      tip: 'Walking or cycling avoids private fuel combustion. Take transit for longer commutes.',
    },
    {
      id: 'diet',      name: 'Diet & Food',  icon: '🥗',
      value: currentFootprint.diet ?? 0,
      color: 'bg-coral-500',
      actionId: 'ate_vegan',       actionLabel: 'Eat a Vegan Meal',
      tip: 'Avoiding meat and cheese cuts agricultural methane and chemical nitrogen loading.',
    },
    {
      id: 'energy',    name: 'Home Energy',  icon: '⚡',
      value: currentFootprint.energy ?? 0,
      color: 'bg-amber-400',
      actionId: 'line_dry_laundry',actionLabel: 'Line-Dry Laundry',
      tip: 'Unplug phantom loads and choose renewable certified utility grid suppliers.',
    },
    {
      id: 'flights',   name: 'Flights',      icon: '✈️',
      value: currentFootprint.flights ?? 0,
      color: 'bg-sky-500',
      actionId: 'public_transit',  actionLabel: 'Commute via Transit',
      tip: 'Offset flight carbon indices by replacing short vehicle commutes with rail/bus trips.',
    },
    {
      id: 'shopping',  name: 'Shopping',     icon: '🛍️',
      value: currentFootprint.shopping ?? 0,
      color: 'bg-[#9c27b0]',
      actionId: 'bought_secondhand',actionLabel: 'Buy Secondhand',
      tip: 'Buying secondhand apparel and electronics avoids carbon-heavy manufacturing loops.',
    },
  ];

  const handleQuickLog = (actionId: string, actionName: string) => {
    logAction(actionId);
    setToastMessage(`Logged: ${actionName}! Tree is growing!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── XP breakdown for tooltip readability ─────────────────────────────────
  const savedTotal_kg          = Math.max(0, baselineTotal - currentTotal);
  const reductionPct           = baselineTotal > 0 ? (savedTotal_kg / baselineTotal) * 100 : 0;
  const footprintContrib       = Math.round(Math.min(100, (reductionPct / 35) * 100) * 0.5);
  const actionContrib          = Math.round(Math.min(100, (loggedActions.length / 50) * 100) * 0.4);
  const streakContrib          = Math.round(Math.min(100, (streak / 7) * 100) * 0.1);

  return (
    <div className="px-4 md:px-0 py-2">

      {/* ── Toast alert ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 bg-forest-800 text-white font-bold text-sm rounded-full shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current animate-bounce" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stage-up banner ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {stageUpBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-16 left-1/2 z-50 px-6 py-3 bg-emerald-700 text-white font-bold text-sm rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/40"
          >
            {stageUpBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-white tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-[#a1b0a5]">
            Nurture your garden. Today, your tree is{' '}
            <span className={`${healthStatus.color} font-bold`}>{healthStatus.label.toLowerCase()}</span>.
          </p>
        </div>
      </div>

      {/* ── 3-Column Layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ════════════════════════════════════════
            COLUMN 1: SIDEBAR (3 cols)
        ════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Active streak */}
          <OrganicCard hoverEffect={true} className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-950/30 border border-orange-900/30 text-orange-400 flex items-center justify-center text-xl animate-pulse">
              🔥
            </div>
            <div>
              <div className="text-[10px] text-[#A3C4B1] font-bold uppercase tracking-wider">Active Streak</div>
              <div className="text-xl font-serif font-bold text-[#E8EDE9] mt-0.5">
                {streak} Day{streak > 1 ? 's' : ''}
              </div>
            </div>
          </OrganicCard>

          {/* Garden stats */}
          <OrganicCard hoverEffect={false} className="p-5 space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#E8EDE9] border-b border-card-border/50 pb-2">
              Garden Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A3C4B1]">Growth Stage:</span>
                <span className="font-bold text-[#E8EDE9] flex items-center gap-1">
                  {stageInfo.icon} {stageInfo.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A3C4B1]">Growth Progress:</span>
                <span className="font-bold text-emerald-400">{growthProgress}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A3C4B1]">Actions Logged:</span>
                <span className="font-bold text-[#E8EDE9]">{loggedActions.length} / 50</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A3C4B1]">Cumulative Offset:</span>
                <span className="font-bold text-emerald-400">-{savedTotal.toFixed(0)} kg CO₂e</span>
              </div>
            </div>
          </OrganicCard>

          {/* Badges gallery */}
          <OrganicCard hoverEffect={false} className="p-5">
            <h3 className="font-serif font-bold text-sm text-[#E8EDE9] mb-3">
              Earned Badges
            </h3>
            <div className="grid grid-cols-5 gap-2.5 relative">
              {badges.map((badge) => {
                const isUnlocked = !!badge.unlockedAt;
                return (
                  <div
                    key={badge.id}
                    className="relative flex justify-center"
                    onMouseEnter={() => setHoveredBadge(badge.id)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <div
                      className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        isUnlocked
                          ? 'bg-forest-800/80 border-forest-600/30 grayscale-0 scale-100 shadow-sm text-white'
                          : 'bg-forest-950/40 border-forest-900/10 grayscale opacity-35 scale-90 text-white/40'
                      }`}
                      role="img"
                      aria-label={badge.title}
                    >
                      {badge.icon}
                    </div>

                    <AnimatePresence>
                      {hoveredBadge === badge.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-12 z-20 w-36 p-2 bg-[#0B1C12] text-[#E8EDE9] text-[10px] rounded-lg shadow-lg font-bold text-center border border-[#2A4A3A]"
                        >
                          <div className="font-serif leading-tight">{badge.title}</div>
                          <div className="font-sans font-normal text-[8px] text-[#A3C4B1] mt-0.5">{badge.description}</div>
                          {isUnlocked && (
                            <div className="text-[7px] text-teal-400 mt-1 font-bold">
                              Unlocked {new Date(badge.unlockedAt!).toLocaleDateString()}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </OrganicCard>
        </div>

        {/* ════════════════════════════════════════
            COLUMN 2: CENTER TREE (5 cols)
        ════════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <OrganicCard
            organicShape={true}
            className={`flex flex-col items-center relative min-h-[520px] justify-between transition-all duration-1000 ${
              isAncient ? 'ring-1 ring-emerald-500/30 shadow-[0_0_40px_rgba(61,204,116,0.12)]' : ''
            }`}
          >
            {/* Card header */}
            <div className="w-full flex justify-between items-center border-b border-card-border/40 pb-3">
              <div className="text-left">
                <span className="text-[10px] text-[#A3C4B1] uppercase font-bold tracking-wider">My Garden Tree</span>
                <h2 className="font-serif font-bold text-lg text-[#E8EDE9] mt-0.5 flex items-center gap-2">
                  {stageInfo.icon} {stageInfo.name}
                  {isAncient && (
                    <motion.span
                      className="text-xs font-sans font-bold text-emerald-400 bg-emerald-900/40 border border-emerald-600/30 px-2 py-0.5 rounded-full"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      ✨ Fully Grown
                    </motion.span>
                  )}
                </h2>
              </div>
              <span className={`text-xs font-bold ${healthStatus.color} flex items-center gap-1.5`}>
                <Heart className="w-4 h-4 fill-current animate-pulse" />
                {treeHealth}% Health
              </span>
            </div>

            {/* Tree SVG */}
            <div className="relative w-full flex items-center justify-center my-auto">
              {/* Outer footprint reduction ring */}
              <div className="absolute z-0 opacity-70 scale-110">
                <ProgressRing
                  value={reductionPercent}
                  size={320}
                  strokeWidth={4.5}
                  color="stroke-emerald-500"
                  trailColor="stroke-forest-950/70"
                />
              </div>

              {/* Tree */}
              <div className="relative z-10 scale-90">
                <AnimatedTreeSVG growthProgress={growthProgress} />
              </div>
            </div>

            {/* ── Growth Progress Bar ─────────────────────────────────────── */}
            <div className="w-full space-y-2.5 mt-2">

              {/* Label row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#E8EDE9]">
                    Growth Progress: <span style={{ color: barColor }}>{growthProgress}%</span>
                  </span>

                  {/* Info tooltip trigger */}
                  <div className="relative group">
                    <button
                      onClick={() => setShowTreeTip(p => !p)}
                      className="w-4 h-4 rounded-full border border-[#A3C4B1]/50 flex items-center justify-center text-[#A3C4B1] hover:border-emerald-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      aria-label="Growth info"
                    >
                      <Info className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <span className="text-[#A3C4B1] font-semibold">
                  Stage {stageInfo.stage} / 5
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-forest-950/60 rounded-full overflow-hidden border border-[#2A4A3A]/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${growthProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>

              {/* Stage milestones beneath bar */}
              <div className="flex justify-between text-[8px] text-[#A3C4B1]/60 font-semibold px-0.5">
                {TREE_STAGES.map(s => (
                  <span
                    key={s.stage}
                    className={`transition-colors ${growthProgress >= s.minProgress ? 'text-[#A3C4B1]' : ''}`}
                  >
                    {s.stage === 1 ? '0%' : `${s.minProgress}%`}
                  </span>
                ))}
                <span className={growthProgress >= 100 ? 'text-emerald-400' : ''}>100%</span>
              </div>

              {/* XP breakdown sub-row */}
              <div className="flex gap-2 text-[9px] text-[#A3C4B1]/70 font-semibold flex-wrap">
                <span className="flex items-center gap-0.5">
                  🌍 Footprint <span className="text-emerald-400 font-bold ml-0.5">+{footprintContrib}%</span>
                </span>
                <span className="text-[#2A4A3A]">·</span>
                <span className="flex items-center gap-0.5">
                  ⚡ Actions <span className="text-emerald-400 font-bold ml-0.5">+{actionContrib}%</span>
                </span>
                <span className="text-[#2A4A3A]">·</span>
                <span className="flex items-center gap-0.5">
                  🔥 Streak <span className="text-emerald-400 font-bold ml-0.5">+{streakContrib}%</span>
                </span>
              </div>

              {/* Info tooltip popup */}
              <AnimatePresence>
                {showTreeTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="w-full p-3 bg-[#0A1F14] border border-[#2A4A3A] rounded-xl text-[10px] text-[#A3C4B1] leading-relaxed"
                  >
                    <p className="font-bold text-[#E8EDE9] mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      How tree growth works
                    </p>
                    <p className="mb-1">
                      Your tree fully grows when you <strong className="text-[#E8EDE9]">reduce your footprint below target</strong> + complete{' '}
                      <strong className="text-[#E8EDE9]">50+ impactful actions</strong> with good consistency.
                    </p>
                    <ul className="space-y-0.5 mt-1.5 text-[9px]">
                      <li>🌍 <strong className="text-[#E8EDE9]">50%</strong> — Carbon footprint (target: 35% reduction)</li>
                      <li>⚡ <strong className="text-[#E8EDE9]">40%</strong> — Actions logged (target: 50 actions)</li>
                      <li>🔥 <strong className="text-[#E8EDE9]">10%</strong> — Streak consistency (target: 7-day streak)</li>
                    </ul>
                    <button
                      onClick={() => setShowTreeTip(false)}
                      className="mt-2 text-[9px] text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Got it ✓
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ancient tree unlock notice */}
            {isAncient && (
              <motion.div
                className="w-full mt-2 p-2.5 bg-emerald-900/30 border border-emerald-600/30 rounded-xl text-[10px] text-emerald-300 font-bold text-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                🌟 Ancient Tree Unlocked — Your forest thrives! New species &amp; background available.
              </motion.div>
            )}

          </OrganicCard>
        </div>

        {/* ════════════════════════════════════════
            COLUMN 3: BREAKDOWN & CHARTS (4 cols)
        ════════════════════════════════════════ */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Emissions breakdown petals */}
          <OrganicCard hoverEffect={false} className="p-5">
            <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-3">
              Emissions Breakdown
            </h3>
            <div className="flex flex-col gap-2.5">
              {petals.map((petal) => {
                const isExpanded  = expandedPetal === petal.id;
                const sharePercent = currentTotal > 0
                  ? Math.round((petal.value / currentTotal) * 100)
                  : 0;

                return (
                  <div
                    key={petal.id}
                    className="border border-[#2A4A3A] rounded-2xl overflow-hidden transition-all duration-300 bg-[#11261D] shadow-sm hover:shadow-md hover:border-[#3D6E54] hover:shadow-[0_0_15px_rgba(82,183,136,0.1)]"
                  >
                    <button
                      onClick={() => setExpandedPetal(isExpanded ? null : petal.id)}
                      className="w-full p-3 flex items-center justify-between gap-3 cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{petal.icon}</span>
                        <div>
                          <span className="font-bold text-xs text-[#E8EDE9] block">{petal.name}</span>
                          <span className="text-[10px] text-[#A3C4B1]">
                            {petal.value.toLocaleString()} kg CO₂e / yr
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#A3C4B1]">{sharePercent}%</span>
                        <ChevronDown className={`w-4 h-4 text-[#A3C4B1] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    <div className="px-3 pb-2.5">
                      <div className="w-full h-2 bg-forest-950/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${petal.color}`}
                          style={{ width: `${sharePercent}%` }}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[#2A4A3A] bg-[#0A1F14]/40 p-3.5 text-xs text-[#E8EDE9] space-y-3"
                        >
                          <p className="text-[11px] leading-relaxed text-[#A3C4B1]">{petal.tip}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-[#2A4A3A]/50">
                            <span className="text-[10px] font-bold text-[#E8EDE9]">Quick logging available:</span>
                            <button
                              onClick={() => handleQuickLog(petal.actionId, petal.actionLabel)}
                              className="px-2.5 py-1 bg-forest-400 hover:bg-forest-300 text-forest-950 font-bold rounded-lg text-[10px] shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              Log Offset
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </OrganicCard>

          {/* Monthly Trend */}
          <OrganicCard hoverEffect={true} className="p-5">
            <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#A3C4B1]" />
              Monthly Emissions Trend
            </h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2d6a4f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#888888" />
                  <Tooltip formatter={(value) => [`${parseFloat(value as string).toFixed(1)} tonnes`, 'CO₂e']} />
                  <Area type="monotone" dataKey="emissions" stroke="#2d6a4f" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </OrganicCard>

          {/* Recent activity feed */}
          <OrganicCard hoverEffect={false} className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-serif font-bold text-base text-[#E8EDE9]">Recent Activities</h3>
              <Link
                href="/actions"
                className="text-[10px] font-bold uppercase tracking-wider text-[#A3C4B1] hover:text-[#E8EDE9] hover:underline"
              >
                Log More
              </Link>
            </div>

            {loggedActions.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                {loggedActions.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="flex justify-between items-center p-2.5 bg-[#0A1F14]/40 border border-[#2A4A3A]/40 rounded-xl text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {act.category === 'transport' ? '🚗' : act.category === 'food' ? '🥗' : act.category === 'energy' ? '⚡' : '♻️'}
                      </span>
                      <div>
                        <p className="font-bold text-[#E8EDE9] text-[11px] truncate max-w-[125px]">{act.name}</p>
                        <p className="text-[9px] text-[#A3C4B1]/80">{new Date(act.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-400">-{act.co2Saved.toFixed(1)} kg</span>
                      <p className="text-[9px] text-forest-400 font-bold">+{act.points} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#A3C4B1]">No logged entries yet.</div>
            )}
          </OrganicCard>

        </div>
      </div>
    </div>
  );
}
