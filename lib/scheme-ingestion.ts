import { supabase } from './supabase-client';
import { mockSchemes } from './mock-data';
import { SCHEME_RULES } from './scheme-eligibility';
import type { Scheme } from './types';

export interface IngestedGovSchemePayload {
  scheme_id: string;
  scheme_name: string;
  scheme_name_hindi?: string;
  ministry?: string;
  ministry_hindi?: string;
  benefit_summary?: string;
  benefit_summary_hindi?: string;
  benefit_amount?: string;
  category?: Scheme['category'];
  eligibility_tags?: string[];
  rules?: any[];
}

const VALID_CATEGORIES: Scheme['category'][] = ['Finance', 'Health', 'Housing', 'Food', 'Education', 'Women'];

/**
 * Ingests and normalizes scheme records from open government data payload
 * and upserts them into the Supabase `schemes` table.
 */
export async function syncGovernmentSchemesData(
  externalPayloads: IngestedGovSchemePayload[] = []
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const recordsToSync = mockSchemes.map((s) => {
      const matchedRule = SCHEME_RULES.find((r) => r.schemeId === s.id);
      return {
        id: s.id,
        name: s.name,
        name_hindi: s.nameHindi,
        ministry: s.ministry,
        ministry_hindi: s.ministryHindi,
        benefit: s.benefit,
        benefit_hindi: s.benefitHindi,
        benefit_amount: s.benefitAmount,
        time_to_apply: s.timeToApply,
        time_to_apply_hindi: s.timeToApplyHindi,
        description: s.description,
        description_hindi: s.descriptionHindi,
        category: s.category,
        icon: s.icon,
        eligibility_tags: s.eligibilityTags,
        eligibility_rules: matchedRule ? matchedRule.criteria : [],
        active: true,
        updated_at: new Date().toISOString(),
      };
    });

    for (const ext of externalPayloads) {
      if (ext.scheme_id && ext.scheme_name) {
        const cat: Scheme['category'] = VALID_CATEGORIES.includes(ext.category as Scheme['category'])
          ? (ext.category as Scheme['category'])
          : 'Finance';

        recordsToSync.push({
          id: ext.scheme_id,
          name: ext.scheme_name,
          name_hindi: ext.scheme_name_hindi || ext.scheme_name,
          ministry: ext.ministry || 'Government of India',
          ministry_hindi: ext.ministry_hindi || 'भारत सरकार',
          benefit: ext.benefit_summary || '',
          benefit_hindi: ext.benefit_summary_hindi || ext.benefit_summary || '',
          benefit_amount: ext.benefit_amount || 'Varies',
          time_to_apply: '10 minutes',
          time_to_apply_hindi: '10 मिनट',
          description: ext.benefit_summary || '',
          description_hindi: ext.benefit_summary_hindi || '',
          category: cat,
          icon: 'Landmark',
          eligibility_tags: ext.eligibility_tags || ['Government Scheme'],
          eligibility_rules: ext.rules || [],
          active: true,
          updated_at: new Date().toISOString(),
        });
      }
    }

    const { error } = await supabase.from('schemes').upsert(recordsToSync, { onConflict: 'id' });

    if (error) {
      console.error('[SchemeIngestion] Upsert error:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: recordsToSync.length };
  } catch (err: any) {
    console.error('[SchemeIngestion] Ingestion failed:', err);
    return { success: false, count: 0, error: err?.message || 'Unknown error' };
  }
}
