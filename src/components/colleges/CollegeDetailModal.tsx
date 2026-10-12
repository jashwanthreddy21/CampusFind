import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  ExternalLink, 
  Bookmark, 
  Scale, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  ShieldCheck,
  Check,
  BarChart3,
  Table as TableIcon,
  Star,
  Share2,
  Copy,
  Camera,
  Bell,
  BellRing,
  Sparkles
} from 'lucide-react';
import { College } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSavedColleges } from '../../context/SavedCollegesContext';
import { useComparison } from '../../context/ComparisonContext';
import { subscribeToCutoffAlert } from '../../firebase/services';
import { PlacementTrendChart } from './PlacementTrendChart';
import { BranchCutoffTrendChart } from './BranchCutoffTrendChart';
import { CollegeLocationMap } from './CollegeLocationMap';
import { PlacementStatsVisualizer } from './PlacementStatsVisualizer';
import { FeeBreakdownPieChart } from './FeeBreakdownPieChart';
import { CollegeReviewsSection } from './CollegeReviewsSection';
import { CollegeImageCarousel } from './CollegeImageCarousel';
import { CutoffAlertModal } from './CutoffAlertModal';
import { CollegeScholarshipEligibility } from './CollegeScholarshipEligibility';
import { AiBranchRecommender } from './AiBranchRecommender';

interface CollegeDetailModalProps {
  college: College | null;
  onClose: () => void;
}

