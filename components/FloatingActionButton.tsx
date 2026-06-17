'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Bike, Leaf, Sun, Plug, Compass, Check } from 'lucide-react';
import { useRootedStore } from '../store/useRootedStore';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const { user, logAction } = useRootedStore();

  if (!user) return null;

  const quickActions = [
    { id: 'walk_bike_trip', name: 'Walk/Bike', icon: Bike, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'ate_vegan', name: 'Vegan Meal', icon: Leaf, color: 'bg-teal-500 hover:bg-teal-600' },
    { id: 'line_dry_laundry', name: 'Line Dry', icon: Sun, color: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'unplugged_vampire', name: 'Unplug Standby', icon: Plug, color: 'bg-sky-500 hover:bg-sky-600' },
  ];

  const handleQuickLog = (actionId: string, name: string) => {
    logAction(actionId);
    setLastLogged(name);
    setTimeout(() => setLastLogged(null), 2000);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end">
      
      {/* Dynamic Success Toast */}
      <AnimatePresence>
        {lastLogged && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            className="mb-3 px-4 py-2 bg-forest-400 text-forest-950 text-xs font-semibold rounded-full shadow-lg border border-card-border/10 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Logged: {lastLogged}! Tree is growing!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.7, y: 15 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                    y: 15,
                    transition: { delay: (quickActions.length - 1 - index) * 0.05 }
                  }}
                  className="flex items-center gap-2 group"
                >
                  {/* Floating Action Name Label */}
                  <span className="bg-forest-800 text-cream-950 text-xs font-bold px-2.5 py-1 rounded-lg border border-card-border shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                    {action.name}
                  </span>
                  
                  {/* Circular Button */}
                  <button
                    onClick={() => handleQuickLog(action.id, action.name)}
                    aria-label={`Log ${action.name}`}
                    className={`w-11 h-11 rounded-full ${action.color} text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}

            {/* Navigation link to see all actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 15 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { delay: quickActions.length * 0.05, type: 'spring', stiffness: 260, damping: 20 }
              }}
              exit={{
                opacity: 0,
                scale: 0.7,
                y: 15,
                transition: { delay: 0 }
              }}
              className="flex items-center gap-2 group"
            >
              <span className="bg-forest-800 text-cream-950 text-xs font-bold px-2.5 py-1 rounded-lg border border-card-border shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                All Actions
              </span>
              <Link
                href="/actions"
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 rounded-full bg-forest-400 text-forest-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/10"
              >
                <Compass className="w-5 h-5 animate-spin-slow" />
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle quick log menu"
        className={`w-14 h-14 rounded-full ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90'
            : 'bg-forest-400 text-forest-950 hover:bg-forest-300'
        } flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/15 cursor-pointer`}
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <Plus className="w-7 h-7 stroke-[2.5]" />
        )}
      </button>
    </div>
  );
}
