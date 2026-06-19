'use client';

/**
 * components/dashboard/StatsSidebar.tsx
 *
 * Left sidebar: Active Streak, Garden Stats, Earned Badges.
 * Pure display component — receives all data as props (no store reads).
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TreeStageInfo } from '../tree/AnimatedTreeSVG';
import type { Badge } from '../../lib/emissionFactors';

interface Props {
  streak: number;
  growthProgress: number;
  stageInfo: TreeStageInfo;
  savedTotal: number;
  actionsCount: number;
  badges: Badge[];
  hoveredBadge: string | null;
  onHoverBadge: (id: string | null) => void;
}

function StatsSidebar({
  streak,
  growthProgress,
  stageInfo,
  savedTotal,
  actionsCount,
  badges,
  hoveredBadge,
  onHoverBadge,
}: Props) {
  return (
    <div className="lg:col-span-3 flex flex-col gap-6">

      {/* Active streak */}
      <div className="glass-panel rounded-3xl p-5 flex items-center gap-4 shadow-organic">
        <div className="w-12 h-12 rounded-full bg-orange-950/30 border border-orange-900/30 text-orange-400 flex items-center justify-center text-xl animate-pulse">
          🔥
        </div>
        <div>
          <div className="text-[10px] text-[#A3C4B1] font-bold uppercase tracking-wider">Active Streak</div>
          <div className="text-xl font-serif font-bold text-[#E8EDE9] mt-0.5">
            {streak} Day{streak > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Garden stats */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-organic">
        <h3 className="font-serif font-bold text-sm text-[#E8EDE9] border-b border-card-border/50 pb-2">
          Garden Stats
        </h3>
        <div className="space-y-3">
          <StatRow label="Growth Stage" value={<span className="flex items-center gap-1">{stageInfo.icon} {stageInfo.name}</span>} />
          <StatRow label="Growth Progress" value={<span className="text-emerald-400">{growthProgress}%</span>} />
          <StatRow label="Actions Logged"  value={<span>{actionsCount} / 50</span>} />
          <StatRow
            label="Cumulative Offset"
            value={<span className="text-emerald-400">-{savedTotal.toFixed(0)} kg CO₂e</span>}
          />
        </div>
      </div>

      {/* Badges gallery */}
      <div className="glass-panel rounded-3xl p-5 shadow-organic">
        <h3 className="font-serif font-bold text-sm text-[#E8EDE9] mb-3">Earned Badges</h3>
        <div className="grid grid-cols-5 gap-2.5 relative">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className="relative flex justify-center"
                onMouseEnter={() => onHoverBadge(badge.id)}
                onMouseLeave={() => onHoverBadge(null)}
              >
                <div
                  className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                    isUnlocked
                      ? 'bg-forest-800/80 border-forest-600/30 grayscale-0 scale-100 shadow-sm text-white'
                      : 'badge-locked bg-forest-950/40 border-forest-900/10 grayscale opacity-35 scale-90 text-white/40'
                  }`}
                  role="img"
                  aria-label={`${badge.title}${isUnlocked ? ' (unlocked)' : ' (locked)'}`}
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
      </div>

    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-[#A3C4B1]">{label}:</span>
      <span className="font-bold text-[#E8EDE9]">{value}</span>
    </div>
  );
}

export default memo(StatsSidebar);
