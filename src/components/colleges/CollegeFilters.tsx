import React from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { ExamStream, FilterState } from '../../types';
import { AVAILABLE_BRANCHES, AVAILABLE_CITIES } from '../../data/collegesData';

interface CollegeFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
  examStream?: ExamStream;
  selectedSubCategory?: string;
  onSubCategoryChange?: (sub: string) => void;
}

export const CollegeFilters: React.FC<CollegeFiltersProps> = ({
  filters,
  setFilters,
  totalCount,
  filteredCount,
  examStream = 'eamcet',
  selectedSubCategory = 'all',
  onSubCategoryChange,
}) => {
  const cities = filters.state === 'all'
    ? [...AVAILABLE_CITIES.TS, ...AVAILABLE_CITIES.AP]
    : filters.state === 'TS'
    ? AVAILABLE_CITIES.TS
    : AVAILABLE_CITIES.AP;

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      state: 'all',
      city: '',
      branch: '',
      collegeType: '',
      ownership: '',
      maxFee: 300000,
      minRating: 0,
      sortBy: 'rating',
    });
    if (onSubCategoryChange) onSubCategoryChange('all');
  };

  const hasActiveFilters = 
    filters.city !== '' || 
    filters.branch !== '' || 
    filters.collegeType !== '' || 
    filters.ownership !== '' || 
    filters.maxFee < 300000 || 
    filters.minRating > 0 ||
    selectedSubCategory !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span>Filter Colleges & Universities</span>
          <span className="text-xs font-normal text-slate-500">
            ({filteredCount} of {totalCount})
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Grid of Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        
        {/* State / Institute Category - TS & AP options removed for JEE Mains and JEE Advance */}
        {examStream === 'eamcet' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">State</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value as any, city: '' }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All States (TS + AP)</option>
              <option value="TS">Telangana (TS EAMCET)</option>
              <option value="AP">Andhra Pradesh (AP EAMCET)</option>
            </select>
          </div>
        ) : examStream === 'jee-main' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Institute Type</label>
            <select
              value={selectedSubCategory}
              onChange={(e) => onSubCategoryChange && onSubCategoryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All (NITs & IIITs - 57)</option>
              <option value="nit">National Institutes of Technology (31 NITs)</option>
              <option value="iiit">Indian Institutes of Information Tech (26 IIITs)</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Institute Track</label>
            <select
              value="all"
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-medium opacity-90 cursor-default"
            >
              <option value="all">All 23 Premier IITs across India</option>
            </select>
          </div>
        )}

        {/* City (Only for EAMCET) / Central Counseling info */}
        {examStream === 'eamcet' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Counseling Allocation</label>
            <select
              value="central"
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-medium opacity-90 cursor-default"
            >
              <option value="central">JoSAA / CSAB All-India Quota</option>
            </select>
          </div>
        )}

        {/* Branch */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Branch / Stream</label>
          <select
            value={filters.branch}
            onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{examStream === 'eamcet' ? 'All Branches (Engineering & Pharmacy)' : 'All Engineering Branches'}</option>
            {AVAILABLE_BRANCHES.map((b) => (
              <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
            ))}
          </select>
        </div>

        {/* College Type */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Institution Type</label>
          <select
            value={filters.collegeType}
            onChange={(e) => setFilters(prev => ({ ...prev, collegeType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Types</option>
            <option value="Institute of National Importance">Institute of National Importance (IIT / NIT)</option>
            <option value="University">State / Govt / Deemed University</option>
            <option value="Autonomous">Autonomous College</option>
            <option value="Affiliated">Affiliated College</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Sort Results By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
          >
            <option value="rating">Top Rated & NIRF</option>
            <option value="placement">Highest Avg Package</option>
            <option value="fee-asc">Annual Fee: Low to High</option>
            <option value="fee-desc">Annual Fee: High to Low</option>
          </select>
        </div>

      </div>

      {/* Fee Filter Slider */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Max Annual Convenor Fee:</span>
          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            {filters.maxFee >= 300000 ? 'Any Fee (No Limit)' : `Up to ₹${(filters.maxFee / 1000).toFixed(0)}k/yr`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[50000, 75000, 115000, 140000, 300000].map((fee) => (
            <button
              key={fee}
              onClick={() => setFilters(prev => ({ ...prev, maxFee: fee }))}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                filters.maxFee === fee
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {fee >= 300000 ? 'All' : `≤ ₹${fee >= 100000 ? (fee / 100000).toFixed(2) + 'L' : (fee / 1000) + 'k'}`}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
