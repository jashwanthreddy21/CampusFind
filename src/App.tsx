import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Scale, 
  Bookmark, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Building, 
  ArrowRight,
  TrendingUp,
  MapPin,
  HelpCircle,
  X,
  Award
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SavedCollegesProvider } from './context/SavedCollegesContext';
import { ComparisonProvider, useComparison } from './context/ComparisonContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CollegeCard } from './components/colleges/CollegeCard';
import { CollegeFilters } from './components/colleges/CollegeFilters';
import { CollegeDetailModal } from './components/colleges/CollegeDetailModal';
import { FAQSection } from './components/colleges/FAQSection';
import { EamcetPredictor } from './components/predictor/EamcetPredictor';
import { CollegeComparisonView } from './components/comparison/CollegeComparisonView';
import { QuickCompareModal } from './components/comparison/QuickCompareModal';
import { SavedCollegesView } from './components/saved/SavedCollegesView';
import { ExamStreamModal } from './components/auth/ExamStreamModal';
import { AuthModal } from './components/auth/AuthModal';
import { CampusChatbot } from './components/chatbot/CampusChatbot';
import { 
  ALL_COLLEGES, 
  TS_COLLEGES, 
  AP_COLLEGES, 
  EAMCET_COLLEGES, 
  JEE_MAIN_COLLEGES, 
  JEE_ADVANCED_COLLEGES,
  IIT_COLLEGES,
  NIT_COLLEGES,
  IIIT_COLLEGES,
  TELANGANA_COLLEGES,
  ANDHRA_COLLEGES,
  getCollegeByIdOrCode
} from './data/collegesData';
import { College, FilterState } from './types';

// Floating Comparison Tray
const FloatingComparisonBar: React.FC<{ 
  onOpenComparison: () => void;
  onOpenModal: () => void;
}> = ({ onOpenComparison, onOpenModal }) => {
  const { comparedColleges, removeCollege, clearComparison } = useComparison();

  if (comparedColleges.length === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] sm:w-[95%] max-w-2xl bg-slate-900/95 backdrop-blur-md text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-3 animate-slide-up">
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full xs:w-auto py-0.5 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 shrink-0">
          <Scale className="w-4 h-4 text-indigo-400" />
          <span>Quick Compare ({comparedColleges.length}/4):</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {comparedColleges.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-mono text-xs px-2 sm:px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
            >
              <span>{c.code}</span>
              <button
                onClick={() => removeCollege(c.id)}
                className="text-white/60 hover:text-white cursor-pointer"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0 w-full xs:w-auto">
        <button
          onClick={clearComparison}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={onOpenModal}
          className="px-3.5 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Compare Side-by-Side</span>
        </button>
      </div>
    </div>
  );
};

