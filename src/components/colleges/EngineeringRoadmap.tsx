import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  Code, 
  BrainCircuit, 
  Cpu, 
  Database, 
  Layers, 
  Award, 
  CheckCircle2, 
  Check, 
  Circle, 
  ExternalLink, 
  Copy, 
  ChevronRight, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  FileCode2, 
  Bookmark,
  Share2
} from 'lucide-react';
import { College } from '../../types';
import { 
  ENGINEERING_ROADMAPS, 
  BranchRoadmap, 
  RoadmapYear, 
  RoadmapProject, 
  RoadmapCertification 
} from '../../data/engineeringRoadmapsData';

interface EngineeringRoadmapProps {
  college: College;
  initialBranch?: string;
  onNavigateToCutoffs?: () => void;
}

export const EngineeringRoadmap: React.FC<EngineeringRoadmapProps> = ({
  college,
  initialBranch,
  onNavigateToCutoffs
}) => {
  // Determine available branches for this college
  const availableBranches = useMemo(() => {
    const collegeCourseCodes = new Set<string>();
    
    // Check college courses array
    if (Array.isArray(college.courses)) {
      college.courses.forEach(c => collegeCourseCodes.add(c.toUpperCase()));
    }
    // Check cutoffs array
    if (Array.isArray(college.cutoffs)) {
      college.cutoffs.forEach(co => collegeCourseCodes.add(co.branchCode.toUpperCase()));
    }

    // Match with our roadmaps catalog
    const allCatalogCodes = Object.keys(ENGINEERING_ROADMAPS);
    
    // Prioritize branches that this college specifically offers
    const matched = allCatalogCodes.filter(code => 
      collegeCourseCodes.has(code) || 
      Array.from(collegeCourseCodes).some(c => c.includes(code))
    );

    return matched.length > 0 ? matched : allCatalogCodes;
  }, [college]);

  // Selected branch
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>(() => {
    if (initialBranch && ENGINEERING_ROADMAPS[initialBranch.toUpperCase()]) {
      return initialBranch.toUpperCase();
    }
    return availableBranches[0] || 'CSE';
  });

  // Selected year (0 means "All 4 Years", or 1, 2, 3, 4)
  const [activeYear, setActiveYear] = useState<number>(1);
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Progress tracker state (persisted in localStorage)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('campusfind_roadmap_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleItemCompletion = (key: string) => {
    setCompletedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('campusfind_roadmap_progress', JSON.stringify(updated));
      return updated;
    });
  };

  // Get active roadmap data
  const currentRoadmap: BranchRoadmap = useMemo(() => {
    return ENGINEERING_ROADMAPS[selectedBranchCode] || ENGINEERING_ROADMAPS['CSE'];
  }, [selectedBranchCode]);

  // Calculate overall progress for this branch
  const branchProgress = useMemo(() => {
    let total = 0;
    let completed = 0;

    currentRoadmap.years.forEach(yr => {
      yr.skills.forEach(skill => {
        total += 1;
        if (completedItems[`${selectedBranchCode}-skill-${skill.name}`]) completed += 1;
      });
      yr.projects.forEach(proj => {
        total += 1;
        if (completedItems[`${selectedBranchCode}-proj-${proj.title}`]) completed += 1;
      });
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [currentRoadmap, selectedBranchCode, completedItems]);

  // Helper to copy text summary
  const handleCopyStudyPlan = () => {
    const summary = `### 4-Year Engineering Learning Roadmap: ${currentRoadmap.branchName} (${currentRoadmap.branchCode})
College: ${college.name} (${college.code}) | Placement Average: ₹${college.placement.averageLPA} LPA

${currentRoadmap.industryTrendSummary}

Recommended Tech Stack: ${currentRoadmap.recommendedTechStack.join(', ')}
Fresher Salary Bracket: ${currentRoadmap.averageFresherSalaryBracket}

${currentRoadmap.years.map(y => `
==============================
${y.yearName}
Theme: ${y.theme}
Focus: ${y.focusTagline}

Key Skills:
${y.skills.map(s => `- [ ] ${s.name} (${s.category})`).join('\n')}

Portfolio Projects:
${y.projects.map(p => `- ${p.title} [${p.difficulty}]: ${p.description}`).join('\n')}

Certifications:
${y.certifications.map(c => `- ${c.title} by ${c.issuer} (${c.importance})`).join('\n')}

Placement Milestones:
${y.placementMilestones.map(m => `* ${m}`).join('\n')}
`).join('\n')}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2500);
    }).catch(() => {});
  };

  const getBranchIcon = (code: string) => {
    switch (code) {
      case 'CSM':
        return <BrainCircuit className="w-4 h-4 text-purple-600" />;
      case 'ECE':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case 'CSD':
        return <Database className="w-4 h-4 text-amber-600" />;
      default:
        return <Code className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getDifficultyBadge = (diff: RoadmapProject['difficulty']) => {
    switch (diff) {
      case 'Beginner':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">Beginner</span>;
      case 'Intermediate':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">Intermediate</span>;
      case 'Advanced':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">Advanced</span>;
      case 'Capstone':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Capstone Project</span>;
    }
  };

  const getImportanceBadge = (imp: RoadmapCertification['importance']) => {
    switch (imp) {
      case 'Essential':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Essential Foundation</span>;
      case 'Industry Standard':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">Industry Standard</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">High Career Value</span>;
    }
  };

  const displayedYears = activeYear === 0 
    ? currentRoadmap.years 
    : currentRoadmap.years.filter(y => y.year === activeYear);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Toast */}
      {copiedPlan && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Complete 4-year study plan and project roadmap copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  Engineering Learning Path (2026–2030)
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Tailored for {college.name} ({college.code})
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-1">
                4-Year Branch Roadmap & Industry Masterplan
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyStudyPlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Study Plan</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {currentRoadmap.industryTrendSummary}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Typical Fresher CTC Bracket
              </span>
              <span className="text-sm font-black text-emerald-300 mt-0.5 block">
                {currentRoadmap.averageFresherSalaryBracket}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                College Avg Package
              </span>
              <span className="text-sm font-black text-amber-300 mt-0.5 block">
                ₹{college.placement.averageLPA} LPA ({college.placement.placementPercentage}% Placed)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Key Target Roles
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
                {currentRoadmap.topCareerRoles.slice(0, 2).join(' • ')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Personal Tracker</span>
                <span className="text-emerald-400">{branchProgress.percentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${branchProgress.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {branchProgress.completed} of {branchProgress.total} milestones achieved
              </span>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 flex-wrap text-xs text-slate-300">
            <span className="font-semibold text-white text-[11px]">Core Tech Stack:</span>
            {currentRoadmap.recommendedTechStack.map(tech => (
              <span key={tech} className="px-2 py-0.5 rounded-md bg-white/10 text-indigo-200 font-mono text-[11px] font-semibold">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* BRANCH SELECTOR NAVIGATION PILLS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Engineering Branch Offered at {college.code}:
          </span>
          <span className="text-[11px] text-slate-500">
            {availableBranches.length} branches analyzed
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
          {availableBranches.map(code => {
            const data = ENGINEERING_ROADMAPS[code];
            if (!data) return null;
            const isSelected = selectedBranchCode === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedBranchCode(code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={isSelected ? 'text-white' : ''}>
                  {getBranchIcon(code)}
                </span>
                <span>{data.branchCode}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {code === 'CSM' ? 'AI/ML' : code === 'ECE' ? 'VLSI' : code === 'CSD' ? 'Data' : 'Core'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* YEAR SELECTOR TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 1, label: 'Year 1: Foundations' },
            { id: 2, label: 'Year 2: Core Depth' },
            { id: 3, label: 'Year 3: Internships & Scale' },
            { id: 4, label: 'Year 4: Placements & Capstone' },
            { id: 0, label: 'View All 4 Years' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveYear(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeYear === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {onNavigateToCutoffs && (
          <button
            type="button"
            onClick={onNavigateToCutoffs}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{selectedBranchCode} Cutoffs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* YEAR BY YEAR CONTENT SECTION */}
      <div className="space-y-6">
        {displayedYears.map((yearData) => (
          <div 
            key={yearData.year}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-6"
          >
            {/* Year Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs">
                    Year {yearData.year}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {yearData.yearName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {yearData.theme}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 font-semibold max-w-sm">
                🎯 <strong>Goal:</strong> {yearData.focusTagline}
              </div>
            </div>

            {/* Grid 1: Skills & Competencies (with Interactive Checkboxes) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Key Technical Competencies & Syllabi</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Click to mark as learned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {yearData.skills.map(skill => {
                  const key = `${selectedBranchCode}-skill-${skill.name}`;
                  const isDone = Boolean(completedItems[key]);

                  return (
                    <button
                      key={skill.name}
                      type="button"
                      onClick={() => toggleItemCompletion(key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isDone
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50/60 border-slate-200/90 hover:bg-slate-100/70 text-slate-800'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                      <div className="space-y-1">
                        <span className={`text-xs font-bold leading-tight block ${isDone ? 'line-through text-emerald-900' : 'text-slate-900'}`}>
                          {skill.name}
                        </span>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                          {skill.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid 2: Real-World Portfolio Projects */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-purple-600" />
                <span>Resume-Ready Portfolio Projects</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {yearData.projects.map(proj => {
                  const key = `${selectedBranchCode}-proj-${proj.title}`;
                  const isDone = Boolean(completedItems[key]);

                  return (
                    <div 
                      key={proj.title}
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isDone 
                          ? 'bg-emerald-50/40 border-emerald-300' 
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getDifficultyBadge(proj.difficulty)}
                            <button
                              type="button"
                              onClick={() => toggleItemCompletion(key)}
                              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                            >
                              {isDone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                              <span>{isDone ? 'Built & Deployed' : 'Mark as Built'}</span>
                            </button>
                          </div>
                          <h5 className="text-sm font-extrabold text-slate-900">
                            {proj.title}
                          </h5>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {proj.description}
                      </p>

                      {/* Tech stack */}
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack.map(tech => (
                          <span key={tech} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-mono font-medium border border-slate-200">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Resume recruiter impact */}
                      <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-950">
                        💼 <strong>Recruiter Impact:</strong> {proj.resumeImpact}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid 3: Industry Certifications & Credentials */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Industry-Recognized Certifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {yearData.certifications.map(cert => (
                  <div key={cert.title} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {getImportanceBadge(cert.importance)}
                        <span className="text-[10px] font-semibold text-slate-500">
                          {cert.issuer}
                        </span>
                      </div>
                      <h6 className="text-xs font-bold text-slate-900">
                        {cert.title}
                      </h6>
                      <p className="text-[11px] text-slate-500">
                        {cert.description}
                      </p>
                    </div>

                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 pt-1 cursor-pointer"
                    >
                      <span>Certification Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid 4: Placement Readiness Milestones */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Year {yearData.year} Placement Milestones for {college.name} Drives:</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-slate-800">
                {yearData.placementMilestones.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ))}
      </div>

      {/* College-Specific Placement Alignment Footer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <h5 className="text-xs font-bold text-white">
              Targeting {college.shortName || college.name}&apos;s Campus Placements
            </h5>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Following this structured 4-year roadmap ensures you qualify for top-tier Day-1 placement slots at {college.name}, targeting recruiters like <strong>{college.placement.topRecruiters?.slice(0, 4).join(', ')}</strong> and surpassing the college average of <strong>₹{college.placement.averageLPA} LPA</strong>.
          </p>
        </div>

        {onNavigateToCutoffs && (
          <button
            type="button"
            onClick={onNavigateToCutoffs}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>View {selectedBranchCode} Cutoff Ranks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
