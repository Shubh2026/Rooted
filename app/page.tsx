'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, Sun, ShieldCheck, Heart } from 'lucide-react';
import { useRootedStore } from '../store/useRootedStore';
import ForestBackground from '../components/tree/ForestBackground';

export default function Home() {
  const router = useRouter();
  const { user } = useRootedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If user is already onboarded, send them directly to their garden dashboard
    if (user && user.onboardingComplete) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!mounted || (user && user.onboardingComplete)) {
    return (
      <div className="absolute inset-0 bg-[#fdfbf7] dark:bg-[#071b0e] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-forest-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden rounded-3xl">
      {/* Visual Ambient Parallax forest */}
      <ForestBackground />

      {/* Hero Content Panel */}
      <div className="relative z-10 text-center max-w-2xl px-6 py-12 rounded-2xl bg-white/20 dark:bg-black/10 backdrop-blur-sm border border-white/20 shadow-xl dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-16 h-16 rounded-full bg-forest-800 dark:bg-forest-400 flex items-center justify-center text-white dark:text-forest-900 mx-auto mb-6 shadow-md"
        >
          <Leaf className="w-8 h-8 fill-current" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif font-bold text-5xl md:text-6xl text-forest-400 mb-4 tracking-tight leading-[1.1]"
        >
          Grow Your <span className="text-forest-400">Footprint</span> Into a Tree
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base md:text-lg text-muted-text dark:text-[#a1b0a5] mb-8 font-medium leading-relaxed"
        >
          Meet Rooted. Plant a digital seed that reflects your real-world carbon footprint. Nurture it, complete challenges, and watch your tree grow as you lower your emissions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 px-8 py-4 bg-coral-500 hover:bg-coral-600 text-white font-bold text-base rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Plant Your Tree
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Feature Pills */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl"
      >
        <div className="flex gap-4 p-5 rounded-2xl bg-white/40 dark:bg-forest-900/40 backdrop-blur-md border border-card-border">
          <div className="p-3 h-fit rounded-xl bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-300">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-forest-800 dark:text-white">Living Digital Garden</h3>
            <p className="text-xs text-muted-text dark:text-[#a1b0a5] mt-1">
              Your procedural tree responds visually to your lifestyle. Watch leaves bloom or wither in real-time.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-5 rounded-2xl bg-white/40 dark:bg-forest-900/40 backdrop-blur-md border border-card-border">
          <div className="p-3 h-fit rounded-xl bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-forest-800 dark:text-white">Actionable Impact</h3>
            <p className="text-xs text-muted-text dark:text-[#a1b0a5] mt-1">
              Log daily green choices like recycling or walking and instantly see carbon reduction figures.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-5 rounded-2xl bg-white/40 dark:bg-forest-900/40 backdrop-blur-md border border-card-border">
          <div className="p-3 h-fit rounded-xl bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-300">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-forest-800 dark:text-white">Hopeful Community</h3>
            <p className="text-xs text-muted-text dark:text-[#a1b0a5] mt-1">
              Compare your offset curves, join active grove challenges, and grow collective community forests.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
