export type StateType = 'TS' | 'AP' | 'National' | string;

export type CollegeType = 'University' | 'Autonomous' | 'Affiliated' | 'Deemed University' | 'Institute of National Importance';

export type OwnershipType = 'Government' | 'Private';

export type ExamStream = 'jee-main' | 'jee-advanced' | 'eamcet';

export type ExamType = 'TS EAMCET' | 'AP EAMCET' | 'JEE Main' | 'JEE Advanced';

export interface BranchCutoff {
  branchCode: string; // CSE, IT, ECE, EEE, MECH, CIVIL, CSM, CSD, etc.
  branchName: string;
  closingRanks: {
    'OC': number;
    'BC-A'?: number;
    'BC-B'?: number;
    'BC-C'?: number;
    'BC-D'?: number;
    'BC-E'?: number;
    'SC'?: number;
    'ST'?: number;
    'EWS'?: number;
  };
  yearlyCutoffs?: {
    year: string;
    closingRanks: {
      'OC': number;
      'BC-A'?: number;
      'BC-B'?: number;
      'BC-C'?: number;
      'BC-D'?: number;
      'BC-E'?: number;
      'SC'?: number;
      'ST'?: number;
      'EWS'?: number;
    };
  }[];
}

export interface College {
  id: string;
  code: string; // Counseling code e.g. CBIT, VMEG, AUCE, JNTK
  name: string;
  shortName: string;
  slug: string;
  state: StateType;
  city: string;
  district: string;
  address: string;
  established: number;
  type: CollegeType;
  ownership: OwnershipType;
  affiliation: string; // e.g. JNTUH, OU, AU, JNTUK, Autonomous
  accreditation: {
    naac?: string; // A++, A+, A, B++
    nba?: boolean;
    nirfRank?: number; // 2024 NIRF Rank if within top 200
  };
  annualFee: number; // Official annual convenor tuition fee (₹)
  feeCategoryNote?: string;
  hostelFeeApprox?: number;
  exam: ExamType;
  examStream?: ExamStream;
  acceptedExams?: ExamType[];
  website: string;
  campusSizeAcres?: number;
  rating: number; // 1.0 - 5.0
  reviewCount: number;
  placement: {
    highestLPA: number;
    averageLPA: number;
    medianLPA: number;
    placementPercentage: number;
    topRecruiters: string[];
    totalOffers?: number;
    yearlyTrends?: {
      year: string;
      averageLPA: number;
      highestLPA?: number;
      offersCount?: number;
    }[];
  };
  courses: string[]; // ['CSE', 'CSM', 'CSD', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL']
  facilities: string[];
  cutoffs: BranchCutoff[];
  featured?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  transit?: {
    nearestBusStop?: string;
    nearestMetroStation?: string;
    nearestRailwayStation?: string;
    airportDistanceKm?: number;
    transitAccessibilityScore?: number; // 1-10
    highlights?: string[];
  };
  imageUrl?: string;
  images?: {
    url: string;
    caption: string;
    category?: 'Campus & Entrance' | 'Academic Block' | 'Library & Labs' | 'Auditorium & Sports' | 'Hostel & Life';
  }[];
}

export interface PredictorInput {
  exam: ExamType;
  examStream?: ExamStream;
  rank: number;
  category: 'OC' | 'BC-A' | 'BC-B' | 'BC-C' | 'BC-D' | 'BC-E' | 'SC' | 'ST' | 'EWS';
  preferredBranches: string[];
  preferredState: 'all' | 'TS' | 'AP';
  maxFee?: number;
  collegeType?: 'all' | 'Government' | 'Private' | 'Autonomous';
}

export interface PredictorResult {
  college: College;
  branchCode: string;
  branchName: string;
  cutoffRank: number;
  userRank: number;
  chance: 'Very High' | 'Good' | 'Possible' | 'Tough';
  chanceScore: number; // 0 - 100
  difference: number;
  notes: string;
}

export interface FilterState {
  searchQuery: string;
  state: 'all' | 'TS' | 'AP';
  city: string;
  branch: string;
  collegeType: string;
  ownership: string;
  maxFee: number;
  minRating: number;
  sortBy: 'rank' | 'fee-asc' | 'fee-desc' | 'rating' | 'placement';
  examStream?: ExamStream;
}

export interface CollegeReview {
  id: string;
  collegeId: string;
  collegeName?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  branch?: string;
  batch?: string;
  recommended?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ReservationCategory = 'OC' | 'BC-A' | 'BC-B' | 'BC-C' | 'BC-D' | 'BC-E' | 'SC' | 'ST' | 'EWS';

export interface CutoffAlert {
  id: string; // Document ID (equal to collegeId)
  collegeId: string;
  collegeCode: string;
  collegeName: string;
  state: StateType;
  userId: string;
  userEmail: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
  counselingCycle: string; // e.g. "2026-2027 EAMCET / Upcoming Counseling Cycle"
  category: ReservationCategory;
  branches: string[]; // List of branch codes e.g. ['ALL'] or ['CSE', 'ECE']
  triggerCondition: 'any_change' | 'significant_shift' | 'round_allotment';
  targetRank?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastNotifiedAt?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  collegeId: string;
  collegeName: string;
  collegeCode: string;
  title: string;
  message: string;
  type: 'cutoff_change' | 'counseling_round' | 'seat_allotment' | 'system';
  read: boolean;
  createdAt: string;
  cutoffDetails?: {
    branchCode: string;
    category: string;
    oldRank: number;
    newRank: number;
    difference: number;
    round: string;
  };
}

export interface MeritTrendItem {
  year: number;
  closingRank: number;
  closingMeritScore: number;
}

export interface CollegeMeritAdmissionTrend {
  collegeId: string;
  collegeName: string;
  collegeCode: string;
  city: string;
  state: 'TS' | 'AP';
  branchCode: string;
  branchName: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  historicalCutoffs: {
    category: ReservationCategory;
    trends: MeritTrendItem[];
  }[];
  trendStatus: 'rising' | 'stable' | 'easing';
  annualFee: number;
  averageLPA: number;
}

export type ScholarshipScope = 'State' | 'National' | 'Institutional';

export type ScholarshipEligibilityStatus = 'fully_eligible' | 'partially_eligible' | 'conditional' | 'not_eligible';

export interface StudentBackgroundProfile {
  domicileState: 'TS' | 'AP' | 'OTHER';
  category: ReservationCategory;
  eamcetRank: number;
  ipeMarks: number; // out of 600 group
  calculatedMeritScore: number; // 0 - 100
  annualFamilyIncome: number; // in INR
  gender: 'Female' | 'Male' | 'Other';
  isFirstGenerationLearner?: boolean;
  isSpeciallyAbled?: boolean;
  isSingleGirlChild?: boolean;
  isOrphanOrCovidAffected?: boolean;
  isMinorityCommunity?: boolean;
  isDefenseWard?: boolean;
}

export interface EvaluatedScholarship {
  id: string;
  title: string;
  provider: string;
  scope: ScholarshipScope;
  applicableStates: string[];
  description: string;
  coverageType: string;
  coverageAmount: number;
  coverageDescription: string;
  status: ScholarshipEligibilityStatus;
  verdict: string;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  guidanceTip: string;
  portalUrl: string;
  portalName: string;
  documentsRequired: string[];
  deadlineNotice: string;
  isDirectTuitionWaiver?: boolean;
}

