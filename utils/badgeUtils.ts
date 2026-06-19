export interface ActionHistoryEntry {
  actionId: string;
  category: string;
}

/**
 * Determines whether a badge should be unlocked based on current streak and action history.
 *
 * @param badgeId The ID of the badge to check
 * @param streak The user's current daily streak
 * @param actionHistory The list of all actions logged by the user
 * @returns boolean True if badge conditions are met
 */
export function shouldUnlockBadge(
  badgeId: string,
  streak: number,
  actionHistory: ActionHistoryEntry[]
): boolean {
  switch (badgeId) {
    case 'first_steps':
      return actionHistory.length >= 1;
    case 'streak_3':
      return streak >= 3;
    case 'vegan_vanguard':
      return actionHistory.filter((act) => act.actionId === 'ate_vegan').length >= 5;
    case 'transit_pro':
      return actionHistory.filter((act) => act.category === 'transport').length >= 5;
    case 'energy_saver':
      return actionHistory.filter((act) => act.category === 'energy').length >= 5;
    default:
      return false;
  }
}
