import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingAnswers, FootprintBreakdown, calculateFootprint } from '../lib/calculations';
import { LOGGABLE_ACTIONS, DEFAULT_BADGES, Badge } from '../lib/emissionFactors';

export interface LoggedActionInstance {
  id: string;
  actionId: string;
  category: 'transport' | 'food' | 'energy' | 'waste' | 'general';
  name: string;
  co2Saved: number;
  points: number;
  timestamp: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'food' | 'energy' | 'waste';
  co2Target: number;
  targetCount: number;
  progressCount: number;
  completed: boolean;
}

interface RootedState {
  user: {
    name: string;
    onboardingComplete: boolean;
  } | null;
  baselineFootprint: FootprintBreakdown | null;
  currentFootprint: FootprintBreakdown | null;
  loggedActions: LoggedActionInstance[];
  challenges: Challenge[];
  badges: Badge[];
  streak: number;
  lastLoggedDate: string | null;
  growthPoints: number; // XP to grow tree
  treeHealth: number; // 0 - 100
  hasNewBlossom: boolean; // triggers visual canvas splash
  
  // Actions
  completeOnboarding: (answers: OnboardingAnswers) => void;
  logAction: (actionId: string) => void;
  completeChallenge: (challengeId: string) => void;
  resetProgress: () => void;
  clearBlossomAlert: () => void;
}

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'car_free_commute',
    title: 'Commute Cleanly',
    description: 'Walk, cycle, or use transit 3 times.',
    category: 'transport',
    co2Target: 4.0,
    targetCount: 3,
    progressCount: 0,
    completed: false
  },
  {
    id: 'plant_based_day',
    title: 'Green Plate Hero',
    description: 'Eat vegan or vegetarian meals 5 times.',
    category: 'food',
    co2Target: 7.0,
    targetCount: 5,
    progressCount: 0,
    completed: false
  },
  {
    id: 'air_dry_drying',
    title: 'Natural Breeze',
    description: 'Line-dry laundry 3 times.',
    category: 'energy',
    co2Target: 2.3,
    targetCount: 3,
    progressCount: 0,
    completed: false
  },
  {
    id: 'unplug_vampire_standby',
    title: 'Vampire Slayer',
    description: 'Unplug idle chargers and standby appliances 4 times.',
    category: 'energy',
    co2Target: 0.8,
    targetCount: 4,
    progressCount: 0,
    completed: false
  },
  {
    id: 'eco_shopper',
    title: 'Second Life',
    description: 'Choose pre-owned items or avoid single-use plastics 3 times.',
    category: 'waste',
    co2Target: 5.0,
    targetCount: 3,
    progressCount: 0,
    completed: false
  }
];

