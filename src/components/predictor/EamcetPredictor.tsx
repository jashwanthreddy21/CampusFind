import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Bookmark, 
  TrendingUp, 
  IndianRupee,
  Share2,
  Calculator
} from 'lucide-react';
import { College, ExamType, PredictorResult, ReservationCategory } from '../../types';
import { ALL_COLLEGES, AVAILABLE_BRANCHES } from '../../data/collegesData';
import { useAuth } from '../../context/AuthContext';
import { savePredictionToFirestore } from '../../firebase/services';
import { useSavedColleges } from '../../context/SavedCollegesContext';
import { MeritScoreCalculator } from './MeritScoreCalculator';

interface EamcetPredictorProps {
  onSelectCollege: (college: College) => void;
}

export const EamcetPredictor: React.FC<EamcetPredictorProps> = ({ onSelectCollege }) => {
  const { user, examStream } = useAuth();
  const { isSaved, toggleSave } = useSavedColleges();

  // Sub-tab: Predictor vs Merit Score Calculator
  const [activeSubTab, setActiveSubTab] = useState<'predictor' | 'merit_score'>('predictor');
  const [appliedRankNotice, setAppliedRankNotice] = useState<string | null>(null);

  const [exam, setExam] = useState<ExamType>(() => {
    if (examStream === 'jee-main') return 'JEE Main';
    if (examStream === 'jee-advanced') return 'JEE Advanced';
    return 'TS EAMCET';
  });

  // Sync exam when examStream changes
  React.useEffect(() => {
    if (examStream === 'jee-main') setExam('JEE Main');
    else if (examStream === 'jee-advanced') setExam('JEE Advanced');
    else if (exam === 'JEE Main' || exam === 'JEE Advanced') setExam('TS EAMCET');
  }, [examStream]);

  const [rankInput, setRankInput] = useState<string>(() => {
    if (examStream === 'jee-advanced') return '1800';
    if (examStream === 'jee-main') return '6500';
    return '8500';
  });
  const [category, setCategory] = useState<'OC' | 'BC-A' | 'BC-B' | 'BC-C' | 'BC-D' | 'BC-E' | 'SC' | 'ST' | 'EWS'>('OC');
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [maxFee, setMaxFee] = useState<number>(500000);
  const [hasPredicted, setHasPredicted] = useState<boolean>(true);

  const results: PredictorResult[] = useMemo(() => {
    const rank = parseInt(rankInput, 10);
    if (isNaN(rank) || rank <= 0) return [];

    const matches: PredictorResult[] = [];

    // Filter candidate colleges by exam selection
    const candidateColleges = ALL_COLLEGES.filter((c) => {
      if (exam === 'JEE Advanced') {
        return (c.exam === 'JEE Advanced' || c.examStream === 'jee-advanced' || c.acceptedExams?.includes('JEE Advanced')) && c.annualFee <= maxFee;
      }
      if (exam === 'JEE Main') {
        return (c.exam === 'JEE Main' || c.examStream === 'jee-main' || c.acceptedExams?.includes('JEE Main')) && c.annualFee <= maxFee;
      }
      const targetState = exam === 'TS EAMCET' ? 'TS' : 'AP';
      return (c.state === targetState || c.exam === exam) && c.annualFee <= maxFee;
    });

    for (const college of candidateColleges) {
      for (const cutoff of college.cutoffs) {
        if (selectedBranch && selectedBranch !== 'ALL' && cutoff.branchCode !== selectedBranch) {
          continue;
        }

        const categoryClosingRank = cutoff.closingRanks[category] || cutoff.closingRanks['OC'] || 0;
        if (!categoryClosingRank) continue;

        let chance: 'Very High' | 'Good' | 'Possible' | 'Tough' = 'Tough';
        let chanceScore = 20;

        if (rank <= categoryClosingRank * 0.75) {
          chance = 'Very High';
          chanceScore = 95;
        } else if (rank <= categoryClosingRank) {
          chance = 'Good';
          chanceScore = 80;
        } else if (rank <= categoryClosingRank * 1.15) {
          chance = 'Possible';
          chanceScore = 55;
        } else {
          chance = 'Tough';
          chanceScore = 25;
        }

        const diff = categoryClosingRank - rank;
        let notes = '';
        if (chance === 'Very High') {
          notes = `Your rank is well within previous cutoff (${categoryClosingRank.toLocaleString('en-IN')}). Extremely safe seat!`;
        } else if (chance === 'Good') {
          notes = `Solid chance in regular Phase 1 counseling rounds.`;
        } else if (chance === 'Possible') {
          notes = `Borderline seat. Highly recommended to place in Choice Filling web options.`;
        } else {
          notes = `Rank is beyond previous cutoff. Might be available in special or final round mop-ups.`;
        }

        matches.push({
          college,
          branchCode: cutoff.branchCode,
          branchName: cutoff.branchName,
          cutoffRank: categoryClosingRank,
          userRank: rank,
          chance,
          chanceScore,
          difference: diff,
          notes,
        });
      }
    }

    // Sort by chance score descending (best opportunities first)
    return matches.sort((a, b) => b.chanceScore - a.chanceScore || a.college.annualFee - b.college.annualFee);
  }, [exam, rankInput, category, selectedBranch, maxFee]);

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasPredicted(true);

    if (user && rankInput) {
      const rank = parseInt(rankInput, 10);
      if (!isNaN(rank)) {
        try {
          await savePredictionToFirestore(user.uid, {
            id: `pred_${Date.now()}`,
            exam,
            rank,
            category,
            branch: selectedBranch,
            state: exam === 'TS EAMCET' ? 'TS' : 'AP',
          });
        } catch (err) {
          console.warn('Prediction sync skipped:', err);
        }
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApplyRankFromMerit = (rank: number, stateCode: 'TS' | 'AP', cat: ReservationCategory) => {
    setRankInput(String(rank));
    setCategory(cat);
    if (stateCode === 'TS') setExam('TS EAMCET');
    else setExam('AP EAMCET');
    setActiveSubTab('predictor');
    setAppliedRankNotice(`Applied Merit Rank #${rank.toLocaleString('en-IN')} (${stateCode} EAMCET - ${cat})`);
    setTimeout(() => setAppliedRankNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation: College Predictor vs Merit Score Calculator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('predictor')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'predictor'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
            <span>College Admission Predictor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('merit_score')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'merit_score'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Merit Score Calculator</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'merit_score' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-100 text-indigo-700'
            }`}>
              25% IPE + 75%
            </span>
          </button>
        </div>

        {appliedRankNotice && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{appliedRankNotice}</span>
          </div>
        )}
      </div>

      {activeSubTab === 'merit_score' ? (
        <MeritScoreCalculator
          onSelectCollege={onSelectCollege}
          onApplyRankToPredictor={handleApplyRankFromMerit}
        />
      ) : (
        <>
          {/* Quick Context Banner inside Predictor Mode */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/70 rounded-2xl border border-indigo-100 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Know your Weighted Merit Score?</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 bg-amber-100 text-amber-800 rounded-full">
                    25% IPE + 75% EAMCET
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Input your Intermediate marks and EAMCET rank to compute your weighted score & analyze 3-year cutoff trends.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('merit_score')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              <span>Calculate Merit Score</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Predictor Form Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {exam === 'JEE Advanced'
                ? 'JoSAA IIT Rank Predictor'
                : exam === 'JEE Main'
                ? 'JoSAA & CSAB NIT / IIIT Predictor'
                : 'Official EAMCET Rank Predictor'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {exam === 'JEE Advanced'
              ? 'Find Your Admission Chances in 23 IITs'
              : exam === 'JEE Main'
              ? 'Find Your Chances in 31 NITs & 26 IIITs'
              : 'Find Your Admission Chances in TS & AP Colleges'}
          </h2>
          <p className="text-sm text-indigo-200 mt-2 leading-relaxed">
            {exam === 'JEE Advanced'
              ? 'Enter your JEE Advanced CRL rank and reservation category to predict branch-wise IIT admission chances based on official JoSAA closing ranks.'
              : exam === 'JEE Main'
              ? 'Enter your JEE Main CRL rank and category to predict admission chances in top NITs and IIITs across India based on JoSAA/CSAB cutoffs.'
              : 'Enter your EAMCET rank and reservation category to predict branch-wise college admission chances based on official convenor round cutoffs.'}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handlePredictSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Exam Selector */}
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">Counselling Exam</label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value as ExamType)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-indigo-400 transition-all"
            >
              {examStream === 'jee-advanced' ? (
                <option value="JEE Advanced" className="text-slate-900">JEE Advance (23 IITs)</option>
              ) : examStream === 'jee-main' ? (
                <option value="JEE Main" className="text-slate-900">JEE Mains (31 NITs & 26 IIITs)</option>
              ) : (
                <>
                  <option value="TS EAMCET" className="text-slate-900">Telangana (TS EAMCET)</option>
                  <option value="AP EAMCET" className="text-slate-900">Andhra Pradesh (AP EAMCET)</option>
                </>
              )}
            </select>
          </div>

          {/* Rank Input */}
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">
              {exam === 'JEE Advanced' ? 'JEE Advanced Rank' : exam === 'JEE Main' ? 'JEE Main CRL / Rank' : 'Your EAMCET Rank'}
            </label>
            <input
              type="number"
              min="1"
              max="500000"
              value={rankInput}
              onChange={(e) => setRankInput(e.target.value)}
              placeholder={exam === 'JEE Advanced' ? 'e.g. 1500' : exam === 'JEE Main' ? 'e.g. 6500' : 'e.g. 8500'}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-indigo-400 transition-all placeholder:text-white/40"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">Category (Quota)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-indigo-400 transition-all"
            >
              <option value="OC" className="text-slate-900">OC (Open Competition)</option>
              <option value="BC-A" className="text-slate-900">BC-A</option>
              <option value="BC-B" className="text-slate-900">BC-B</option>
              <option value="BC-C" className="text-slate-900">BC-C</option>
              <option value="BC-D" className="text-slate-900">BC-D</option>
              <option value="BC-E" className="text-slate-900">BC-E</option>
              <option value="SC" className="text-slate-900">SC</option>
              <option value="ST" className="text-slate-900">ST</option>
              <option value="EWS" className="text-slate-900">EWS</option>
            </select>
          </div>

          {/* Preferred Branch */}
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">Target Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-indigo-400 transition-all"
            >
              <option value="ALL" className="text-slate-900">All Branches</option>
              {AVAILABLE_BRANCHES.map((b) => (
                <option key={b.code} value={b.code} className="text-slate-900">
                  {b.code} ({b.name})
                </option>
              ))}
            </select>
          </div>

          {/* Predict Action Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Predict Chances</span>
            </button>
          </div>

        </form>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            Predicted Colleges for Rank #{parseInt(rankInput || '0', 10).toLocaleString('en-IN')} ({category})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {results.length} seat possibilities in {exam === 'TS EAMCET' ? 'Telangana' : 'Andhra Pradesh'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Very High
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Good
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Possible
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Tough
          </span>
        </div>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">No matches found for this filter</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your rank, selecting "All Branches", or increasing the annual fee filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((res, index) => {
            const saved = isSaved(res.college.id);
            return (
              <div
                key={`${res.college.id}_${res.branchCode}_${index}`}
                onClick={() => onSelectCollege(res.college)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-md">
                        {res.college.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {res.college.city}
                      </span>
                    </div>

                    {/* Chance Badge */}
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      res.chance === 'Very High' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : res.chance === 'Good'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : res.chance === 'Possible'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {res.chance} Chance
                    </span>
                  </div>

                  {/* College Name & Branch */}
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {res.college.name}
                  </h4>
                  <div className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1.5">
                    <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                      {res.branchCode}
                    </span>
                    <span className="truncate">{res.branchName}</span>
                  </div>

                  {/* Cutoff Rank Comparison */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Cutoff Closing Rank</span>
                      <div className="font-mono font-bold text-slate-900">
                        ~{res.cutoffRank.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Annual Convenor Fee</span>
                      <div className="font-mono font-bold text-slate-900">
                        {formatCurrency(res.college.annualFee)}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    {res.notes}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 font-medium">
                    Avg Package: <strong className="text-slate-900">₹{res.college.placement.averageLPA} LPA</strong>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(res.college);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      saved 
                        ? 'bg-amber-500 text-white border-amber-500' 
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

    </div>
  );
};