export const CollegeDetailModal: React.FC<CollegeDetailModalProps> = ({ college, onClose }) => {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedColleges();
  const { isComparing, addCollege, removeCollege } = useComparison();
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'photos' | 'placements' | 'cutoffs' | 'branch_recommender' | 'scholarships' | 'location' | 'reviews'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<'OC' | 'BC-A' | 'BC-B' | 'BC-C' | 'BC-D' | 'BC-E' | 'SC' | 'ST' | 'EWS'>('OC');
  const [cutoffViewMode, setCutoffViewMode] = useState<'analytics' | 'table' | 'both'>('both');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

  React.useEffect(() => {
    if (college && user && !user.isAnonymous) {
      const unsub = subscribeToCutoffAlert(user.uid, college.id, (alert) => {
        setIsAlertActive(Boolean(alert && alert.isActive));
      });
      return () => unsub();
    } else {
      setIsAlertActive(false);
    }
  }, [college, user]);

  if (!college) return null;

  const saved = isSaved(college.id);
  const comparing = isComparing(college.id);

  const getShareableUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('college', college.code || college.id);
      return url.toString();
    } catch (e) {
      return `${window.location.origin}?college=${encodeURIComponent(college.code || college.id)}`;
    }
  };

  const handleShareCollege = async () => {
    const shareUrl = getShareableUrl();
    const shareText = `Check out ${college.name} (${college.code}) on CampusFind: NIRF verified cutoffs, fee breakdown (₹${(college.annualFee / 1000).toFixed(0)}k/yr), average package ₹${college.placement.averageLPA} LPA, and student reviews.`;

    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${college.name} - Cutoffs, Fees & Placements`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User canceled share sheet
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // Prompt fallback for older browsers
      window.prompt('Copy shareable college URL:', shareUrl);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative">
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1.5">
            {/* Notify Me Bell Icon */}
            <button
              onClick={() => setIsAlertModalOpen(true)}
              aria-label="Notify me on cutoff changes"
              title={isAlertActive ? 'Cutoff alerts are active for this college' : 'Notify Me on Cutoff Rank Changes'}
              className={`p-2 rounded-full transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                isAlertActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
              }`}
            >
              {isAlertActive ? (
                <>
                  <BellRing className="w-4 h-4 text-white animate-pulse" />
                  <span className="hidden sm:inline text-[11px] pr-1">Alerts Active</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px] pr-1">Notify Me</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareCollege}
              aria-label="Share college"
              title={copiedLink ? 'Link Copied!' : 'Share College Link'}
              className={`p-2 rounded-full transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline text-[11px] pr-1">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px] pr-1">Share</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2 sm:mb-3 pr-8 sm:pr-0">
            <span className="px-2.5 py-1 bg-white text-slate-950 font-mono font-bold text-[11px] sm:text-xs rounded-lg shadow-xs">
              CODE: {college.code}
            </span>
            {college.state === 'TS' ? (
              <span className="px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                Telangana (TS EAMCET)
              </span>
            ) : college.state === 'AP' ? (
              <span className="px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold rounded-md bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                Andhra Pradesh (AP EAMCET)
              </span>
            ) : (
              <span className="px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold rounded-md bg-amber-500/30 text-amber-200 border border-amber-400/40">
                {college.state} • {college.exam}
              </span>
            )}
            <span className="px-2 sm:px-2.5 py-0.5 bg-white/10 text-slate-200 text-[11px] sm:text-xs rounded-md">
              {college.type}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
            {college.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300 mt-2">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <span>{college.affiliation} • Established {college.established}</span>
            </span>
            <a
              href={college.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${college.name}, ${college.city}, ${college.state}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-white hover:underline transition-colors"
              title="Open location in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">{college.address}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Dedicated Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveModalTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeModalTab === 'overview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Overview & Fees
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('photos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'photos'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Campus Photos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
              activeModalTab === 'photos' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              Gallery
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('placements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'placements'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Placements</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
              activeModalTab === 'placements' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
              ₹{college.placement.highestLPA} LPA
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('cutoffs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'cutoffs'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Cutoffs & Ranks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('branch_recommender')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'branch_recommender'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Branch Match</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
              activeModalTab === 'branch_recommender' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
            }`}>
              AI/ML • VLSI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('scholarships')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'scholarships'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Scholarships</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
              activeModalTab === 'scholarships' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Fee Aid
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('location')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'location'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Location & Maps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('reviews')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'reviews'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeModalTab === 'reviews' ? 'fill-white' : 'fill-amber-400 text-amber-500'}`} />
            <span>Reviews</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
              activeModalTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              ★ {college.rating}
            </span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          
          {/* Toast Notification for Link Copied */}
          {copiedLink && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Shareable link copied to clipboard! Anyone with this link will open <strong>{college.code}</strong> directly.
                </span>
              </div>
              <button 
                onClick={() => setCopiedLink(false)}
                className="text-emerald-600 hover:text-emerald-900 ml-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* DEDICATED TAB: CAMPUS PHOTOS & IMAGE CAROUSEL */}
          {activeModalTab === 'photos' && (
            <div className="space-y-4 animate-fade-in">
              <CollegeImageCarousel college={college} />
            </div>
          )}

          {/* DEDICATED TAB: REVIEWS & RATINGS */}
          {activeModalTab === 'reviews' && (
            <CollegeReviewsSection college={college} />
          )}

          {/* DEDICATED TAB: PLACEMENTS (3-Year Average Salary Trend Bar Chart & Placement Stats) */}
          {activeModalTab === 'placements' && (
            <div className="space-y-6">
              <PlacementTrendChart 
                placement={college.placement} 
                collegeName={college.name} 
              />
              <PlacementStatsVisualizer college={college} />
            </div>
          )}

          {/* DEDICATED TAB: SCHOLARSHIP ELIGIBILITY & NET FEE ANALYSIS */}
          {activeModalTab === 'scholarships' && (
            <div className="space-y-6 animate-fade-in">
              <CollegeScholarshipEligibility 
                college={college} 
                initialCategory={selectedCategory}
              />
            </div>
          )}

          {/* DEDICATED TAB: AI BRANCH RECOMMENDER */}
          {activeModalTab === 'branch_recommender' && (
            <div className="space-y-6 animate-fade-in">
              <AiBranchRecommender 
                college={college} 
                initialCategory={selectedCategory}
                onNavigateToCutoffs={() => setActiveModalTab('cutoffs')}
              />
            </div>
          )}

          {/* Campus Visual Tour Preview in Overview Tab */}
          {activeModalTab === 'overview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>Campus Visual Showcase</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('photos')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Gallery</span>
                  <span>→</span>
                </button>
              </div>
              <CollegeImageCarousel college={college} />
            </div>
          )}

          {/* Key Facts Summary (Overview Tab) */}
          {activeModalTab === 'overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Annual Convenor Fee
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {formatCurrency(college.annualFee)}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Official AFRC Fee
                </div>
              </div>

              <div 
                onClick={() => setActiveModalTab('placements')}
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group"
                title="Click to view full placement bar chart"
              >
                <div className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Average Package</span>
                  <span className="text-[10px] font-bold text-indigo-600">Charts →</span>
                </div>
                <div className="text-lg font-extrabold text-indigo-600 mt-1">
                  ₹{college.placement.averageLPA} LPA
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Median: ₹{college.placement.medianLPA} LPA
                </div>
              </div>

              <div 
                onClick={() => setActiveModalTab('placements')}
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer group"
                title="Click to view full placement bar chart"
              >
                <div className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Highest Package</span>
                  <span className="text-[10px] font-bold text-emerald-600">Charts →</span>
                </div>
                <div className="text-lg font-extrabold text-emerald-600 mt-1">
                  ₹{college.placement.highestLPA} LPA
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {college.placement.placementPercentage}% Placement Rate
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Accreditations
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {college.accreditation.naac ? `NAAC ${college.accreditation.naac}` : 'UGC'}
                </div>
                <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
                  {college.accreditation.nirfRank ? `NIRF Rank #${college.accreditation.nirfRank}` : 'NBA Accredited'}
                </div>
              </div>

              {/* Student Ratings & Reviews Quick Access Banner */}
              <div 
                onClick={() => setActiveModalTab('reviews')}
                className="col-span-2 sm:col-span-4 p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent hover:bg-amber-100/40 rounded-xl border border-amber-200/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                title="Click to view student reviews and leave your rating"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 flex items-center gap-2 flex-wrap">
                      <span>Peer Rating: {college.rating} / 5.0</span>
                      <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded-md font-bold">
                        Verified Community Reviews
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Read real feedback on academics, mess food, coding culture, and placements or post a star review.
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-700 group-hover:text-amber-800 flex items-center gap-1 shrink-0">
                  <span>Reviews Tab</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          )}

          {/* Official Fee Clarification Box */}
          {activeModalTab === 'overview' && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <strong className="block font-bold">Deduplicated & Verified Convenor Fee Record</strong>
                <p className="leading-relaxed">
                  {college.feeCategoryNote || 'This is the government-notified convenor quota tuition fee. No duplicate listings with varying fee blocks are maintained.'}
                  {college.hostelFeeApprox && (
                    <span className="block mt-1 text-emerald-800">
                      Hostel & Mess Charges: Approx <strong>{formatCurrency(college.hostelFeeApprox)}</strong> per year (optional).
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Visual Fee Breakdown (Pie Chart: Tuition Fee vs Other Expenses) */}
          {activeModalTab === 'overview' && (
            <FeeBreakdownPieChart college={college} />
          )}

          {/* Scholarship Eligibility & Net Fee Analysis Section */}
          {activeModalTab === 'overview' && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span>Scholarship Eligibility & Net Fee Analysis</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculates state tuition reimbursements (TS ePASS / AP JVD), national aids, and college endowments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('scholarships')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Open Full View</span>
                  <span>→</span>
                </button>
              </div>

              <CollegeScholarshipEligibility 
                college={college} 
                initialCategory={selectedCategory}
              />
            </div>
          )}

          {/* EAMCET Cutoff Section: Visual Analytics & Closing Ranks */}
          {(activeModalTab === 'overview' || activeModalTab === 'cutoffs') && (
            <div className="space-y-4">
              {/* Upcoming Counseling Cycle Cutoff Alert CTA Banner */}
              <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 border border-indigo-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isAlertActive 
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-300' 
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  }`}>
                    {isAlertActive ? <BellRing className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {isAlertActive ? 'Cutoff Change Alerts Active' : 'Get Alerts on Upcoming Cutoff Changes'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                        2026-27 Counseling Cycle
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {isAlertActive 
                        ? `You are receiving notifications for ${college.code} closing rank shifts across upcoming counseling rounds.`
                        : `Sign up for email or in-app alerts if cutoff ranks for ${college.name} shift during upcoming counseling rounds.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(true)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    isAlertActive
                      ? 'bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {isAlertActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manage Alerts</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <span>{college.exam} Cutoff & Branch Analytics</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Analyze 3-year closing rank trajectories and compare branch competitiveness
                </p>
              </div>

              {/* View Switcher: Analytics Graph vs Cutoff Table vs Both */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setCutoffViewMode('analytics')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    cutoffViewMode === 'analytics'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>3-Yr Trend Graph</span>
                </button>
                <button
                  onClick={() => setCutoffViewMode('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    cutoffViewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Cutoff Table</span>
                </button>
                <button
                  onClick={() => setCutoffViewMode('both')}
                  className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    cutoffViewMode === 'both'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Both</span>
                </button>
              </div>
            </div>

            {/* Visual Analytics Dashboard (Recharts 3-Year Cutoff Trend Graph) */}
            {(cutoffViewMode === 'analytics' || cutoffViewMode === 'both') && (
              <BranchCutoffTrendChart
                college={college}
                initialCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}

            {/* Tabular Cutoffs View */}
            {(cutoffViewMode === 'table' || cutoffViewMode === 'both') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-700">
                    Detailed Branch Closing Ranks Table ({selectedCategory} Category)
                  </div>

                  {/* Category Selector for Table View */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                    {(['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Branch Code</th>
                        <th className="py-2.5 px-4">Course Name</th>
                        <th className="py-2.5 px-4 text-right">Closing Rank ({selectedCategory})</th>
                        <th className="py-2.5 px-4 text-right">General OC Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {college.cutoffs.map((co) => {
                        const catRank = co.closingRanks[selectedCategory] || co.closingRanks['OC'] || 0;
                        const ocRank = co.closingRanks['OC'] || 0;
                        return (
                          <tr key={co.branchCode} className="hover:bg-slate-50/80">
                            <td className="py-2 px-4 font-mono font-bold text-indigo-600">
                              {co.branchCode}
                            </td>
                            <td className="py-2 px-4 font-medium text-slate-800">
                              {co.branchName}
                            </td>
                            <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                              ~{catRank.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-slate-500">
                              ~{ocRank.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Dedicated Section: Visualizing Placement Statistics (Bar Chart & Top Recruiters) in Overview Tab */}
          {activeModalTab === 'overview' && (
            <div className="space-y-6">
              <PlacementStatsVisualizer college={college} />

              {/* Year-over-Year Placement Growth Trend Visualization */}
              <PlacementTrendChart 
                placement={college.placement} 
                collegeName={college.name} 
              />

              {/* AI-Powered Branch Recommender Preview Banner in Overview Tab */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-white">
                        AI Branch Recommender
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/30">
                        AI/ML, Data Science & VLSI Fit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl">
                      Synthesize your saved subject passions with {college.name}&apos;s verified ₹{college.placement.averageLPA} LPA placement track record to find your best engineering branch fit.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('branch_recommender')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Explore Branch Recommendations</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* Geographical Location & Transit Accessibility (Google Maps Platform) */}
          {(activeModalTab === 'overview' || activeModalTab === 'location') && (
            <div>
              <CollegeLocationMap college={college} />
            </div>
          )}

          {/* Facilities */}
          {activeModalTab === 'overview' && (
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-2">Campus Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {college.facilities.map((fac) => (
                  <span 
                    key={fac}
                    className="px-2.5 py-1 bg-indigo-50/70 border border-indigo-100 text-indigo-800 text-xs font-medium rounded-lg"
                  >
                    ✓ {fac}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <a
            href={college.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-1 sm:py-0"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>Official College Portal</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              title={isAlertActive ? 'Cutoff alerts are active' : 'Notify me on cutoff changes'}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAlertActive
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isAlertActive ? (
                <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Bell className="w-4 h-4 shrink-0 text-slate-600" />
              )}
              <span>{isAlertActive ? 'Alerts On' : 'Notify Me'}</span>
            </button>

            <button
              onClick={handleShareCollege}
              title={copiedLink ? 'Link copied to clipboard!' : 'Share college'}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Share2 className="w-4 h-4 shrink-0" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => {
                if (comparing) {
                  removeCollege(college.id);
                } else {
                  addCollege(college);
                }
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                comparing 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>{comparing ? 'In Compare' : 'Compare'}</span>
            </button>

            <button
              onClick={() => toggleSave(college)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                saved 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 shrink-0 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Bookmark'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Cutoff Change Notification Preferences Modal */}
      <CutoffAlertModal
        college={college}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onAlertStatusChange={(active) => setIsAlertActive(active)}
      />
    </div>
  );
};
