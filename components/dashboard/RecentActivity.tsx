'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import type { LoggedActionInstance } from '../../store/useRootedStore';

interface Props {
  loggedActions: LoggedActionInstance[];
}

/**
 * RecentActivity Component
 *
 * Displays a list of recently logged green actions with carbon offsets and XP points earned.
 */
function RecentActivity({ loggedActions }: Props) {
  return (
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
  );
}

export default memo(RecentActivity);
