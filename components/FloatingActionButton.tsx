'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Bike, Leaf, Sun, Plug, Compass, Check } from 'lucide-react';
import { useRootedStore } from '../store/useRootedStore';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen]       = useState(false);
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const { user, logAction }       = useRootedStore();

  // ── Refs for focus trap ───────────────────────────────────────────────────
  const menuRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!user) return null;

  const quickActions = [
    { id: 'walk_bike_trip',    name: 'Walk/Bike',      icon: Bike, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'ate_vegan',         name: 'Vegan Meal',     icon: Leaf, color: 'bg-teal-500   hover:bg-teal-600'    },
    { id: 'line_dry_laundry',  name: 'Line Dry',       icon: Sun,  color: 'bg-amber-500  hover:bg-amber-600'   },
    { id: 'unplugged_vampire', name: 'Unplug Standby', icon: Plug, color: 'bg-sky-500    hover:bg-sky-600'     },
  ];

  const handleQuickLog = (actionId: string, name: string) => {
    logAction(actionId);
    setLastLogged(name);
    setTimeout(() => setLastLogged(null), 2000);
    setIsOpen(false);
    // Return focus to trigger after menu closes
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // ── Keyboard handling: Escape closes, Tab traps focus ────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isOpen],
  );

  // Move focus into menu when it opens
  useEffect(() => {
    if (isOpen) {
      const first = menuRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), a:not([disabled])',
      );
      first?.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  return (
    /* Wrap everything so onKeyDown applies to the whole widget */
    <div
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end"
      onKeyDown={handleKeyDown}
    >
      {/* Success Toast */}
      <AnimatePresence>
        {lastLogged && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{    opacity: 0, y: -15, scale: 0.9 }}
            className="mb-3 px-4 py-2 bg-forest-400 text-forest-950 text-xs font-semibold rounded-full shadow-lg border border-card-border/10 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Logged: {lastLogged}! Tree is growing!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable menu — focus-trapped, role=menu */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Quick eco-action log menu"
            className="flex flex-col items-end gap-3 mb-4"
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.7, y: 15 }}
                  animate={{
                    opacity: 1, scale: 1, y: 0,
                    transition: { delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 },
                  }}
                  exit={{
                    opacity: 0, scale: 0.7, y: 15,
                    transition: { delay: (quickActions.length - 1 - index) * 0.05 },
                  }}
                  className="flex items-center gap-2 group"
                >
                  {/* Label */}
                  <span
                    id={`fab-label-${action.id}`}
                    className="bg-forest-800 text-[#E8EDE9] text-xs font-bold px-2.5 py-1 rounded-lg border border-card-border shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                  >
                    {action.name}
                  </span>

                  {/* Action button */}
                  <button
                    role="menuitem"
                    onClick={() => handleQuickLog(action.id, action.name)}
                    aria-label={`Log: ${action.name}`}
                    aria-describedby={`fab-label-${action.id}`}
                    className={`w-11 h-11 rounded-full ${action.color} text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </motion.div>
              );
            })}

            {/* All Actions link */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 15 }}
              animate={{
                opacity: 1, scale: 1, y: 0,
                transition: { delay: quickActions.length * 0.05, type: 'spring', stiffness: 260, damping: 20 },
              }}
              exit={{ opacity: 0, scale: 0.7, y: 15, transition: { delay: 0 } }}
              className="flex items-center gap-2 group"
            >
              <span className="bg-forest-800 text-[#E8EDE9] text-xs font-bold px-2.5 py-1 rounded-lg border border-card-border shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                All Actions
              </span>
              <Link
                role="menuitem"
                href="/actions"
                onClick={handleClose}
                aria-label="View all eco actions"
                className="w-11 h-11 rounded-full bg-forest-400 text-forest-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
              >
                <Compass className="w-5 h-5 animate-spin-slow" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary FAB trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? 'fab-menu' : undefined}
        aria-label={isOpen ? 'Close quick log menu' : 'Open quick log menu'}
        className={`w-14 h-14 rounded-full ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90'
            : 'bg-forest-400 text-forest-950 hover:bg-forest-300'
        } flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/15 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950`}
      >
        {isOpen
          ? <X    className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
          : <Plus className="w-7 h-7 stroke-[2.5]" aria-hidden="true" />
        }
      </button>
    </div>
  );
}