// Main App Inner Content
function MainAppContent() {
  const { 
    user, 
    examStream, 
    setExamStream, 
    showExamModal, 
    setShowExamModal,
    showAuthModal,
    setShowAuthModal,
    authModalInitialMode
  } = useAuth();
  const { 
    comparedColleges, 
    removeCollege, 
    clearComparison, 
    limitMessage 
  } = useComparison();
  const [activeTab, setActiveTab] = useState<'directory' | 'predictor' | 'saved' | 'comparison'>('directory');
  const [selectedState, setSelectedState] = useState<'all' | 'TS' | 'AP'>('all');
  const [mainsSubCategory, setMainsSubCategory] = useState<'all' | 'nit' | 'iiit'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [showQuickCompareModal, setShowQuickCompareModal] = useState<boolean>(false);

  // Auto-load college from URL param (?college=collegeIdOrCode)
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const collegeParam = urlParams.get('college');
      if (collegeParam) {
        const matched = getCollegeByIdOrCode(collegeParam);
        if (matched) {
          setSelectedCollege(matched);
        }
      }
    } catch (e) {
      console.warn('Could not read college URL param:', e);
    }
  }, []);

  // Update or clear ?college= in URL when selectedCollege changes
  const handleSelectCollege = (col: College | null) => {
    setSelectedCollege(col);
    try {
      const currentUrl = new URL(window.location.href);
      if (col) {
        currentUrl.searchParams.set('college', col.code || col.id);
      } else {
        currentUrl.searchParams.delete('college');
      }
      window.history.replaceState({}, '', currentUrl.toString());
    } catch (e) {
      // Ignore in iframe if pushState fails
    }
  };

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    state: 'all',
    city: '',
    branch: '',
    collegeType: '',
    ownership: '',
    maxFee: 600000,
    minRating: 0,
    sortBy: 'rating',
  });

  // Sync state filter between navbar and filters
  const handleStateChange = (state: 'all' | 'TS' | 'AP') => {
    setSelectedState(state);
    setFilters((prev) => ({ ...prev, state }));
  };

  // Base colleges strictly for active examStream
  const streamColleges = useMemo(() => {
    if (examStream === 'jee-advanced') {
      return JEE_ADVANCED_COLLEGES;
    }
    if (examStream === 'jee-main') {
      if (mainsSubCategory === 'nit') return NIT_COLLEGES;
      if (mainsSubCategory === 'iiit') return IIIT_COLLEGES;
      return JEE_MAIN_COLLEGES;
    }
    // eamcet
    return EAMCET_COLLEGES;
  }, [examStream, mainsSubCategory]);

  // Counts for active stream
  const streamTsColleges = useMemo(() => TELANGANA_COLLEGES, []);
  const streamApColleges = useMemo(() => ANDHRA_COLLEGES, []);

  // Effective search query from top navbar or filters
  const effectiveSearchQuery = (searchQuery || filters.searchQuery || '').trim();
  const isSearching = effectiveSearchQuery.length > 0;

  // Filtered colleges calculation
  const filteredColleges = useMemo(() => {
    const q = effectiveSearchQuery.toLowerCase();

    // When the user is searching with the top search bar, search across all colleges
    // so any institute (e.g. "SR University", "CBIT", "IIT", etc.) is instantly found
    const sourceColleges = isSearching ? ALL_COLLEGES : streamColleges;

    if (isSearching) {
      const queryWords = q.split(/\s+/).filter(Boolean);

      return sourceColleges.filter((college) => {
        const codeLower = college.code.toLowerCase();
        const nameLower = college.name.toLowerCase();
        const shortNameLower = (college.shortName || '').toLowerCase();
        const cityLower = college.city.toLowerCase();
        const districtLower = college.district.toLowerCase();
        const affiliationLower = college.affiliation.toLowerCase();
        const coursesLower = (college.courses || []).join(' ').toLowerCase();

        // 1. Direct match on code or starts with
        if (codeLower === q || codeLower.startsWith(q) || codeLower.includes(q)) {
          return true;
        }

        // 2. Direct match on name or shortName
        if (nameLower.includes(q) || shortNameLower.includes(q)) {
          return true;
        }

        // 3. Multi-word search across all metadata
        const fullBlob = `${codeLower} ${nameLower} ${shortNameLower} ${cityLower} ${districtLower} ${affiliationLower} ${coursesLower}`;
        return queryWords.every((word) => fullBlob.includes(word));
      }).sort((a, b) => {
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Exact code match first
        const aExactCode = aCode === q;
        const bExactCode = bCode === q;
        if (aExactCode && !bExactCode) return -1;
        if (!aExactCode && bExactCode) return 1;

        // Name starts with query
        const aNameStarts = aName.startsWith(q);
        const bNameStarts = bName.startsWith(q);
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;

        // Name contains query
        const aNameContains = aName.includes(q);
        const bNameContains = bName.includes(q);
        if (aNameContains && !bNameContains) return -1;
        if (!aNameContains && bNameContains) return 1;

        // Code contains query
        const aCodeContains = aCode.includes(q);
        const bCodeContains = bCode.includes(q);
        if (aCodeContains && !bCodeContains) return -1;
        if (!aCodeContains && bCodeContains) return 1;

        // Fallback to highest rating
        return b.rating - a.rating;
      });
    }

    return streamColleges.filter((college) => {
      // State filter strictly for EAMCET only
      if (examStream === 'eamcet') {
        if (selectedState !== 'all' && college.state !== selectedState) {
          return false;
        }
        if (filters.state !== 'all' && college.state !== filters.state) {
          return false;
        }
      }

      // City filter
      if (filters.city && college.city !== filters.city) {
        return false;
      }

      // Branch filter
      if (filters.branch) {
        const hasBranch = college.courses.includes(filters.branch) || 
          college.cutoffs.some((c) => c.branchCode === filters.branch);
        if (!hasBranch) return false;
      }

      // College Type filter
      if (filters.collegeType && college.type !== filters.collegeType) {
        return false;
      }

      // Ownership filter
      if (filters.ownership && college.ownership !== filters.ownership) {
        return false;
      }

      // Fee filter
      if (college.annualFee > filters.maxFee) {
        return false;
      }

      // Rating filter
      if (college.rating < filters.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'fee-asc') return a.annualFee - b.annualFee;
      if (filters.sortBy === 'fee-desc') return b.annualFee - a.annualFee;
      if (filters.sortBy === 'placement') return b.placement.averageLPA - a.placement.averageLPA;
      // Default: top rated / NIRF priority
      return b.rating - a.rating;
    });
  }, [streamColleges, examStream, selectedState, effectiveSearchQuery, isSearching, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedState={selectedState}
        setSelectedState={handleStateChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResultsCount={isSearching ? filteredColleges.length : undefined}
        onClearSearch={() => {
          setSearchQuery('');
          setFilters((prev) => ({ ...prev, searchQuery: '' }));
        }}
        onOpenChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
        isChatbotOpen={isChatbotOpen}
        onSelectCollege={(collegeId) => {
          const matched = getCollegeByIdOrCode(collegeId);
          if (matched) {
            handleSelectCollege(matched);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB: DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            
            {/* If searching via search bar: Hide all banner/selector content and show only matching colleges */}
            {isSearching ? (
              <div className="space-y-4 min-h-[500px]">
                {/* Clean search status header */}
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800">
                      Search results for <span className="text-indigo-600">"{effectiveSearchQuery}"</span>
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full ml-1">
                      {filteredColleges.length} {filteredColleges.length === 1 ? 'college' : 'colleges'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters((prev) => ({ ...prev, searchQuery: '' }));
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                </div>

                {/* Quick Compare Interactive Banner in Search Results */}
                {filteredColleges.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/60 rounded-2xl border border-indigo-100 p-3.5 sm:p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                              Quick Compare
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              comparedColleges.length > 0 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {comparedColleges.length}/4 Selected
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {comparedColleges.length === 0
                              ? 'Select up to four colleges via checkboxes below to view fees, placements, and cutoffs side-by-side in a modal.'
                              : `${comparedColleges.length} college${comparedColleges.length > 1 ? 's' : ''} selected. View side-by-side comparative breakdown.`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        {comparedColleges.length > 0 && (
                          <button
                            onClick={clearComparison}
                            className="text-slate-500 hover:text-slate-800 text-xs font-bold px-2.5 py-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={() => setShowQuickCompareModal(true)}
                          disabled={comparedColleges.length === 0}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            comparedColleges.length > 0
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 cursor-pointer scale-[1.01]'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>
                            {comparedColleges.length > 0 
                              ? `Compare Selected (${comparedColleges.length})` 
                              : 'Compare Side-by-Side'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Selected Colleges Pills */}
                    {comparedColleges.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-indigo-100 overflow-x-auto py-0.5">
                        <span className="text-[11px] font-bold text-indigo-700 shrink-0">Selected:</span>
                        {comparedColleges.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 bg-white text-slate-800 font-mono text-xs px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs shrink-0"
                          >
                            <span className="font-black text-indigo-700">{c.code}</span>
                            <span className="text-[11px] text-slate-500 max-w-[120px] truncate font-sans">
                              {c.shortName || c.name}
                            </span>
                            <button
                              onClick={() => removeCollege(c.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer ml-0.5"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {limitMessage && (
                      <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium animate-fade-in">
                        {limitMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* College Cards Grid or No Colleges Found */}
                {filteredColleges.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs my-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Building className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">No Colleges Found</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-6">
                      No colleges matching <span className="font-semibold text-slate-700">"{effectiveSearchQuery}"</span> were found in the database.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters((prev) => ({ ...prev, searchQuery: '' }));
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Clear Search & View All Colleges
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredColleges.map((college) => (
                      <CollegeCard
                        key={college.id}
                        college={college}
                        onSelect={handleSelectCollege}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* EXAM OPTION BUTTONS (CLEAR, USER FRIENDLY, NOT MESSY) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target Exam
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        Select Your Exam
                      </h2>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                      Showing: <span className="font-black text-indigo-700 uppercase">{examStream === 'jee-advanced' ? 'JEE Advance' : examStream === 'jee-main' ? 'JEE Mains' : 'EAMCET'}</span>
                    </div>
                  </div>

                  {/* 3 Clear, Responsive Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {/* Button 1: JEE Mains */}
                    <button
                      type="button"
                      onClick={() => { setExamStream('jee-main'); setSelectedState('all'); }}
                      className={`py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 ${
                        examStream === 'jee-main'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.01]'
                          : 'bg-slate-50 hover:bg-blue-50/60 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700'
                      }`}
                    >
                      <Award className="w-5 h-5 shrink-0" />
                      <span>JEE Mains</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                        examStream === 'jee-main' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {JEE_MAIN_COLLEGES.length}
                      </span>
                    </button>

                    {/* Button 2: JEE Advance */}
                    <button
                      type="button"
                      onClick={() => { setExamStream('jee-advanced'); setSelectedState('all'); }}
                      className={`py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 ${
                        examStream === 'jee-advanced'
                          ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.01]'
                          : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 shrink-0" />
                      <span>JEE Advance</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                        examStream === 'jee-advanced' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {JEE_ADVANCED_COLLEGES.length}
                      </span>
                    </button>

                    {/* Button 3: EAMCET */}
                    <button
                      type="button"
                      onClick={() => { setExamStream('eamcet'); setSelectedState('all'); }}
                      className={`py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 ${
                        examStream === 'eamcet'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.01]'
                          : 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5 shrink-0" />
                      <span>Eamcet</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                        examStream === 'eamcet' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {EAMCET_COLLEGES.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Clean Context Banner for the Selected Option */}
                <div className={`rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md ${
                  examStream === 'jee-advanced'
                    ? 'bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900'
                    : examStream === 'jee-main'
                    ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900'
                    : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
                }`}>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {examStream === 'jee-advanced'
                          ? 'JoSAA All-India IIT Counseling • Premier Institutes'
                          : examStream === 'jee-main'
                          ? 'JoSAA & CSAB Central Counseling • Top NITs & IIITs'
                          : 'TAFRC & APHERMC Official Convenor Quota Seats'}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                      {examStream === 'jee-advanced'
                        ? 'Indian Institutes of Technology (IITs)'
                        : examStream === 'jee-main'
                        ? 'National Institutes of Technology & IIITs (JEE Mains)'
                        : 'Telangana & Andhra Pradesh EAMCET Colleges'}
                    </h1>
                    <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                      {examStream === 'jee-advanced'
                        ? 'Showing closing CRL ranks, seat allocations, and placement records across premier IITs.'
                        : examStream === 'jee-main'
                        ? 'Showing JEE Main opening & closing cutoffs, tuition fees, and placements for NITs and IIITs.'
                        : 'Showing official convenor fees, closing ranks, and accreditation for TS & AP EAMCET colleges.'}
                    </p>
                  </div>

                  {/* Options & Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                    {examStream === 'eamcet' ? (
                      <>
                        <button
                          onClick={() => handleStateChange('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedState === 'all'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          All ({EAMCET_COLLEGES.length})
                        </button>
                        <button
                          onClick={() => handleStateChange('TS')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedState === 'TS'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          Telangana ({streamTsColleges.length})
                        </button>
                        <button
                          onClick={() => handleStateChange('AP')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedState === 'AP'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          Andhra Pradesh ({streamApColleges.length})
                        </button>
                      </>
                    ) : examStream === 'jee-main' ? (
                      <>
                        <button
                          onClick={() => setMainsSubCategory('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            mainsSubCategory === 'all'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          All ({JEE_MAIN_COLLEGES.length})
                        </button>
                        <button
                          onClick={() => setMainsSubCategory('nit')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            mainsSubCategory === 'nit'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          NITs ({NIT_COLLEGES.length})
                        </button>
                        <button
                          onClick={() => setMainsSubCategory('iiit')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            mainsSubCategory === 'iiit'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          IIITs ({IIIT_COLLEGES.length})
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm">
                        All 23 Premier IITs ({IIT_COLLEGES.length})
                      </span>
                    )}

                    <button
                      onClick={() => setActiveTab('predictor')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1 shadow-sm transition-all cursor-pointer ml-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Predictor</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <CollegeFilters
                  filters={filters}
                  setFilters={setFilters}
                  totalCount={streamColleges.length}
                  filteredCount={filteredColleges.length}
                  examStream={examStream}
                  selectedSubCategory={mainsSubCategory}
                  onSubCategoryChange={(sub) => setMainsSubCategory(sub as any)}
                />

                {/* College Cards Grid */}
                {filteredColleges.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                    <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-900 text-lg">No colleges match your criteria</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Try relaxing your fee, city, or branch filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
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
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredColleges.map((college) => (
                      <CollegeCard
                        key={college.id}
                        college={college}
                        onSelect={handleSelectCollege}
                      />
                    ))}
                  </div>
                )}

                {/* Frequently Asked Questions Section on Landing Page */}
                <FAQSection />
              </>
            )}

          </div>
        )}

        {/* TAB: PREDICTOR */}
        {activeTab === 'predictor' && (
          <EamcetPredictor onSelectCollege={handleSelectCollege} />
        )}

        {/* TAB: SAVED */}
        {activeTab === 'saved' && (
          <SavedCollegesView
            onBrowseColleges={() => setActiveTab('directory')}
            onSelectCollege={handleSelectCollege}
          />
        )}

        {/* TAB: COMPARISON */}
        {activeTab === 'comparison' && (
          <CollegeComparisonView
            onBrowseColleges={() => setActiveTab('directory')}
            onSelectCollege={handleSelectCollege}
          />
        )}

      </main>

      {/* Floating Comparison Drawer */}
      <FloatingComparisonBar 
        onOpenComparison={() => setActiveTab('comparison')} 
        onOpenModal={() => setShowQuickCompareModal(true)}
      />

      {/* Quick Compare Side-by-Side Modal */}
      <QuickCompareModal
        isOpen={showQuickCompareModal}
        onClose={() => setShowQuickCompareModal(false)}
        onSelectCollege={handleSelectCollege}
      />

      {/* College Detail Modal */}
      <CollegeDetailModal
        college={selectedCollege}
        onClose={() => handleSelectCollege(null)}
      />

      {/* Candidate Target Exam Stream Modal */}
      <ExamStreamModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
      />

      {/* Candidate Sign In and Sign Up Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalInitialMode}
      />

      {/* AI Counselor Chatbot */}
      <CampusChatbot
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        examStream={examStream}
        selectedState={selectedState}
        allColleges={ALL_COLLEGES}
        onSelectCollege={(col) => setSelectedCollege(col)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SavedCollegesProvider>
        <ComparisonProvider>
          <MainAppContent />
        </ComparisonProvider>
      </SavedCollegesProvider>
    </AuthProvider>
  );
}
