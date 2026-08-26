import { describe, it, expect } from 'vitest';
import { SCHEME_RULES } from '../lib/scheme-eligibility';

describe('SCHEME_RULES', () => {
  it('should define eligibility rules for all expected core schemes', () => {
    expect(SCHEME_RULES.length).toBeGreaterThan(0);
    const schemeIds = SCHEME_RULES.map((r) => r.schemeId);
    expect(schemeIds).toContain('pm-svanidhi');
    expect(schemeIds).toContain('mudra-yojana');
    expect(schemeIds).toContain('ayushman-bharat');
    expect(schemeIds).toContain('pmay');
    expect(schemeIds).toContain('sukanya-samriddhi');
  });

  it('every rule should have non-empty criteria with valid fields and ops', () => {
    const validOps = ['lte', 'gte', 'eq', 'in', 'contains', 'is_true'];
    for (const rule of SCHEME_RULES) {
      expect(rule.schemeId).toBeTruthy();
      expect(rule.criteria.length).toBeGreaterThan(0);
      for (const criterion of rule.criteria) {
        expect(criterion.field).toBeTruthy();
        expect(validOps).toContain(criterion.op);
        expect(criterion.label).toBeTruthy();
        expect(criterion.labelHindi).toBeTruthy();
      }
    }
  });

  it('PM SVANidhi should have income ≤ 200,000 and street vendor criteria', () => {
    const rule = SCHEME_RULES.find((r) => r.schemeId === 'pm-svanidhi');
    expect(rule).toBeDefined();
    const incomeCriterion = rule?.criteria.find((c) => c.field === 'income');
    expect(incomeCriterion?.op).toBe('lte');
    expect(incomeCriterion?.value).toBe(200000);
  });
});
