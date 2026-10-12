import React from 'react';
import { 
  MapPin, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  Bookmark, 
  Scale, 
  Check, 
  ExternalLink,
  Building,
  GraduationCap,
  Star
} from 'lucide-react';
import { College } from '../../types';
import { useSavedColleges } from '../../context/SavedCollegesContext';
import { useComparison } from '../../context/ComparisonContext';

interface CollegeCardProps {
  college: College;
  onSelect: (college: College) => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, onSelect }) => {
  const { isSaved, toggleSave } = useSavedColleges();
  const { isComparing, addCollege, removeCollege, canAddMore } = useComparison();

  const saved = isSaved(college.id);
  const comparing = isComparing(college.id);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCompareToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (comparing) {
      removeCollege(college.id);
    } else {
      addCollege(college);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(college);
  };

  return (
    <div 
      onClick={() => onSelect(college)}
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative ${
        comparing
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200/90 hover:border-indigo-400/80 shadow-xs hover:shadow-xl'
      }`}
    >
      {/* Top Banner Ribbon */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          
          {/* Counseling Code + State */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg tracking-wider shadow-xs">
              CODE: {college.code}
            </span>

            {college.state === 'TS' ? (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-md border border-indigo-200/70">
                Telangana
              </span>
            ) : college.state === 'AP' ? (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-md border border-emerald-200/70">
                Andhra Pradesh
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-semibold text-xs rounded-md border border-amber-200/70">
                {college.state || 'All India'}
              </span>
            )}

            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-md border border-indigo-100">
              {college.exam}
            </span>

            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-xs rounded-md">
              {college.type}
            </span>
          </div>

          {/* Quick Action Icons & Compare Checkbox */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <label
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer select-none transition-all border ${
                comparing
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-400/30'
                  : !canAddMore
                  ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                  : 'bg-white hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-600 border-slate-200'
              }`}
              title={
                comparing
                  ? 'Uncheck to remove from comparison'
                  : !canAddMore
                  ? 'Maximum 4 colleges selected for comparison'
                  : 'Select for Quick Compare'
              }
            >
              <input
                type="checkbox"
                checked={comparing}
                disabled={!comparing && !canAddMore}
                onChange={handleCompareToggle}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
              />
              <span className="text-[11px]">
                {comparing ? 'Compared' : 'Compare'}
              </span>
            </label>

            <button
              onClick={handleSaveClick}
              title={saved ? 'Remove from saved' : 'Save college'}
              className={`p-1.5 rounded-lg border text-xs transition-all ${
                saved
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-slate-500 hover:text-amber-500 hover:bg-amber-50 border-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Affiliation */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {college.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{college.affiliation} • Est. {college.established}</span>
          </p>
          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between gap-1">
            <span className="flex items-center gap-1 min-w-0 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{college.city}, {college.state}</span>
            </span>
            <a
              href={college.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${college.name}, ${college.city}, ${college.state}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors shrink-0"
              title="Open campus location on Google Maps"
            >
              <span>Maps</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Accreditations & Badges */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap text-xs">
          {college.accreditation.naac && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 font-semibold rounded-md border border-amber-200 text-[11px]">
              <Award className="w-3 h-3 text-amber-600" />
              NAAC {college.accreditation.naac}
            </span>
          )}

          {college.accreditation.nirfRank && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-800 font-semibold rounded-md border border-purple-200 text-[11px]">
              NIRF #{college.accreditation.nirfRank}
            </span>
          )}

          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md ml-auto flex items-center gap-1 shadow-2xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{college.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({college.reviewCount})</span>
          </span>
        </div>
      </div>

      {/* Key Metrics Grid: Fee & Placements */}
      <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          
          {/* Official AFRC Annual Tuition Fee */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <span>Annual Fee (AFRC)</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {formatCurrency(college.annualFee)}
              <span className="text-[10px] text-slate-400 font-normal">/yr</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
              Verified Convenor Fee
            </div>
          </div>

          {/* Average Package */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-500" />
              <span>Avg Package</span>
            </div>
            <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
              ₹{college.placement.averageLPA} LPA
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Highest: ₹{college.placement.highestLPA} LPA
            </div>
          </div>

        </div>

        {/* Top Branch Cutoff Preview */}
        {college.cutoffs.length > 0 && (
          <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
            <span className="text-[11px] font-medium">
              CSE OC Cutoff: <strong className="text-slate-900">Rank ~{college.cutoffs[0].closingRanks['OC']?.toLocaleString('en-IN') || 'N/A'}</strong>
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5">
              View All Cutoffs →
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
