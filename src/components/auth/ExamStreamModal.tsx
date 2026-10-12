import React from 'react';
import { 
  Sparkles, 
  Award, 
  GraduationCap, 
  X, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ExamStream } from '../../types';

interface ExamStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamStreamModal: React.FC<ExamStreamModalProps> = ({ isOpen, onClose }) => {
  const { user, examStream, setExamStream } = useAuth();

  if (!isOpen) return null;

  const handleSelect = async (stream: ExamStream) => {
    await setExamStream(stream);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Select Your Exam
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Choose your target exam to view relevant colleges, ranks, and cutoffs.
          </p>
        </div>

        {/* 3 Clear, User-Friendly Buttons */}
        <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
          
          {/* Button 1: JEE Mains */}
          <button
            type="button"
            onClick={() => handleSelect('jee-main')}
            className={`w-full p-3 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all group cursor-pointer ${
              examStream === 'jee-main'
                ? 'bg-blue-50 border-blue-600 shadow-sm'
                : 'bg-white hover:bg-blue-50/50 border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">
                  JEE Mains
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                  NITs, IIITs & Central Universities (JoSAA / CSAB)
                </div>
              </div>
            </div>
            <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold shadow-xs shrink-0 flex items-center gap-1">
              <span>Select</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Button 2: JEE Advance */}
          <button
            type="button"
            onClick={() => handleSelect('jee-advanced')}
            className={`w-full p-3 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all group cursor-pointer ${
              examStream === 'jee-advanced'
                ? 'bg-amber-50 border-amber-600 shadow-sm'
                : 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">
                  JEE Advance
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                  Premier Indian Institutes of Technology (IITs)
                </div>
              </div>
            </div>
            <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] sm:text-xs font-bold shadow-xs shrink-0 flex items-center gap-1">
              <span>Select</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Button 3: EAMCET */}
          <button
            type="button"
            onClick={() => handleSelect('eamcet')}
            className={`w-full p-3 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all group cursor-pointer ${
              examStream === 'eamcet'
                ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                : 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">
                  Eamcet
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                  Telangana & Andhra Pradesh State Convenor Colleges
                </div>
              </div>
            </div>
            <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold shadow-xs shrink-0 flex items-center gap-1">
              <span>Select</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate pr-2">Switch exams anytime on home page.</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
