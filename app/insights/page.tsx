'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from 'recharts';
import { Award, Compass, LineChart as ChartIcon, Trees } from 'lucide-react';
import { useRootedStore } from '../../store/useRootedStore';
import { GLOBAL_AVERAGES } from '../../lib/calculations';
import OrganicCard from '../../components/ui/OrganicCard';
import OrganicButton from '../../components/ui/OrganicButton';
import ProgressRing from '../../components/ui/ProgressRing';

import { getDynamicNeighbors, MockNeighbor } from '../../lib/neighbors';

export default function Insights() {
  const router = useRouter();
  const { user, currentFootprint, challenges, completeChallenge, loggedActions, streak } = useRootedStore();
  
  // Dynamic mock neighbors loaded from lib
  const neighbors = React.useMemo(() => getDynamicNeighbors(), []);
  
  const [selectedNeighbor, setSelectedNeighbor] = useState<MockNeighbor | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace('/');
    }
  }, [mounted, user, router]);

  if (!mounted || !user || !currentFootprint) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-forest-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentTonnes = parseFloat((currentFootprint.total / 1000).toFixed(1));
  const barChartData = [
    { name: 'US Average', value: GLOBAL_AVERAGES.usa / 1000, fill: '#8d6e63' },
    { name: 'EU Average', value: GLOBAL_AVERAGES.europe / 1000, fill: '#bcaaa4' },
    { name: 'Global Avg', value: GLOBAL_AVERAGES.global / 1000, fill: '#2d6a4f' },
    { name: 'You (Current)', value: currentTonnes, fill: '#ff6b6b' },
    { name: 'Climate Target', value: GLOBAL_AVERAGES.target / 1000, fill: '#008080' },
  ];

  const getLineChartData = () => {
    if (loggedActions.length === 0) {
      return [
        { day: 'Day 0', co2Saved: 0 },
        { day: 'Day 1', co2Saved: 0.5 },
        { day: 'Day 2', co2Saved: 1.2 },
        { day: 'Day 3', co2Saved: 1.8 },
      ];
    }
    
    const sorted = [...loggedActions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    let cumulative = 0;
    const history = sorted.map((act, idx) => {
      cumulative += act.co2Saved;
      return {
        day: `Action ${idx + 1}`,
        co2Saved: parseFloat(cumulative.toFixed(1))
      };
    });

    return [{ day: 'Start', co2Saved: 0 }, ...history];
  };

  const lineChartData = getLineChartData();

  return (
    <div className="px-4 md:px-0 py-2">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif font-bold text-3xl md:text-4xl text-white tracking-tight flex items-center gap-2">
          <ChartIcon className="w-8 h-8 text-forest-400" />
          Garden Insights
        </h1>
        <p className="text-sm text-muted-text">
          Analyze your emissions benchmarks, complete challenges to sprout blossoms, and explore the Community Grove.
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Comparison Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <OrganicCard hoverEffect={true} className="p-5 h-full">
            <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-4">
              How You Compare (Annual Tonnes CO₂e)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#B8D4C3' }} stroke="#2A4A3A" />
                  <YAxis tick={{ fontSize: 10, fill: '#B8D4C3' }} stroke="#2A4A3A" />
                  <Tooltip contentStyle={{ backgroundColor: '#11261D', borderColor: '#2A4A3A', borderRadius: '12px' }} itemStyle={{ color: '#E8EDE9' }} labelStyle={{ color: '#A3C4B1' }} formatter={(value) => [`${value} tonnes`, 'Carbon output']} />
                  <ReferenceLine y={2.0} stroke="#E07A5F" strokeDasharray="4 4" label={{ value: 'Paris Target (2t)', fill: '#E07A5F', fontSize: 10, position: 'insideTopRight', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-[#B8D4C3] mt-3 italic">
              The Intergovernmental Panel on Climate Change (IPCC) recommends a target under 2 tonnes per person annually.
            </p>
          </OrganicCard>
        </div>

        {/* Cumulative Savings Line Chart (5 cols) */}
        <div className="lg:col-span-5">
          <OrganicCard hoverEffect={true} className="p-5 h-full">
            <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-4">
              Your Cumulative Savings (kg CO₂e)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#B8D4C3' }} stroke="#2A4A3A" />
                  <YAxis tick={{ fontSize: 9, fill: '#B8D4C3' }} stroke="#2A4A3A" />
                  <Tooltip contentStyle={{ backgroundColor: '#11261D', borderColor: '#2A4A3A', borderRadius: '12px' }} itemStyle={{ color: '#E8EDE9' }} labelStyle={{ color: '#A3C4B1' }} formatter={(value) => [`${value} kg`, 'Saved CO₂e']} />
                  <Line type="monotone" dataKey="co2Saved" stroke="#3D9E8F" strokeWidth={3.5} activeDot={{ r: 8 }} dot={{ strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-[#B8D4C3] mt-3 italic">
              Growth is cumulative. As you log more choices, the gradient curve rises!
            </p>
          </OrganicCard>
        </div>

      </div>

      {/* Challenges & Community Grove Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Complete Challenges Tracker (6 cols) */}
        <div className="lg:col-span-6">
          <OrganicCard hoverEffect={false} className="p-5 h-full">
            <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-4 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-forest-400" />
              Challenges & Achievements
            </h3>

            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    challenge.completed
                      ? 'bg-emerald-950/35 border-emerald-800/50'
                      : 'bg-[#11261D] border-[#2A4A3A]'
                  }`}
                >
                  <div className="flex-1 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${challenge.completed ? 'text-emerald-400 line-through' : 'text-[#E8EDE9]'}`}>
                          {challenge.title}
                        </span>
                        {challenge.completed && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#B8D4C3] mt-1 leading-relaxed max-w-[200px] sm:max-w-[280px]">
                        {challenge.description}
                      </p>
                    </div>
                    <ProgressRing
                      value={(challenge.progressCount / challenge.targetCount) * 100}
                      size={40}
                      strokeWidth={4}
                      color={challenge.completed ? 'stroke-emerald-400' : 'stroke-forest-400'}
                      trailColor="stroke-forest-950/80"
                    />
                  </div>

                  {!challenge.completed && (
                    <OrganicButton
                      onClick={() => completeChallenge(challenge.id)}
                      className="px-3 py-1.5 font-bold text-xs"
                    >
                      Resolve
                    </OrganicButton>
                  )}
                </div>
              ))}
            </div>
          </OrganicCard>
        </div>

        {/* Community Grove (6 cols) */}
        <div className="lg:col-span-6">
          <OrganicCard hoverEffect={false} className="p-5 h-full">
            <h3 className="font-serif font-bold text-base text-[#E8EDE9] mb-4 flex items-center gap-1.5">
              <Trees className="w-5 h-5 text-forest-400" />
              The Community Grove
            </h3>
            <p className="text-[11px] text-[#B8D4C3] mb-5">
              Compare with neighbors in your local community forest. Select a tree to view their stats.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center mb-6">
              {neighbors.map((neighbor) => (
                <button
                  key={neighbor.name}
                  onClick={() => setSelectedNeighbor(neighbor)}
                  className={`flex flex-col items-center p-3 rounded-2xl border w-full max-w-[110px] transition-all cursor-pointer ${
                    selectedNeighbor?.name === neighbor.name
                      ? 'bg-forest-800 border-forest-400 shadow-md scale-105 text-white'
                      : 'bg-[#11261D] text-[#B8D4C3] border-[#2A4A3A] hover:bg-forest-900/40 hover:text-[#E8EDE9]'
                  }`}
                >
                  {/* Mini procedural-looking tree icon */}
                  <div className="relative w-16 h-20 flex justify-center items-end mb-2">
                    {/* Stem */}
                    <div className="w-1.5 h-12 bg-[#5d4037] rounded-full" />
                    {/* Leaves cluster */}
                    <div
                      className={`absolute bottom-6 w-12 h-12 rounded-full ${neighbor.leafColor} opacity-80 filter blur-[1px] origin-bottom animate-[sway_4s_ease-in-out_infinite]`}
                      style={{ animationDelay: neighbor.swayDelay }}
                    />
                    {/* Blossom dots */}
                    {neighbor.xp > 550 && (
                      <>
                        <div className="absolute bottom-10 left-3 w-1.5 h-1.5 rounded-full bg-coral-400" />
                        <div className="absolute bottom-8 right-3 w-1.5 h-1.5 rounded-full bg-coral-400" />
                      </>
                    )}
                  </div>
                  
                  <span className="font-bold text-xs text-[#E8EDE9]">
                    {neighbor.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#B8D4C3] mt-0.5">
                    {neighbor.emissions}t / year
                  </span>
                </button>
              ))}
            </div>

            {/* Neighbor details popup */}
            <AnimatePresence mode="wait">
              {selectedNeighbor ? (
                <motion.div
                  key={selectedNeighbor.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-[#0A1F14]/40 border border-[#2A4A3A]/40 rounded-2xl flex items-center gap-4"
                >
                  <div className="text-3xl p-3 bg-forest-950 rounded-2xl border border-[#2A4A3A]/40">
                    {selectedNeighbor.avatar}
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-[#E8EDE9]">
                      {selectedNeighbor.name}&apos;s Garden
                    </h4>
                    <p className="text-[10px] text-[#B8D4C3] mt-0.5">
                      Growing a <strong>{selectedNeighbor.treeType}</strong> (Level {Math.floor(selectedNeighbor.xp / 150) + 1})
                    </p>
                    
                    <div className="mt-2.5 flex justify-between font-semibold text-[10px]">
                      <span className="text-[#E8EDE9]">Emissions:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedNeighbor.emissions} tonnes/year
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 border border-dashed border-[#2A4A3A]/60 rounded-2xl text-center text-xs text-[#B8D4C3] py-6">
                  Click a neighbor&apos;s tree above to inspect their digital carbon garden profile.
                </div>
              )}
            </AnimatePresence>
          </OrganicCard>
        </div>
      </div>
    </div>
  );
}
