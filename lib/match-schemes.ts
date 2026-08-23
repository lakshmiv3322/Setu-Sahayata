import type { Scheme } from './types';
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

/**
 * Computes how well a profile matches a scheme's eligibility rules.
 * Returns a percentage (0–100) based on the fraction of criteria met.
 * If no rules exist for the scheme, returns 50 (neutral/unknown).
 */
export function computeMatchPercent(scheme: Scheme, profile: StoredProfile | null): number {
  if (!profile) return 0;

  const rule = SCHEME_RULES.find((r) => r.schemeId === scheme.id);
  if (!rule || rule.criteria.length === 0) return 50;

  const passed = rule.criteria.filter((c) => evaluateCriterion(c, profile)).length;
  return Math.round((passed / rule.criteria.length) * 100);
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

  const rule = SCHEME_RULES.find((r) => r.schemeId === scheme.id);
  if (!rule) return { passed: [], failed: [], passedHindi: [], failedHindi: [] };

  const passed: string[] = [];
  const failed: string[] = [];
  const passedHindi: string[] = [];
  const failedHindi: string[] = [];

  for (const criterion of rule.criteria) {
    if (evaluateCriterion(criterion, profile)) {
      passed.push(criterion.label);
      passedHindi.push(criterion.labelHindi);
    } else {
      failed.push(criterion.label);
      failedHindi.push(criterion.labelHindi);
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
