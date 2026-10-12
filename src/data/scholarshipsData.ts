import { College, StudentBackgroundProfile, EvaluatedScholarship } from '../types';

export const DEFAULT_STUDENT_PROFILE: StudentBackgroundProfile = {
  domicileState: 'TS',
  category: 'BC-B',
  eamcetRank: 6800,
  ipeMarks: 565,
  calculatedMeritScore: 78.4,
  annualFamilyIncome: 180000, // ₹1.8 Lakhs
  gender: 'Female',
  isFirstGenerationLearner: false,
  isSpeciallyAbled: false,
  isSingleGirlChild: true,
  isOrphanOrCovidAffected: false,
  isMinorityCommunity: false,
  isDefenseWard: false,
};

export const INCOME_SLABS = [
  { label: 'Below ₹1.5 Lakhs (BPL / White Ration Card)', value: 120000 },
  { label: '₹1.5 Lakhs – ₹2.5 Lakhs (Eligible for most state aids)', value: 200000 },
  { label: '₹2.5 Lakhs – ₹4.5 Lakhs (NSP & Central schemes)', value: 350000 },
  { label: '₹4.5 Lakhs – ₹8.0 Lakhs (AICTE Pragati / Saksham)', value: 650000 },
  { label: 'Above ₹8.0 Lakhs (Non-Creamy Layer Exceeded)', value: 1000000 },
];

/**
 * Evaluates all state, national, and college institutional scholarships
 * based on student merit score, EAMCET rank, background, and specific college attributes.
 */
