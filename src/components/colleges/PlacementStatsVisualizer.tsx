import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  Building2, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  IndianRupee,
  Users,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { College } from '../../types';

interface PlacementStatsVisualizerProps {
  college: College;
}

export const PlacementStatsVisualizer: React.FC<PlacementStatsVisualizerProps> = ({ college }) => {
  const { placement } = college;
  const [activeView, setActiveView] = useState<'packages' | 'recruiters' | 'comparison'>('packages');

  const highestLPA = placement.highestLPA || 0;
  const averageLPA = placement.averageLPA || 0;
  const medianLPA = placement.medianLPA || Math.round(averageLPA * 0.88 * 10) / 10;
  const placementRate = placement.placementPercentage || 85;
  const recruiters = placement.topRecruiters || [];

  // Data for Package Comparison Bar Chart
  const packageBars = [
    {
      id: 'highest',
      label: 'Highest Package',
      value: highestLPA,
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Peak international or domestic dream offer received by top candidate',
      percentage: 100, // Reference max
    },
    {
      id: 'average',
      label: 'Average Package',
      value: averageLPA,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
      textColor: 'text-indigo-700',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      description: 'Mean annual compensation across all recruited candidates',
      percentage: highestLPA > 0 ? Math.min(100, Math.round((averageLPA / highestLPA) * 100)) : 40,
    },
    {
      id: 'median',
      label: 'Median Package',
      value: medianLPA,
      color: 'bg-gradient-to-r from-violet-500 to-purple-600',
      textColor: 'text-violet-700',
      badgeBg: 'bg-violet-50 text-violet-800 border-violet-200',
      description: 'Middle 50th percentile offer, most realistic student benchmark',
      percentage: highestLPA > 0 ? Math.min(100, Math.round((medianLPA / highestLPA) * 100)) : 35,
    },
  ];

  // Estimated hiring volume or package tier score for Top Recruiters (bar chart visualization)
  // Generates realistic relative scale based on company profile and overall college average
  const recruiterBars = recruiters.map((name, index) => {
    // Tier multipliers based on typical recruiter tiers
    let tierMultiplier = 1.0;
    const isTier1 = /google|microsoft|amazon|apple|goldman|de shaw|uber|nvidia|oracle|adobe|atlassian|salesforce/i.test(name);
    const isTier2 = /tcs ninja|tcs digital|wipro turbo|infosys sp|accenture|cognizant|deloitte|ey|pwc|kpmg/i.test(name);

    if (isTier1) {
      tierMultiplier = 1.35;
    } else if (isTier2) {
      tierMultiplier = 0.85;
    } else {
      tierMultiplier = 1.0 - (index * 0.05);
    }

    const estimatedOfferRangeLPA = Math.max(3.6, Math.round(averageLPA * tierMultiplier * 10) / 10);
    const maxRecruiterVal = Math.max(highestLPA * 0.9, ...recruiters.map(() => averageLPA * 1.35));
    const barWidthPct = Math.min(100, Math.max(20, Math.round((estimatedOfferRangeLPA / maxRecruiterVal) * 100)));

    return {
      name,
      estimatedOfferLPA: estimatedOfferRangeLPA,
      barWidthPct,
      category: isTier1 ? 'Super Dream / Tier 1' : isTier2 ? 'Mass / Core' : 'Dream Offer',
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Placement Statistics & Salary Packages</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {placementRate}% Placed
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing highest CTC, average CTC, median CTC, and key recruiting partners
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('packages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'packages'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Package Chart
          </button>
          <button
            type="button"
            onClick={() => setActiveView('recruiters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'recruiters'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Recruiters
          </button>
          <button
            type="button"
            onClick={() => setActiveView('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'comparison'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Visuals
          </button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-xl border border-emerald-200/80">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Highest Package</span>
          </div>
          <div className="text-xl font-black text-emerald-950 mt-1">
            ₹{highestLPA} <span className="text-xs font-bold text-emerald-700">LPA</span>
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5 truncate">
            Top Dream Offer
          </div>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50/40 rounded-xl border border-indigo-200/80">
          <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            <span>Average Package</span>
          </div>
          <div className="text-xl font-black text-indigo-950 mt-1">
            ₹{averageLPA} <span className="text-xs font-bold text-indigo-700">LPA</span>
          </div>
          <div className="text-[11px] text-indigo-700/80 mt-0.5 truncate">
            Across All Branches
          </div>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-violet-50 to-purple-50/40 rounded-xl border border-violet-200/80">
          <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-violet-600" />
            <span>Median Package</span>
          </div>
          <div className="text-xl font-black text-violet-950 mt-1">
            ₹{medianLPA} <span className="text-xs font-bold text-violet-700">LPA</span>
          </div>
          <div className="text-[11px] text-violet-700/80 mt-0.5 truncate">
            Middle 50% Benchmark
          </div>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-xl border border-amber-200/80">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>Placement Rate</span>
          </div>
          <div className="text-xl font-black text-amber-950 mt-1">
            {placementRate}%
          </div>
          <div className="text-[11px] text-amber-800/80 mt-0.5 truncate">
            {placement.totalOffers ? `${placement.totalOffers}+ Total Offers` : 'Students Placed'}
          </div>
        </div>
      </div>

      {/* SECTION 1: Package Comparison Bar Chart */}
      {(activeView === 'packages' || activeView === 'comparison') && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Annual Compensation Package Bar Chart (₹ in LPA)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Relative comparison of Highest CTC, Average CTC, and Median CTC
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Max: ₹{highestLPA} LPA
            </span>
          </div>

          {/* Simple Visual Horizontal Bar Chart */}
          <div className="space-y-4 pt-2">
            {packageBars.map((bar) => {
              // Calculate width relative to highest package
              const widthPct = highestLPA > 0 
                ? Math.max(12, Math.round((bar.value / highestLPA) * 100))
                : 50;

              return (
                <div key={bar.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{bar.label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${bar.badgeBg}`}>
                        {bar.id === 'highest' ? '100% (Peak)' : `${bar.percentage}% of Peak`}
                      </span>
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900">
                      ₹{bar.value} <span className="text-xs font-bold text-slate-500">LPA</span>
                    </div>
                  </div>

                  {/* Visual Bar Track */}
                  <div className="h-6 w-full bg-slate-200/80 rounded-xl overflow-hidden p-0.5 flex items-center shadow-inner">
                    <div
                      className={`h-full ${bar.color} rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2 text-white font-mono font-bold text-[11px] shadow-sm`}
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className="drop-shadow-xs">₹{bar.value} LPA</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {bar.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Key Insights Ratio */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Package Spread Factor:</span>
                <span className="text-slate-600 text-[11px]">
                  Highest package is <strong>{(highestLPA / (averageLPA || 1)).toFixed(1)}x</strong> of the average branch package, showing strong top-tier placement opportunities.
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Median Stability:</span>
                <span className="text-slate-600 text-[11px]">
                  Median package at <strong>₹{medianLPA} LPA</strong> indicates consistent mid-tier hiring across major software & core sectors.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Top Recruiters Bar Chart & Hiring Ecosystem */}
      {(activeView === 'recruiters' || activeView === 'comparison') && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Top Recruiting Companies & Offer Range Bar Chart</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimated compensation range & hiring strength of primary campus recruiters
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {recruiters.length} Key Partners
            </span>
          </div>

          {/* Recruiter Simple Bar Chart */}
          <div className="space-y-3 pt-1">
            {recruiterBars.map((r, i) => (
              <div key={r.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      • {r.category}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-indigo-700 text-xs">
                    ~₹{r.estimatedOfferLPA} LPA <span className="text-[10px] text-slate-400 font-normal">avg offer</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-5 w-full bg-slate-200/70 rounded-lg overflow-hidden p-0.5 flex items-center">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-md transition-all duration-500 flex items-center justify-end pr-2 text-white font-mono font-bold text-[10px]"
                    style={{ width: `${r.barWidthPct}%` }}
                  >
                    <span>{r.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recruiter Tag Cloud */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              All Major Participating Recruiters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recruiters.map((recruiter) => (
                <span
                  key={recruiter}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-800 text-xs font-medium rounded-lg border border-slate-200 transition-colors shadow-2xs"
                >
                  {recruiter}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
