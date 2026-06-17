'use client';

import React from 'react';

export default function ForestBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Soft radial atmospheric glow using design tokens */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--card-bg)] to-[var(--card-border)] transition-colors duration-1000" />
      
      {/* Soft Moon Glow */}
      <div className="absolute top-[15%] left-[20%] w-64 h-64 rounded-full bg-[#52b788]/5 opacity-60 blur-3xl" />
      
      {/* Animated Clouds */}
      <div className="absolute top-[10%] left-[-10%] w-[120%] h-32 opacity-5">
        <div className="absolute top-2 left-[15%] w-32 h-8 bg-[#ffffff] rounded-full blur-md animate-[drift_45s_linear_infinite]" />
        <div className="absolute top-12 left-[55%] w-48 h-10 bg-[#ffffff] rounded-full blur-md animate-[drift_65s_linear_infinite_reverse]" />
        <div className="absolute top-6 left-[80%] w-24 h-6 bg-[#ffffff] rounded-full blur-md animate-[drift_35s_linear_infinite]" />
      </div>

      {/* Layer 3: Distant Mountains/Hills (Deepest) */}
      <svg
        className="absolute bottom-0 w-full h-[30%] text-[#081810] transition-colors duration-1000"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,192L60,197.3C120,203,240,213,360,202.7C480,192,600,160,720,165.3C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>

      {/* Layer 2: Mid-ground hills silhouette */}
      <svg
        className="absolute bottom-0 w-full h-[20%] text-[#0D251A] transition-colors duration-1000 opacity-80"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,240L1360,240C1280,240,1120,240,960,240C800,240,640,240,480,240C320,240,160,240,80,240L0,240Z"
        />
      </svg>

      {/* Layer 1: Foreground details - stylized vector trees swaying slightly */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] flex justify-between items-end px-4 md:px-12">
        <svg className="w-16 h-28 text-[#112E21]/50 origin-bottom animate-[sway_6s_ease-in-out_infinite]" viewBox="0 0 40 100">
          <path fill="currentColor" d="M18,100 L22,100 L22,60 L35,50 L22,45 L30,25 L22,20 L25,5 L20,0 L15,5 L18,20 L10,25 L18,45 L5,50 L18,60 Z" />
        </svg>
        <svg className="w-20 h-36 text-[#153A2A]/30 origin-bottom animate-[sway_8s_ease-in-out_infinite_1s] hidden sm:block" viewBox="0 0 40 100">
          <path fill="currentColor" d="M18,100 L22,100 L22,50 L38,40 L22,35 L32,15 L22,10 L20,0 L18,10 L8,15 L18,35 L2,40 L18,50 Z" />
        </svg>
        <svg className="w-12 h-24 text-[#112E21]/40 origin-bottom animate-[sway_5s_ease-in-out_infinite_0.5s]" viewBox="0 0 40 100">
          <path fill="currentColor" d="M18,100 L22,100 L22,60 L35,50 L22,45 L30,25 L22,20 L25,5 L20,0 L15,5 L18,20 L10,25 L18,45 L5,50 L18,60 Z" />
        </svg>
        <svg className="w-24 h-44 text-[#153A2A]/25 origin-bottom animate-[sway_7s_ease-in-out_infinite_2s] hidden md:block" viewBox="0 0 40 100">
          <path fill="currentColor" d="M18,100 L22,100 L22,50 L38,40 L22,35 L32,15 L22,10 L20,0 L18,10 L8,15 L18,35 L2,40 L18,50 Z" />
        </svg>
      </div>
      
      {/* Floating firefly dots */}
      <div className="absolute inset-0">
        <div className="absolute top-[40%] left-[10%] w-1.5 h-1.5 bg-[#a8e6cf] rounded-full blur-[1px] animate-[pulse_3s_infinite] opacity-30" />
        <div className="absolute top-[60%] left-[85%] w-2 h-2 bg-[#ff8b94]/80 rounded-full blur-[1px] animate-[pulse_4s_infinite_1s] opacity-20" />
        <div className="absolute top-[30%] left-[75%] w-1.5 h-1.5 bg-[#a8e6cf]/80 rounded-full blur-[1px] animate-[pulse_5s_infinite_2s] opacity-35" />
        <div className="absolute top-[75%] left-[30%] w-2.5 h-2.5 bg-[#a8e6cf] rounded-full blur-[2px] animate-[pulse_3.5s_infinite_1.5s] opacity-20" />
      </div>
    </div>
  );
}
