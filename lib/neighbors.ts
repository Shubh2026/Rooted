export interface MockNeighbor {
  name: string;
  avatar: string;
  emissions: number; // tonnes
  xp: number;
  treeType: string;
  leafColor: string;
  swayDelay: string;
}

/**
 * Generates dynamic mock neighbors whose stats fluctuate slightly based on the current date.
 * This gives a "live" feel to the community grove without using non-deterministic Math.random()
 * during component renders, avoiding hydration mismatch bugs or unstable lists.
 */
export function getDynamicNeighbors(): MockNeighbor[] {
  // Simple deterministic pseudo-random number generator based on calendar date
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Linear Congruential Generator
  const lcg = (s: number) => {
    let current = s;
    return () => {
      current = (current * 1664525 + 1013904223) % 4294967296;
      return current / 4294967296;
    };
  };

  const nextRand = lcg(seed);

  const neighborsBase = [
    { name: 'Aria', avatar: '👩‍🌾', baseEmissions: 3.2, baseXP: 820, treeType: 'Emerald Willow', leafColor: 'bg-emerald-500', swayDelay: '0s' },
    { name: 'Leo', avatar: '👨‍🚀', baseEmissions: 8.5, baseXP: 340, treeType: 'Swaying Birch', leafColor: 'bg-forest-400', swayDelay: '1.2s' },
    { name: 'Freya', avatar: '👩‍🎨', baseEmissions: 2.1, baseXP: 1200, treeType: 'Ancient Spruce', leafColor: 'bg-teal-500', swayDelay: '0.5s' },
    { name: 'Kai', avatar: '👨‍🎤', baseEmissions: 12.8, baseXP: 90, treeType: 'Dry Elm', leafColor: 'bg-earth-300', swayDelay: '2s' },
    { name: 'Nadia', avatar: '👩‍🔬', baseEmissions: 4.5, baseXP: 610, treeType: 'Golden Larch', leafColor: 'bg-amber-500', swayDelay: '1.7s' },
    { name: 'Rowan', avatar: '👨‍🌾', baseEmissions: 1.8, baseXP: 1450, treeType: 'Whispering Pine', leafColor: 'bg-emerald-600', swayDelay: '0.8s' },
  ];

  return neighborsBase.map((n) => {
    // Fluctuate emissions by up to +/- 15% dynamically
    const emissionVariance = 1 + (nextRand() * 0.3 - 0.15);
    const emissions = parseFloat((n.baseEmissions * emissionVariance).toFixed(1));
    
    // Add dynamic XP progression (simulating active neighbors)
    const xpGain = Math.floor(nextRand() * 200);
    const xp = n.baseXP + xpGain;

    return {
      name: n.name,
      avatar: n.avatar,
      emissions,
      xp,
      treeType: n.treeType,
      leafColor: n.leafColor,
      swayDelay: n.swayDelay,
    };
  });
}
