'use client';

/**
 * app/dashboard/page.tsx  — slim orchestrator
 *
 * Responsibilities:
 *   1. Read from Zustand store (single source of truth).
 *   2. Compute derived data with useMemo (memoized, recalculates only on deps change).
 *   3. Manage toast/banner/badge-hover UI state.
 *   4. Render three focused sub-components: StatsSidebar, TreeDashboard, EmissionsBreakdown.
 *
 * No JSX business logic lives here — it is purely wiring.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useRootedStore } from '../../store/useRootedStore';
import { getTreeStage, TREE_STAGES } from '../../components/tree/AnimatedTreeSVG';
import StatsSidebar      from '../../components/dashboard/StatsSidebar';
import TreeDashboard     from '../../components/dashboard/TreeDashboard';
import EmissionsBreakdown from '../../components/dashboard/EmissionsBreakdown';

// ─── Growth progress weights ──────────────────────────────────────────────────
// Footprint reduction 50% | Actions count 40% | Streak 10%
// Targets: 35% reduction  | 50 actions         | 7-day streak
function computeGrowthProgress(
  baselineTotal: number,
  currentTotal:  number,
  actionsCount:  number,
  streak:        number,
): number {
  const saved          = Math.max(0, baselineTotal - currentTotal);
  const reductionPct   = baselineTotal > 0 ? (saved / baselineTotal) * 100 : 0;
  const footprintFactor = Math.min(100, (reductionPct / 35) * 100);
  const actionFactor    = Math.min(100, (actionsCount  / 50) * 100);
  const streakFactor    = Math.min(100, (streak        / 7)  * 100);
  return Math.min(100, Math.round(footprintFactor * 0.5 + actionFactor * 0.4 + streakFactor * 0.1));
}

function getHealthStatus(h: number) {
  if (h >= 80) return { label: 'Flourishing', color: 'text-emerald-400' };
  if (h >= 55) return { label: 'Vibrant',     color: 'text-forest-400'  };
  if (h >= 35) return { label: 'Withered',    color: 'text-amber-500'   };
  return              { label: 'Critical',    color: 'text-red-500'     };
}

export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    currentFootprint,
    baselineFootprint,
    loggedActions,
    badges,
    streak,
    treeHealth,
    logAction,
  } = useRootedStore();

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [mounted,       setMounted]       = useState(false);
  const [expandedPetal, setExpandedPetal] = useState<string | null>(null);
  const [hoveredBadge,  setHoveredBadge]  = useState<string | null>(null);
  const [toastMessage,  setToastMessage]  = useState<string | null>(null);
  const [prevProgress,  setPrevProgress]  = useState(0);
  const [stageUpBanner, setStageUpBanner] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!user || !currentFootprint)) router.replace('/');
  }, [mounted, user, currentFootprint, router]);

  // ── Heavy derived values — memoized ────────────────────────────────────────
  const currentTotal   = useMemo(() => currentFootprint?.total  ?? 0, [currentFootprint]);
  const baselineTotal  = useMemo(() => baselineFootprint?.total ?? currentTotal, [baselineFootprint, currentTotal]);
  const savedTotal     = useMemo(() => Math.max(0, baselineTotal - currentTotal), [baselineTotal, currentTotal]);
  const reductionPercent = useMemo(
    () => (baselineTotal > 0 ? (savedTotal / baselineTotal) * 100 : 0),
    [savedTotal, baselineTotal],
  );

  const growthProgress = useMemo(
    () => computeGrowthProgress(baselineTotal, currentTotal, loggedActions.length, streak),
    [baselineTotal, currentTotal, loggedActions.length, streak],
  );

  const stageInfo  = useMemo(() => getTreeStage(growthProgress),     [growthProgress]);
  const isAncient  = stageInfo.stage === 5;
  const healthStatus = useMemo(() => getHealthStatus(treeHealth),    [treeHealth]);

  // Memoized XP contribution breakdown
  const { footprintContrib, actionContrib, streakContrib } = useMemo(() => {
    const reductionPct  = baselineTotal > 0 ? (savedTotal / baselineTotal) * 100 : 0;
    return {
      footprintContrib: Math.round(Math.min(100, (reductionPct              / 35) * 100) * 0.5),
      actionContrib:    Math.round(Math.min(100, (loggedActions.length      / 50) * 100) * 0.4),
      streakContrib:    Math.round(Math.min(100, (streak                    / 7)  * 100) * 0.1),
    };
  }, [savedTotal, baselineTotal, loggedActions.length, streak]);

  // Memoized trend chart data
  const trendData = useMemo(() => {
    const baseT = (baselineTotal / 1000);
    const curT  = (currentTotal  / 1000);
    return [
      { month: 'Jan', emissions: baseT },
      { month: 'Feb', emissions: parseFloat((baseT * 0.96).toFixed(2)) },
      { month: 'Mar', emissions: parseFloat((baseT * 0.91).toFixed(2)) },
      { month: 'Apr', emissions: parseFloat(curT.toFixed(2)) },
    ];
  }, [baselineTotal, currentTotal]);

  // Memoized petals — avoids re-creating array on unrelated renders
  const petals = useMemo(() => [
    {
      id: 'transport', name: 'Transport',   icon: '🚗',
      value: currentFootprint?.transport ?? 0,
      color: 'bg-emerald-600',
      actionId: 'walk_bike_trip',    actionLabel: 'Walk or Cycle (5km)',
      tip: 'Walking or cycling avoids private fuel combustion. Take transit for longer commutes.',
    },
    {
      id: 'diet',      name: 'Diet & Food', icon: '🥗',
      value: currentFootprint?.diet ?? 0,
      color: 'bg-coral-500',
      actionId: 'ate_vegan',         actionLabel: 'Eat a Vegan Meal',
      tip: 'Avoiding meat and cheese cuts agricultural methane and chemical nitrogen loading.',
    },
    {
      id: 'energy',    name: 'Home Energy', icon: '⚡',
      value: currentFootprint?.energy ?? 0,
      color: 'bg-amber-400',
      actionId: 'line_dry_laundry',  actionLabel: 'Line-Dry Laundry',
      tip: 'Unplug phantom loads and choose renewable certified utility grid suppliers.',
    },
    {
      id: 'flights',   name: 'Flights',     icon: '✈️',
      value: currentFootprint?.flights ?? 0,
      color: 'bg-sky-500',
      actionId: 'public_transit',    actionLabel: 'Commute via Transit',
      tip: 'Offset flight carbon indices by replacing short vehicle commutes with rail/bus trips.',
    },
    {
      id: 'shopping',  name: 'Shopping',    icon: '🛍️',
      value: currentFootprint?.shopping ?? 0,
      color: 'bg-[#9c27b0]',
      actionId: 'bought_secondhand', actionLabel: 'Buy Secondhand',
      tip: 'Buying secondhand apparel and electronics avoids carbon-heavy manufacturing loops.',
    },
  ], [currentFootprint]);

  // ── Stage-up notification ───────────────────────────────────────────────────
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

  // ── Early return — after all hooks ─────────────────────────────────────────
  if (!mounted || !user || !currentFootprint) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-forest-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleQuickLog = (actionId: string, actionName: string) => {
    logAction(actionId);
    setToastMessage(`Logged: ${actionName}! Tree is growing!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="px-4 md:px-0 py-2">

      {/* ── Toast ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0,   x: '-50%' }}
            exit={{    opacity: 0, y: -20,  x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 bg-forest-800 text-white font-bold text-sm rounded-full shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current animate-bounce" aria-hidden="true" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stage-up banner ─────────────────────────────────────────── */}
      <AnimatePresence>
        {stageUpBanner && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0,   x: '-50%' }}
            exit={{    opacity: 0, y: -20,  x: '-50%' }}
            className="fixed top-16 left-1/2 z-50 px-6 py-3 bg-emerald-700 text-white font-bold text-sm rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/40"
          >
            {stageUpBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ─────────────────────────────────────────────── */}
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

      {/* ── 3-Column Layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <StatsSidebar
          streak={streak}
          growthProgress={growthProgress}
          stageInfo={stageInfo}
          savedTotal={savedTotal}
          actionsCount={loggedActions.length}
          badges={badges}
          hoveredBadge={hoveredBadge}
          onHoverBadge={setHoveredBadge}
        />

        <TreeDashboard
          growthProgress={growthProgress}
          reductionPercent={reductionPercent}
          treeHealth={treeHealth}
          stageInfo={stageInfo}
          isAncient={isAncient}
          footprintContrib={footprintContrib}
          actionContrib={actionContrib}
          streakContrib={streakContrib}
          healthColor={healthStatus.color}
          healthLabel={healthStatus.label}
        />

        <EmissionsBreakdown
          currentFootprint={currentFootprint}
          currentTotal={currentTotal}
          petals={petals}
          trendData={trendData}
          loggedActions={loggedActions}
          expandedPetal={expandedPetal}
          onExpandPetal={setExpandedPetal}
          onQuickLog={handleQuickLog}
        />

      </div>
    </div>
  );
}
