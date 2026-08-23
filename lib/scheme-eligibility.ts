import type { StoredProfile } from './match-schemes';

/**
 * A single eligibility criterion for a scheme.
 * Evaluates `profile[field]` against `value` using `op`.
 *
 * op meanings:
 *   lte        — profile[field] <= value
 *   gte        — profile[field] >= value
 *   eq         — profile[field] === value (case-insensitive for strings)
 *   in         — value is string[], profile[field] is one of them
 *   contains   — profile[field] (string) includes value (string), case-insensitive
 *   is_true    — profile[field] === true
 */
export interface CriterionCheck {
  field: keyof StoredProfile;
  op: 'lte' | 'gte' | 'eq' | 'in' | 'contains' | 'is_true';
  value: number | string | string[] | boolean;
  /** Short English description shown to the user, e.g. "Annual income ≤ ₹2,00,000" */
  label: string;
  /** Short Hindi description */
  labelHindi: string;
}

export interface SchemeRule {
  schemeId: string;
  /** All criteria must apply for the scheme to be considered. Missing criteria = partial match. */
  criteria: CriterionCheck[];
}

/**
 * Data-driven eligibility rules for every scheme.
 * To add a new scheme, add one entry to this array — no code changes needed.
 */
export const SCHEME_RULES: SchemeRule[] = [
  {
    schemeId: 'pm-svanidhi',
    criteria: [
      {
        field: 'income',
        op: 'lte',
        value: 200000,
        label: 'Annual income ≤ ₹2,00,000',
        labelHindi: 'वार्षिक आय ≤ ₹2,00,000',
      },
      {
        field: 'has_aadhaar',
        op: 'is_true',
        value: true,
        label: 'Has Aadhaar card',
        labelHindi: 'आधार कार्ड है',
      },
      {
        field: 'occupation',
        op: 'contains',
        value: 'vendor',
        label: 'Occupation is street vendor / vendor',
        labelHindi: 'व्यवसाय: सड़क विक्रेता / विक्रेता',
      },
    ],
  },
  {
    schemeId: 'mudra-yojana',
    criteria: [
      {
        field: 'income',
        op: 'lte',
        value: 800000,
        label: 'Annual income ≤ ₹8,00,000',
        labelHindi: 'वार्षिक आय ≤ ₹8,00,000',
      },
      {
        field: 'has_aadhaar',
        op: 'is_true',
        value: true,
        label: 'Has Aadhaar card',
        labelHindi: 'आधार कार्ड है',
      },
      {
        field: 'occupation',
        op: 'contains',
        value: 'business',
        label: 'Occupation is business / self-employed',
        labelHindi: 'व्यवसाय: व्यापार / स्व-रोजगार',
      },
    ],
  },
  {
    schemeId: 'ayushman-bharat',
    criteria: [
      {
        field: 'income',
        op: 'lte',
        value: 500000,
        label: 'Annual income ≤ ₹5,00,000',
        labelHindi: 'वार्षिक आय ≤ ₹5,00,000',
      },
      {
        field: 'has_ration_card',
        op: 'is_true',
        value: true,
        label: 'Has ration card',
        labelHindi: 'राशन कार्ड है',
      },
    ],
  },
  {
    schemeId: 'pmay',
    criteria: [
      {
        field: 'income',
        op: 'lte',
        value: 600000,
        label: 'Annual income ≤ ₹6,00,000',
        labelHindi: 'वार्षिक आय ≤ ₹6,00,000',
      },
      {
        field: 'has_aadhaar',
        op: 'is_true',
        value: true,
        label: 'Has Aadhaar card',
        labelHindi: 'आधार कार्ड है',
      },
    ],
  },
  {
    schemeId: 'sukanya-samriddhi',
    criteria: [
      {
        field: 'gender',
        op: 'eq',
        value: 'Female',
        label: 'Applicant is female',
        labelHindi: 'आवेदक महिला है',
      },
      {
        field: 'has_aadhaar',
        op: 'is_true',
        value: true,
        label: 'Has Aadhaar card',
        labelHindi: 'आधार कार्ड है',
      },
    ],
  },
  {
    schemeId: 'anna-yojana',
    criteria: [
      {
        field: 'income',
        op: 'lte',
        value: 100000,
        label: 'Annual income ≤ ₹1,00,000',
        labelHindi: 'वार्षिक आय ≤ ₹1,00,000',
      },
      {
        field: 'has_ration_card',
        op: 'is_true',
        value: true,
        label: 'Has ration card',
        labelHindi: 'राशन कार्ड है',
      },
    ],
  },
];
