import React from 'react';
import { 
  Bookmark, 
  Trash2, 
  Scale, 
  ExternalLink, 
  Download, 
  Printer, 
  Building, 
  MapPin, 
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { College } from '../../types';
import { useSavedColleges } from '../../context/SavedCollegesContext';
import { useComparison } from '../../context/ComparisonContext';
import { useAuth } from '../../context/AuthContext';
import { getCollegeByIdOrCode } from '../../data/collegesData';

interface SavedCollegesViewProps {
  onBrowseColleges: () => void;
  onSelectCollege: (college: College) => void;
}

export const SavedCollegesView: React.FC<SavedCollegesViewProps> = ({ 
  onBrowseColleges,
  onSelectCollege 
}) => {
  const { savedColleges, toggleSave } = useSavedColleges();
  const { isComparing, addCollege, removeCollege } = useComparison();
  const { user, openAuthModal } = useAuth();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportText = () => {
    const lines = [
      '======================================================',
      'CAMPUSFIND - TS & AP EAMCET COUNSELING CHOICE FILLING',
      '======================================================',
      `Export Date: ${new Date().toLocaleDateString()}`,
      `Total Colleges Bookmarked: ${savedColleges.length}`,
      '',
      ...savedColleges.map((item, index) => 
        `Choice #${index + 1}: [CODE: ${item.collegeCode}] ${item.collegeName} (${item.state}) - Fee: ${formatCurrency(item.annualFee)}/yr`
      ),
      '',
      'Note: Verify official seat matrix at TGCHE / APSCHE counseling portal before final submission.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EAMCET_Choice_Options_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (savedColleges.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Your Watchlist is Empty</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Bookmark colleges while browsing the directory to build your personalized EAMCET choice-filling list and track annual convenor fees.
        </p>
        <button
          onClick={onBrowseColleges}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          Discover Colleges Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <Bookmark className="w-4 h-4 fill-current" />
            <span>Choice Filling Watchlist</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {savedColleges.length} Saved College{savedColleges.length > 1 ? 's' : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized with your Firebase account across devices.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export List</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {!user && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900">
          <div>
            <strong>Sign in or create an account</strong> to automatically sync and access your chosen colleges across mobile, tablet, and desktop devices.
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shrink-0 cursor-pointer text-center"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Grid of Saved Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedColleges.map((item, index) => {
          const fullCollege = getCollegeByIdOrCode(item.collegeId);
          const comparing = fullCollege ? isComparing(fullCollege.id) : false;

          return (
            <div
              key={item.collegeId}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-md">
                      CODE: {item.collegeCode}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                      item.state === 'TS' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.state === 'TS' ? 'Telangana' : 'Andhra Pradesh'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (fullCollege) toggleSave(fullCollege);
                    }}
                    title="Remove from saved"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 
                  onClick={() => fullCollege && onSelectCollege(fullCollege)}
                  className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer line-clamp-1 mt-1"
                >
                  {item.collegeName}
                </h4>

                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{item.city}</span>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Convenor Fee</span>
                    <div className="font-mono font-extrabold text-slate-900">
                      {formatCurrency(item.annualFee)}/yr
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
                    <div className="font-bold text-amber-600">
                      ⭐ {item.rating ? item.rating.toFixed(1) : '4.5'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {fullCollege && (
                  <button
                    onClick={() => {
                      if (comparing) {
                        removeCollege(fullCollege.id);
                      } else {
                        addCollege(fullCollege);
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      comparing 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{comparing ? 'In Compare' : 'Compare'}</span>
                  </button>
                )}

                {fullCollege && (
                  <button
                    onClick={() => onSelectCollege(fullCollege)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
