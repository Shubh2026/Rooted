'use client';

import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';

interface OrganicCardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: boolean;
  organicShape?: boolean;
}

export default function OrganicCard({
  children,
  className = '',
  hoverEffect = true,
  organicShape = false,
  ...props
}: OrganicCardProps) {
  const cardVariants: Variants = {
    initial: { y: 0 },
    hover: hoverEffect
      ? {
          y: -5,
          transition: { duration: 0.3, ease: 'easeOut' as const },
        }
      : {},
  };

  const borderStyle = organicShape
    ? 'rounded-[2.5rem_2rem_3rem_1.5rem] dark:rounded-[2.5rem_2rem_3rem_1.5rem]'
    : 'rounded-3xl';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      className={`glass-panel p-6 backdrop-blur-md overflow-hidden ${borderStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
