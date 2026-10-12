import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Compass, 
  Layers, 
  ReceiptIndianRupee, 
  CalendarClock, 
  FileCheck2, 
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'counseling' | 'seat-allocation' | 'fees';
  question: string;
  answer: string;
  badge: string;
  highlights?: string[];
  links?: { title: string; url: string }[];
}

const FAQ_DATA: FAQItem[] = [
  // Exam Counseling
  {
    id: 'counseling-procedure',
    category: 'counseling',
    badge: 'Exam Counseling',
    question: 'How does the online counseling process work for TG / AP EAPCET and JoSAA?',
    answer: 'Online counseling is conducted systematically through designated portals: TGCHE for Telangana (TG EAPCET), APSCHE for Andhra Pradesh (AP EAPCET), and JoSAA/CSAB for IITs, NITs, and IIITs. It involves mandatory document verification, slot booking, candidate registration, web options entry (filling college preferences), and allotment publication.',
    highlights: [
      'Document Verification & Processing Fee payment is prerequisite before web options.',
      'Web Options Priority: Always arrange your choice list with dream colleges at the top.',
      'Mock Allotment allows checking probability before freezing final choices.'
    ],
    links: [
      { title: 'TG EAPCET Official Portal', url: 'https://eapcet.tgche.ac.in' },
      { title: 'AP EAPCET Official Portal', url: 'https://cets.apsche.ap.gov.in' }
    ]
  },
  {
    id: 'web-options-strategy',
    category: 'counseling',
    badge: 'Exam Counseling',
    question: 'How should I order my web options to maximize my chances of getting a top college?',
    answer: 'Sort your options strictly by preference rather than rank fear. Enter top aspirational choices at the beginning (even if cutoff was slightly higher last year), followed by realistic safe colleges within your rank range, and backup colleges at the end. Since the algorithm checks candidate choices sequentially from top to bottom, putting a lower college first can permanently lock you out of a better college you could have gotten.',
    highlights: [
      'Add at least 30 to 60 web choices covering high-demand branches and verified institutes.',
      'Do not keep only 3-5 options; wide lists protect against sudden cutoff shifts.',
      'Ensure college affiliation codes (e.g., JNTUH, OU, AU) match official counseling codes.'
    ]
  },
  {
    id: 'documents-required',
    category: 'counseling',
    badge: 'Exam Counseling',
    question: 'What documents are required for certificate verification during counseling?',
    answer: 'Candidates must carry both original certificates and sets of photocopies to the designated Help Line Center (HLC) or upload them for online verification.',
    highlights: [
      'EAPCET / JEE Rank Card & Hall Ticket',
      'Intermediate (10+2) Marks Memo & SSC / 10th Certificate',
      'Study / Bonafide Certificates from Class 6 to Intermediate (local status proof)',
      'Caste / EWS Certificate (issued by competent authority / MeeSeva)',
      'Income Certificate (issued on or after Jan 1st of current year for fee reimbursement eligibility)'
    ]
  },

  // Seat Allocation
  {
    id: 'freeze-vs-float-vs-slide',
    category: 'seat-allocation',
    badge: 'Seat Allocation',
    question: 'What is the difference between Freeze, Float, and Slide in seat allocation?',
    answer: 'After a seat is allotted in Round 1 or 2, candidates must choose how they want to proceed with their allotment:',
    highlights: [
      'Freeze: Accept the allotted college & branch with total satisfaction. You exit further counseling rounds.',
      'Float: Accept the currently allotted seat while remaining eligible for higher preference choices in subsequent rounds if upgraded.',
      'Slide: Accept the allotted institute, but seek an upgrade to a preferred higher branch within the exact same institute in next rounds.'
    ]
  },
  {
    id: 'self-reporting-retention',
    category: 'seat-allocation',
    badge: 'Seat Allocation',
    question: 'What is Online Self-Reporting and do I lose my seat if I participate in Phase 2 / Round 2?',
    answer: 'Under TG / AP EAPCET rules, once a seat is allotted in Phase 1, you must perform "Online Self-Reporting" and pay any differential tuition fee within the deadline. By doing self-reporting, your Phase 1 seat is safely reserved. If you participate in Phase 2 and secure a higher preference seat, your Phase 1 seat automatically vacates; if you do not get an upgrade in Phase 2, your Phase 1 seat remains intact.',
    highlights: [
      'Failure to complete online self-reporting leads to automatic cancellation of the allotted seat.',
      'Physical reporting at the college is usually required after final phase allotments.'
    ]
  },
  {
    id: 'category-reservations',
    category: 'seat-allocation',
    badge: 'Seat Allocation',
    question: 'How are reservations, local area status (OU / AU / SVU), and girl quotas applied?',
    answer: '85% of seats in state convenor quotas are reserved for local candidates (Osmania University region for Telangana; Andhra University and Sri Venkateswara University regions for Andhra Pradesh), and 15% are unreserved (open to all). State statutory reservations (SC, ST, BC-A/B/C/D/E, EWS) and 33.33% horizontal reservation for female candidates are strictly factored into each merit pool.',
    highlights: [
      'Non-local candidates can only compete within the 15% open merit category.',
      'Valid local area study certificate from 6th to 12th determines your local status.'
    ]
  },

  // College Fees
  {
    id: 'fee-reimbursement',
    category: 'fees',
    badge: 'College Fees',
    question: 'How does Telangana (ePASS) and Andhra Pradesh (Jagananna Vidya Deevena) Fee Reimbursement work?',
    answer: 'Both state governments provide full or partial tuition fee reimbursement to eligible students admitted under Convenor Quota (Category-A) whose parental annual income does not exceed state guidelines (typically ₹1.5L to ₹2L in rural / ₹2L in urban areas, or valid white ration card holders).',
    highlights: [
      'Telangana (TG ePASS): Top ranks or SC/ST candidates often qualify for 100% tuition reimbursement up to government-notified limits.',
      'Andhra Pradesh (JVD): Tuition fee is credited directly to mother accounts in quarterly installments.',
      'Management Quota (Category-B / NRI) seats are strictly NOT eligible for fee reimbursement.'
    ]
  },
  {
    id: 'tuition-vs-other-expenses',
    category: 'fees',
    badge: 'College Fees',
    question: 'What is the difference between Convenor Tuition Fee and Other College Expenses?',
    answer: 'The annual tuition fee is legally fixed by the Admission and Fee Regulatory Committee (AFRC) and represents the academic tuition for Category-A convenor seats. Other expenses are separate and paid upon joining the college.',
    highlights: [
      'Convenor Tuition Fee: Regulated by AFRC (ranges from ₹35,000 to ₹1,40,000/yr depending on college tier).',
      'Other Expenses: University recognition fee, library caution deposit (refundable), examination fees, lab charges (typically ₹8,000 - ₹25,000/yr).',
      'Hostel & Mess: Usually ₹50,000 - ₹95,000 per academic year for on-campus boarding.'
    ]
  },
  {
    id: 'refund-policy',
    category: 'fees',
    badge: 'College Fees',
    question: 'Can I get a fee refund if I cancel my admission or join another college?',
    answer: 'Yes, both AICTE and state counseling councils have strict fee refund regulations. If a candidate cancels admission before the counseling withdrawal cutoff date, the college must refund the tuition fee after deducting a nominal processing fee (usually capped at ₹1,000 to ₹2,000). Colleges cannot withhold original certificates once formal cancellation is approved.',
    highlights: [
      'Cancel before the final counseling date to receive standard full refund.',
      'Keep payment receipts, transaction IDs, and self-reporting allotment printouts safe.'
    ]
  }
];

