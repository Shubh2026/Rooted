'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, LineChart, Leaf, LogOut, Sun } from 'lucide-react';
import { useRootedStore } from '../store/useRootedStore';

export default function Navigation() {
  const pathname = usePathname();
  const { user, resetProgress } = useRootedStore();
  const [mounted, setMounted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('dark');
    // Restore high-contrast preference
    const saved = localStorage.getItem('rooted-high-contrast');
    if (saved === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('rooted-high-contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('rooted-high-contrast', 'false');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Actions', path: '/actions', icon: Compass },
    { name: 'Insights', path: '/insights', icon: LineChart },
  ];

  if (!mounted || !user) return null;

  return (
    <>
      {/* Desktop Navigation Top Bar */}
      <nav className="hidden md:flex sticky top-4 left-0 right-0 z-50 justify-between items-center mx-auto max-w-6xl w-[95%] px-6 py-3 bg-forest-900 text-cream-900 dark:bg-forest-950 border border-forest-800/40 rounded-full shadow-lg transition-all duration-300">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-forest-800 dark:bg-forest-400 flex items-center justify-center text-white dark:text-forest-900 transition-transform group-hover:rotate-12 duration-300">
            <Leaf className="w-4 h-4 fill-current" />
          </div>
          <span className="font-serif font-bold text-lg text-cream-50 dark:text-white tracking-wide">
            Rooted
          </span>
        </Link>

        {/* Center menu links */}
        <div className="flex gap-1 bg-forest-950/60 dark:bg-forest-950/80 p-1 rounded-full border border-forest-800/30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-forest-400 text-forest-950 shadow-sm font-bold'
                    : 'text-cream-200/80 hover:text-white hover:bg-white/5 dark:text-[#a1b0a5] dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 bg-forest-950/60 dark:bg-forest-900 text-cream-100 dark:text-forest-400 rounded-full border border-forest-800/40">
            🌱 {user.name}
          </span>

          {/* High Contrast toggle */}
          <button
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
            title={highContrast ? 'High contrast: ON' : 'High contrast: OFF'}
            className={`p-2 rounded-full border transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-forest-300 ${
              highContrast
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                : 'border-forest-800/30 bg-forest-950/60 text-[#A3C4B1] hover:text-white hover:border-forest-600'
            }`}
          >
            <Sun className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your garden? This deletes all progress.')) {
                resetProgress();
                window.location.href = '/';
              }
            }}
            aria-label="Reset game progress"
            className="p-2 rounded-full border border-red-900/30 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md px-4 py-2.5 bg-forest-900/90 dark:bg-forest-950/90 backdrop-blur-lg border border-forest-800/40 rounded-2xl shadow-lg flex justify-around items-center transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-forest-400 scale-110 font-bold'
                  : 'text-cream-300/60 dark:text-[#a1b0a5] hover:text-cream-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
        
        {/* High Contrast toggle — mobile */}
        <button
          onClick={toggleHighContrast}
          aria-pressed={highContrast}
          aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
          className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all duration-300 cursor-pointer ${
            highContrast ? 'text-yellow-300' : 'text-[#a1b0a5] hover:text-cream-100'
          }`}
        >
          <Sun className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] tracking-tight">Contrast</span>
        </button>

        {/* Reset Progress on mobile */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset your garden? This deletes all progress.')) {
              resetProgress();
              window.location.href = '/';
            }
          }}
          aria-label="Reset progress"
          className="flex flex-col items-center justify-center gap-0.5 p-2 text-red-400 hover:text-red-300 cursor-pointer"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px] tracking-tight">Reset</span>
        </button>
      </nav>
    </>
  );
}