export function evaluateScholarshipsForCollege(
  college: College,
  profile: StudentBackgroundProfile
): {
  scholarships: EvaluatedScholarship[];
  summary: {
    totalEligibleCount: number;
    maxTuitionCoverage: number;
    maxMaintenanceAllowance: number;
    effectiveNetTuition: number;
    recommendedPrimaryScheme: string;
    hasFullFeeReimbursement: boolean;
  };
} {
  const results: EvaluatedScholarship[] = [];
  const collegeFee = college.annualFee || 95000;
  const isCollegeInTS = college.state === 'TS';
  const isCollegeInAP = college.state === 'AP';
  const isGovtCollege = college.ownership === 'Government' || college.type === 'University';

  // -------------------------------------------------------------
  // 1. TELANGANA STATE SCHEMES
  // -------------------------------------------------------------
  if (isCollegeInTS) {
    // 1A. TS ePASS Post-Matric Fee Reimbursement (RTF)
    const isTsDomicile = profile.domicileState === 'TS';
    const isScSt = profile.category === 'SC' || profile.category === 'ST';
    const isBcEbcMin = ['BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EWS'].includes(profile.category) || profile.isMinorityCommunity;
    const isOc = profile.category === 'OC' && !profile.isMinorityCommunity;
    
    // Income limits in TS ePASS: SC/ST <= 2L, BC/EBC <= 1.5L (rural) / 2L (urban)
    const scStIncomeOk = profile.annualFamilyIncome <= 200000;
    const bcIncomeOk = profile.annualFamilyIncome <= 200000;

    let rtfStatus: 'fully_eligible' | 'partially_eligible' | 'conditional' | 'not_eligible' = 'not_eligible';
    let rtfAmount = 0;
    let rtfDescription = '';
    let rtfVerdict = '';
    const rtfMatched: string[] = [];
    const rtfUnmatched: string[] = [];

    if (isTsDomicile) {
      rtfMatched.push('Telangana domicile candidate');
      rtfMatched.push(`Admitted via convenor quota to ${college.name} (${college.code})`);
    } else {
      rtfUnmatched.push('Requires Telangana State Domicile (Non-local candidate)');
    }

    if (isScSt) {
      rtfMatched.push(`Reserved Category: ${profile.category} eligible for 100% Tuition Fee Reimbursement`);
      if (scStIncomeOk) {
        rtfMatched.push(`Annual family income ₹${(profile.annualFamilyIncome / 100000).toFixed(1)}L is below ₹2.0L threshold`);
        if (isTsDomicile) {
          rtfStatus = 'fully_eligible';
          rtfAmount = collegeFee;
          rtfDescription = `100% Tuition Fee Reimbursed: ₹${collegeFee.toLocaleString('en-IN')}/year`;
          rtfVerdict = 'Eligible for 100% Full Convenor Tuition Reimbursement by Dept of Scheduled Caste/Tribe Welfare.';
        }
      } else {
        rtfUnmatched.push(`Family income exceeds ₹2.0 Lakhs/annum limit for SC/ST ePASS`);
        rtfStatus = 'conditional';
        rtfAmount = 0;
        rtfDescription = 'Income certificate exceeds standard limits';
        rtfVerdict = 'Income threshold exceeded. Valid income certificate or white ration card required.';
      }
    } else if (isBcEbcMin) {
      rtfMatched.push(`Category: ${profile.category} covered under BC Welfare / Minorities Dept.`);
      if (bcIncomeOk) {
        rtfMatched.push(`Annual family income ₹${(profile.annualFamilyIncome / 100000).toFixed(1)}L is within ₹1.5L–₹2.0L limit`);
        
        // TS Golden Rule: Rank < 10,000 in EAMCET gets 100% fee reimbursement in any college!
        // If rank >= 10,000, Govt colleges get 100%, but Private colleges get capped at ₹35,000
        if (profile.eamcetRank <= 10000) {
          rtfMatched.push(`TS EAMCET Rank ${profile.eamcetRank.toLocaleString('en-IN')} ≤ 10,000 unlocks 100% Tuition Waiver in Private & Autonomous colleges`);
          if (isTsDomicile) {
            rtfStatus = 'fully_eligible';
            rtfAmount = collegeFee;
            rtfDescription = `100% Fee Reimbursement (Rank ≤ 10,000 privilege): ₹${collegeFee.toLocaleString('en-IN')}/year`;
            rtfVerdict = 'Complete 100% tuition reimbursement approved due to top-10k convenor rank & income eligibility.';
          }
        } else if (isGovtCollege) {
          rtfMatched.push(`Government/University college (${college.type}) qualifies for full tuition support`);
          if (isTsDomicile) {
            rtfStatus = 'fully_eligible';
            rtfAmount = collegeFee;
            rtfDescription = `100% University Fee Reimbursed: ₹${collegeFee.toLocaleString('en-IN')}/year`;
            rtfVerdict = 'University convenor fee fully covered under TS Govt social welfare grant.';
          }
        } else {
          // Rank > 10,000 in private college: capped at ₹35,000/year
          const cappedAmount = Math.min(collegeFee, 35000);
          if (isTsDomicile) {
            rtfStatus = 'partially_eligible';
            rtfAmount = cappedAmount;
            rtfDescription = `Standard AFRC Cap: ₹${cappedAmount.toLocaleString('en-IN')}/year (Balance ₹${(collegeFee - cappedAmount).toLocaleString('en-IN')} payable)`;
            rtfVerdict = `Eligible for government capped reimbursement of ₹35,000/yr. As TS EAMCET rank is ${profile.eamcetRank.toLocaleString('en-IN')} (>10,000), remainder is borne by candidate.`;
          }
          rtfUnmatched.push(`TS EAMCET rank is above 10,000 (Ranks ≤ 10,000 qualify for full ₹${(collegeFee/1000).toFixed(0)}k waiver in private colleges)`);
        }
      } else {
        rtfUnmatched.push(`Family income ₹${(profile.annualFamilyIncome / 100000).toFixed(1)}L exceeds ₹1.5L–₹2.0L threshold`);
        rtfStatus = 'not_eligible';
        rtfVerdict = 'Annual family income exceeds the TS ePASS ceiling of ₹2.0 Lakhs.';
      }
    } else {
      // OC general
      rtfUnmatched.push('OC (General) without EWS certificate is not covered under TS ePASS');
      rtfStatus = 'not_eligible';
      rtfVerdict = 'TS ePASS fee reimbursement requires SC, ST, BC, EBC, Minority, or EWS quota status with valid income certificate.';
    }

    results.push({
      id: 'ts-epass-rtf',
      title: 'TS ePASS Post-Matric Fee Reimbursement (RTF)',
      provider: 'Govt. of Telangana (SC/ST/BC/Minority Welfare Dept.)',
      scope: 'State',
      applicableStates: ['TS'],
      description: 'Official Government of Telangana scheme providing 100% or capped tuition fee reimbursement directly to collegiate institutions for convenor-allotted candidates.',
      coverageType: rtfStatus === 'fully_eligible' ? 'Full Tuition' : 'Tuition Capped',
      coverageAmount: rtfAmount,
      coverageDescription: rtfDescription || `Up to ₹${collegeFee.toLocaleString('en-IN')}/year`,
      status: rtfStatus,
      verdict: rtfVerdict,
      matchedCriteria: rtfMatched,
      unmatchedCriteria: rtfUnmatched,
      guidanceTip: profile.eamcetRank <= 10000 
        ? 'Your EAMCET rank is below 10,000! You get full fee waiver even in top private institutes like CBIT, Vasavi, and VNR VJIET.'
        : 'Tip: Candidate must apply on the TS ePASS portal within 45 days of counseling admission with Meeseva income & caste certificates.',
      portalUrl: 'https://telanganaepass.cgg.gov.in',
      portalName: 'Telangana ePASS Portal',
      documentsRequired: [
        'EAMCET Convenor Allotment Order & Joining Report',
        'Meeseva Income Certificate (Issued within current financial year)',
        'Caste/Community Certificate from Revenue Authorities',
        'Intermediate Marks Memo (IPE) & TC',
        'Aadhaar Linked Bank Account Passbook',
      ],
      deadlineNotice: 'Window opens during Counseling Round 1 seat reporting (August – October).',
      isDirectTuitionWaiver: true,
    });

    // 1B. TS ePASS Maintenance Fee (MTF / Mess Allowance)
    const mtfEligible = isTsDomicile && (isScSt || isBcEbcMin) && (scStIncomeOk || bcIncomeOk);
    const mtfAmount = 18000;
    results.push({
      id: 'ts-epass-mtf',
      title: 'TS ePASS Maintenance Fee & Boarding Allowance (MTF)',
      provider: 'Directorate of Social Welfare, Govt. of Telangana',
      scope: 'State',
      applicableStates: ['TS'],
      description: 'Quarterly subsistence and boarding allowance disbursed directly to the student’s bank account to support mess charges and living costs.',
      coverageType: 'Hostel & Maintenance',
      coverageAmount: mtfEligible ? mtfAmount : 0,
      coverageDescription: '₹1,500 – ₹2,000 per month (Approx ₹18,000/year)',
      status: mtfEligible ? 'fully_eligible' : 'not_eligible',
      verdict: mtfEligible 
        ? 'Qualified for quarterly direct benefit transfer (DBT) living subsidy based on category and income.'
        : 'Requires TS domicile and valid low-income verification.',
      matchedCriteria: mtfEligible 
        ? ['Eligible for post-matric social welfare benefits', 'Enrolled in recognized technical degree program'] 
        : [],
      unmatchedCriteria: mtfEligible ? [] : ['Requires active RTF qualification and approved hostel verification'],
      guidanceTip: 'Hostel warden or college principal verification is mandatory during biometric authentication.',
      portalUrl: 'https://telanganaepass.cgg.gov.in',
      portalName: 'Telangana ePASS Portal',
      documentsRequired: ['College Hostel / Mess Certification', 'Aadhaar Biometric Authentication', 'Active NPCI mapped bank account'],
      deadlineNotice: 'Verified at college level post-admission.',
      isDirectTuitionWaiver: false,
    });
  }

  // -------------------------------------------------------------
  // 2. ANDHRA PRADESH STATE SCHEMES
  // -------------------------------------------------------------
  if (isCollegeInAP) {
    // 2A. Jagananna Vidya Deevena (JVD) - 100% Fee Reimbursement
    const isApDomicile = profile.domicileState === 'AP';
    const isIncomeUnder25L = profile.annualFamilyIncome <= 250000;
    const isCategoryEligible = profile.category !== 'OC' || true; // JVD applies to SC, ST, BC, EBC, Kapu, Minority, and Differently abled (income <= 2.5L)

    let jvdStatus: 'fully_eligible' | 'conditional' | 'not_eligible' = 'not_eligible';
    let jvdAmount = 0;
    const jvdMatched: string[] = [];
    const jvdUnmatched: string[] = [];

    if (isApDomicile) {
      jvdMatched.push('Andhra Pradesh state domicile candidate');
      jvdMatched.push(`Admitted through AP EAMCET convenor quota at ${college.name} (${college.code})`);
    } else {
      jvdUnmatched.push('Requires AP State Domicile (Candidate is registered outside AP)');
    }

    if (isIncomeUnder25L) {
      jvdMatched.push(`Annual family income ₹${(profile.annualFamilyIncome/100000).toFixed(1)}L is well within ₹2.50 Lakhs Jnanabhumi ceiling`);
    } else {
      jvdUnmatched.push(`Family income exceeds ₹2.50 Lakhs limit (taxpayer/land ceiling check applies)`);
    }

    if (isApDomicile && isIncomeUnder25L) {
      jvdStatus = 'fully_eligible';
      jvdAmount = collegeFee;
    } else if (isApDomicile) {
      jvdStatus = 'conditional';
    }

    results.push({
      id: 'ap-jvd-tuition',
      title: 'Jagananna Vidya Deevena (JVD) – 100% Tuition Fee Reimbursement',
      provider: 'Higher Education & Social Welfare Dept., Govt. of Andhra Pradesh',
      scope: 'State',
      applicableStates: ['AP'],
      description: 'Flagship AP government initiative depositing 100% of the prescribed convenor tuition fees directly into the bank accounts of mothers of eligible engineering students.',
      coverageType: 'Full Tuition',
      coverageAmount: jvdAmount,
      coverageDescription: `100% Tuition Fee Reimbursed: ₹${collegeFee.toLocaleString('en-IN')}/year in 4 quarterly installments`,
      status: jvdStatus,
      verdict: jvdStatus === 'fully_eligible' 
        ? `Fully eligible for 100% fee compensation of ₹${collegeFee.toLocaleString('en-IN')}/year under Jnanabhumi.`
        : isApDomicile 
        ? 'Subject to family income verification (must be non-income taxpayer with <2.5L income).'
        : 'AP Domicile is mandatory to claim Jagananna Vidya Deevena.',
      matchedCriteria: jvdMatched,
      unmatchedCriteria: jvdUnmatched,
      guidanceTip: 'Attendance must be maintained above 75% per semester in biometric records to receive quarterly disbursements.',
      portalUrl: 'https://jnanabhumi.ap.gov.in',
      portalName: 'AP Jnanabhumi Portal',
      documentsRequired: [
        'AP EAMCET Rank Card & Convenor Allotment Letter',
        'Mother’s Aadhaar Linked Bank Account with active NPCI seeding',
        'Integrated Caste & Income Certificate issued by Grama/Ward Sachivalayam',
        'Ration Card / Rice Card (White)',
        'Non-Taxpayer Self Declaration',
      ],
      deadlineNotice: 'Verified at Grama/Ward Sachivalayam during admission cycle.',
      isDirectTuitionWaiver: true,
    });

    // 2B. Jagananna Vasathi Deevena
    const vasathiEligible = isApDomicile && isIncomeUnder25L;
    const vasathiAmount = 20000;
    results.push({
      id: 'ap-jvd-vasathi',
      title: 'Jagananna Vasathi Deevena (Hostel & Boarding Assistance)',
      provider: 'Grama / Ward Sachivalayam & Welfare Dept., Govt. of AP',
      scope: 'State',
      applicableStates: ['AP'],
      description: 'Annual financial grant of ₹20,000 for degree engineering students provided in two tranches of ₹10,000 to cover food, hostel, and boarding charges.',
      coverageType: 'Hostel & Maintenance',
      coverageAmount: vasathiEligible ? vasathiAmount : 0,
      coverageDescription: '₹20,000/year (disbursed in 2 tranches of ₹10,000 each)',
      status: vasathiEligible ? 'fully_eligible' : 'not_eligible',
      verdict: vasathiEligible 
        ? 'Eligible for ₹20,000/year annual living and accommodation support.'
        : 'Requires AP domicile and validated Rice Card / Sachivalayam verification.',
      matchedCriteria: vasathiEligible ? ['Qualified for JVD benefits', 'Enrolled in 4-year B.Tech program'] : [],
      unmatchedCriteria: vasathiEligible ? [] : ['Requires AP Sachivalayam welfare clearance'],
      guidanceTip: 'Funds are credited to the mother’s account in April and July of each academic year.',
      portalUrl: 'https://jnanabhumi.ap.gov.in',
      portalName: 'AP Jnanabhumi Portal',
      documentsRequired: ['Mother’s active DBT Bank Account', 'Biometric Sachivalayam verification', 'Hostel status declaration'],
      deadlineNotice: 'Bi-annual disbursement cycle.',
      isDirectTuitionWaiver: false,
    });
  }

  // -------------------------------------------------------------
  // 3. NATIONAL & CENTRAL GOVERNMENT SCHEMES
  // -------------------------------------------------------------
  
  // 3A. AICTE Pragati Scholarship for Girl Students
  const isFemale = profile.gender === 'Female';
  const aicteIncomeOk = profile.annualFamilyIncome <= 800000;
  const aicteMeritOk = profile.calculatedMeritScore >= 60 || profile.ipeMarks >= 450;
  
  let pragatiStatus: 'fully_eligible' | 'conditional' | 'not_eligible' = 'not_eligible';
  const pragatiMatched: string[] = [];
  const pragatiUnmatched: string[] = [];

  if (isFemale) {
    pragatiMatched.push('Female student candidate (AICTE Pragati mandate)');
  } else {
    pragatiUnmatched.push('Exclusive for female candidates admitted to AICTE approved technical programs');
  }

  if (aicteIncomeOk) {
    pragatiMatched.push(`Family income ₹${(profile.annualFamilyIncome/100000).toFixed(1)}L is well below ₹8.0 Lakhs threshold`);
  } else {
    pragatiUnmatched.push(`Family income exceeds ₹8.0 Lakhs threshold`);
  }

  if (aicteMeritOk) {
    pragatiMatched.push(`Strong academic merit: ${profile.calculatedMeritScore.toFixed(1)} merit score / ${profile.ipeMarks} IPE marks`);
  }

  pragatiMatched.push(`College (${college.code}) is an AICTE recognized institution`);

  if (isFemale && aicteIncomeOk) {
    pragatiStatus = 'fully_eligible';
  } else if (isFemale) {
    pragatiStatus = 'conditional';
  }

  results.push({
    id: 'aicte-pragati',
    title: 'AICTE Pragati Scholarship Scheme for Girl Students',
    provider: 'All India Council for Technical Education (AICTE), Ministry of Education',
    scope: 'National',
    applicableStates: ['TS', 'AP', 'National'],
    description: 'Empowers meritorious female students entering technical degree courses with an annual scholarship to support educational expenses.',
    coverageType: 'Fixed Amount',
    coverageAmount: pragatiStatus === 'fully_eligible' ? 50000 : 0,
    coverageDescription: '₹50,000 per annum for all 4 years of B.Tech (Total ₹2,00,000)',
    status: pragatiStatus,
    verdict: pragatiStatus === 'fully_eligible'
      ? 'Fully eligible! Girl students with family income < ₹8L admitted to AICTE degree colleges receive ₹50,000/yr.'
      : isFemale 
      ? 'Requires income verification under ₹8 Lakhs per annum.'
      : 'Open strictly to female candidates (up to 2 girls per family).',
    matchedCriteria: pragatiMatched,
    unmatchedCriteria: pragatiUnmatched,
    guidanceTip: 'Maximum two girl children per family are eligible. Selection is purely based on 10+2 / Intermediate percentage merit.',
    portalUrl: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal (NSP)',
    documentsRequired: [
      'Intermediate / 10+2 Marks Memo',
      'AICTE College Admission Proof & Tuition Fee Receipt',
      'Income Certificate (Issued by competent authority, ≤ ₹8 Lakhs)',
      'Single Girl Child / Family Affidavit (Declaration on 100 Rs Stamp Paper)',
      'Aadhaar seeded bank account',
    ],
    deadlineNotice: 'Applications open on NSP portal from September to November each year.',
    isDirectTuitionWaiver: false,
  });

  // 3B. NSP Central Sector Scheme of Scholarship (CSSS) for College & University Students
  const csssMeritOk = profile.ipeMarks >= 480 || profile.calculatedMeritScore >= 75; // Top 20th percentile (usually >80%)
  const csssIncomeOk = profile.annualFamilyIncome <= 450000;
  
  let csssStatus: 'fully_eligible' | 'conditional' | 'not_eligible' = 'not_eligible';
  const csssMatched: string[] = [];
  const csssUnmatched: string[] = [];

  if (csssMeritOk) {
    csssMatched.push(`Intermediate marks (${profile.ipeMarks}/600) qualify for top-20th percentile board cutoff`);
  } else {
    csssUnmatched.push('Requires >80th percentile in State Intermediate Board (IPE)');
  }

  if (csssIncomeOk) {
    csssMatched.push(`Family income ₹${(profile.annualFamilyIncome/100000).toFixed(1)}L is below ₹4.5 Lakhs limit`);
  } else {
    csssUnmatched.push(`Family income exceeds the ₹4.5 Lakhs threshold`);
  }

  if (csssMeritOk && csssIncomeOk) {
    csssStatus = 'fully_eligible';
  } else if (csssMeritOk) {
    csssStatus = 'conditional';
  }

  results.push({
    id: 'nsp-central-sector',
    title: 'Central Sector Scheme of Scholarship (CSSS)',
    provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
    scope: 'National',
    applicableStates: ['TS', 'AP', 'National'],
    description: 'Awarded to top 20th percentile board graduates enrolled in regular degree programs with parental income under ₹4.5 Lakhs.',
    coverageType: 'Fixed Amount',
    coverageAmount: csssStatus === 'fully_eligible' ? 12000 : 0,
    coverageDescription: '₹12,000/year (1st to 3rd year) & ₹20,000 in 4th year (Total ₹56,000)',
    status: csssStatus,
    verdict: csssStatus === 'fully_eligible'
      ? 'Eligible for Central Sector direct bank transfer based on stellar IPE board merit.'
      : 'Requires high IPE board percentile (>80%) and income below ₹4.5 Lakhs.',
    matchedCriteria: csssMatched,
    unmatchedCriteria: csssUnmatched,
    guidanceTip: 'Must maintain minimum 50% marks and 75% attendance in engineering semester exams for annual renewal.',
    portalUrl: 'https://scholarships.gov.in',
    portalName: 'National Scholarship Portal (NSP)',
    documentsRequired: ['Class 12 / IPE Marks Sheet', 'Income Certificate', 'College Bonafide Certificate', 'Bank Passbook'],
    deadlineNotice: 'NSP application cycle active August – December.',
    isDirectTuitionWaiver: false,
  });

  // 3C. AICTE Saksham Scholarship (For Specially Abled Students)
  if (profile.isSpeciallyAbled) {
    results.push({
      id: 'aicte-saksham',
      title: 'AICTE Saksham Scholarship Scheme',
      provider: 'AICTE, Ministry of Education',
      scope: 'National',
      applicableStates: ['TS', 'AP', 'National'],
      description: 'Special technical grant designed for specially-abled students with disability not less than 40% admitted to 1st year technical programs.',
      coverageType: 'Fixed Amount',
      coverageAmount: 50000,
      coverageDescription: '₹50,000 per year for 4 years of study',
      status: 'fully_eligible',
      verdict: 'Qualified under AICTE Saksham framework for candidates with validated disability certificate.',
      matchedCriteria: ['Disability criteria met (≥40%)', 'Enrolled in AICTE recognized institution', 'Income within prescribed limits'],
      unmatchedCriteria: [],
      guidanceTip: 'Upload UDID card or competent CMO medical board disability certificate on NSP.',
      portalUrl: 'https://scholarships.gov.in',
      portalName: 'National Scholarship Portal',
      documentsRequired: ['UDID Disability Certificate (≥40%)', 'Admission Allotment Letter', 'Income Certificate'],
      deadlineNotice: 'NSP window opens in autumn.',
      isDirectTuitionWaiver: false,
    });
  }

  // 3D. Ministry of Minority Affairs (MoMA) Merit-cum-Means
  if (profile.isMinorityCommunity) {
    const momaIncomeOk = profile.annualFamilyIncome <= 250000;
    const momaStatus = momaIncomeOk ? 'fully_eligible' : 'conditional';
    results.push({
      id: 'moma-mcm',
      title: 'Merit-cum-Means Scholarship for Professional & Technical Courses (MoMA)',
      provider: 'Ministry of Minority Affairs, Govt. of India',
      scope: 'National',
      applicableStates: ['TS', 'AP', 'National'],
      description: 'Targeted support for meritorious students belonging to notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) pursuing professional engineering.',
      coverageType: 'Fixed Amount',
      coverageAmount: momaIncomeOk ? 30000 : 0,
      coverageDescription: '₹20,000/year course fee + ₹10,000 maintenance allowance (₹30,000/yr)',
      status: momaStatus,
      verdict: momaIncomeOk 
        ? 'Eligible under National Minority Welfare framework with income under ₹2.5 Lakhs.'
        : 'Requires family income validation under ₹2.5 Lakhs.',
      matchedCriteria: ['Notified minority community member', 'Admitted to recognized technical course'],
      unmatchedCriteria: momaIncomeOk ? [] : ['Income exceeds ₹2.50 Lakhs limit'],
      guidanceTip: 'Selection is made based on state minority quota and Intermediate marks percentage.',
      portalUrl: 'https://scholarships.gov.in',
      portalName: 'National Scholarship Portal',
      documentsRequired: ['Self-Declaration of Minority Community', 'Income Certificate', 'IPE Marks Memo'],
      deadlineNotice: 'Autumn NSP cycle.',
      isDirectTuitionWaiver: false,
    });
  }

  // 3E. PMSS for Wards of Ex-Servicemen & CAPF
  if (profile.isDefenseWard) {
    const pmssAmount = profile.gender === 'Female' ? 36000 : 30000;
    results.push({
      id: 'pmss-defense',
      title: 'Prime Minister’s Scholarship Scheme (PMSS) for Wards of Defense & CAPF',
      provider: 'Kendriya Sainik Board (KSB) / WARB, Ministry of Home Affairs & Defense',
      scope: 'National',
      applicableStates: ['TS', 'AP', 'National'],
      description: 'Special scholarship honoring wards of Ex-Servicemen, Armed Forces, Coast Guard, and Central Armed Police Forces.',
      coverageType: 'Fixed Amount',
      coverageAmount: pmssAmount,
      coverageDescription: profile.gender === 'Female' ? '₹36,000/year (₹3,000/month)' : '₹30,000/year (₹2,500/month)',
      status: 'fully_eligible',
      verdict: 'Eligible based on Defense/CAPF ward declaration and minimum 60% in 10+2.',
      matchedCriteria: ['Wards of Defense/CAPF service personnel', 'Minimum 60% marks in 10+2'],
      unmatchedCriteria: [],
      guidanceTip: 'Apply via the KSB web portal with ESM discharge book and PPO.',
      portalUrl: 'https://ksb.gov.in',
      portalName: 'Kendriya Sainik Board Portal',
      documentsRequired: ['Discharge Book / PPO Copy', 'Bonafide Certificate', '10+2 Mark Sheet (Minimum 60%)'],
      deadlineNotice: 'KSB portal open till November 30.',
      isDirectTuitionWaiver: false,
    });
  }

  // -------------------------------------------------------------
  // 4. COLLEGE-SPECIFIC & INSTITUTIONAL MERIT ENDOWMENTS
  // -------------------------------------------------------------
  const isHighTier = (college.accreditation?.nirfRank && college.accreditation.nirfRank <= 150) || 
                     college.type === 'University' || 
                     college.type === 'Autonomous' ||
                     ['CBIT', 'VNRV', 'VCE', 'CVR', 'AUCE', 'JNTK', 'VRSEC', 'GMRIT'].includes(college.code);

  // 4A. Institutional Merit Waiver (Top Ranks in EAMCET)
  let instMeritStatus: 'fully_eligible' | 'partially_eligible' | 'conditional' | 'not_eligible' = 'not_eligible';
  let instMeritAmount = 0;
  let instMeritDesc = '';
  const instMeritMatched: string[] = [];
  const instMeritUnmatched: string[] = [];

  if (profile.eamcetRank <= 2500 || profile.calculatedMeritScore >= 85) {
    instMeritStatus = 'fully_eligible';
    instMeritAmount = Math.round(collegeFee * 0.5); // 50% tuition discount
    instMeritDesc = `50% Academic Merit Waiver: ₹${instMeritAmount.toLocaleString('en-IN')}/year`;
    instMeritMatched.push(`Outstanding Convenor Rank: ${profile.eamcetRank.toLocaleString('en-IN')} (≤ 2,500)`);
    instMeritMatched.push(`Calculated Merit Score: ${profile.calculatedMeritScore.toFixed(1)}/100`);
  } else if (profile.eamcetRank <= 7500 || profile.calculatedMeritScore >= 75) {
    instMeritStatus = 'partially_eligible';
    instMeritAmount = Math.round(collegeFee * 0.25); // 25% tuition discount
    instMeritDesc = `25% Dean's Merit Honor Concession: ₹${instMeritAmount.toLocaleString('en-IN')}/year`;
    instMeritMatched.push(`Top Quota Rank: ${profile.eamcetRank.toLocaleString('en-IN')} qualifies for 2nd tier merit honors`);
  } else {
    instMeritStatus = 'not_eligible';
    instMeritDesc = 'Rank threshold not met for institute merit waiver';
    instMeritUnmatched.push(`Institute merit awards typically require EAMCET Rank ≤ 7,500 (Current: ${profile.eamcetRank.toLocaleString('en-IN')})`);
  }

  if (isHighTier) {
    results.push({
      id: `${college.code.toLowerCase()}-merit-waiver`,
      title: `${college.shortName || college.name} Governing Board Merit Scholarship`,
      provider: `${college.name} Endowment & Academic Council`,
      scope: 'Institutional',
      applicableStates: [college.state],
      description: `Internal merit award administered by ${college.shortName || college.name} honoring top-ranking convenor admissions with upfront tuition reductions.`,
      coverageType: 'Merit Concession',
      coverageAmount: instMeritAmount,
      coverageDescription: instMeritDesc || '25% – 50% tuition concession for top percentile admissions',
      status: instMeritStatus,
      verdict: instMeritStatus === 'fully_eligible' 
        ? `Qualifies for 50% institution tuition waiver (approx ₹${instMeritAmount.toLocaleString('en-IN')}/yr) for top rank excellence.`
        : instMeritStatus === 'partially_eligible'
        ? `Qualifies for 25% institution tuition concession (approx ₹${instMeritAmount.toLocaleString('en-IN')}/yr).`
        : 'Requires top 7,500 rank or score >75 to qualify for internal college merit discount.',
      matchedCriteria: instMeritMatched,
      unmatchedCriteria: instMeritUnmatched,
      guidanceTip: 'Awarded automatically at the administrative office during certificate submission with rank card verification.',
      portalUrl: college.website,
      portalName: `${college.shortName || college.code} Official Portal`,
      documentsRequired: ['EAMCET Rank Card', 'Seat Allotment Order', '10+2 Merit Certificate'],
      deadlineNotice: 'Verified at college administrative office upon orientation.',
      isDirectTuitionWaiver: true,
    });
  }

  // 4B. College Alumni & Trust Deserving Student Support
  const alumniEligible = profile.annualFamilyIncome <= 250000 && (profile.ipeMarks >= 520 || profile.calculatedMeritScore >= 70);
  const alumniAmount = 25000;
  results.push({
    id: `${college.code.toLowerCase()}-alumni-aid`,
    title: `${college.shortName || college.name} Alumni Association Need-Based Grant`,
    provider: `${college.shortName || college.name} Global Alumni Foundation`,
    scope: 'Institutional',
    applicableStates: [college.state],
    description: `Endowed fund supported by distinguished alumni of ${college.shortName || college.name} providing laptops, books, and fee stipends for hardworking students facing financial constraints.`,
    coverageType: 'Fixed Amount',
    coverageAmount: alumniEligible ? alumniAmount : 0,
    coverageDescription: '₹25,000 annual book, laptop & contingency grant',
    status: alumniEligible ? 'fully_eligible' : 'conditional',
    verdict: alumniEligible 
      ? 'Eligible for alumni foundation annual stipend based on economic need and consistent high school marks.'
      : 'Requires family income under ₹2.5 Lakhs and solid academic standing.',
    matchedCriteria: alumniEligible ? ['Economic need verified', 'IPE academic performance ≥ 85%'] : [],
    unmatchedCriteria: alumniEligible ? [] : ['Requires family income < ₹2.5L and merit recommendation'],
    guidanceTip: 'Submit application to the Dean of Student Affairs in Semester 1 along with family income statement.',
    portalUrl: college.website,
    portalName: 'Alumni Relations Cell',
    documentsRequired: ['Family Income Proof', 'Statement of Purpose / Need', 'Semester 1 Enrollment Card'],
    deadlineNotice: 'Announced within first month of campus induction.',
    isDirectTuitionWaiver: false,
  });

  // -------------------------------------------------------------
  // CALCULATE AGGREGATE SUMMARY
  // -------------------------------------------------------------
  // What is the max direct tuition waiver?
  const directWaivers = results.filter(r => r.isDirectTuitionWaiver && (r.status === 'fully_eligible' || r.status === 'partially_eligible'));
  const maxTuitionCoverage = Math.min(collegeFee, directWaivers.reduce((max, r) => Math.max(max, r.coverageAmount), 0));
  
  // Additional non-waiver grants (maintenance, AICTE Pragati, etc.)
  const maintenanceGrants = results.filter(r => !r.isDirectTuitionWaiver && r.status === 'fully_eligible');
  const maxMaintenanceAllowance = maintenanceGrants.reduce((sum, r) => sum + r.coverageAmount, 0);

  const effectiveNetTuition = Math.max(0, collegeFee - maxTuitionCoverage);
  const eligibleCount = results.filter(r => r.status === 'fully_eligible' || r.status === 'partially_eligible').length;
  
  let primaryScheme = 'Government Scholarship';
  if (isCollegeInTS && directWaivers.some(r => r.id === 'ts-epass-rtf')) {
    primaryScheme = 'TS ePASS Fee Reimbursement';
  } else if (isCollegeInAP && directWaivers.some(r => r.id === 'ap-jvd-tuition')) {
    primaryScheme = 'AP Jagananna Vidya Deevena (JVD)';
  } else if (results.some(r => r.id === 'aicte-pragati' && r.status === 'fully_eligible')) {
    primaryScheme = 'AICTE Pragati Scheme';
  } else if (directWaivers.length > 0) {
    primaryScheme = directWaivers[0].title;
  }

  return {
    scholarships: results,
    summary: {
      totalEligibleCount: eligibleCount,
      maxTuitionCoverage,
      maxMaintenanceAllowance,
      effectiveNetTuition,
      recommendedPrimaryScheme: primaryScheme,
      hasFullFeeReimbursement: maxTuitionCoverage >= collegeFee,
    },
  };
}
