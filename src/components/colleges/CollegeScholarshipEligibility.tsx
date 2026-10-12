import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, 
  GraduationCap, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  XCircle, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Info, 
  Calendar,
  Check,
  RotateCcw,
  Zap,
  BookmarkCheck,
  HeartHandshake
} from 'lucide-react';
import { College, ReservationCategory, StudentBackgroundProfile, EvaluatedScholarship } from '../../types';
import { 
  DEFAULT_STUDENT_PROFILE, 
  INCOME_SLABS, 
  evaluateScholarshipsForCollege 
} from '../../data/scholarshipsData';
import { calculateWeightedMeritScore, estimateEamcetMarksFromRank } from '../../data/meritTrendsData';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../firebase/services';

interface CollegeScholarshipEligibilityProps {
  college: College;
  initialRank?: number;
  initialCategory?: ReservationCategory;
}

export const CollegeScholarshipEligibility: React.FC<CollegeScholarshipEligibilityProps> = ({
  college,
  initialRank,
  initialCategory,
}) => {
  const { user } = useAuth();

  // Local student profile state
  const [profile, setProfile] = useState<StudentBackgroundProfile>(() => {
    // Attempt to seed from localStorage if previously configured
    const saved = localStorage.getItem('campusfind_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STUDENT_PROFILE,
          ...parsed,
          eamcetRank: initialRank || parsed.eamcetRank || DEFAULT_STUDENT_PROFILE.eamcetRank,
          category: initialCategory || parsed.category || DEFAULT_STUDENT_PROFILE.category,
          domicileState: college.state === 'TS' || college.state === 'AP' ? (parsed.domicileState || college.state) : 'TS',
        };
      } catch (e) {
        // Fallback
      }
    }
    return {
      ...DEFAULT_STUDENT_PROFILE,
      eamcetRank: initialRank || 6800,
      category: initialCategory || 'BC-B',
      domicileState: college.state === 'AP' ? 'AP' : 'TS',
    };
  });

  // Pull profile from Firestore if authenticated
  useEffect(() => {
    if (user && !user.isAnonymous) {
      getUserProfile(user.uid).then((p) => {
        if (p) {
          setProfile((prev) => ({
            ...prev,
            category: p.category || prev.category,
            eamcetRank: p.eamcetRank || prev.eamcetRank,
            domicileState: p.preferredState && p.preferredState !== 'all' ? p.preferredState : prev.domicileState,
          }));
        }
      }).catch(() => {});
    }
  }, [user]);

  // Editor toggle state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeScopeTab, setActiveScopeTab] = useState<'ALL' | 'State' | 'National' | 'Institutional'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ELIGIBLE_ONLY'>('ALL');
  const [expandedDocsId, setExpandedDocsId] = useState<string | null>(null);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Recalculate merit score when rank or IPE marks change
  const handleRankChange = (rank: number) => {
    const validRank = Math.max(1, Math.min(300000, rank || 1));
    const estimatedMarks = estimateEamcetMarksFromRank(validRank);
    const merit = calculateWeightedMeritScore(profile.ipeMarks, 600, estimatedMarks);
    setProfile((prev) => ({
      ...prev,
      eamcetRank: validRank,
      calculatedMeritScore: merit.totalMeritScore,
    }));
  };

  const handleIpeChange = (marks: number) => {
    const validIpe = Math.max(0, Math.min(600, marks || 0));
    const estimatedMarks = estimateEamcetMarksFromRank(profile.eamcetRank);
    const merit = calculateWeightedMeritScore(validIpe, 600, estimatedMarks);
    setProfile((prev) => ({
      ...prev,
      ipeMarks: validIpe,
      calculatedMeritScore: merit.totalMeritScore,
    }));
  };

  const handleSaveProfile = () => {
    localStorage.setItem('campusfind_student_profile', JSON.stringify(profile));
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  const handleResetProfile = () => {
    const fresh: StudentBackgroundProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      domicileState: college.state === 'AP' ? 'AP' : 'TS',
    };
    setProfile(fresh);
    localStorage.removeItem('campusfind_student_profile');
  };

  // Run dynamic evaluation
  const evaluation = useMemo(() => {
    return evaluateScholarshipsForCollege(college, profile);
  }, [college, profile]);

  // Filter scholarships
  const filteredScholarships = useMemo(() => {
    return evaluation.scholarships.filter((item) => {
      if (activeScopeTab !== 'ALL' && item.scope !== activeScopeTab) {
        return false;
      }
      if (statusFilter === 'ELIGIBLE_ONLY') {
        return item.status === 'fully_eligible' || item.status === 'partially_eligible';
      }
      return true;
    });
  }, [evaluation.scholarships, activeScopeTab, statusFilter]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: EvaluatedScholarship['status']) => {
    switch (status) {
      case 'fully_eligible':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Fully Eligible
          </span>
        );
      case 'partially_eligible':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Partially Covered
          </span>
        );
      case 'conditional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Conditional / Review Required
          </span>
        );
      case 'not_eligible':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            Not Eligible
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      
      {/* Toast */}
      {profileSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Student merit & background preferences saved to this browser session!</span>
          </div>
        </div>
      )}

      {/* Hero Financial Impact & Fee Savings Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-4 sm:p-6 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  Scholarship & Fee Subsidy Calculator
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Personalized for {college.name} ({college.code})
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Net Annual Fee & Scholarship Analysis
              </h3>
            </div>

            {/* Quick Profile Summary Badge */}
            <button
              type="button"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Modify Background Profile</span>
              {isEditorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Key Metric Financial Breakdown Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            
            {/* Box 1: Official Convenor Fee */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Official Tuition Fee
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {formatCurrency(college.annualFee)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                AFRC Approved Annual Quota
              </div>
            </div>

            {/* Box 2: Max Tuition Waiver */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xs">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                <span>Tuition Reimbursement</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                - {formatCurrency(evaluation.summary.maxTuitionCoverage)}
              </div>
              <div className="text-[10px] text-emerald-200/90 font-medium mt-0.5 truncate">
                {evaluation.summary.recommendedPrimaryScheme}
              </div>
            </div>

            {/* Box 3: Net Effective Tuition Payable */}
            <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-400/40 backdrop-blur-xs">
              <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                Net Tuition Payable
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {formatCurrency(evaluation.summary.effectiveNetTuition)}
              </div>
              <div className="text-[10px] font-semibold text-emerald-300 mt-0.5">
                {evaluation.summary.hasFullFeeReimbursement ? '✓ 100% Zero Tuition Fee' : `Net Annual Balance`}
              </div>
            </div>

            {/* Box 4: Additional Living / DBT Grants */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xs">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Hostel / DBT Grant
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                + {formatCurrency(evaluation.summary.maxMaintenanceAllowance)}
              </div>
              <div className="text-[10px] text-amber-200/90 mt-0.5">
                Direct to Student / Mother Bank A/c
              </div>
            </div>
          </div>

          {/* Quick Active Student Profile Pill Row */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs text-slate-300">
            <span className="font-semibold text-white">Active Evaluation Parameters:</span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md font-mono text-[11px] font-bold text-indigo-200">
              Rank: #{profile.eamcetRank.toLocaleString('en-IN')}
            </span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold text-slate-200">
              Category: {profile.category}
            </span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold text-slate-200">
              Merit Score: {profile.calculatedMeritScore.toFixed(1)}/100
            </span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold text-slate-200">
              Income: {formatCurrency(profile.annualFamilyIncome)}/yr
            </span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold text-slate-200">
              Domicile: {profile.domicileState}
            </span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[11px] font-bold text-slate-200">
              Gender: {profile.gender}
            </span>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE STUDENT BACKGROUND & MERIT SCORE EDITOR */}
      {isEditorOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Customize Student Background & Academic Profile
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetProfile}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Field 1: EAMCET Rank */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                EAMCET State Rank
              </label>
              <input
                type="number"
                min="1"
                max="300000"
                value={profile.eamcetRank}
                onChange={(e) => handleRankChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="e.g. 6800"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {profile.eamcetRank <= 10000 
                  ? '⚡ Rank ≤ 10k qualifies for 100% TS fee waiver in private colleges' 
                  : 'Ranks > 10,000 receive capped fee aid in private colleges'}
              </span>
            </div>

            {/* Field 2: IPE Group Marks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IPE Group Marks (out of 600)
              </label>
              <input
                type="number"
                min="0"
                max="600"
                value={profile.ipeMarks}
                onChange={(e) => handleIpeChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="e.g. 565"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {((profile.ipeMarks / 600) * 100).toFixed(1)}% ({((profile.ipeMarks / 600) * 25).toFixed(2)} / 25 IPE weightage)
              </span>
            </div>

            {/* Field 3: Reservation Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reservation Category
              </label>
              <select
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value as ReservationCategory })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {(['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'] as ReservationCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Official social welfare caste classification
              </span>
            </div>

            {/* Field 4: Annual Family Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Annual Family Income
              </label>
              <select
                value={profile.annualFamilyIncome}
                onChange={(e) => setProfile({ ...profile, annualFamilyIncome: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {INCOME_SLABS.map((slab) => (
                  <option key={slab.value} value={slab.value}>
                    {slab.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Income on Meeseva or Sachivalayam certificate
              </span>
            </div>

            {/* Field 5: Domicile State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State Domicile / Residence
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['TS', 'AP', 'OTHER'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProfile({ ...profile, domicileState: st })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      profile.domicileState === st
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'OTHER' ? 'Other' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 6: Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Candidate Gender
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Female', 'Male', 'Other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: g })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      profile.gender === g
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 7 & 8: Special Background Flags */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Special Category & Background Checkboxes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-indigo-50/50">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.isSingleGirlChild)}
                    onChange={(e) => setProfile({ ...profile, isSingleGirlChild: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <span>Single Girl Child</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-indigo-50/50">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.isSpeciallyAbled)}
                    onChange={(e) => setProfile({ ...profile, isSpeciallyAbled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <span>Specially Abled (PwD)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-indigo-50/50">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.isMinorityCommunity)}
                    onChange={(e) => setProfile({ ...profile, isMinorityCommunity: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <span>Minority Community</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-indigo-50/50">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.isDefenseWard)}
                    onChange={(e) => setProfile({ ...profile, isDefenseWard: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <span>Ex-Servicemen / Defense</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-indigo-50/50">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.isFirstGenerationLearner)}
                    onChange={(e) => setProfile({ ...profile, isFirstGenerationLearner: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <span>1st Generation Graduate</span>
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FILTER & CATEGORY NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveScopeTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeScopeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Schemes ({evaluation.scholarships.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveScopeTab('State')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeScopeTab === 'State'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>State Government</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md font-bold">
              {college.state}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScopeTab('National')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeScopeTab === 'National'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>National & Central</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md font-bold">
              NSP / AICTE
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScopeTab('Institutional')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeScopeTab === 'Institutional'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            College Endowments
          </button>
        </div>

        {/* Status Toggle (Show only eligible vs show all) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'ALL' ? 'ELIGIBLE_ONLY' : 'ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'ELIGIBLE_ONLY'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === 'ELIGIBLE_ONLY' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{statusFilter === 'ELIGIBLE_ONLY' ? 'Showing Only Eligible' : 'Filter: Eligible Only'}</span>
          </button>
        </div>
      </div>

      {/* SCHOLARSHIP CARDS LIST */}
      <div className="space-y-4">
        {filteredScholarships.map((sch) => {
          const isDocsOpen = expandedDocsId === sch.id;

          return (
            <div
              key={sch.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                sch.status === 'fully_eligible'
                  ? 'bg-white border-emerald-300 shadow-sm hover:shadow-md'
                  : sch.status === 'partially_eligible'
                  ? 'bg-white border-blue-300 shadow-sm hover:shadow-md'
                  : sch.status === 'conditional'
                  ? 'bg-white border-amber-300 shadow-sm'
                  : 'bg-slate-50/80 border-slate-200 opacity-90'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      sch.scope === 'State' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : sch.scope === 'National' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {sch.scope} Scheme
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {sch.provider}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {sch.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {sch.description}
                  </p>
                </div>

                {/* Financial Coverage Pill */}
                <div className="shrink-0 text-left sm:text-right p-3 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[180px]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Financial Benefit
                  </div>
                  <div className="text-base sm:text-lg font-black text-indigo-700 mt-0.5">
                    {sch.coverageDescription}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(sch.status)}
                  </div>
                </div>
              </div>

              {/* Verdict Box */}
              <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                sch.status === 'fully_eligible'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : sch.status === 'partially_eligible'
                  ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                  : sch.status === 'conditional'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {sch.status === 'fully_eligible' || sch.status === 'partially_eligible' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : sch.status === 'conditional' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="font-bold block mb-0.5">Eligibility Evaluation Verdict:</strong>
                  <span>{sch.verdict}</span>
                </div>
              </div>

              {/* Criteria Checklist Breakdown */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* Matched Points */}
                {sch.matchedCriteria.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-[11px] text-emerald-700 uppercase tracking-wider block">
                      ✓ Criteria Satisfied
                    </span>
                    <ul className="space-y-1">
                      {sch.matchedCriteria.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unmatched / Advisory Points */}
                {sch.unmatchedCriteria.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-[11px] text-amber-800 uppercase tracking-wider block">
                      ⚠️ Criteria To Check / Constraints
                    </span>
                    <ul className="space-y-1">
                      {sch.unmatchedCriteria.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Guidance & Document Checklist Toggle Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{sch.deadlineNotice}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedDocsId(isDocsOpen ? null : sch.id)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isDocsOpen ? 'Hide Documents' : 'Required Documents'}</span>
                    {isDocsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <a
                    href={sch.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200"
                  >
                    <span>{sch.portalName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Expanded Documents Accordion */}
              {isDocsOpen && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 animate-fade-in">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Checklist of Documents Required for {sch.title}:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                    {sch.documentsRequired.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-slate-200">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                  {sch.guidanceTip && (
                    <div className="text-[11px] text-indigo-900 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                      <strong>Counselor Tip:</strong> {sch.guidanceTip}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}

        {filteredScholarships.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              No scholarships matched the active scope filter
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try switching tabs to &quot;All Schemes&quot; or toggling the &quot;Filter: Eligible Only&quot; button to see all available state and national aids.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveScopeTab('ALL');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* STATE ADVISORY & STATUTORY GUIDELINES */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">
            Statutory Guidelines for Counseling & Fee Reimbursement
          </strong>
          <p className="leading-relaxed text-amber-900">
            {college.state === 'TS' ? (
              <>
                In Telangana, candidates securing convenor seat through TS EAMCET counseling under BC/EBC/Minority category receive 100% tuition reimbursement if state rank is <strong>≤ 10,000</strong>. Candidates with ranks &gt; 10,000 in private autonomous institutions receive the government-capped subsidy of ₹35,000/year, while government/university colleges offer 100% waiver. SC/ST candidates are entitled to 100% reimbursement without rank capping subject to income verification.
              </>
            ) : (
              <>
                In Andhra Pradesh, the <strong>Jagananna Vidya Deevena (JVD)</strong> scheme provides 100% fee reimbursement directly into the mother’s bank account in quarterly installments for eligible candidates across all approved engineering programs, paired with ₹20,000/year under Vasathi Deevena for food and lodging.
              </>
            )}
          </p>
        </div>
      </div>

    </div>
  );
};