export const useRootedStore = create<RootedState>()(
  persist(
    (set, get) => ({
      user: null,
      baselineFootprint: null,
      currentFootprint: null,
      loggedActions: [],
      challenges: DEFAULT_CHALLENGES,
      badges: DEFAULT_BADGES,
      streak: 1,
      lastLoggedDate: null,
      growthPoints: 100,
      treeHealth: 50,
      hasNewBlossom: false,

      completeOnboarding: (answers) => {
        const footprint = calculateFootprint(answers);
        
        const targetBaseline = 12000;
        const initialHealth = Math.max(10, Math.min(100, Math.round(100 - (footprint.total / targetBaseline) * 50)));

        set({
          user: {
            name: answers.name,
            onboardingComplete: true
          },
          baselineFootprint: footprint,
          currentFootprint: { ...footprint },
          loggedActions: [],
          challenges: DEFAULT_CHALLENGES.map(c => ({ ...c })),
          badges: DEFAULT_BADGES.map(b => ({ ...b })),
          streak: 1,
          lastLoggedDate: null,
          growthPoints: 100,
          treeHealth: initialHealth,
          hasNewBlossom: false
        });
      },

      logAction: (actionId) => {
        const actionDetails = LOGGABLE_ACTIONS.find(a => a.id === actionId);
        if (!actionDetails) return;

        const timestampStr = new Date().toISOString();
        const newInstance: LoggedActionInstance = {
          id: Math.random().toString(36).substring(2, 9),
          actionId: actionDetails.id,
          category: actionDetails.category,
          name: actionDetails.name,
          co2Saved: actionDetails.co2Saved,
          points: actionDetails.points,
          timestamp: timestampStr
        };

        const currentLogged = get().loggedActions;
        const currentFootprint = get().currentFootprint;
        const currentXP = get().growthPoints;
        const currentHealth = get().treeHealth;

        // Deduct emissions: Waste maps to shopping deductions
        const targetCategory = actionDetails.category === 'waste' ? 'shopping' : actionDetails.category;
        
        const updatedFootprint = currentFootprint
          ? {
              ...currentFootprint,
              [targetCategory]: Math.max(0, currentFootprint[targetCategory as keyof FootprintBreakdown] - actionDetails.co2Saved),
              total: Math.max(0, currentFootprint.total - actionDetails.co2Saved)
            }
          : null;

        const updatedHealth = Math.min(100, currentHealth + Math.ceil(actionDetails.points / 5));

        // Update challenges
        const updatedChallenges = get().challenges.map(challenge => {
          if (challenge.completed) return challenge;
          if (challenge.category === actionDetails.category) {
            const newCount = challenge.progressCount + 1;
            const completed = newCount >= challenge.targetCount;
            return {
              ...challenge,
              progressCount: newCount,
              completed
            };
          }
          return challenge;
        });

        // Update streak
        let updatedStreak = get().streak;
        const lastDateStr = get().lastLoggedDate;
        const todayStr = new Date().toDateString();

        if (lastDateStr) {
          const lastDate = new Date(lastDateStr);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate.toDateString() === yesterday.toDateString()) {
            updatedStreak += 1;
          } else if (lastDate.toDateString() !== todayStr) {
            updatedStreak = 1; // reset streak if gap > 1 day
          }
        } else {
          updatedStreak = 1;
        }

        // Check & Unlock badges
        const actionHistory = [newInstance, ...currentLogged];
        const updatedBadges = get().badges.map(badge => {
          if (badge.unlockedAt) return badge;

          let shouldUnlock = false;
          if (badge.id === 'first_steps') {
            shouldUnlock = true;
          } else if (badge.id === 'streak_3' && updatedStreak >= 3) {
            shouldUnlock = true;
          } else if (badge.id === 'vegan_vanguard') {
            const veganLogs = actionHistory.filter(act => act.actionId === 'ate_vegan').length;
            shouldUnlock = veganLogs >= 5;
          } else if (badge.id === 'transit_pro') {
            const transitLogs = actionHistory.filter(act => act.category === 'transport').length;
            shouldUnlock = transitLogs >= 5;
          } else if (badge.id === 'energy_saver') {
            const energyLogs = actionHistory.filter(act => act.category === 'energy').length;
            shouldUnlock = energyLogs >= 5;
          }

          if (shouldUnlock) {
            return { ...badge, unlockedAt: timestampStr };
          }
          return badge;
        });

        const newlyCompletedChallenge = updatedChallenges.some(
          (c, idx) => c.completed && !get().challenges[idx].completed
        );

        const newlyUnlockedBadge = updatedBadges.some(
          (b, idx) => b.unlockedAt && !get().badges[idx].unlockedAt
        );

        const xpGain = actionDetails.points + (newlyCompletedChallenge ? 50 : 0) + (newlyUnlockedBadge ? 100 : 0);

        set({
          loggedActions: actionHistory,
          currentFootprint: updatedFootprint,
          growthPoints: currentXP + xpGain,
          treeHealth: updatedHealth,
          challenges: updatedChallenges,
          badges: updatedBadges,
          streak: updatedStreak,
          lastLoggedDate: timestampStr,
          hasNewBlossom: newlyCompletedChallenge || newlyUnlockedBadge || Math.random() < 0.2
        });
      },

      completeChallenge: (challengeId) => {
        const updatedChallenges = get().challenges.map(c => {
          if (c.id === challengeId) {
            return { ...c, completed: true, progressCount: c.targetCount };
          }
          return c;
        });

        set({
          challenges: updatedChallenges,
          growthPoints: get().growthPoints + 50,
          hasNewBlossom: true
        });
      },

      clearBlossomAlert: () => set({ hasNewBlossom: false }),

      resetProgress: () => {
        set({
          user: null,
          baselineFootprint: null,
          currentFootprint: null,
          loggedActions: [],
          challenges: DEFAULT_CHALLENGES.map(c => ({ ...c })),
          badges: DEFAULT_BADGES.map(b => ({ ...b })),
          streak: 1,
          lastLoggedDate: null,
          growthPoints: 100,
          treeHealth: 50,
          hasNewBlossom: false
        });
      }
    }),
    {
      name: 'rooted-store',
    }
  )
);
