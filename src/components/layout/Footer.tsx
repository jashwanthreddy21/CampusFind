import React from 'react';
import { GraduationCap, ShieldCheck, ExternalLink, CheckCircle2, Building, Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Vision */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>CampusFind • TS & AP EAMCET</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Official discovery directory and cutoff predictor for Telangana State (TG EAPCET) and Andhra Pradesh (AP EAPCET) engineering admissions.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All duplicate colleges removed. Official AFRC convenor tuition fees only.</span>
            </div>
          </div>

          {/* Official Counseling Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Official Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://eapcet.tgche.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>TG EAPCET (Telangana State)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://cets.apsche.ap.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AP EAPCET (Andhra Pradesh)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tgche.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>TGCHE Official Site</span>
                </a>
              </li>
              <li>
                <a
                  href="https://apsche.ap.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>APSCHE Official Site</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Fee Regulatory Authorities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Fee Regulation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convenor annual tuition fees are regulated by the <strong>Telangana Admission and Fee Regulatory Committee (TAFRC)</strong> and the <strong>Andhra Pradesh Higher Education Regulatory & Monitoring Commission (APHERMC)</strong>.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              Database powered by Google Cloud Firestore with real-time sync.
            </div>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CampusFind TS & AP EAMCET Directory. Built for aspiring engineering candidates across Telangana and Andhra Pradesh.
        </div>
      </div>
    </footer>
  );
};
