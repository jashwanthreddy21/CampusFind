import React from 'react';
import { 
  Scale, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Building, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import { College } from '../../types';
import { useComparison } from '../../context/ComparisonContext';

interface CollegeComparisonViewProps {
  onBrowseColleges: () => void;
  onSelectCollege: (college: College) => void;
}

export const CollegeComparisonView: React.FC<CollegeComparisonViewProps> = ({ 
  onBrowseColleges,
  onSelectCollege 
}) => {
  const { comparedColleges, removeCollege, clearComparison } = useComparison();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (comparedColleges.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Colleges Selected for Comparison</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Select 2 to 4 colleges from the directory to compare their verified annual tuition fees, NIRF rankings, placements, and EAMCET cutoffs side-by-side.
        </p>
        <button
          onClick={onBrowseColleges}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          Explore Colleges Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Side-by-Side Comparison</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Comparing {comparedColleges.length} Institution{comparedColleges.length > 1 ? 's' : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate official convenor fees, placement packages, and counseling cutoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparedColleges.length < 4 && (
            <button
              onClick={onBrowseColleges}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another College</span>
            </button>
          )}

          <button
            onClick={clearComparison}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl border border-rose-200 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-4 w-48 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                Parameter
              </th>
              {comparedColleges.map((college) => (
                <th key={college.id} className="p-4 min-w-[240px] align-top">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-md">
                      CODE: {college.code}
                    </span>
                    <button
                      onClick={() => removeCollege(college.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 
                    onClick={() => onSelectCollege(college)}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors mt-2 cursor-pointer line-clamp-2"
                  >
                    {college.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{college.city}, {college.state}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            
            {/* Annual Tuition Fee */}
            <tr className="bg-emerald-50/40">
              <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Annual Convenor Fee</span>
              </td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4">
                  <div className="text-base font-extrabold text-slate-900 font-mono">
                    {formatCurrency(c.annualFee)}
                    <span className="text-[10px] text-slate-400 font-normal">/yr</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    AFRC Verified Convenor Fee
                  </div>
                </td>
              ))}
            </tr>

            {/* Average Placement Package */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Average Package</td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4 font-bold text-indigo-600 text-sm">
                  ₹{c.placement.averageLPA} LPA
                </td>
              ))}
            </tr>

            {/* Highest Placement Package */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Highest Package</td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4 font-bold text-emerald-600 text-sm">
                  ₹{c.placement.highestLPA} LPA
                </td>
              ))}
            </tr>

            {/* NIRF / NAAC Accreditation */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Accreditations</td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4 space-y-1">
                  <div>NAAC Grade: <strong>{c.accreditation.naac || 'N/A'}</strong></div>
                  <div>NIRF Rank: <strong>{c.accreditation.nirfRank ? `#${c.accreditation.nirfRank}` : 'Unranked'}</strong></div>
                </td>
              ))}
            </tr>

            {/* Institution Status */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Type & Affiliation</td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4 space-y-0.5">
                  <div className="font-semibold text-slate-900">{c.type}</div>
                  <div className="text-slate-500 text-[11px]">{c.affiliation}</div>
                  <div className="text-slate-500 text-[11px]">Est. {c.established}</div>
                </td>
              ))}
            </tr>

            {/* CSE OC Cutoff */}
            <tr>
              <td className="p-4 font-bold text-slate-700">CSE Cutoff (OC)</td>
              {comparedColleges.map((c) => {
                const cse = c.cutoffs.find((x) => x.branchCode === 'CSE');
                return (
                  <td key={c.id} className="p-4 font-mono font-bold text-slate-900">
                    {cse ? `~${cse.closingRanks['OC']?.toLocaleString('en-IN')}` : 'N/A'}
                  </td>
                );
              })}
            </tr>

            {/* Campus Acreage */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Campus Area</td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4 font-medium text-slate-700">
                  {c.campusSizeAcres ? `${c.campusSizeAcres} Acres` : 'Standard City Campus'}
                </td>
              ))}
            </tr>

            {/* Top Recruiters */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Top Recruiters</td>
              {comparedColleges.map((c) => (
                <td key={c.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {c.placement.topRecruiters.slice(0, 5).map((r) => (
                      <span key={r} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};
