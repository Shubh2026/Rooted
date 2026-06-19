'use client';

/**
 * components/dashboard/EmissionsBreakdown.tsx
 *
 * Right column: expandable category petals, monthly trend chart, recent activity.
 * Memoized — only re-renders when emission data or loggedActions change.
 */

import React, { memo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import type { FootprintBreakdown } from '../../lib/calculations';
import type { LoggedActionInstance } from '../../store/useRootedStore';

interface Petal {
  id: string;
  name: string;
  icon: string;
  value: number;
  color: string;
  actionId: string;
  actionLabel: string;
  tip: string;
}

interface TrendPoint {
  month: string;
  emissions: number;
}

interface Props {
  currentFootprint: FootprintBreakdown;
  currentTotal: number;
  petals: Petal[];
  trendData: TrendPoint[];
  loggedActions: LoggedActionInstance[];
  expandedPetal: string | null;
  onExpandPetal: (id: string | null) => void;
  onQuickLog: (actionId: string, label: string) => void;
}

function EmissionsBreakdown({
  currentTotal,
  petals,
  trendData,
  loggedActions,
  expandedPetal,
  onExpandPetal,
  onQuickLog,
}: Props) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">

      {/* ── Emission category petals ─────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-5 shadow-organic">
        <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-3">Emissions Breakdown</h3>
        <div className="flex flex-col gap-2.5">
          {petals.map((petal) => {
            const isExpanded   = expandedPetal === petal.id;
            const sharePercent = currentTotal > 0
              ? Math.round((petal.value / currentTotal) * 100)
              : 0;

            return (
              <div
                key={petal.id}
                className="border border-[#2A4A3A] rounded-2xl overflow-hidden transition-all duration-300 bg-[#11261D] shadow-sm hover:shadow-md hover:border-[#3D6E54]"
              >
                <button
                  onClick={() => onExpandPetal(isExpanded ? null : petal.id)}
                  className="w-full p-3 flex items-center justify-between gap-3 cursor-pointer text-left"
                  aria-expanded={isExpanded}
                  aria-controls={`petal-detail-${petal.id}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base" aria-hidden="true">{petal.icon}</span>
                    <div>
                      <span className="font-bold text-xs text-[#E8EDE9] block">{petal.name}</span>
                      <span className="text-[10px] text-[#A3C4B1]">
                        {petal.value.toLocaleString()} kg CO₂e / yr
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#A3C4B1]">{sharePercent}%</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#A3C4B1] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {/* Progress bar — always visible, role=progressbar for screen readers */}
                <div className="px-3 pb-2.5">
                  <div
                    className="relative w-full h-2 bg-forest-950/70 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={sharePercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${petal.name} share: ${sharePercent}%`}
                  >
                    <div
                      className={`progress-bar-fill h-full rounded-full ${petal.color} relative`}
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                  {/* Text label — not colour-only */}
                  <span className="sr-only">{petal.name}: {sharePercent}% of total emissions</span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id={`petal-detail-${petal.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#2A4A3A] bg-[#0A1F14]/40 p-3.5 text-xs text-[#E8EDE9] space-y-3"
                    >
                      <p className="text-[11px] leading-relaxed text-[#A3C4B1]">{petal.tip}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#2A4A3A]/50">
                        <span className="text-[10px] font-bold text-[#E8EDE9]">Quick logging available:</span>
                        <button
                          onClick={() => onQuickLog(petal.actionId, petal.actionLabel)}
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
      </div>

      {/* ── Monthly trend chart ──────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-5 shadow-organic">
        <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-4 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#A3C4B1]" aria-hidden="true" />
          Monthly Emissions Trend
        </h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
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
              <Area
                type="monotone"
                dataKey="emissions"
                stroke="#2d6a4f"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorEmissions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent activity feed ─────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-5 shadow-organic">
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
                  <span className="text-xs" aria-hidden="true">
                    {act.category === 'transport' ? '🚗'
                      : act.category === 'food'      ? '🥗'
                      : act.category === 'energy'    ? '⚡'
                      : '♻️'}
                  </span>
                  <div>
                    <p className="font-bold text-[#E8EDE9] text-[11px] truncate max-w-[125px]">{act.name}</p>
                    <p className="text-[9px] text-[#A3C4B1]/80">
                      <time dateTime={act.timestamp}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </time>
                    </p>
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
      </div>

    </div>
  );
}

export default memo(EmissionsBreakdown);
