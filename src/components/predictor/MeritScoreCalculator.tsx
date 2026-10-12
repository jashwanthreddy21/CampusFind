import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  Copy, 
  Check, 
  Filter, 
  GraduationCap, 
  Building2, 
  Award, 
  Sliders, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ReservationCategory, College } from '../../types';
import { 
  calculateWeightedMeritScore, 
  estimateEamcetMarksFromRank, 
  estimateRankFromEamcetMarks, 
  getPercentileFromMeritScore,
  HISTORICAL_MERIT_TRENDS 
} from '../../data/meritTrendsData';
import { ALL_COLLEGES } from '../../data/collegesData';

interface MeritScoreCalculatorProps {
  onSelectCollege?: (college: College) => void;
  onApplyRankToPredictor?: (rank: number, state: 'TS' | 'AP', category: ReservationCategory) => void;
}

type IpeInputMode = 'group' | 'total' | 'subject_wise';

export const MeritScoreCalculator: React.FC<MeritScoreCalculatorProps> = ({
  onSelectCollege,
  onApplyRankToPredictor
}) => {
  // Input states
  const [ipeInputMode, setIpeInputMode] = useState<IpeInputMode>('group');
  const [ipeGroupMarks, setIpeGroupMarks] = useState<number>(565);
  const [ipeTotalMarks, setIpeTotalMarks] = useState<number>(940);
  
  // Subject-wise split (for MPC: 300 + 150 + 150 = 600)
  const [mathsMarks, setMathsMarks] = useState<number>(285);
  const [physicsMarks, setPhysicsMarks] = useState<number>(140);
  const [chemMarks, setChemMarks] = useState<number>(140);

  // EAMCET inputs
  const [eamcetRank, setEamcetRank] = useState<number>(6800);
  const [manualMarksMode, setManualMarksMode] = useState<boolean>(false);
  const [eamcetMarksInput, setEamcetMarksInput] = useState<number>(() => estimateEamcetMarksFromRank(6800));

  // Domain & Category
  const [state, setState] = useState<'TS' | 'AP'>('TS');
  const [category, setCategory] = useState<ReservationCategory>('OC');

  // Trend filtering states
  const [trendStateFilter, setTrendStateFilter] = useState<'ALL' | 'TS' | 'AP'>('ALL');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'SAFE' | 'TARGET' | 'DREAM'>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // What-If sensitivity adjustments
  const [whatIfIpeDelta, setWhatIfIpeDelta] = useState<number>(0);
  const [whatIfEamcetDelta, setWhatIfEamcetDelta] = useState<number>(0);

  // UI state
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showFormulaExplanation, setShowFormulaExplanation] = useState<boolean>(false);

  // Handle rank change
  const handleRankChange = (newRank: number) => {
    const validRank = Math.max(1, Math.min(300000, newRank || 1));
    setEamcetRank(validRank);
    if (!manualMarksMode) {
      setEamcetMarksInput(estimateEamcetMarksFromRank(validRank));
    }
  };

  // Handle marks change
  const handleMarksChange = (newMarks: number) => {
    const validMarks = Math.max(0, Math.min(160, newMarks || 0));
    setEamcetMarksInput(validMarks);
    if (manualMarksMode) {
      setEamcetRank(estimateRankFromEamcetMarks(validMarks));
    }
  };

  // Effective IPE Marks based on selected mode
  const effectiveIpe = useMemo(() => {
    if (ipeInputMode === 'group') {
      return { marks: ipeGroupMarks, max: 600 };
    }
    if (ipeInputMode === 'total') {
      // Normalizing total 1000 to 600 scale or directly computing percentage
      return { marks: (ipeTotalMarks / 1000) * 600, max: 600 };
    }
    const sum = mathsMarks + physicsMarks + chemMarks;
    return { marks: sum, max: 600 };
  }, [ipeInputMode, ipeGroupMarks, ipeTotalMarks, mathsMarks, physicsMarks, chemMarks]);

  // Primary calculation
  const calculation = useMemo(() => {
    const eamcetScoreToUse = manualMarksMode 
      ? eamcetMarksInput 
      : estimateEamcetMarksFromRank(eamcetRank);

    return calculateWeightedMeritScore(
      effectiveIpe.marks,
      effectiveIpe.max,
      eamcetScoreToUse
    );
  }, [effectiveIpe, manualMarksMode, eamcetMarksInput, eamcetRank]);

  // What-If calculation
  const whatIfCalculation = useMemo(() => {
    const simulatedIpe = Math.min(600, Math.max(0, effectiveIpe.marks + whatIfIpeDelta));
    const baseEamcet = manualMarksMode ? eamcetMarksInput : estimateEamcetMarksFromRank(eamcetRank);
    const simulatedEamcet = Math.min(160, Math.max(0, baseEamcet + whatIfEamcetDelta));

    return calculateWeightedMeritScore(
      simulatedIpe,
      600,
      simulatedEamcet
    );
  }, [effectiveIpe, whatIfIpeDelta, whatIfEamcetDelta, manualMarksMode, eamcetMarksInput, eamcetRank]);

  const percentileInfo = useMemo(() => {
    return getPercentileFromMeritScore(calculation.totalMeritScore);
  }, [calculation.totalMeritScore]);

  // Benchmarked trends list
  const benchmarkedTrends = useMemo(() => {
    return HISTORICAL_MERIT_TRENDS.map((item) => {
      // Find historical cutoffs for current category, fallback to OC
      const categoryData = item.historicalCutoffs.find((c) => c.category === category) 
        || item.historicalCutoffs.find((c) => c.category === 'OC') 
        || item.historicalCutoffs[0];

      const trends = categoryData.trends;
      const latest2024 = trends.find((t) => t.year === 2024) || trends[0];
      const prev2023 = trends.find((t) => t.year === 2023) || trends[1];
      const prev2022 = trends.find((t) => t.year === 2022) || trends[2];

      const cutoffScore = latest2024.closingMeritScore;
      const scoreDiff = Number((calculation.totalMeritScore - cutoffScore).toFixed(2));

      let admissionZone: 'SAFE' | 'TARGET' | 'DREAM';
      let zoneLabel = '';
      let zoneColor = '';

      if (scoreDiff >= 1.5) {
        admissionZone = 'SAFE';
        zoneLabel = 'Safe Zone';
        zoneColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (scoreDiff >= -1.5) {
        admissionZone = 'TARGET';
        zoneLabel = 'Target Zone';
        zoneColor = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        admissionZone = 'DREAM';
        zoneLabel = 'Dream / Reach';
        zoneColor = 'bg-rose-50 text-rose-700 border-rose-200';
      }

      const collegeRef = ALL_COLLEGES.find((c) => c.id === item.collegeId || c.code === item.collegeCode);

      return {
        ...item,
        categoryCutoffs: categoryData,
        latest2024,
        prev2023,
        prev2022,
        cutoffScore,
        scoreDiff,
        admissionZone,
        zoneLabel,
        zoneColor,
        collegeRef
      };
    }).filter((item) => {
      if (trendStateFilter !== 'ALL' && item.state !== trendStateFilter) return false;
      if (zoneFilter !== 'ALL' && item.admissionZone !== zoneFilter) return false;
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesName = item.collegeName.toLowerCase().includes(query);
        const matchesCode = item.collegeCode.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesCity) return false;
      }
      return true;
    });
  }, [calculation.totalMeritScore, category, trendStateFilter, zoneFilter, searchFilter]);

  const handleCopyReport = () => {
    const reportText = `TS/AP EAMCET Weighted Merit Score Analysis:
---------------------------------------------
Category: ${category} | Domain: ${state} EAMCET
• IPE Marks: ${Math.round(effectiveIpe.marks)}/600 (${calculation.ipePercentage}%)
  -> 25% IPE Weightage: ${calculation.ipeWeightedScore.toFixed(2)} / 25.00
• EAMCET Performance: Rank #${eamcetRank.toLocaleString('en-IN')} (Estimated ${Math.round(calculation.eamcetPercentage * 1.6)}/160 marks)
  -> 75% EAMCET Weightage: ${calculation.eamcetWeightedScore.toFixed(2)} / 75.00
---------------------------------------------
★ TOTAL WEIGHTED MERIT SCORE: ${calculation.totalMeritScore.toFixed(2)} / 100.00
★ Standing: ${percentileInfo.standingText}
Generated on CampusPredict EAMCET Portal.`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Merit Calculator Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Convenor Ranking Model</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span>25% IPE + 75% EAMCET</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            EAMCET Weighted Merit Score Calculator
          </h2>

          <p className="text-sm text-indigo-200/90 mt-2 leading-relaxed max-w-3xl">
            Input your Intermediate (IPE) marks and EAMCET rank to compute your composite merit score out of 100. Benchmark your standing against verified multi-year admission cutoffs (2024, 2023, 2022) across premier engineering institutes in Telangana and Andhra Pradesh.
          </p>

          {/* Quick info toggle */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{showFormulaExplanation ? 'Hide Weightage Formula' : 'How is Merit Score Computed?'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Report Copied!' : 'Copy Merit Report'}</span>
            </button>
          </div>

          {/* Formula Explanation Callout */}
          {showFormulaExplanation && (
            <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs leading-relaxed space-y-2 text-indigo-100 animate-fadeIn">
              <div className="font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Statutory Ranking Weightage Criteria:</span>
              </div>
              <p>
                In the official EAMCET ranking framework:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10">
                  <div className="font-bold text-amber-300">1. IPE Intermediate (25% Weightage)</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1">
                    Score = (IPE Group Marks ÷ 600) × 25
                  </div>
                  <div className="text-[11px] text-indigo-300 mt-1">
                    Considers 1st & 2nd year group subjects: Mathematics (300), Physics (150), and Chemistry (150).
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10">
                  <div className="font-bold text-emerald-300">2. EAMCET Exam (75% Weightage)</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1">
                    Score = (Normalized EAMCET Marks ÷ 160) × 75
                  </div>
                  <div className="text-[11px] text-indigo-300 mt-1">
                    Derived from candidate performance across 160 marks (Maths: 80, Physics: 40, Chem: 40).
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-white/80 pt-1">
                • <strong>Combined Merit Score = 25% IPE + 75% EAMCET</strong>. Admission counseling seats are allotted based on this composite merit standing.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Dual Grid: Calculator Inputs & Real-Time Merit Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (7 COLS): Inputs */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card: IPE (Intermediate) Marks */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                  25%
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    1. Intermediate (IPE) Marks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Board exam marks weightage in final convenor merit
                  </p>
                </div>
              </div>

              {/* Input Mode Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIpeInputMode('group')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    ipeInputMode === 'group' 
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Group (600)
                </button>
                <button
                  type="button"
                  onClick={() => setIpeInputMode('total')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    ipeInputMode === 'total' 
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total (1000)
                </button>
                <button
                  type="button"
                  onClick={() => setIpeInputMode('subject_wise')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    ipeInputMode === 'subject_wise' 
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Subject-wise
                </button>
              </div>
            </div>

            {/* Mode 1: Group Marks (out of 600) */}
            {ipeInputMode === 'group' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">MPC Group Marks (Maths + Physics + Chem)</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {ipeGroupMarks} / 600 ({((ipeGroupMarks / 600) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="150"
                    max="600"
                    value={ipeGroupMarks}
                    onChange={(e) => setIpeGroupMarks(Math.min(600, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full text-base font-bold text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    placeholder="Enter Group Marks (e.g. 570)"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400 pointer-events-none">
                    out of 600
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Quick Select:</span>
                  {[590, 570, 540, 510, 480].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setIpeGroupMarks(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        ipeGroupMarks === preset
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {preset} ({(preset / 6).toFixed(0)}%)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: Total Marks (out of 1000) */}
            {ipeInputMode === 'total' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Total Intermediate Marks (1st & 2nd Year)</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {ipeTotalMarks} / 1000 ({(ipeTotalMarks / 10).toFixed(1)}%)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="350"
                    max="1000"
                    value={ipeTotalMarks}
                    onChange={(e) => setIpeTotalMarks(Math.min(1000, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full text-base font-bold text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    placeholder="Enter Total Marks (e.g. 950)"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400 pointer-events-none">
                    out of 1000
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Automatically converted to 600-point group scale: ~{Math.round((ipeTotalMarks / 1000) * 600)} / 600
                </p>
              </div>
            )}

            {/* Mode 3: Subject-wise Split */}
            {ipeInputMode === 'subject_wise' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mathematics (1A, 1B, 2A, 2B)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={mathsMarks}
                      onChange={(e) => setMathsMarks(Math.min(300, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                      className="w-full text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400">/ 300</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physics (Theory + Prac)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={physicsMarks}
                      onChange={(e) => setPhysicsMarks(Math.min(150, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                      className="w-full text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400">/ 150</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chemistry (Theory + Prac)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={chemMarks}
                      onChange={(e) => setChemMarks(Math.min(150, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                      className="w-full text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400">/ 150</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card: EAMCET Rank & Marks */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  75%
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    2. EAMCET Rank & Exam Score
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statewide rank or normalized exam marks out of 160
                  </p>
                </div>
              </div>

              {/* Mode switch: Rank vs Manual Marks */}
              <button
                type="button"
                onClick={() => setManualMarksMode(!manualMarksMode)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {manualMarksMode ? 'Switch to Rank Input' : 'Enter Raw Exam Marks Instead'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* EAMCET Rank Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  EAMCET State Rank {manualMarksMode && '(Derived)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300000"
                    value={eamcetRank}
                    disabled={manualMarksMode}
                    onChange={(e) => handleRankChange(parseInt(e.target.value, 10))}
                    className={`w-full text-base font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border outline-none ${
                      manualMarksMode 
                        ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    placeholder="e.g. 6800"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 pointer-events-none">
                    Rank
                  </span>
                </div>
              </div>

              {/* EAMCET Marks (160) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated EAMCET Marks {manualMarksMode && '(Raw / Out of 160)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="160"
                    value={eamcetMarksInput}
                    disabled={!manualMarksMode}
                    onChange={(e) => handleMarksChange(parseInt(e.target.value, 10))}
                    className={`w-full text-base font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border outline-none ${
                      !manualMarksMode 
                        ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    placeholder="e.g. 98"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 pointer-events-none">
                    / 160
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Rank Presets */}
            {!manualMarksMode && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                <span className="text-slate-400 text-[11px] font-medium mr-1">Sample Ranks:</span>
                {[1200, 3500, 6800, 12500, 25000, 45000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleRankChange(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      eamcetRank === preset
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    #{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            )}

            {/* State & Category Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Exam</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as 'TS' | 'AP')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold outline-none focus:border-indigo-400"
                >
                  <option value="TS">Telangana (TS EAMCET / TG EAPCET)</option>
                  <option value="AP">Andhra Pradesh (AP EAMCET / AP EAPCET)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reservation Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReservationCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold outline-none focus:border-indigo-400"
                >
                  <option value="OC">OC (Open Competition)</option>
                  <option value="BC-A">BC-A</option>
                  <option value="BC-B">BC-B</option>
                  <option value="BC-C">BC-C</option>
                  <option value="BC-D">BC-D</option>
                  <option value="BC-E">BC-E</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive "What-If" Sensitivity Simulator */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 rounded-3xl border border-indigo-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h4 className="font-extrabold text-slate-900 text-sm">
                  "What-If" Sensitivity Simulator
                </h4>
              </div>
              {(whatIfIpeDelta !== 0 || whatIfEamcetDelta !== 0) && (
                <button
                  onClick={() => { setWhatIfIpeDelta(0); setWhatIfEamcetDelta(0); }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Reset Simulator
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              See how a small gain in IPE marks or EAMCET exam score transforms your overall composite merit score and state rank:
            </p>

            <div className="space-y-4 pt-1">
              {/* Slider 1: IPE Marks Delta */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Simulate IPE Marks Change:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    whatIfIpeDelta > 0 ? 'bg-emerald-100 text-emerald-800' : whatIfIpeDelta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {whatIfIpeDelta > 0 ? `+${whatIfIpeDelta}` : whatIfIpeDelta} Marks
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="5"
                  value={whatIfIpeDelta}
                  onChange={(e) => setWhatIfIpeDelta(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: EAMCET Score Delta */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Simulate EAMCET Exam Score Change:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    whatIfEamcetDelta > 0 ? 'bg-emerald-100 text-emerald-800' : whatIfEamcetDelta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {whatIfEamcetDelta > 0 ? `+${whatIfEamcetDelta}` : whatIfEamcetDelta} Marks
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="2"
                  value={whatIfEamcetDelta}
                  onChange={(e) => setWhatIfEamcetDelta(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* What-If Result Preview */}
              {(whatIfIpeDelta !== 0 || whatIfEamcetDelta !== 0) && (
                <div className="p-3 bg-white rounded-2xl border border-indigo-200 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] font-medium">Simulated Composite Score:</span>
                    <div className="font-mono font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{whatIfCalculation.totalMeritScore.toFixed(2)}</span>
                      <span className={`text-xs font-bold ${
                        whatIfCalculation.totalMeritScore >= calculation.totalMeritScore ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        ({whatIfCalculation.totalMeritScore >= calculation.totalMeritScore ? '+' : ''}
                        {(whatIfCalculation.totalMeritScore - calculation.totalMeritScore).toFixed(2)} pts)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] font-medium">Estimated New Rank:</span>
                    <div className="font-mono font-bold text-emerald-700 text-sm">
                      ~#{estimateRankFromEamcetMarks(Math.round(whatIfCalculation.eamcetPercentage * 1.6)).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 COLS): Grand Composite Merit Score Card */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md relative overflow-hidden space-y-6 sticky top-24">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                Candidate Merit Card
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">
                {state} • {category}
              </span>
            </div>

            {/* Total Weighted Merit Score Display */}
            <div className="text-center py-4 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white rounded-3xl border border-indigo-100 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Total Weighted Merit Score
              </div>
              <div className="text-5xl sm:text-6xl font-black text-slate-900 font-mono tracking-tight flex items-center justify-center gap-1">
                <span>{calculation.totalMeritScore.toFixed(2)}</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-400">/100</span>
              </div>

              {/* Statewide Percentile Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${percentileInfo.badgeColor}">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{percentileInfo.standingText}</span>
              </div>
            </div>

            {/* Dual Score Component Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Score Components (25:75 Ratio)
              </div>

              {/* Component 1: IPE (25%) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                    IPE Intermediate Component (25%)
                  </span>
                  <span className="font-mono font-black text-indigo-700">
                    {calculation.ipeWeightedScore.toFixed(2)} <span className="text-slate-400 font-normal">/ 25.00</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(calculation.ipeWeightedScore / 25) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Marks: {Math.round(effectiveIpe.marks)} / 600</span>
                  <span>{calculation.ipePercentage}% Board Score</span>
                </div>
              </div>

              {/* Component 2: EAMCET (75%) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    EAMCET Exam Component (75%)
                  </span>
                  <span className="font-mono font-black text-emerald-700">
                    {calculation.eamcetWeightedScore.toFixed(2)} <span className="text-slate-400 font-normal">/ 75.00</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(calculation.eamcetWeightedScore / 75) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Est. Marks: {Math.round(calculation.eamcetPercentage * 1.6)} / 160</span>
                  <span>Rank #{eamcetRank.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Actions for Candidate */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {onApplyRankToPredictor && (
                <button
                  type="button"
                  onClick={() => onApplyRankToPredictor(eamcetRank, state, category)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Apply Rank #{eamcetRank.toLocaleString('en-IN')} to College Predictor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyReport}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReport ? 'Copied to Clipboard!' : 'Share / Copy Merit Report'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* HISTORICAL ADMISSION TRENDS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Multi-Year Admission Trends (2024, 2023, 2022)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Historical Cutoff Merit Score Benchmark
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare your weighted merit score ({calculation.totalMeritScore.toFixed(2)}) against verified closing merit scores for {category} category across top institutes.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* State filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTrendStateFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendStateFilter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                All States
              </button>
              <button
                onClick={() => setTrendStateFilter('TS')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendStateFilter === 'TS' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Telangana
              </button>
              <button
                onClick={() => setTrendStateFilter('AP')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendStateFilter === 'AP' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Andhra Pradesh
              </button>
            </div>

            {/* Zone filter */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
            >
              <option value="ALL">All Admission Zones</option>
              <option value="SAFE">Safe Zone (Score &gt; Cutoff + 1.5)</option>
              <option value="TARGET">Target Zone (Within ±1.5)</option>
              <option value="DREAM">Dream / Reach Zone</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap pb-2">
          <span className="font-semibold text-slate-500">Admission Zones:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Safe Zone (+1.5 or above)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Target Zone (Competitive / ±1.5)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Dream Zone (Ambitious)
          </span>
        </div>

        {/* Trends Cards Grid */}
        {benchmarkedTrends.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="font-bold text-slate-700 text-sm">No colleges match the selected zone filter</div>
            <p className="text-xs text-slate-500 mt-1">Try resetting the zone filter to "All Admission Zones".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benchmarkedTrends.map((trend) => (
              <div
                key={`${trend.collegeId}_${trend.branchCode}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Code, State & Zone Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-md">
                        {trend.collegeCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {trend.city}, {trend.state}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {trend.tier}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${trend.zoneColor}`}>
                      {trend.zoneLabel}
                    </span>
                  </div>

                  {/* College Name & Branch */}
                  <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {trend.collegeName}
                  </h4>
                  <div className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1.5">
                    <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono text-[11px]">
                      {trend.branchCode}
                    </span>
                    <span className="truncate">{trend.branchName}</span>
                  </div>

                  {/* 3-Year Historical Cutoff Trend Comparison Grid */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Historical Year</span>
                      <span>Closing Rank</span>
                      <span>Cutoff Merit Score</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* 2024 */}
                      <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60 font-semibold">
                        <span className="text-slate-800 font-bold flex items-center gap-1">
                          <span>2024</span>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">Latest</span>
                        </span>
                        <span className="font-mono text-slate-600">
                          #{trend.latest2024.closingRank.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono font-black text-slate-900">
                          {trend.latest2024.closingMeritScore.toFixed(1)} / 100
                        </span>
                      </div>

                      {/* 2023 */}
                      <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60 text-slate-600">
                        <span className="text-slate-600">2023</span>
                        <span className="font-mono">
                          #{trend.prev2023.closingRank.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {trend.prev2023.closingMeritScore.toFixed(1)} / 100
                        </span>
                      </div>

                      {/* 2022 */}
                      <div className="flex items-center justify-between py-0.5 text-slate-500">
                        <span>2022</span>
                        <span className="font-mono">
                          #{trend.prev2022.closingRank.toLocaleString('en-IN')}
                        </span>
                        <span className="font-mono font-bold text-slate-600">
                          {trend.prev2022.closingMeritScore.toFixed(1)} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Merit Delta Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">Your Score vs 2024 Cutoff:</span>
                      <div className="font-bold flex items-center gap-1">
                        <span className="text-slate-900 font-mono">{calculation.totalMeritScore.toFixed(2)}</span>
                        <span className="text-slate-400">vs</span>
                        <span className="text-slate-700 font-mono">{trend.latest2024.closingMeritScore.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs inline-flex items-center gap-0.5 ${
                        trend.scoreDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {trend.scoreDiff >= 0 ? '+' : ''}{trend.scoreDiff.toFixed(2)} pts
                        {trend.scoreDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {trend.scoreDiff >= 1.5 ? 'Very Strong Margin' : trend.scoreDiff >= 0 ? 'Comfortable Margin' : trend.scoreDiff >= -1.5 ? 'Borderline Range' : 'Cutoff Gap'}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Avg Placement: <strong className="text-slate-800">₹{trend.averageLPA} LPA</strong>
                  </span>

                  {trend.collegeRef && onSelectCollege && (
                    <button
                      onClick={() => onSelectCollege(trend.collegeRef!)}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <span>View College</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