export const FAQSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'counseling' | 'seat-allocation' | 'fees'>('all');
  const [openItem, setOpenItem] = useState<string>('counseling-procedure');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.highlights && item.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? '' : id));
  };

  return (
    <section className="mt-20 pt-16 border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Student Guidance & FAQs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Clear, authoritative answers to common concerns about state and national engineering counseling, web options entry, seat allocation rules, and tuition fee structures.
          </p>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Topics ({FAQ_DATA.length})
            </button>
            <button
              onClick={() => setActiveCategory('counseling')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'counseling'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Exam Counseling</span>
            </button>
            <button
              onClick={() => setActiveCategory('seat-allocation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'seat-allocation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Seat Allocation</span>
            </button>
            <button
              onClick={() => setActiveCategory('fees')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'fees'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ReceiptIndianRupee className="w-3.5 h-3.5" />
              <span>College Fees</span>
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search counseling questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching questions found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting "All Topics".</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => {
              const isOpen = openItem === faq.id;
              const badgeColors = 
                faq.category === 'counseling' 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : faq.category === 'seat-allocation'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div
                  key={faq.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'border-indigo-200 shadow-md ring-1 ring-indigo-500/10' 
                      : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColors}`}>
                          {faq.badge}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-slate-600 animate-fadeIn">
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                        {faq.answer}
                      </p>

                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="mt-3.5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Key Takeaways & Guidelines:
                          </span>
                          <ul className="space-y-1.5">
                            {faq.highlights.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {faq.links && faq.links.length > 0 && (
                        <div className="mt-3 flex items-center gap-3 pt-2">
                          <span className="text-[11px] font-bold text-slate-400">Official Links:</span>
                          {faq.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <span>{link.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Counseling Help Note */}
        <div className="mt-10 p-4 rounded-2xl bg-linear-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Need specific rank prediction or cutoff ranges?</h4>
              <p className="text-[11px] sm:text-xs text-slate-600">Use our live Rank Predictor to estimate your branch and college probability based on previous rounds.</p>
            </div>
          </div>
          <a
            href="#predictor"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            Explore Predictor ↑
          </a>
        </div>

      </div>
    </section>
  );
};
