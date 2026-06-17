'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number; // percentage 0 - 100
  size?: number; // total size in px
  strokeWidth?: number; // width of ring in px
  color?: string; // foreground ring color
  trailColor?: string; // background ring track color
  label?: string; // optional label to put below or inside
}

export default function ProgressRing({
  value,
  size = 72,
  strokeWidth = 6,
  color = 'stroke-forest-400',
  trailColor = 'stroke-forest-900/50',
  label,
}: ProgressRingProps) {
  // Clamp value between 0 and 100
  const percentage = Math.max(0, Math.min(100, value));

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track circle */}
          <circle
            className={`fill-transparent ${trailColor}`}
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground progress circle */}
          <motion.circle
            className={`fill-transparent ${color} transition-all`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Central percentage text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold font-serif text-[#E8EDE9]">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {label && (
        <span className="text-[10px] uppercase tracking-wider font-bold mt-1.5 text-[#A3C4B1]">
          {label}
        </span>
      )}
    </div>
  );
}
