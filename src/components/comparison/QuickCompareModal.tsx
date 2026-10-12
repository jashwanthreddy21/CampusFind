import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  IndianRupee, 
  TrendingUp, 
  Award, 
  MapPin, 
  Building, 
  ExternalLink, 
  Trash2, 
  Check, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { College } from '../../types';
import { useComparison } from '../../context/ComparisonContext';

interface QuickCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCollege?: (college: College) => void;
}

export const QuickCompareModal: React.FC<QuickCompareModalProps> = ({
  isOpen,
  onClose,
  onSelectCollege
}) => {
  const { comparedColleges, removeCollege, clearComparison } = useComparison();
  const [selectedCategory, setSelectedCategory] = useState<'OC' | 'BC-A' | 'BC-B' | 'BC-C' | 'BC-D' | 'BC-E' | 'SC' | 'ST' | 'EWS'>('OC');
  const [activeSection, setActiveSection] = useState<'all' | 'fees' | 'placements' | 'cutoffs'>('all');

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Branch list for cutoff comparison
  const commonBranches = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'CSM', name: 'CSE (AI & Machine Learning)' },
    { code: 'CSD', name: 'CSE (Data Science)' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'ECE', name: 'Electronics & Communication' },
    { code: 'EEE', name: 'Electrical & Electronics' },
    { code: 'MECH', name: 'Mechanical Engineering' },
    { code: 'CIVIL', name: 'Civil Engineering' },
  ];

  // Helper to find lowest fee among compared
  const minFee = comparedColleges.length > 0 
    ? Math.min(...comparedColleges.map((c) => c.annualFee)) 
    : 0;

  // Helper to find highest average placement package
  const maxAvgPackage = comparedColleges.length > 0 
    ? Math.max(...comparedColleges.map((c) => c.placement.averageLPA)) 
    : 0;

  // Helper to find highest package
  const maxHighestPackage = comparedColleges.length > 0 
    ? Math.max(...comparedColleges.map((c) => c.placement.highestLPA)) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Quick College Compare
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {comparedColleges.length}/4 Selected
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Side-by-side comparative breakdown of verified annual fees, placement records, and cutoff ranks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {comparedColleges.length > 0 && (
              <button
                onClick={clearComparison}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              aria-label="Close Comparison Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs & Category Selector */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick jump filter buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setActiveSection('fees')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'fees'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              💰 Fees
            </button>
            <button
              onClick={() => setActiveSection('placements')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'placements'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              📈 Placements
            </button>
            <button
              onClick={() => setActiveSection('cutoffs')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'cutoffs'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              🎯 Cutoffs
            </button>
          </div>

          {/* Category Filter for Cutoffs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Cutoff Category:</span>
            {(['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body / Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {comparedColleges.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Colleges Selected</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">
                Check the "Compare" box on any college in the search results to inspect fees, placement packages, and cutoff ranks side-by-side.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Return to Search Results
              </button>
            </div>
          ) : (
            <>
              {/* Colleges Header Cards Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {comparedColleges.map((college) => (
                  <div 
                    key={college.id}
                    className="bg-white rounded-2xl border-2 border-indigo-100 p-4 shadow-xs relative flex flex-col justify-between hover:border-indigo-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-lg shadow-2xs">
                          {college.code}
                        </span>
                        <button
                          onClick={() => removeCollege(college.id)}
                          className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 
                        onClick={() => {
                          if (onSelectCollege) {
                            onClose();
                            onSelectCollege(college);
                          }
                        }}
                        className="text-sm font-extrabold text-slate-900 mt-2 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors"
                        title={college.name}
                      >
                        {college.name}
                      </h3>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{college.city}, {college.state}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                          {college.type}
                        </span>
                        {college.accreditation.naac && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
                            NAAC {college.accreditation.naac}
                          </span>
                        )}
                        {college.accreditation.nirfRank && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-bold">
                            NIRF #{college.accreditation.nirfRank}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{college.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal text-[10px]">({college.reviewCount})</span>
                      </div>
                      <button
                        onClick={() => {
                          if (onSelectCollege) {
                            onClose();
                            onSelectCollege(college);
                          }
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Full Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* If less than 4 colleges, show placeholder cards to invite adding more */}
                {Array.from({ length: 4 - comparedColleges.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/50 min-h-[170px]"
                  >
                    <Scale className="w-6 h-6 mb-2 text-slate-300" />
                    <span className="text-xs font-bold text-slate-500">Add Another College</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Check box in search results to compare side-by-side
                    </p>
                  </div>
                ))}
              </div>

              {/* SECTION 1: FEES COMPARATIVE BREAKDOWN */}
              {(activeSection === 'all' || activeSection === 'fees') && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        Tuition & Cost Breakdown
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      AFRC State Regulatory Approved
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-100">
                        {/* Annual Convenor Fee */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700 w-52">
                            Annual Convenor Fee
                            <span className="block text-[10px] text-slate-400 font-normal">Per academic year</span>
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4 min-w-[200px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-slate-900 text-base">
                                  {formatCurrency(c.annualFee)}
                                </span>
                                {c.annualFee === minFee && comparedColleges.length > 1 && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                    Lowest Fee
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Government Convener Quota</span>
                            </td>
                          ))}
                        </tr>

                        {/* 4-Year B.Tech Estimate */}
                        <tr className="hover:bg-slate-50/60 bg-slate-50/30">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            4-Year Total Tuition Fee
                            <span className="block text-[10px] text-slate-400 font-normal">Course tuition (4 years)</span>
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4 font-mono font-bold text-slate-800">
                              {formatCurrency(c.annualFee * 4)}
                            </td>
                          ))}
                        </tr>

                        {/* Hostel & Mess Charges */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            Hostel & Mess Fee (Approx)
                            <span className="block text-[10px] text-slate-400 font-normal">Per annum boarding</span>
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4 text-slate-700 font-medium">
                              {c.hostelFeeApprox ? (
                                <span className="font-mono font-bold text-slate-800">
                                  {formatCurrency(c.hostelFeeApprox)}/yr
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">~₹60,000 - ₹85,000/yr</span>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Fee Reimbursement & Scholarships */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            Scholarship & Reimbursement
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4 text-slate-600 text-[11px] leading-relaxed">
                              {c.state === 'TS' ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>TS ePASS Eligible</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    Full fee reimbursement for Rank &lt; 10,000 & SC/ST/BC categories
                                  </div>
                                </div>
                              ) : c.state === 'AP' ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Jagananna Vidya Deevena (AP)</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    Full fee reimbursement to qualified candidates
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500">
                                  Central Government NSP & Merit Cum Means scholarships applicable
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 2: PLACEMENTS COMPARATIVE BREAKDOWN */}
              {(activeSection === 'all' || activeSection === 'placements') && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        Placement Statistics & ROI
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
                      Recent Graduating Batches
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-100">
                        {/* Average CTC */}
                        <tr className="hover:bg-slate-50/60 bg-indigo-50/20">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700 w-52">
                            Average Package (CTC)
                            <span className="block text-[10px] text-slate-400 font-normal">Campus-wide average</span>
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4 min-w-[200px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-indigo-700 text-base">
                                  ₹{c.placement.averageLPA} LPA
                                </span>
                                {c.placement.averageLPA === maxAvgPackage && comparedColleges.length > 1 && (
                                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                                    Top Average
                                  </span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Highest CTC */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            Highest Package
                            <span className="block text-[10px] text-slate-400 font-normal">Peak international/domestic offer</span>
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-emerald-700 text-base">
                                  ₹{c.placement.highestLPA} LPA
                                </span>
                                {c.placement.highestLPA === maxHighestPackage && comparedColleges.length > 1 && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                    Top Offer
                                  </span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Median CTC */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            Median Package
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4 font-mono font-bold text-slate-800">
                              ₹{c.placement.medianLPA || c.placement.averageLPA} LPA
                            </td>
                          ))}
                        </tr>

                        {/* Placement Rate */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            Placement Percentage
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 font-mono text-sm">
                                  {c.placement.placementPercentage}%
                                </span>
                                <div className="flex-1 max-w-[100px] bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-indigo-600 h-full rounded-full"
                                    style={{ width: `${Math.min(c.placement.placementPercentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Top Recruiting Companies */}
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-700">
                            Top Campus Recruiters
                          </td>
                          {comparedColleges.map((c) => (
                            <td key={c.id} className="p-3.5 sm:p-4">
                              <div className="flex flex-wrap gap-1">
                                {c.placement.topRecruiters.slice(0, 6).map((r) => (
                                  <span 
                                    key={r}
                                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200/60"
                                  >
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
              )}

              {/* SECTION 3: CUTOFFS COMPARATIVE BREAKDOWN */}
              {(activeSection === 'all' || activeSection === 'cutoffs') && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-amber-50/70 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          Cutoff Closing Ranks Comparison
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Comparing category <span className="font-bold text-slate-900">{selectedCategory}</span> closing ranks across major B.Tech branches.
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                      Lower rank = More competitive
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-3.5 sm:p-4 text-slate-500 uppercase text-[10px] font-bold tracking-wider w-52">
                            Branch
                          </th>
                          {comparedColleges.map((c) => (
                            <th key={c.id} className="p-3.5 sm:p-4 font-mono font-bold text-slate-700 min-w-[200px]">
                              {c.code} ({c.shortName || c.name.split(' ')[0]})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {commonBranches.map((branch) => {
                          // Collect all cutoff ranks for this branch across colleges for the selected category
                          const ranks = comparedColleges.map((c) => {
                            const b = c.cutoffs.find(
                              (item) => item.branchCode.toUpperCase() === branch.code.toUpperCase()
                            );
                            if (!b) return null;
                            const r = b.closingRanks[selectedCategory];
                            return typeof r === 'number' ? r : null;
                          });

                          const validRanks = ranks.filter((r): r is number => r !== null);
                          const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : null;

                          return (
                            <tr key={branch.code} className="hover:bg-slate-50/60">
                              <td className="p-3.5 sm:p-4">
                                <div className="font-mono font-bold text-indigo-600 text-xs">
                                  {branch.code}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {branch.name}
                                </div>
                              </td>
                              {comparedColleges.map((c, idx) => {
                                const rankVal = ranks[idx];
                                const isBest = rankVal !== null && rankVal === bestRank && validRanks.length > 1;

                                return (
                                  <td key={c.id} className="p-3.5 sm:p-4">
                                    {rankVal !== null ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-slate-900 text-sm">
                                          ~{rankVal.toLocaleString('en-IN')}
                                        </span>
                                        {isBest && (
                                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                            Top Cutoff
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-mono text-xs">
                                        N/A
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Quick Help Tip */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700">Counselling Note:</span>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Tuition fees are determined by the Admission and Fee Regulatory Committee (AFRC). Cutoff ranks represent round 1 to final counseling closing ranks. Actual cutoffs may vary year-on-year based on candidate volume and seat availability.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {comparedColleges.length === 1 && (
              <span>Tip: Select up to 3 more colleges to compare side-by-side.</span>
            )}
            {comparedColleges.length > 1 && (
              <span>Comparing {comparedColleges.length} colleges side-by-side.</span>
            )}
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
