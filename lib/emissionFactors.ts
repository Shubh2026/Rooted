export interface EmissionFactors {
  transport: {
    petrolCar: number; // kg CO2e per km
    dieselCar: number; // kg CO2e per km
    hybridCar: number; // kg CO2e per km
    electricCar: number; // kg CO2e per km
    publicTransport: number; // kg CO2e per passenger km
    flightShort: number; // kg CO2e per short-haul flight (under 1500km)
    flightLong: number; // kg CO2e per long-haul flight (over 1500km)
  };
  diet: {
    meatLover: number; // kg CO2e per day
    average: number; // kg CO2e per day
    vegetarian: number; // kg CO2e per day
    vegan: number; // kg CO2e per day
  };
  energy: {
    electricity: number; // kg CO2e per kWh
    naturalGas: number; // kg CO2e per kWh
    solar: number; // kg CO2e per kWh
    cleanGrid: number; // kg CO2e per kWh
  };
  shopping: {
    eco: number; // kg CO2e per year (secondhand, minimalist)
    average: number; // kg CO2e per year (standard consumer)
    heavy: number; // kg CO2e per year (frequent tech/fashion buyer)
  };
}

export const EMISSION_FACTORS: EmissionFactors = {
  transport: {
    petrolCar: 0.170, // 170g CO2e/km
    dieselCar: 0.171, // 171g CO2e/km
    hybridCar: 0.103, // 103g CO2e/km
    electricCar: 0.047, // 47g CO2e/km (lifecycle grid mix)
    publicTransport: 0.035, // 35g CO2e/km
    flightShort: 150.0, // average 150kg CO2e per short flight
    flightLong: 950.0, // average 950kg CO2e per long flight
  },
  diet: {
    meatLover: 7.26, // daily food footprint
    average: 5.63,
    vegetarian: 3.81,
    vegan: 2.89,
  },
  energy: {
    electricity: 0.385, // average grid kWh
    naturalGas: 0.185, // per kWh equivalent
    solar: 0.020, // minimal panels lifecycle
    cleanGrid: 0.040, // hydro/nuclear/wind mix
  },
  shopping: {
    eco: 300, // 300kg CO2e/year
    average: 1200, // 1200kg CO2e/year
    heavy: 2800, // 2800kg CO2e/year
  }
};

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji character
  category: 'general' | 'transport' | 'food' | 'energy' | 'waste';
  unlockedAt: string | null; // iso date string or null
}

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_steps',
    title: 'Seed Sower',
    description: 'Log your very first eco-friendly action.',
    icon: '🌱',
    category: 'general',
    unlockedAt: null
  },
  {
    id: 'streak_3',
    title: 'Daily Caretaker',
    description: 'Log choices on 3 consecutive days.',
    icon: '🔥',
    category: 'general',
    unlockedAt: null
  },
  {
    id: 'vegan_vanguard',
    title: 'Vegan Vanguard',
    description: 'Log 5 plant-based meals.',
    icon: '🥗',
    category: 'food',
    unlockedAt: null
  },
  {
    id: 'transit_pro',
    title: 'Transit Champion',
    description: 'Log 5 green commuting actions.',
    icon: '🚲',
    category: 'transport',
    unlockedAt: null
  },
  {
    id: 'energy_saver',
    title: 'Energy Guardian',
    description: 'Log 5 home energy saving choices.',
    icon: '🔌',
    category: 'energy',
    unlockedAt: null
  }
];

export interface LoggableAction {
  id: string;
  category: 'transport' | 'food' | 'energy' | 'waste' | 'general';
  name: string;
  description: string;
  co2Saved: number; // kg CO2e saved per execution
  points: number; // experience points to grow tree
  icon: string;
}

export const LOGGABLE_ACTIONS: LoggableAction[] = [
  {
    id: 'walk_bike_trip',
    category: 'transport',
    name: 'Walk or Cycle',
    description: 'Walked or cycled instead of driving a private car (5km trip)',
    co2Saved: 0.85, // 5km * petrolCar (0.17)
    points: 15,
    icon: 'Bike'
  },
  {
    id: 'public_transit',
    category: 'transport',
    name: 'Take Public Transit',
    description: 'Took a bus or train instead of driving (10km trip)',
    co2Saved: 1.35, // 10km * (petrolCar - publicTransport)
    points: 12,
    icon: 'Train'
  },
  {
    id: 'carpool',
    category: 'transport',
    name: 'Carpool with Others',
    description: 'Carpooled to save fuel and emissions (15km trip shared)',
    co2Saved: 1.28,
    points: 10,
    icon: 'Users'
  },
  {
    id: 'ate_vegan',
    category: 'food',
    name: 'Ate a Vegan Meal',
    description: 'Ate entirely plant-based, cutting food emissions for a meal',
    co2Saved: 1.45,
    points: 15,
    icon: 'Leaf'
  },
  {
    id: 'ate_vegetarian',
    category: 'food',
    name: 'Ate a Vegetarian Meal',
    description: 'Skipped meat for a meal, opting for dairy/eggs instead',
    co2Saved: 1.15,
    points: 10,
    icon: 'Egg'
  },
  {
    id: 'composted_food',
    category: 'food',
    name: 'Composted Organic Waste',
    description: 'Composted food scraps instead of sending them to landfill',
    co2Saved: 0.50,
    points: 8,
    icon: 'Trash2'
  },
  {
    id: 'line_dry_laundry',
    category: 'energy',
    name: 'Line-Dried Laundry',
    description: 'Air-dried clothes instead of using a tumble dryer',
    co2Saved: 0.77,
    points: 10,
    icon: 'Sun'
  },
  {
    id: 'unplugged_vampire',
    category: 'energy',
    name: 'Unplug Standby Devices',
    description: 'Unplugged electronics and appliances that draw vampire load',
    co2Saved: 0.20,
    points: 5,
    icon: 'Plug'
  },
  {
    id: 'turned_down_thermostat',
    category: 'energy',
    name: 'Lower Heating/AC Usage',
    description: 'Adjusted thermostat by 1-2°C to reduce HVAC loading',
    co2Saved: 0.80,
    points: 10,
    icon: 'Thermometer'
  },
  {
    id: 'reusable_bottle_cup',
    category: 'waste',
    name: 'Used Reusable Cup/Bottle',
    description: 'Avoided buying a single-use plastic bottle or coffee cup',
    co2Saved: 0.15,
    points: 5,
    icon: 'CupSoda'
  },
  {
    id: 'recycled_properly',
    category: 'waste',
    name: 'Recycled Metals & Plastics',
    description: 'Ensured all recyclable packaging was sorted properly',
    co2Saved: 0.35,
    points: 6,
    icon: 'RefreshCw'
  },
  {
    id: 'bought_secondhand',
    category: 'waste',
    name: 'Purchased Secondhand',
    description: 'Bought clothes or home items pre-owned, avoiding new manufacturing',
    co2Saved: 4.50,
    points: 20,
    icon: 'ShoppingBag'
  }
];
