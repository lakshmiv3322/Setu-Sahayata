import type { Scheme, FamilyMember } from './types';
import { SCHEME_RULES } from './scheme-eligibility';
import type { CriterionCheck } from './scheme-eligibility';

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
  family_members?: FamilyMember[] | null;
}

export interface MatchExplanation {
  passed: string[];
  failed: string[];
  passedHindi: string[];
  failedHindi: string[];
}

/** Evaluate a single CriterionCheck against a profile value. */
function evaluateCriterion(criterion: CriterionCheck, profile: StoredProfile): boolean {
  const raw = profile[criterion.field];

  switch (criterion.op) {
    case 'lte':
      return typeof raw === 'number' && typeof criterion.value === 'number' && raw <= criterion.value;
    case 'gte':
      return typeof raw === 'number' && typeof criterion.value === 'number' && raw >= criterion.value;
    case 'eq':
      return (
        raw !== null &&
        raw !== undefined &&
        String(raw).toLowerCase() === String(criterion.value).toLowerCase()
      );
    case 'in':
      return (
        raw !== null &&
        raw !== undefined &&
        Array.isArray(criterion.value) &&
        criterion.value.some((v) => String(v).toLowerCase() === String(raw).toLowerCase())
      );
    case 'contains':
      return (
        typeof raw === 'string' &&
        typeof criterion.value === 'string' &&
        raw.toLowerCase().includes(criterion.value.toLowerCase())
      );
    case 'is_true':
      return raw === true;
    default:
      return false;
  }
}

function getSchemeCriteria(scheme: Scheme): CriterionCheck[] {
  if (Array.isArray(scheme.eligibilityRules) && scheme.eligibilityRules.length > 0) {
    return scheme.eligibilityRules as CriterionCheck[];
  }
  const rule = SCHEME_RULES.find((r) => r.schemeId === scheme.id);
  return rule ? rule.criteria : [];
}

/**
 * Computes how well a profile matches a scheme's eligibility rules.
 * Returns a percentage (0–100) based on the fraction of criteria met.
 * If no rules exist for the scheme, returns 50 (neutral/unknown).
 */
export function computeMatchPercent(scheme: Scheme, profile: StoredProfile | null): number {
  if (!profile) return 0;

  const criteria = getSchemeCriteria(scheme);
  if (criteria.length === 0) return 50;

  const passed = criteria.filter((c) => evaluateCriterion(c, profile)).length;
  return Math.round((passed / criteria.length) * 100);
}

/**
 * Returns a breakdown of which eligibility criteria passed and which failed.
 * Used to show the user *why* their match percentage is what it is.
 */
export function computeMatchExplanation(
  scheme: Scheme,
  profile: StoredProfile | null
): MatchExplanation {
  if (!profile) {
    return { passed: [], failed: [], passedHindi: [], failedHindi: [] };
  }

  const criteria = getSchemeCriteria(scheme);
  if (criteria.length === 0) return { passed: [], failed: [], passedHindi: [], failedHindi: [] };

  const passed: string[] = [];
  const failed: string[] = [];
  const passedHindi: string[] = [];
  const failedHindi: string[] = [];

  for (const criterion of criteria) {
    if (evaluateCriterion(criterion, profile)) {
      passed.push(criterion.label || String(criterion.field));
      passedHindi.push(criterion.labelHindi || criterion.label || String(criterion.field));
    } else {
      failed.push(criterion.label || String(criterion.field));
      failedHindi.push(criterion.labelHindi || criterion.label || String(criterion.field));
    }
  }

  return { passed, failed, passedHindi, failedHindi };
}

/**
 * Ranks schemes by match percentage (highest first).
 * Also attaches the explanation for each scheme.
 */
export function rankSchemes(schemes: Scheme[], profile: StoredProfile | null): Scheme[] {
  return schemes
    .map((s) => ({
      ...s,
      matchPercent: computeMatchPercent(s, profile),
      matchExplanation: computeMatchExplanation(s, profile),
    }))
    .sort((a, b) => b.matchPercent - a.matchPercent);
}
