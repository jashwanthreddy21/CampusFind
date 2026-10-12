import { ReservationCategory, CollegeMeritAdmissionTrend } from '../types';

/**
 * Estimate normalized EAMCET examination marks (out of 160) from convenor state rank.
 * Grounded on historical TS EAMCET & AP EAMCET marks vs rank distribution curves.
 */
export function estimateEamcetMarksFromRank(rank: number): number {
  if (rank <= 1) return 158;
  if (rank <= 10) return 155;
  if (rank <= 50) return 150;
  if (rank <= 100) return 145;
  if (rank <= 250) return 140;
  if (rank <= 500) return 134;
  if (rank <= 1000) return 126;
  if (rank <= 2000) return 118;
  if (rank <= 3500) return 110;
  if (rank <= 5000) return 104;
  if (rank <= 7500) return 97;
  if (rank <= 10000) return 92;
  if (rank <= 15000) return 84;
  if (rank <= 20000) return 78;
  if (rank <= 30000) return 70;
  if (rank <= 45000) return 61;
  if (rank <= 60000) return 55;
  if (rank <= 80000) return 48;
  if (rank <= 100000) return 43;
  if (rank <= 125000) return 39;
  if (rank <= 150000) return 36;
  return Math.max(30, Math.round(160 - 22 * Math.log(rank)));
}

/**
 * Estimate state rank from raw or normalized EAMCET examination marks (out of 160).
 */
export function estimateRankFromEamcetMarks(marks: number): number {
  const clamped = Math.min(160, Math.max(30, marks));
  if (clamped >= 155) return Math.round(1 + (160 - clamped) * 2);
  if (clamped >= 145) return Math.round(15 + (155 - clamped) * 8.5);
  if (clamped >= 135) return Math.round(100 + (145 - clamped) * 40);
  if (clamped >= 125) return Math.round(500 + (135 - clamped) * 60);
  if (clamped >= 115) return Math.round(1100 + (125 - clamped) * 120);
  if (clamped >= 105) return Math.round(2300 + (115 - clamped) * 250);
  if (clamped >= 95) return Math.round(4800 + (105 - clamped) * 400);
  if (clamped >= 85) return Math.round(8800 + (95 - clamped) * 600);
  if (clamped >= 75) return Math.round(14800 + (85 - clamped) * 850);
  if (clamped >= 65) return Math.round(23300 + (75 - clamped) * 1200);
  if (clamped >= 55) return Math.round(35300 + (65 - clamped) * 1800);
  if (clamped >= 45) return Math.round(53300 + (55 - clamped) * 2800);
  return Math.round(81300 + (45 - clamped) * 3500);
}

/**
 * Calculates weighted Merit Score out of 100:
 * - 25% IPE Group Marks: (ipeMarks / maxIpeMarks) * 25
 * - 75% EAMCET Marks: (eamcetMarks / 160) * 75
 */
export function calculateWeightedMeritScore(
  ipeMarks: number,
  maxIpeMarks: number,
  eamcetMarks: number
): {
  ipeWeightedScore: number;
  eamcetWeightedScore: number;
  totalMeritScore: number;
  ipePercentage: number;
  eamcetPercentage: number;
} {
  const safeIpeMax = maxIpeMarks > 0 ? maxIpeMarks : 600;
  const clampedIpe = Math.min(safeIpeMax, Math.max(0, ipeMarks));
  const clampedEamcet = Math.min(160, Math.max(0, eamcetMarks));

  const ipePercentage = (clampedIpe / safeIpeMax) * 100;
  const eamcetPercentage = (clampedEamcet / 160) * 100;

  const ipeWeightedScore = Number(((clampedIpe / safeIpeMax) * 25).toFixed(2));
  const eamcetWeightedScore = Number(((clampedEamcet / 160) * 75).toFixed(2));
  const totalMeritScore = Number((ipeWeightedScore + eamcetWeightedScore).toFixed(2));

  return {
    ipeWeightedScore,
    eamcetWeightedScore,
    totalMeritScore,
    ipePercentage: Number(ipePercentage.toFixed(1)),
    eamcetPercentage: Number(eamcetPercentage.toFixed(1)),
  };
}

