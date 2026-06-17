'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bike, Train, Users, Leaf, Egg, Trash2, Sun, Plug, Thermometer, CupSoda, RefreshCw, ShoppingBag, Check, Compass, Info, TreePine } from 'lucide-react';
import { useRootedStore } from '../../store/useRootedStore';
import { LOGGABLE_ACTIONS } from '../../lib/emissionFactors';
import OrganicCard from '../../components/ui/OrganicCard';
import OrganicButton from '../../components/ui/OrganicButton';

// ─── Icon map ────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bike, Train, Users, Leaf, Egg, Trash2, Sun, Plug, Thermometer, CupSoda, RefreshCw, ShoppingBag,
};

// ─── Loading skeleton card ────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[190px] flex flex-col justify-between animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-forest-800/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-forest-800/60 rounded w-3/4" />
          <div className="h-3 bg-forest-800/40 rounded w-full" />
          <div className="h-3 bg-forest-800/40 rounded w-5/6" />
        </div>
      </div>
      <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#2A4A3A]/30">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-forest-800/40 rounded" />
          <div className="h-5 w-14 bg-forest-800/40 rounded" />
        </div>
        <div className="h-8 w-24 bg-forest-800/50 rounded-full" />
      </div>
    </div>
  );
}

// ─── Category tabs config ──────────────────────────────────────────────────────
type Category = 'all' | 'transport' | 'food' | 'energy' | 'waste';

