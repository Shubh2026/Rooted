'use client';

import React from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';

interface OrganicButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'coral' | 'teal';
  magnetic?: boolean;
}

export default function OrganicButton({
  children,
  className = '',
  variant = 'primary',
  magnetic = true,
  disabled = false,
  ...props
}: OrganicButtonProps) {
  // Define button style classes based on variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-forest-400 text-forest-950 hover:bg-forest-300 shadow-md shadow-forest-950/15 border-transparent';
      case 'secondary':
        return 'bg-card-bg text-[#A3C4B1] border border-card-border hover:bg-forest-900/40 hover:text-white';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-950/10 border-transparent';
      case 'ghost':
        return 'bg-transparent text-[#a1b0a5] hover:text-white hover:bg-white/5 border-transparent';
      case 'coral':
        return 'bg-coral-500 text-white hover:bg-coral-600 shadow-md shadow-coral-950/10 border-transparent';
      case 'teal':
        return 'bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-950/10 border-transparent';
      default:
        return '';
    }
  };

  const buttonVariants: Variants = magnetic && !disabled
    ? {
        hover: { scale: 1.05, y: -1, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
        tap: { scale: 0.95, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
      }
    : {};

  return (
    <motion.button
      whileHover={disabled ? {} : 'hover'}
      whileTap={disabled ? {} : 'tap'}
      variants={buttonVariants}
      disabled={disabled ? true : undefined}
      className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer border ${getVariantStyles()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
