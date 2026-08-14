import type { Scheme } from './types';

export interface StoredProfile {
  income?: number | null;
  category?: string | null;
  occupation?: string | null;
  state?: string | null;
  has_aadhaar?: boolean | null;
  has_ration_card?: boolean | null;
  has_udyam?: boolean | null;
  family_size?: number | null;
  gender?: string | null;
}

interface EligibilityCriteria {
  maxIncome?: number;
  categories?: string[];
  occupations?: string[];
  states?: string[];
  requiresAadhaar?: boolean;
  requiresRationCard?: boolean;
  requiresUdyam?: boolean;
  gender?: string;
  maxFamilySize?: number;
}

const schemeCriteria: Record<string, EligibilityCriteria> = {
  'pm-svanidhi': {
    maxIncome: 200000,
    requiresAadhaar: true,
    occupations: ['street vendor', 'vendor', 'small business'],
  },
  'mudra-yojana': {
    maxIncome: 800000,
    requiresAadhaar: true,
    occupations: ['small business', 'business', 'entrepreneur', 'vendor', 'self-employed'],
  },
  'ayushman-bharat': {
    maxIncome: 500000,
    requiresRationCard: true,
  },
  'pmay': {
    maxIncome: 600000,
    requiresAadhaar: true,
  },
  'sukanya-samriddhi': {
    gender: 'Female',
    requiresAadhaar: true,
  },
  'anna-yojana': {
    maxIncome: 100000,
    requiresRationCard: true,
  },
};

export function computeMatchPercent(scheme: Scheme, profile: StoredProfile | null): number {
  if (!profile) return 0;

  const criteria = schemeCriteria[scheme.id];
  if (!criteria) return 50;

  const checks: boolean[] = [];
  const tags = (scheme.eligibilityTags || []).map((t) => t.toLowerCase());

  if (criteria.maxIncome !== undefined && profile.income !== null && profile.income !== undefined) {
    checks.push(profile.income <= criteria.maxIncome);
  }

  if (criteria.categories && profile.category) {
    checks.push(criteria.categories.some((c) => c.toLowerCase() === profile.category!.toLowerCase()));
  }

  if (criteria.occupations && profile.occupation) {
    const userOcc = profile.occupation.toLowerCase();
    checks.push(criteria.occupations.some((o) => userOcc.includes(o)));
  }

  if (criteria.states && profile.state) {
    checks.push(criteria.states.some((s) => s.toLowerCase() === profile.state!.toLowerCase()));
  }

  if (criteria.requiresAadhaar) {
    checks.push(profile.has_aadhaar === true);
  }

  if (criteria.requiresRationCard) {
    checks.push(profile.has_ration_card === true);
  }

  if (criteria.requiresUdyam) {
    checks.push(profile.has_udyam === true);
  }

  if (criteria.gender && profile.gender) {
    checks.push(profile.gender.toLowerCase() === criteria.gender.toLowerCase());
  }

  if (criteria.maxFamilySize !== undefined && profile.family_size) {
    checks.push(profile.family_size <= criteria.maxFamilySize);
  }

  if (checks.length === 0) return 50;

  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function rankSchemes(schemes: Scheme[], profile: StoredProfile | null): Scheme[] {
  return schemes
    .map((s) => ({ ...s, matchPercent: computeMatchPercent(s, profile) }))
    .sort((a, b) => b.matchPercent - a.matchPercent);
}
