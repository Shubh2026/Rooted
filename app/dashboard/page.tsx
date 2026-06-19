'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useRootedStore } from '../../store/useRootedStore';
import { getTreeStage, TREE_STAGES } from '../../components/tree/AnimatedTreeSVG';
import { useTreeGrowth } from '../../hooks/useTreeGrowth';
import StatsSidebar from '../../components/dashboard/StatsSidebar';
import TreeDisplay from '../../components/dashboard/TreeDisplay';
import EmissionsBreakdown from '../../components/dashboard/EmissionsBreakdown';
import RecentActivity from '../../components/dashboard/RecentActivity';

/**
 * Dashboard Page
 *
 * Slim orchestration page that reads from the store, invokes the `useTreeGrowth` hook
 * for derived carbon/tree calculations, and maps sub-components inside a responsive grid.
 */
export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    currentFootprint,
    loggedActions,
    badges,
    streak,
    treeHealth,
    logAction,
  } = useRootedStore();

  const {
    growthProgress,
    stageInfo,
    isAncient,
    healthStatus,
    reductionPercent,
    savedTotal,
    baselineTotal,
    currentTotal,
    contributions: { footprintContrib, actionContrib, streakContrib },
  } = useTreeGrowth();

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [expandedPetal, setExpandedPetal] = useState<string | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [prevProgress, setPrevProgress] = useState(0);
  const [stageUpBanner, setStageUpBanner] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || !currentFootprint)) {
      router.replace('/');
    }
  }, [mounted, user, currentFootprint, router]);

  // Memoized trend chart data
  const trendData = useMemo(() => {
    const baseT = baselineTotal / 1000;
    const curT = currentTotal / 1000;
    return [
      { month: 'Jan', emissions: baseT },
      { month: 'Feb', emissions: parseFloat((baseT * 0.96).toFixed(2)) },
      { month: 'Mar', emissions: parseFloat((baseT * 0.91).toFixed(2)) },
      { month: 'Apr', emissions: parseFloat(curT.toFixed(2)) },
    ];
  }, [baselineTotal, currentTotal]);

  // Memoized petals
  const petals = useMemo(() => [
    {
      id: 'transport',
      name: 'Transport',
      icon: '🚗',
      value: currentFootprint?.transport ?? 0,
      color: 'bg-emerald-600',
      actionId: 'walk_bike_trip',
      actionLabel: 'Walk or Cycle (5km)',
      tip: 'Walking or cycling avoids private fuel combustion. Take transit for longer commutes.',
    },
    {
      id: 'diet',
      name: 'Diet & Food',
      icon: '🥗',
      value: currentFootprint?.diet ?? 0,
      color: 'bg-coral-500',
      actionId: 'ate_vegan',
      actionLabel: 'Eat a Vegan Meal',
      tip: 'Avoiding meat and cheese cuts agricultural methane and chemical nitrogen loading.',
    },
    {
      id: 'energy',
      name: 'Home Energy',
      icon: '⚡',
      value: currentFootprint?.energy ?? 0,
      color: 'bg-amber-400',
      actionId: 'line_dry_laundry',
      actionLabel: 'Line-Dry Laundry',
      tip: 'Unplug phantom loads and choose renewable certified utility grid suppliers.',
    },
    {
      id: 'flights',
      name: 'Flights',
      icon: '✈️',
      value: currentFootprint?.flights ?? 0,
      color: 'bg-sky-500',
      actionId: 'public_transit',
      actionLabel: 'Commute via Transit',
      tip: 'Offset flight carbon indices by replacing short vehicle commutes with rail/bus trips.',
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: '🛍️',
      value: currentFootprint?.shopping ?? 0,
      color: 'bg-[#9c27b0]',
      actionId: 'bought_secondhand',
      actionLabel: 'Buy Secondhand',
      tip: 'Buying secondhand apparel and electronics avoids carbon-heavy manufacturing loops.',
    },
  ], [currentFootprint]);

  // ── Stage-up notification ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const currentStage = getTreeStage(growthProgress).stage;
    const prevStage = getTreeStage(prevProgress).stage;
    if (currentStage > prevStage && prevProgress !== 0) {
      const info = TREE_STAGES.find((s) => s.stage === currentStage);
      if (info) {
        setStageUpBanner(`🌿 Your tree leveled up to ${info.name}!`);
        setTimeout(() => setStageUpBanner(null), 4000);
      }
    }
    setPrevProgress(growthProgress);
  }, [growthProgress, prevProgress, mounted]);

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
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
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
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
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
            <span className={`${healthStatus.color} font-bold`}>
              {healthStatus.label.toLowerCase()}
            </span>
            .
          </p>
        </div>
      </div>

      {/* ── 3-Column Layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Stats Sidebar */}
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

        {/* Column 2: Tree Display */}
        <TreeDisplay
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

        {/* Column 3: Emissions Breakdown & Recent Activities */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <EmissionsBreakdown
            currentFootprint={currentFootprint}
            currentTotal={currentTotal}
            petals={petals}
            trendData={trendData}
            expandedPetal={expandedPetal}
            onExpandPetal={setExpandedPetal}
            onQuickLog={handleQuickLog}
          />
          <RecentActivity loggedActions={loggedActions} />
        </div>
      </div>
    </div>
  );
}
