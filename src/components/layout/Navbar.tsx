import React, { useState } from 'react';
import { 
  Home,
  GraduationCap, 
  Bookmark, 
  Scale, 
  Sparkles, 
  Search, 
  LogOut, 
  LogIn,
  UserPlus,
  Bot,
  Menu,
  X,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedColleges } from '../../context/SavedCollegesContext';
import { useComparison } from '../../context/ComparisonContext';
import { NotificationFeedDropdown } from './NotificationFeedDropdown';

interface NavbarProps {
  activeTab: 'directory' | 'predictor' | 'saved' | 'comparison';
  setActiveTab: (tab: 'directory' | 'predictor' | 'saved' | 'comparison') => void;
  selectedState: 'all' | 'TS' | 'AP';
  setSelectedState: (state: 'all' | 'TS' | 'AP') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClearSearch?: () => void;
  searchResultsCount?: number;
  onOpenChatbot?: () => void;
  isChatbotOpen?: boolean;
  onSelectCollege?: (collegeId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onClearSearch,
  searchResultsCount,
  onOpenChatbot,
  isChatbotOpen,
  onSelectCollege,
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const { savedColleges } = useSavedColleges();
  const { comparedColleges } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'directory' | 'predictor' | 'saved' | 'comparison') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    setActiveTab('directory');
    if (searchQuery) {
      handleClearSearch();
    }
    setMobileMenuOpen(false);
    // Smooth scroll to top of window
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore in iframe
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // When a user types, always switch to the main directory tab to reveal the search results
    if (activeTab !== 'directory') {
      setActiveTab('directory');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0" 
            onClick={() => handleTabClick('directory')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 block leading-tight">
                CampusFind
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block leading-tight truncate max-w-[150px] sm:max-w-none">
                Admissions & Cutoffs
              </span>
            </div>
          </div>

          {/* Quick Search - Visible on Tablet and Desktop */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? 'text-indigo-600' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search college, code, city..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-16 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {typeof searchResultsCount === 'number' && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                      {searchResultsCount}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            
            {/* Home Tab */}
            <button
              onClick={handleHomeClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'directory' && !searchQuery
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 text-indigo-400" />
              <span>Home</span>
            </button>

            {/* Colleges Tab */}
            <button
              onClick={() => handleTabClick('directory')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'directory' && searchQuery
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Colleges
            </button>

            {/* Predictor Tab */}
            <button
              onClick={() => handleTabClick('predictor')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'predictor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Predictor</span>
            </button>

            {/* AI Counselor Chatbot Button */}
            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isChatbotOpen
                    ? 'bg-slate-900 text-white shadow-xs ring-2 ring-indigo-400'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80'
                }`}
                title="Ask AI Counselor about cutoffs, JoSAA & colleges"
              >
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>AI Counselor</span>
                <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                  AI
                </span>
              </button>
            )}

            {/* Compare Button */}
            <button
              onClick={() => handleTabClick('comparison')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Compare</span>
              {comparedColleges.length > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {comparedColleges.length}
                </span>
              )}
            </button>

            {/* Saved Colleges Button */}
            <button
              onClick={() => handleTabClick('saved')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Saved</span>
              {savedColleges.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {savedColleges.length}
                </span>
              )}
            </button>

          </nav>

          {/* Right Header Area: Authentication & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Cutoff Change In-App Notification Bell Feed for Registered Users */}
            <NotificationFeedDropdown onSelectCollege={onSelectCollege} />

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2" title={user.email || user.displayName || 'Candidate'}>
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'Candidate')}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-indigo-200 object-cover shrink-0"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-800 truncate max-w-[100px] leading-tight">
                      {user.displayName || 'Candidate'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[100px] leading-tight">
                      {user.email || 'Signed in'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Sign Up</span>
                </button>
              </div>
            )}

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Search Bar for Mobile screens */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? 'text-indigo-600' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search college, code, city..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-16 py-2 bg-slate-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {typeof searchResultsCount === 'number' && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                    {searchResultsCount}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={handleHomeClick}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'directory' && !searchQuery
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200/70'
                }`}
              >
                <Home className="w-4 h-4 text-indigo-400" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleTabClick('directory')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'directory' && searchQuery
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200/70'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Colleges Directory</span>
              </button>

              <button
                onClick={() => handleTabClick('predictor')}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'predictor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200/70'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Rank Predictor</span>
              </button>

              <button
                onClick={() => handleTabClick('comparison')}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'comparison'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span>Comparison</span>
                </div>
                {comparedColleges.length > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {comparedColleges.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('saved')}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Saved List</span>
                </div>
                {savedColleges.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {savedColleges.length}
                  </span>
                )}
              </button>
            </div>

            {onOpenChatbot && (
              <button
                onClick={() => {
                  onOpenChatbot();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>AI Admission Counselor</span>
                </div>
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md">
                  Ask AI
                </span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
