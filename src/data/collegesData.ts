import { College } from '../types';
import { IIT_COLLEGES } from './iitColleges';
import { IIIT_COLLEGES } from './iiitColleges';
import { NIT_COLLEGES } from './nitColleges';
import { TELANGANA_COLLEGES } from './telanganaColleges';
import { ANDHRA_COLLEGES } from './andhraColleges';

export { IIT_COLLEGES } from './iitColleges';
export { IIIT_COLLEGES } from './iiitColleges';
export { NIT_COLLEGES } from './nitColleges';
export { TELANGANA_COLLEGES } from './telanganaColleges';
export { ANDHRA_COLLEGES } from './andhraColleges';

// Combined authorative colleges list
const RAW_COLLEGES: College[] = [
  ...IIT_COLLEGES,
  ...NIT_COLLEGES,
  ...IIIT_COLLEGES,
  ...TELANGANA_COLLEGES,
  ...ANDHRA_COLLEGES,
];

// Deduplicate and enrich helper
export function enrichCollegeWithMapsUrl(college: College): College {
  const mapsUrl = college.googleMapsUrl || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${college.name}, ${college.city}, ${college.state}`)}`;
  return {
    ...college,
    googleMapsUrl: mapsUrl,
  };
}

export function deduplicateColleges(colleges: College[]): College[] {
  const seenIds = new Set<string>();
  const uniqueList: College[] = [];

  for (const rawCollege of colleges) {
    const college = enrichCollegeWithMapsUrl(rawCollege);
    const idKey = college.id.trim().toLowerCase();
    if (seenIds.has(idKey)) {
      continue;
    }
    seenIds.add(idKey);
    uniqueList.push(college);
  }

  return uniqueList;
}

// Authoritative full collection
export const ALL_COLLEGES: College[] = deduplicateColleges(RAW_COLLEGES);

// Streams
export const JEE_ADVANCED_COLLEGES: College[] = ALL_COLLEGES.filter(
  (c) => c.examStream === 'jee-advanced' || c.acceptedExams?.includes('JEE Advanced') || c.exam === 'JEE Advanced'
);

export const JEE_MAIN_COLLEGES: College[] = ALL_COLLEGES.filter(
  (c) => c.examStream === 'jee-main' || c.acceptedExams?.includes('JEE Main') || c.exam === 'JEE Main'
);

export const EAMCET_COLLEGES: College[] = ALL_COLLEGES.filter(
  (c) => c.examStream === 'eamcet' || (!c.examStream && (c.exam === 'TS EAMCET' || c.exam === 'AP EAMCET'))
);

// State-specific helper collections
export const TS_COLLEGES: College[] = ALL_COLLEGES.filter(
  (c) => c.state === 'TS' || c.state === 'Telangana'
);

export const AP_COLLEGES: College[] = ALL_COLLEGES.filter(
  (c) => c.state === 'AP' || c.state === 'Andhra Pradesh'
);

// Helper by stream
export function getCollegesByExamStream(stream: 'jee-main' | 'jee-advanced' | 'eamcet'): College[] {
  if (stream === 'jee-main') return JEE_MAIN_COLLEGES;
  if (stream === 'jee-advanced') return JEE_ADVANCED_COLLEGES;
  return EAMCET_COLLEGES;
}

// Find college by code or ID
export function getCollegeByIdOrCode(identifier: string): College | undefined {
  if (!identifier) return undefined;
  const query = identifier.trim().toLowerCase();
  return ALL_COLLEGES.find((c) => c.id.toLowerCase() === query || c.code.toLowerCase() === query);
}

// Available engineering & pharmacy branch filter options
export const AVAILABLE_BRANCHES = [
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
  { code: 'DS', name: 'Data Science' },
  { code: 'CSD', name: 'Computer Science & Data Science' },
  { code: 'CSM', name: 'CSE (AI & Machine Learning)' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' },
  { code: 'AERO', name: 'Aerospace / Aeronautical Engineering' },
  { code: 'CHEM', name: 'Chemical Engineering' },
  { code: 'BIOTECH', name: 'Biotechnology / Biomedical Engineering' },
  { code: 'METALLURGY', name: 'Metallurgical & Materials Engineering' },
  { code: 'MINING', name: 'Mining Engineering' },
  { code: 'PHM', name: 'B.Pharmacy (Bachelor of Pharmacy)' },
  { code: 'PHD', name: 'Doctor of Pharmacy (Pharm.D)' },
];

export const AVAILABLE_CITIES = {
  TS: [
    'Hyderabad',
    'Warangal',
    'Medchal-Malkajgiri',
    'Ranga Reddy',
    'Sangareddy',
    'Dundigal',
    'Ghatkesar',
    'Narsapur',
    'Ibrahimpatnam',
    'Sultanpur',
    'Manthani',
    'Karimnagar',
    'Sircilla',
    'Kodad',
  ],
  AP: [
    'Visakhapatnam',
    'Kakinada',
    'Vijayawada',
    'Guntur',
    'Tirupati',
    'Anantapur',
    'Bhimavaram',
    'Kurnool',
    'Vizianagaram',
    'Rajam',
    'Mylavaram',
    'Amaravati',
    'Bapatla',
    'Gudlavalleru',
    'Peddapuram',
    'Tadepalligudem',
    'Sri City',
    'Pulivendula',
    'Kalikiri',
    'Rajahmundry',
    'Machilipatnam',
    'Chittoor',
    'Kadapa',
    'Nellore',
    'Prakasam',
    'Narasaraopet',
    'Nandyal',
    'Srikakulam',
    'Surampalem',
    'Chirala',
    'Eluru',
    'Tenali',
    'Mangalagiri',
    'Puttur',
    'Proddatur',
    'Vadlamudi',
  ],
};