/**
 * Get statewide percentile bracket from total merit score.
 */
export function getPercentileFromMeritScore(score: number): {
  percentile: number;
  standingText: string;
  badgeColor: string;
} {
  if (score >= 92) return { percentile: 99.8, standingText: 'Top 0.2% Elite Tier (Premier Gov & Top 3 Colleges)', badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 86) return { percentile: 98.5, standingText: 'Top 1.5% State Tier (Top Autonomous CSE/IT)', badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { percentile: 95.0, standingText: 'Top 5% Statewide (Tier 1 Premier Private & Gov)', badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  if (score >= 74) return { percentile: 90.0, standingText: 'Top 10% Statewide (Reputed Tier 2 Engineering)', badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  if (score >= 66) return { percentile: 80.0, standingText: 'Top 20% Competitive Bracket', badgeColor: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (score >= 58) return { percentile: 65.0, standingText: 'Mid-Tier Qualifying Range', badgeColor: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { percentile: 45.0, standingText: 'Developing Bracket (Affiliated Colleges)', badgeColor: 'text-slate-700 bg-slate-50 border-slate-200' };
}

/**
 * Curated historical admission trends dataset across 2024, 2023, and 2022
 * for premier colleges in Telangana and Andhra Pradesh.
 */
export const HISTORICAL_MERIT_TRENDS: CollegeMeritAdmissionTrend[] = [
  // --- TELANGANA COLLEGES ---
  {
    collegeId: 'ts_jntuh_ceh',
    collegeName: 'JNTUH University College of Engineering',
    collegeCode: 'JNTH',
    city: 'Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 35000,
    averageLPA: 11.2,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 485, closingMeritScore: 92.6 },
          { year: 2023, closingRank: 520, closingMeritScore: 92.1 },
          { year: 2022, closingRank: 560, closingMeritScore: 91.5 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 1650, closingMeritScore: 88.2 },
          { year: 2023, closingRank: 1720, closingMeritScore: 87.8 },
          { year: 2022, closingRank: 1800, closingMeritScore: 87.1 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 1120, closingMeritScore: 89.8 },
          { year: 2023, closingRank: 1190, closingMeritScore: 89.2 },
          { year: 2022, closingRank: 1250, closingMeritScore: 88.6 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 4800, closingMeritScore: 81.5 },
          { year: 2023, closingRank: 5100, closingMeritScore: 80.8 },
          { year: 2022, closingRank: 5400, closingMeritScore: 80.1 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 5900, closingMeritScore: 79.4 },
          { year: 2023, closingRank: 6200, closingMeritScore: 78.8 },
          { year: 2022, closingRank: 6500, closingMeritScore: 78.2 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 780, closingMeritScore: 91.2 },
          { year: 2023, closingRank: 830, closingMeritScore: 90.6 },
          { year: 2022, closingRank: 890, closingMeritScore: 90.0 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_ou_uce',
    collegeName: 'University College of Engineering, Osmania University',
    collegeCode: 'OUCE',
    city: 'Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 35000,
    averageLPA: 10.5,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 840, closingMeritScore: 90.8 },
          { year: 2023, closingRank: 890, closingMeritScore: 90.2 },
          { year: 2022, closingRank: 940, closingMeritScore: 89.7 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 2200, closingMeritScore: 86.4 },
          { year: 2023, closingRank: 2310, closingMeritScore: 85.9 },
          { year: 2022, closingRank: 2450, closingMeritScore: 85.3 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 1650, closingMeritScore: 88.0 },
          { year: 2023, closingRank: 1740, closingMeritScore: 87.4 },
          { year: 2022, closingRank: 1820, closingMeritScore: 86.8 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 6200, closingMeritScore: 78.8 },
          { year: 2023, closingRank: 6500, closingMeritScore: 78.1 },
          { year: 2022, closingRank: 6900, closingMeritScore: 77.4 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 7800, closingMeritScore: 76.2 },
          { year: 2023, closingRank: 8200, closingMeritScore: 75.5 },
          { year: 2022, closingRank: 8600, closingMeritScore: 74.8 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 1100, closingMeritScore: 89.8 },
          { year: 2023, closingRank: 1180, closingMeritScore: 89.1 },
          { year: 2022, closingRank: 1250, closingMeritScore: 88.5 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_cbit',
    collegeName: 'Chaitanya Bharathi Institute of Technology',
    collegeCode: 'CBIT',
    city: 'Gandipet, Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 140000,
    averageLPA: 9.8,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 1420, closingMeritScore: 88.9 },
          { year: 2023, closingRank: 1540, closingMeritScore: 88.3 },
          { year: 2022, closingRank: 1680, closingMeritScore: 87.6 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 3800, closingMeritScore: 83.2 },
          { year: 2023, closingRank: 4050, closingMeritScore: 82.6 },
          { year: 2022, closingRank: 4300, closingMeritScore: 81.9 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 2750, closingMeritScore: 85.5 },
          { year: 2023, closingRank: 2900, closingMeritScore: 84.9 },
          { year: 2022, closingRank: 3100, closingMeritScore: 84.2 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 9800, closingMeritScore: 74.2 },
          { year: 2023, closingRank: 10400, closingMeritScore: 73.5 },
          { year: 2022, closingRank: 11000, closingMeritScore: 72.8 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 12500, closingMeritScore: 71.5 },
          { year: 2023, closingRank: 13200, closingMeritScore: 70.8 },
          { year: 2022, closingRank: 14000, closingMeritScore: 70.0 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 1950, closingMeritScore: 87.2 },
          { year: 2023, closingRank: 2100, closingMeritScore: 86.5 },
          { year: 2022, closingRank: 2280, closingMeritScore: 85.8 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_vnr_vjiet',
    collegeName: 'VNR Vignana Jyothi Institute of Engineering and Technology',
    collegeCode: 'VNRV',
    city: 'Bachupally, Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 135000,
    averageLPA: 9.2,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 2350, closingMeritScore: 86.5 },
          { year: 2023, closingRank: 2480, closingMeritScore: 85.9 },
          { year: 2022, closingRank: 2650, closingMeritScore: 85.2 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 5200, closingMeritScore: 80.9 },
          { year: 2023, closingRank: 5500, closingMeritScore: 80.2 },
          { year: 2022, closingRank: 5850, closingMeritScore: 79.5 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 3900, closingMeritScore: 83.0 },
          { year: 2023, closingRank: 4120, closingMeritScore: 82.4 },
          { year: 2022, closingRank: 4350, closingMeritScore: 81.7 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 13500, closingMeritScore: 70.8 },
          { year: 2023, closingRank: 14200, closingMeritScore: 70.0 },
          { year: 2022, closingRank: 15100, closingMeritScore: 69.2 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 16800, closingMeritScore: 68.2 },
          { year: 2023, closingRank: 17600, closingMeritScore: 67.4 },
          { year: 2022, closingRank: 18500, closingMeritScore: 66.6 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 3100, closingMeritScore: 84.8 },
          { year: 2023, closingRank: 3300, closingMeritScore: 84.1 },
          { year: 2022, closingRank: 3550, closingMeritScore: 83.4 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_vasavi',
    collegeName: 'Vasavi College of Engineering',
    collegeCode: 'VASV',
    city: 'Ibrahimbagh, Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 140000,
    averageLPA: 8.9,
    trendStatus: 'stable',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 3100, closingMeritScore: 85.1 },
          { year: 2023, closingRank: 3220, closingMeritScore: 84.6 },
          { year: 2022, closingRank: 3380, closingMeritScore: 84.0 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 6400, closingMeritScore: 79.2 },
          { year: 2023, closingRank: 6700, closingMeritScore: 78.5 },
          { year: 2022, closingRank: 7100, closingMeritScore: 77.8 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 4900, closingMeritScore: 81.6 },
          { year: 2023, closingRank: 5150, closingMeritScore: 80.9 },
          { year: 2022, closingRank: 5450, closingMeritScore: 80.2 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 16200, closingMeritScore: 68.6 },
          { year: 2023, closingRank: 17000, closingMeritScore: 67.8 },
          { year: 2022, closingRank: 18100, closingMeritScore: 67.0 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 19800, closingMeritScore: 66.0 },
          { year: 2023, closingRank: 20800, closingMeritScore: 65.2 },
          { year: 2022, closingRank: 22000, closingMeritScore: 64.3 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 3950, closingMeritScore: 83.2 },
          { year: 2023, closingRank: 4200, closingMeritScore: 82.5 },
          { year: 2022, closingRank: 4500, closingMeritScore: 81.8 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_cvr',
    collegeName: 'CVR College of Engineering',
    collegeCode: 'CVRH',
    city: 'Ibrahimpatnam, Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 2',
    annualFee: 115000,
    averageLPA: 7.8,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 5100, closingMeritScore: 81.2 },
          { year: 2023, closingRank: 5350, closingMeritScore: 80.6 },
          { year: 2022, closingRank: 5700, closingMeritScore: 79.9 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 9500, closingMeritScore: 74.8 },
          { year: 2023, closingRank: 9900, closingMeritScore: 74.1 },
          { year: 2022, closingRank: 10400, closingMeritScore: 73.4 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 7800, closingMeritScore: 77.0 },
          { year: 2023, closingRank: 8150, closingMeritScore: 76.4 },
          { year: 2022, closingRank: 8600, closingMeritScore: 75.7 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 23500, closingMeritScore: 63.8 },
          { year: 2023, closingRank: 24800, closingMeritScore: 62.9 },
          { year: 2022, closingRank: 26200, closingMeritScore: 62.1 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 28500, closingMeritScore: 61.2 },
          { year: 2023, closingRank: 30000, closingMeritScore: 60.3 },
          { year: 2022, closingRank: 31800, closingMeritScore: 59.4 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 6400, closingMeritScore: 79.3 },
          { year: 2023, closingRank: 6750, closingMeritScore: 78.6 },
          { year: 2022, closingRank: 7200, closingMeritScore: 77.9 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_griet',
    collegeName: 'Gokaraju Rangaraju Institute of Engineering and Technology',
    collegeCode: 'GRRR',
    city: 'Bachupally, Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 2',
    annualFee: 122000,
    averageLPA: 7.5,
    trendStatus: 'stable',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 6400, closingMeritScore: 79.4 },
          { year: 2023, closingRank: 6700, closingMeritScore: 78.8 },
          { year: 2022, closingRank: 7100, closingMeritScore: 78.1 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 11200, closingMeritScore: 72.8 },
          { year: 2023, closingRank: 11800, closingMeritScore: 72.1 },
          { year: 2022, closingRank: 12500, closingMeritScore: 71.3 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 9200, closingMeritScore: 75.3 },
          { year: 2023, closingRank: 9700, closingMeritScore: 74.6 },
          { year: 2022, closingRank: 10300, closingMeritScore: 73.8 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 27500, closingMeritScore: 61.6 },
          { year: 2023, closingRank: 29000, closingMeritScore: 60.8 },
          { year: 2022, closingRank: 30800, closingMeritScore: 59.9 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 33000, closingMeritScore: 59.0 },
          { year: 2023, closingRank: 34800, closingMeritScore: 58.1 },
          { year: 2022, closingRank: 37000, closingMeritScore: 57.2 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 7900, closingMeritScore: 77.2 },
          { year: 2023, closingRank: 8350, closingMeritScore: 76.5 },
          { year: 2022, closingRank: 8900, closingMeritScore: 75.8 },
        ],
      },
    ],
  },
  {
    collegeId: 'ts_bvrit',
    collegeName: 'BVRIT Hyderabad College of Engineering for Women',
    collegeCode: 'BVRW',
    city: 'Bachupally, Hyderabad',
    state: 'TS',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 2',
    annualFee: 120000,
    averageLPA: 7.2,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 8200, closingMeritScore: 76.8 },
          { year: 2023, closingRank: 8650, closingMeritScore: 76.1 },
          { year: 2022, closingRank: 9200, closingMeritScore: 75.4 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 14500, closingMeritScore: 70.1 },
          { year: 2023, closingRank: 15300, closingMeritScore: 69.3 },
          { year: 2022, closingRank: 16200, closingMeritScore: 68.5 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 11800, closingMeritScore: 72.4 },
          { year: 2023, closingRank: 12500, closingMeritScore: 71.6 },
          { year: 2022, closingRank: 13300, closingMeritScore: 70.8 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 32000, closingMeritScore: 59.4 },
          { year: 2023, closingRank: 33900, closingMeritScore: 58.5 },
          { year: 2022, closingRank: 36000, closingMeritScore: 57.6 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 38500, closingMeritScore: 57.0 },
          { year: 2023, closingRank: 40800, closingMeritScore: 56.1 },
          { year: 2022, closingRank: 43200, closingMeritScore: 55.2 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 9900, closingMeritScore: 74.8 },
          { year: 2023, closingRank: 10500, closingMeritScore: 74.0 },
          { year: 2022, closingRank: 11200, closingMeritScore: 73.2 },
        ],
      },
    ],
  },

  // --- ANDHRA PRADESH COLLEGES ---
  {
    collegeId: 'ap_au_coe',
    collegeName: 'Andhra University College of Engineering',
    collegeCode: 'AUCE',
    city: 'Visakhapatnam',
    state: 'AP',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 30000,
    averageLPA: 10.1,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 1180, closingMeritScore: 89.6 },
          { year: 2023, closingRank: 1260, closingMeritScore: 89.0 },
          { year: 2022, closingRank: 1350, closingMeritScore: 88.4 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 3100, closingMeritScore: 84.8 },
          { year: 2023, closingRank: 3300, closingMeritScore: 84.1 },
          { year: 2022, closingRank: 3550, closingMeritScore: 83.4 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 2250, closingMeritScore: 86.8 },
          { year: 2023, closingRank: 2400, closingMeritScore: 86.1 },
          { year: 2022, closingRank: 2600, closingMeritScore: 85.4 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 7900, closingMeritScore: 77.1 },
          { year: 2023, closingRank: 8400, closingMeritScore: 76.3 },
          { year: 2022, closingRank: 9000, closingMeritScore: 75.5 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 10500, closingMeritScore: 73.8 },
          { year: 2023, closingRank: 11200, closingMeritScore: 73.0 },
          { year: 2022, closingRank: 12000, closingMeritScore: 72.1 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 1580, closingMeritScore: 88.3 },
          { year: 2023, closingRank: 1700, closingMeritScore: 87.6 },
          { year: 2022, closingRank: 1840, closingMeritScore: 86.9 },
        ],
      },
    ],
  },
  {
    collegeId: 'ap_jntuk_ucek',
    collegeName: 'JNTU College of Engineering, Kakinada',
    collegeCode: 'JNKK',
    city: 'Kakinada',
    state: 'AP',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 32000,
    averageLPA: 9.4,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 1980, closingMeritScore: 87.2 },
          { year: 2023, closingRank: 2120, closingMeritScore: 86.6 },
          { year: 2022, closingRank: 2300, closingMeritScore: 85.9 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 4800, closingMeritScore: 81.6 },
          { year: 2023, closingRank: 5100, closingMeritScore: 80.9 },
          { year: 2022, closingRank: 5450, closingMeritScore: 80.2 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 3600, closingMeritScore: 83.8 },
          { year: 2023, closingRank: 3850, closingMeritScore: 83.1 },
          { year: 2022, closingRank: 4150, closingMeritScore: 82.3 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 11800, closingMeritScore: 72.4 },
          { year: 2023, closingRank: 12500, closingMeritScore: 71.6 },
          { year: 2022, closingRank: 13300, closingMeritScore: 70.8 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 14500, closingMeritScore: 70.1 },
          { year: 2023, closingRank: 15400, closingMeritScore: 69.2 },
          { year: 2022, closingRank: 16400, closingMeritScore: 68.3 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 2550, closingMeritScore: 85.8 },
          { year: 2023, closingRank: 2750, closingMeritScore: 85.1 },
          { year: 2022, closingRank: 2980, closingMeritScore: 84.4 },
        ],
      },
    ],
  },
  {
    collegeId: 'ap_gvpce',
    collegeName: 'Gayatri Vidya Parishad College of Engineering',
    collegeCode: 'GVPE',
    city: 'Madhurawada, Visakhapatnam',
    state: 'AP',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 73000,
    averageLPA: 8.5,
    trendStatus: 'stable',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 4400, closingMeritScore: 82.5 },
          { year: 2023, closingRank: 4650, closingMeritScore: 81.9 },
          { year: 2022, closingRank: 4950, closingMeritScore: 81.2 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 8900, closingMeritScore: 75.8 },
          { year: 2023, closingRank: 9400, closingMeritScore: 75.1 },
          { year: 2022, closingRank: 9950, closingMeritScore: 74.3 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 7100, closingMeritScore: 78.1 },
          { year: 2023, closingRank: 7500, closingMeritScore: 77.4 },
          { year: 2022, closingRank: 7950, closingMeritScore: 76.7 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 21500, closingMeritScore: 65.0 },
          { year: 2023, closingRank: 22800, closingMeritScore: 64.1 },
          { year: 2022, closingRank: 24200, closingMeritScore: 63.2 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 26500, closingMeritScore: 62.4 },
          { year: 2023, closingRank: 28000, closingMeritScore: 61.5 },
          { year: 2022, closingRank: 29700, closingMeritScore: 60.6 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 5500, closingMeritScore: 80.8 },
          { year: 2023, closingRank: 5850, closingMeritScore: 80.1 },
          { year: 2022, closingRank: 6250, closingMeritScore: 79.4 },
        ],
      },
    ],
  },
  {
    collegeId: 'ap_vrsec',
    collegeName: 'Velagapudi Ramakrishna Siddhartha Engineering College',
    collegeCode: 'VRSE',
    city: 'Kanuru, Vijayawada',
    state: 'AP',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 73000,
    averageLPA: 8.2,
    trendStatus: 'rising',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 5600, closingMeritScore: 80.6 },
          { year: 2023, closingRank: 5920, closingMeritScore: 80.0 },
          { year: 2022, closingRank: 6300, closingMeritScore: 79.3 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 10400, closingMeritScore: 74.0 },
          { year: 2023, closingRank: 10950, closingMeritScore: 73.2 },
          { year: 2022, closingRank: 11600, closingMeritScore: 72.4 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 8500, closingMeritScore: 76.4 },
          { year: 2023, closingRank: 8950, closingMeritScore: 75.7 },
          { year: 2022, closingRank: 9500, closingMeritScore: 74.9 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 24800, closingMeritScore: 63.2 },
          { year: 2023, closingRank: 26200, closingMeritScore: 62.3 },
          { year: 2022, closingRank: 27800, closingMeritScore: 61.4 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 29500, closingMeritScore: 60.8 },
          { year: 2023, closingRank: 31200, closingMeritScore: 59.9 },
          { year: 2022, closingRank: 33100, closingMeritScore: 58.9 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 6900, closingMeritScore: 78.8 },
          { year: 2023, closingRank: 7300, closingMeritScore: 78.1 },
          { year: 2022, closingRank: 7800, closingMeritScore: 77.3 },
        ],
      },
    ],
  },
  {
    collegeId: 'ap_svuce',
    collegeName: 'SVU College of Engineering, Sri Venkateswara University',
    collegeCode: 'SVUC',
    city: 'Tirupati',
    state: 'AP',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 1',
    annualFee: 31000,
    averageLPA: 8.8,
    trendStatus: 'stable',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 2600, closingMeritScore: 85.8 },
          { year: 2023, closingRank: 2750, closingMeritScore: 85.2 },
          { year: 2022, closingRank: 2950, closingMeritScore: 84.5 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 5900, closingMeritScore: 80.1 },
          { year: 2023, closingRank: 6250, closingMeritScore: 79.4 },
          { year: 2022, closingRank: 6650, closingMeritScore: 78.6 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 4400, closingMeritScore: 82.5 },
          { year: 2023, closingRank: 4680, closingMeritScore: 81.8 },
          { year: 2022, closingRank: 5000, closingMeritScore: 81.0 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 14200, closingMeritScore: 70.4 },
          { year: 2023, closingRank: 15000, closingMeritScore: 69.6 },
          { year: 2022, closingRank: 16000, closingMeritScore: 68.7 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 17500, closingMeritScore: 68.0 },
          { year: 2023, closingRank: 18500, closingMeritScore: 67.1 },
          { year: 2022, closingRank: 19700, closingMeritScore: 66.2 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 3350, closingMeritScore: 84.4 },
          { year: 2023, closingRank: 3580, closingMeritScore: 83.7 },
          { year: 2022, closingRank: 3850, closingMeritScore: 82.9 },
        ],
      },
    ],
  },
  {
    collegeId: 'ap_rvr_jc',
    collegeName: 'R.V.R. & J.C. College of Engineering',
    collegeCode: 'RVRJ',
    city: 'Chowdavaram, Guntur',
    state: 'AP',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    tier: 'Tier 2',
    annualFee: 70000,
    averageLPA: 7.4,
    trendStatus: 'stable',
    historicalCutoffs: [
      {
        category: 'OC',
        trends: [
          { year: 2024, closingRank: 7800, closingMeritScore: 77.2 },
          { year: 2023, closingRank: 8200, closingMeritScore: 76.6 },
          { year: 2022, closingRank: 8700, closingMeritScore: 75.9 },
        ],
      },
      {
        category: 'BC-A',
        trends: [
          { year: 2024, closingRank: 13800, closingMeritScore: 70.8 },
          { year: 2023, closingRank: 14500, closingMeritScore: 70.0 },
          { year: 2022, closingRank: 15300, closingMeritScore: 69.2 },
        ],
      },
      {
        category: 'BC-B',
        trends: [
          { year: 2024, closingRank: 11200, closingMeritScore: 73.0 },
          { year: 2023, closingRank: 11800, closingMeritScore: 72.2 },
          { year: 2022, closingRank: 12500, closingMeritScore: 71.4 },
        ],
      },
      {
        category: 'SC',
        trends: [
          { year: 2024, closingRank: 31500, closingMeritScore: 59.8 },
          { year: 2023, closingRank: 33200, closingMeritScore: 58.9 },
          { year: 2022, closingRank: 35100, closingMeritScore: 58.0 },
        ],
      },
      {
        category: 'ST',
        trends: [
          { year: 2024, closingRank: 37500, closingMeritScore: 57.5 },
          { year: 2023, closingRank: 39500, closingMeritScore: 56.6 },
          { year: 2022, closingRank: 41800, closingMeritScore: 55.6 },
        ],
      },
      {
        category: 'EWS',
        trends: [
          { year: 2024, closingRank: 9500, closingMeritScore: 75.2 },
          { year: 2023, closingRank: 10050, closingMeritScore: 74.4 },
          { year: 2022, closingRank: 10700, closingMeritScore: 73.6 },
        ],
      },
    ],
  },
];