const categoryTabs: { id: Category; label: string; emoji: string }[] = [
  { id: 'all',       label: 'All Items',    emoji: '🌿' },
  { id: 'transport', label: 'Transport',    emoji: '🚗' },
  { id: 'food',      label: 'Food / Diet',  emoji: '🥗' },
  { id: 'energy',    label: 'Home Energy',  emoji: '⚡' },
  { id: 'waste',     label: 'Waste / Reuse',emoji: '♻️' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Actions() {
  const router = useRouter();
  const { user, logAction, loggedActions } = useRootedStore();

  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [successActionId,   setSuccessActionId]  = useState<string | null>(null);
  const [mounted,           setMounted]           = useState(false);

  // ── Split the two useEffects to satisfy Rules of Hooks order ──────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace('/');
    }
  }, [mounted, user, router]);

  // ── Stable filtered list ───────────────────────────────────────────────────
  const filteredActions = useMemo(
    () => LOGGABLE_ACTIONS.filter(
      a => selectedCategory === 'all' || a.category === selectedCategory
    ),
    [selectedCategory]
  );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalOffset = useMemo(
    () => loggedActions.reduce((s, a) => s + a.co2Saved, 0),
    [loggedActions]
  );
  const todayOffset = useMemo(() => {
    const today = new Date().toDateString();
    return loggedActions
      .filter(a => new Date(a.timestamp).toDateString() === today)
      .reduce((s, a) => s + a.co2Saved, 0);
  }, [loggedActions]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogClick = (actionId: string) => {
    logAction(actionId);
    setSuccessActionId(actionId);
    setTimeout(() => setSuccessActionId(null), 1600);
  };

  // ── Loading skeleton state (before hydration) ─────────────────────────────
  if (!mounted || !user) {
    return (
      <div className="px-4 md:px-0 py-2">
        {/* Skeleton header */}
        <div className="mb-8 h-10 w-56 bg-forest-800/50 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="glass-panel rounded-3xl p-5 h-24 animate-pulse bg-forest-800/30" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 py-2">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#E8EDE9] tracking-tight flex items-center gap-2">
            <Compass className="w-8 h-8 text-[#A3C4B1]" />
            Action Logger
          </h1>
          <p className="text-sm text-[#A3C4B1] mt-1">
            Log eco-friendly choices to grow your tree and earn XP.{' '}
            <span className="text-emerald-400 font-semibold">{loggedActions.length} actions logged so far.</span>
          </p>
        </div>
      </div>

      {/* ── Impact Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <OrganicCard hoverEffect={false} className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A3C4B1] font-bold uppercase tracking-wider">Today&apos;s Offset</p>
            <h3 className="font-serif font-bold text-3xl text-[#E8EDE9] mt-1">
              {todayOffset.toFixed(1)} <span className="text-xs font-sans font-medium text-[#A3C4B1]">kg CO₂e</span>
            </h3>
          </div>
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-2xl">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        </OrganicCard>

        <OrganicCard hoverEffect={false} className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A3C4B1] font-bold uppercase tracking-wider">Total Offset Saved</p>
            <h3 className="font-serif font-bold text-3xl text-[#E8EDE9] mt-1">
              {totalOffset.toFixed(1)} <span className="text-xs font-sans font-medium text-[#A3C4B1]">kg CO₂e</span>
            </h3>
          </div>
          <div className="p-3 bg-teal-950/30 border border-teal-900/30 text-teal-400 rounded-2xl">
            <Leaf className="w-6 h-6" />
          </div>
        </OrganicCard>

        <OrganicCard hoverEffect={false} className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A3C4B1] font-bold uppercase tracking-wider">Total Actions Logged</p>
            <h3 className="font-serif font-bold text-3xl text-[#E8EDE9] mt-1">
              {loggedActions.length} <span className="text-xs font-sans font-medium text-[#A3C4B1]">entries</span>
            </h3>
          </div>
          <div className="p-3 bg-forest-900/30 border border-forest-800/30 text-forest-300 rounded-2xl">
            <Bike className="w-6 h-6" />
          </div>
        </OrganicCard>
      </div>

      {/* ── Category Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#2A4A3A]/50">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === tab.id
                ? 'bg-forest-400 text-forest-950 border-forest-400 shadow-sm'
                : 'bg-[#11261D] text-[#A3C4B1] border-[#2A4A3A] hover:bg-forest-900/40 hover:text-white'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Actions Grid ─────────────────────────────────────────────────────── */}
      {filteredActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <TreePine className="w-12 h-12 text-[#2A4A3A]" />
          <p className="text-[#A3C4B1] font-semibold">No actions in this category yet.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
          >
            View all actions →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredActions.map((action) => {
              const IconComponent = iconMap[action.icon] || Info;
              const isSuccess = successActionId === action.id;
              const logCount = loggedActions.filter(l => l.actionId === action.id).length;

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                >
                  <OrganicCard className="flex flex-col justify-between min-h-[190px] h-full">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-2xl border transition-colors ${
                        isSuccess
                          ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-400'
                          : 'bg-forest-950 border-[#2A4A3A] text-[#A3C4B1]'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-base text-[#E8EDE9] leading-tight">
                            {action.name}
                          </h3>
                          {logCount > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-forest-800/60 text-[#A3C4B1] border border-[#2A4A3A]/60 whitespace-nowrap">
                              ×{logCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#A3C4B1] leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#2A4A3A]/50">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                          -{action.co2Saved.toFixed(1)} kg
                        </span>
                        <span className="text-[10px] font-bold text-forest-400 bg-forest-900/30 px-2 py-0.5 rounded border border-forest-800/30">
                          +{action.points} XP
                        </span>
                      </div>

                      <OrganicButton
                        onClick={() => handleLogClick(action.id)}
                        disabled={isSuccess}
                        className={`py-1.5 px-4 font-bold text-xs transition-all ${
                          isSuccess ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-transparent' : ''
                        }`}
                      >
                        {isSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Logged!
                          </>
                        ) : (
                          'Log Choice'
                        )}
                      </OrganicButton>
                    </div>
                  </OrganicCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── First-time empty state (no logs at all) ───────────────────────────── */}
      {loggedActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-5 bg-[#11261D]/60 border border-[#2A4A3A]/60 border-dashed rounded-2xl text-center"
        >
          <p className="text-[11px] text-[#A3C4B1] font-medium">
            🌱 <span className="font-bold text-[#E8EDE9]">Start here!</span> Log your first green choice above to begin growing your tree and earning XP.
          </p>
        </motion.div>
      )}

    </div>
  );
}
