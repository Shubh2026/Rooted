'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRootedStore } from '../../store/useRootedStore';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface TreeStageInfo {
  stage: number;
  name: string;
  icon: string;
  desc: string;
  minProgress: number;
  maxProgress: number;
}

export const TREE_STAGES: TreeStageInfo[] = [
  { stage: 1, name: 'Sapling',            icon: '🌱', desc: 'Just sprouted from the soil',       minProgress: 0,  maxProgress: 20  },
  { stage: 2, name: 'Young Tree',         icon: '🌿', desc: 'Developing first leaves',            minProgress: 21, maxProgress: 45  },
  { stage: 3, name: 'Growing Tree',       icon: '🌳', desc: 'Growing strong branches',            minProgress: 46, maxProgress: 70  },
  { stage: 4, name: 'Mature Tree',        icon: '🍁', desc: 'Blossoming and stable',              minProgress: 71, maxProgress: 90  },
  { stage: 5, name: 'Ancient Tree',       icon: '👑', desc: 'A pillar of the community grove',   minProgress: 91, maxProgress: 100 },
];

export function getTreeStage(progress: number): TreeStageInfo {
  return TREE_STAGES.find(s => progress <= s.maxProgress) ?? TREE_STAGES[4];
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface AnimatedTreeSVGProps {
  growthProgress: number; // 0 – 100
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AnimatedTreeSVG({ growthProgress = 0 }: AnimatedTreeSVGProps) {
  const { hasNewBlossom, clearBlossomAlert } = useRootedStore();
  const [mounted,    setMounted]    = useState(false);
  const [prevStage,  setPrevStage]  = useState(0);
  const [stageFlash, setStageFlash] = useState(false);
  const [isVisible,  setIsVisible]  = useState(true);
  const containerRef   = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  // ── Pause animations when off-screen (IntersectionObserver) ─────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasNewBlossom) {
      const t = setTimeout(() => clearBlossomAlert(), 3000);
      return () => clearTimeout(t);
    }
  }, [hasNewBlossom, clearBlossomAlert]);

  const stageInfo = getTreeStage(growthProgress);

  // ── isAncient and pollenData MUST live before any early return (Rules of Hooks) ──
  const isAncient = stageInfo.stage === 5;

  const pollenData = useMemo(() => {
    const count = isAncient ? 14 : stageInfo.stage === 4 ? 10 : 6;
    return Array.from({ length: count }, (_, i) => ({
      r:      1.2 + (((i * 7 + 3) % 10) / 10) * 1.3,
      xStart: 80 + (i / count) * 240,
      xDrift: (i % 2 === 0 ? 25 : -25),
      dur:    6 + i * 1.3,
      delay:  i * 0.6,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageInfo.stage, isAncient]);

  // Flash animation when stage changes
  useEffect(() => {
    if (!mounted) return;
    if (stageInfo.stage !== prevStage && prevStage !== 0) {
      setStageFlash(true);
      const t = setTimeout(() => setStageFlash(false), 1200);
      return () => clearTimeout(t);
    }
    setPrevStage(stageInfo.stage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageInfo.stage]);

  if (!mounted) return null;

  // Pause all looping animations when off-screen or reduced-motion is preferred
  const shouldAnimate = isVisible && !prefersReduced;

  // ── Growth ratio used for sizing (0.30 → 1.05) ──────────────────────────────
  // Stage thresholds → visual growthRatio:
  //   Stage 1 (0-20%)   → 0.30 – 0.44
  //   Stage 2 (21-45%)  → 0.45 – 0.62
  //   Stage 3 (46-70%)  → 0.63 – 0.80
  //   Stage 4 (71-90%)  → 0.81 – 0.97
  //   Stage 5 (91-100%) → 0.98 – 1.10
  const growthRatio = 0.30 + (growthProgress / 100) * 0.80;

  // ── Trunk + canopy sizing ───────────────────────────────────────────────────
  const trunkBaseWidth = Math.max(8, 18 * growthRatio);
  const trunkHeight    = Math.max(38, 105 * growthRatio);
  const trunkPath      = `M 200 380 Q 198 300 200 ${380 - trunkHeight}`;
  const trunkTopY      = 380 - trunkHeight;

  // ── Leaf palette per stage ──────────────────────────────────────────────────
  const leafPalettes: Record<number, string[]> = {
    1: ['#5a9e6e', '#4a8a5e'],                            // pale young green
    2: ['#3a8f56', '#4aab6a', '#2e7a46'],                 // fresh green
    3: ['#2d7a4a', '#3da860', '#52c07a'],                 // vibrant mid-green
    4: ['#1e6e40', '#2d9e58', '#3db86e', '#52c87e'],     // lush, deep green
    5: ['#0f5e30', '#1a8a47', '#26b05e', '#3dcc74', '#5ae08c'], // ancient radiant
  };
  const leafColors = leafPalettes[stageInfo.stage];
  const leavesPerCluster = stageInfo.stage === 5 ? 7
    : stageInfo.stage === 4 ? 5
    : stageInfo.stage === 3 ? 4
    : stageInfo.stage === 2 ? 3
    : 2;

  // ── Branch definitions ──────────────────────────────────────────────────────
  // Each branch has a minStage so they sprout progressively
  const branches = [
    {
      id: 'low-left',
      d: `M 199 ${380 - trunkHeight * 0.4} Q 170 ${380 - trunkHeight * 0.5} 140 ${380 - trunkHeight * 0.7}`,
      width: 7 * growthRatio,
      minStage: 2,
      leaves: [
        { x: 140, y: 380 - trunkHeight * 0.7,  scale: 0.85 },
        { x: 120, y: 380 - trunkHeight * 0.82, scale: 0.70 },
      ]
    },
    {
      id: 'low-right',
      d: `M 201 ${380 - trunkHeight * 0.35} Q 230 ${380 - trunkHeight * 0.45} 260 ${380 - trunkHeight * 0.65}`,
      width: 7 * growthRatio,
      minStage: 2,
      leaves: [
        { x: 260, y: 380 - trunkHeight * 0.65, scale: 0.85 },
        { x: 280, y: 380 - trunkHeight * 0.77, scale: 0.70 },
      ]
    },
    {
      id: 'mid-left',
      d: `M 200 ${380 - trunkHeight * 0.7} Q 165 ${380 - trunkHeight * 0.85} 145 ${380 - trunkHeight * 1.15}`,
      width: 5 * growthRatio,
      minStage: 3,
      leaves: [
        { x: 145, y: 380 - trunkHeight * 1.15, scale: 0.95 },
        { x: 125, y: 380 - trunkHeight * 1.27, scale: 0.80 },
      ]
    },
    {
      id: 'mid-right',
      d: `M 200 ${380 - trunkHeight * 0.65} Q 235 ${380 - trunkHeight * 0.8} 255 ${380 - trunkHeight * 1.1}`,
      width: 5 * growthRatio,
      minStage: 3,
      leaves: [
        { x: 255, y: 380 - trunkHeight * 1.1,  scale: 0.95 },
        { x: 275, y: 380 - trunkHeight * 1.22, scale: 0.80 },
      ]
    },
    {
      id: 'top-left',
      d: `M 200 ${trunkTopY} Q 185 ${trunkTopY - 40 * growthRatio} 170 ${trunkTopY - 80 * growthRatio}`,
      width: 4 * growthRatio,
      minStage: 4,
      leaves: [
        { x: 170, y: trunkTopY - 80 * growthRatio,  scale: 1.05 },
        { x: 152, y: trunkTopY - 105 * growthRatio, scale: 0.88 },
      ]
    },
    {
      id: 'top-right',
      d: `M 200 ${trunkTopY} Q 215 ${trunkTopY - 40 * growthRatio} 230 ${trunkTopY - 80 * growthRatio}`,
      width: 4 * growthRatio,
      minStage: 4,
      leaves: [
        { x: 230, y: trunkTopY - 80 * growthRatio,  scale: 1.05 },
        { x: 248, y: trunkTopY - 105 * growthRatio, scale: 0.88 },
      ]
    },
    {
      id: 'top-center',
      d: `M 200 ${trunkTopY} Q 200 ${trunkTopY - 60 * growthRatio} 200 ${trunkTopY - 112 * growthRatio}`,
      width: 3 * growthRatio,
      minStage: 4,
      leaves: [
        { x: 200, y: trunkTopY - 112 * growthRatio, scale: 1.15 },
        { x: 182, y: trunkTopY - 132 * growthRatio, scale: 0.92 },
      ]
    },
    // Ancient-only extra branches (stage 5)
    {
      id: 'ancient-far-left',
      d: `M 199 ${380 - trunkHeight * 0.5} Q 145 ${380 - trunkHeight * 0.6} 100 ${380 - trunkHeight * 0.9}`,
      width: 6 * growthRatio,
      minStage: 5,
      leaves: [
        { x: 100, y: 380 - trunkHeight * 0.9,  scale: 1.0 },
        { x: 80,  y: 380 - trunkHeight * 1.05, scale: 0.85 },
        { x: 110, y: 380 - trunkHeight * 1.1,  scale: 0.75 },
      ]
    },
    {
      id: 'ancient-far-right',
      d: `M 201 ${380 - trunkHeight * 0.5} Q 255 ${380 - trunkHeight * 0.6} 300 ${380 - trunkHeight * 0.9}`,
      width: 6 * growthRatio,
      minStage: 5,
      leaves: [
        { x: 300, y: 380 - trunkHeight * 0.9,  scale: 1.0 },
        { x: 320, y: 380 - trunkHeight * 1.05, scale: 0.85 },
        { x: 290, y: 380 - trunkHeight * 1.1,  scale: 0.75 },
      ]
    },
  ];

  // ── Ancient Tree filter / glow ──────────────────────────────────────────────
  // (isAncient and pollenData are declared above, before the early return)
  const treeFilter = isAncient
    ? 'drop-shadow(0 0 14px rgba(61,204,116,0.55)) drop-shadow(0 0 30px rgba(61,204,116,0.25))'
    : 'drop-shadow(2px 6px 12px rgba(0,0,0,0.35))';

  // ── Canopy glow overlay (stage 5 only) ─────────────────────────────────────
  const showCanopyGlow = isAncient;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center w-full max-w-[420px] aspect-square rounded-3xl p-4 overflow-hidden select-none transition-all duration-1000 ${
        isAncient
          ? 'bg-gradient-to-b from-emerald-900/20 via-forest-900/10 to-transparent'
          : 'bg-gradient-to-b from-transparent to-forest-900/10'
      }`}
    >
      {/* Stage-change flash overlay */}
      <AnimatePresence>
        {stageFlash && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-emerald-400/15 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Ancient Tree ambient glow rings */}
      <AnimatePresence>
        {showCanopyGlow && (
          <>
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none z-0"
              initial={{ opacity: 0 }}
              animate={shouldAnimate ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
              transition={{ repeat: shouldAnimate ? Infinity : 0, duration: 3.5, ease: 'easeInOut' }}
              style={{ boxShadow: 'inset 0 0 60px rgba(61,204,116,0.18)' }}
            />
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none z-0"
              animate={shouldAnimate ? { opacity: [0.1, 0.3, 0.1] } : { opacity: 0.1 }}
              transition={{ repeat: shouldAnimate ? Infinity : 0, duration: 5, ease: 'easeInOut', delay: 1 }}
              style={{ boxShadow: 'inset 0 0 100px rgba(90,224,140,0.1)' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* SVG Viewport — accessible image with title + desc for screen readers */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full relative z-10"
        style={{ filter: treeFilter, transition: 'filter 1.5s ease' }}
        role="img"
        aria-labelledby={`tree-title-${stageInfo.stage}`}
        aria-describedby={`tree-desc-${stageInfo.stage}`}
      >
        {/* Accessible text — hidden visually, read by screen readers */}
        <title id={`tree-title-${stageInfo.stage}`}>
          {stageInfo.icon} {stageInfo.name} — {growthProgress}% growth
        </title>
        <desc id={`tree-desc-${stageInfo.stage}`}>
          {stageInfo.desc}. Tree health: {Math.round(growthProgress)}%.
          {isAncient ? ' Your tree has reached full Ancient Tree status.' : ''}
        </desc>
        <defs>
          <radialGradient id="sunlight-glow" cx="30%" cy="30%" r="70%">
            <stop offset="0%"   stopColor={isAncient ? 'rgba(90,224,140,0.12)' : 'rgba(255,220,100,0.08)'} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          {/* Ancient Tree canopy glow gradient */}
          {isAncient && (
            <radialGradient id="ancient-glow" cx="50%" cy="40%" r="55%">
              <stop offset="0%"   stopColor="rgba(61,204,116,0.22)" />
              <stop offset="100%" stopColor="rgba(61,204,116,0)"    />
            </radialGradient>
          )}
        </defs>

        {/* Ambient background glow */}
        <circle cx="200" cy="180" r="180" fill="url(#sunlight-glow)" pointerEvents="none" />

        {/* Ancient canopy radial glow */}
        {isAncient && (
          <motion.ellipse
            cx="200" cy={trunkTopY + 10}
            rx="160" ry="140"
            fill="url(#ancient-glow)"
            animate={shouldAnimate ? { opacity: [0.6, 1, 0.6], ry: [140, 148, 140] } : { opacity: 0.6 }}
            transition={{ repeat: shouldAnimate ? Infinity : 0, duration: 4, ease: 'easeInOut' }}
          />
        )}

        {/* Floating pollen / fireflies */}
        {pollenData.map((p, i) => (
          <motion.circle
            key={i}
            r={p.r}
            fill={isAncient ? '#5ae08c' : '#a8dabc'}
            initial={{ cx: p.xStart, cy: 370, opacity: 0 }}
            animate={shouldAnimate ? {
              cy:      [370, 60],
              cx:      [p.xStart, p.xStart + p.xDrift, p.xStart],
              opacity: [0, isAncient ? 0.9 : 0.6, 0],
            } : { opacity: 0 }}
            transition={{
              repeat:   shouldAnimate ? Infinity : 0,
              duration: p.dur,
              ease:     'easeOut',
              delay:    p.delay,
            }}
          />
        ))}

        {/* Tree Roots */}
        <motion.path
          d="M 155 380 Q 200 377 245 380"
          stroke="var(--tree-trunk)"
          strokeWidth={trunkBaseWidth * 0.65}
          strokeLinecap="round"
          fill="none"
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />

        {/* Trunk */}
        <motion.path
          key={`trunk-${stageInfo.stage}`}
          d={trunkPath}
          stroke="var(--tree-trunk)"
          strokeWidth={trunkBaseWidth}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />

        {/* Branches + Leaves */}
        {branches.map((branch) => {
          const visible = stageInfo.stage >= branch.minStage;

          return (
            <g key={branch.id}>
              <motion.path
                d={branch.d}
                stroke="var(--tree-branch)"
                strokeWidth={branch.width}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: visible ? 1 : 0 }}
                transition={{ duration: 1.4, ease: 'easeInOut', delay: (branch.minStage - 1) * 0.15 }}
              />

              {visible && branch.leaves.map((leaf, leafIdx) => (
                <motion.g
                  key={`${branch.id}-leaf-${leafIdx}`}
                  transform={`translate(${leaf.x}, ${leaf.y}) scale(${leaf.scale * growthRatio})`}
                  animate={{
                    rotate: [-3 - leafIdx * 2, 3 + leafIdx * 2, -3 - leafIdx * 2],
                    y: [0, -1.5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.5 + leafIdx * 0.8,
                    ease: 'easeInOut',
                  }}
                >
                  {Array.from({ length: leavesPerCluster }).map((_, i) => {
                    const angle = (i * 360) / leavesPerCluster - 45;
                    const color = leafColors[i % leafColors.length];
                    return (
                      <motion.path
                        key={i}
                        d="M 0 0 Q 9 -12 18 0 Q 9 11 0 0 Z"
                        fill={color}
                        transform={`rotate(${angle})`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 130, damping: 10, delay: 0.07 * i }}
                      />
                    );
                  })}

                  {/* Ancient Tree sparkle glint on each leaf cluster */}
                  {isAncient && (
                    <motion.circle
                      cx="9" cy="-6" r="2.5"
                      fill="#c8ffd4"
                      animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.3, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5 + leafIdx * 0.5,
                        ease: 'easeInOut',
                        delay: leafIdx * 0.3,
                      }}
                    />
                  )}

                  {/* Blossom popups on new XP events */}
                  <AnimatePresence>
                    {hasNewBlossom && leafIdx === 0 && (
                      <motion.path
                        d="M 0 0 C -4 -4, -7 -1, -6 2 C -5 6, -1 6, 0 1 C 1 6, 5 6, 6 2 C 7 -1, 4 -4, 0 0 Z"
                        fill="var(--tree-blossom)"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 45 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.g>
              ))}
            </g>
          );
        })}

        {/* Sapling crown (stage 1 only — tiny leaf tuft at top) */}
        {stageInfo.stage === 1 && (
          <motion.ellipse
            cx="200" cy={trunkTopY - 10}
            rx={14 + growthProgress * 0.4}
            ry={10 + growthProgress * 0.3}
            fill={leafColors[0]}
            fillOpacity={0.85}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          />
        )}
      </svg>

      {/* Stage label at bottom of visual */}
      <div className="absolute bottom-2 text-center text-[10px] text-muted-text opacity-50 font-semibold tracking-wider uppercase pointer-events-none">
        {stageInfo.icon} {isAncient ? '✨ Ancient Tree — Fully Grown ✨' : `${stageInfo.name} — Rustling in a gentle breeze`}
      </div>
    </div>
  );
}
