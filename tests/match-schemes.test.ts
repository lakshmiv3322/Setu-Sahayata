import { describe, it, expect } from 'vitest';
import {
  computeMatchPercent,
  computeMatchExplanation,
  rankSchemes,
  type StoredProfile,
} from '../lib/match-schemes';
import type { Scheme } from '../lib/types';

const sampleScheme: Scheme = {
  id: 'pm-svanidhi',
  name: 'PM SVANidhi',
  nameHindi: 'पीएम स्वनिधि',
  ministry: 'Ministry of Housing and Urban Affairs',
  ministryHindi: 'आवासन और शहरी कार्य मंत्रालय',
  benefit: 'Collateral-free working capital loan up to ₹10,000',
  benefitHindi: '₹10,000 तक कार्यशील पूंजी ऋण',
  benefitAmount: '₹10,000',
  matchPercent: 0,
  timeToApply: '10 minutes',
  timeToApplyHindi: '10 मिनट',
  description: 'Special Micro-Credit Facility for Street Vendors',
  descriptionHindi: 'स्ट्रीट विक्रेताओं के लिए विशेष माइक्रो-क्रेडिट सुविधा',
  category: 'Finance',
  icon: 'Store',
  eligibilityTags: ['Street Vendor', 'Aadhaar Card'],
};

describe('computeMatchPercent', () => {
  it('returns 0 if profile is null', () => {
    expect(computeMatchPercent(sampleScheme, null)).toBe(0);
  });

  it('computes 100% when all criteria pass for PM SVANidhi', () => {
    const profile: StoredProfile = {
      income: 150000,
      has_aadhaar: true,
      occupation: 'street vendor',
    };
    expect(computeMatchPercent(sampleScheme, profile)).toBe(100);
  });

  it('computes partial match when some criteria fail', () => {
    const profile: StoredProfile = {
      income: 150000,
      has_aadhaar: false, // fails
      occupation: 'street vendor',
    };
    const score = computeMatchPercent(sampleScheme, profile);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('computes 0% match when all criteria fail', () => {
    const profile: StoredProfile = {
      income: 500000, // fails (>200000)
      has_aadhaar: false, // fails
      occupation: 'software engineer', // fails
    };
    expect(computeMatchPercent(sampleScheme, profile)).toBe(0);
  });
});

describe('computeMatchExplanation', () => {
  it('returns empty lists if profile is null', () => {
    const exp = computeMatchExplanation(sampleScheme, null);
    expect(exp.passed).toEqual([]);
    expect(exp.failed).toEqual([]);
  });

  it('correctly separates passed and failed criteria', () => {
    const profile: StoredProfile = {
      income: 150000,
      has_aadhaar: true,
      occupation: 'software engineer',
    };
    const exp = computeMatchExplanation(sampleScheme, profile);
    expect(exp.passed.length).toBe(2);
    expect(exp.failed.length).toBe(1);
    expect(exp.failed[0]).toContain('vendor');
  });
});

describe('rankSchemes', () => {
  it('sorts schemes by match percentage in descending order', () => {
    const schemeHigh: Scheme = { ...sampleScheme, id: 'pm-svanidhi' };
    const schemeLow: Scheme = { ...sampleScheme, id: 'anna-yojana' };
    const profile: StoredProfile = {
      income: 150000,
      has_aadhaar: true,
      occupation: 'street vendor',
      has_ration_card: false,
    };
    const ranked = rankSchemes([schemeLow, schemeHigh], profile);
    expect(ranked[0].matchPercent).toBeGreaterThanOrEqual(ranked[1].matchPercent);
    expect(ranked[0].matchExplanation).toBeDefined();
  });
});
