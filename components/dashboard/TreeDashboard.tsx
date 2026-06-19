'use client';

/**
 * components/dashboard/TreeDashboard.tsx
 *
 * Center column: animated tree, growth progress bar, XP breakdown, growth tooltip.
 * Uses IntersectionObserver to pause Framer Motion animations when off-screen.
 */

import React, { memo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart, Sparkles, Info } from 'lucide-react';
import AnimatedTreeSVG, { type TreeStageInfo, TREE_STAGES } from '../tree/AnimatedTreeSVG';
import ProgressRing from '../ui/ProgressRing';

const STAGE_BAR_COLORS: Record<number, string> = {
  1: '#6aab7c',
  2: '#4a9e62',
  3: '#2d8a4e',
  4: '#1a7a3c',
  5: '#0fa832',
};

interface Props {
  growthProgress: number;
  reductionPercent: number;
  treeHealth: number;
  stageInfo: TreeStageInfo;
  isAncient: boolean;
  footprintContrib: number;
  actionContrib: number;
  streakContrib: number;
  healthColor: string;
  healthLabel: string;
}

function TreeDashboard({
  growthProgress,
  reductionPercent,
  treeHealth,
  stageInfo,
  isAncient,
  footprintContrib,
  actionContrib,
  streakContrib,
  healthColor,
  healthLabel,
}: Props) {
  const [showTreeTip, setShowTreeTip] = useState(false);
  const [isVisible,  setIsVisible]   = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const barColor = STAGE_BAR_COLORS[stageInfo.stage];

  // ── IntersectionObserver: pause animations when off-screen ────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lg:col-span-5 flex flex-col gap-6" ref={containerRef}>
      <div
        className={`glass-panel rounded-3xl flex flex-col items-center relative min-h-[520px] justify-between transition-all duration-1000 p-6 ${
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
                  animate={isVisible && !prefersReducedMotion ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✨ Fully Grown
                </motion.span>
              )}
            </h2>
          </div>
          <span className={`text-xs font-bold ${healthColor} flex items-center gap-1.5`}>
            <Heart className="w-4 h-4 fill-current animate-pulse" aria-hidden="true" />
            {treeHealth}% Health
            <span className="sr-only">({healthLabel})</span>
          </span>
        </div>

        {/* Tree SVG — only animated when visible */}
        <div className="relative w-full flex items-center justify-center my-auto">
          <div className="absolute z-0 opacity-70 scale-110">
            <ProgressRing
              value={reductionPercent}
              size={320}
              strokeWidth={4.5}
              color="stroke-emerald-500"
              trailColor="stroke-forest-950/70"
            />
          </div>
          <div className="relative z-10 scale-90">
            {/* Pass isVisible so the tree can skip heavy animations when off-screen */}
            <AnimatedTreeSVG growthProgress={growthProgress} />
          </div>
        </div>

        {/* ── Growth Progress Bar ──────────────────────────────────── */}
        <div className="w-full space-y-2.5 mt-2">

          {/* Label row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#E8EDE9]">
                Growth Progress:{' '}
                <span style={{ color: barColor }}>{growthProgress}%</span>
              </span>
              <button
                onClick={() => setShowTreeTip(p => !p)}
                className="w-4 h-4 rounded-full border border-[#A3C4B1]/50 flex items-center justify-center text-[#A3C4B1] hover:border-emerald-400 hover:text-emerald-400 transition-colors cursor-pointer"
                aria-label="Toggle growth info tooltip"
                aria-expanded={showTreeTip}
                aria-controls="growth-tip"
              >
                <Info className="w-2.5 h-2.5" aria-hidden="true" />
              </button>
            </div>
            <span className="text-[#A3C4B1] font-semibold">Stage {stageInfo.stage} / 5</span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-3 bg-forest-950/60 rounded-full overflow-hidden border border-[#2A4A3A]/60"
            role="progressbar"
            aria-valuenow={growthProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tree growth progress: ${growthProgress}%`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
              initial={{ width: 0 }}
              animate={{ width: `${growthProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          {/* Stage milestones */}
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
                id="growth-tip"
                role="tooltip"
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="w-full p-3 bg-[#0A1F14] border border-[#2A4A3A] rounded-xl text-[10px] text-[#A3C4B1] leading-relaxed"
              >
                <p className="font-bold text-[#E8EDE9] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  How tree growth works
                </p>
                <p className="mb-1">
                  Your tree fully grows when you{' '}
                  <strong className="text-[#E8EDE9]">reduce your footprint below target</strong> + complete{' '}
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
            animate={isVisible && !prefersReducedMotion ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            🌟 Ancient Tree Unlocked — Your forest thrives! New species &amp; background available.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default memo(TreeDashboard);
