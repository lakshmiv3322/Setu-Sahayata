import type { StoredProfile } from './match-schemes';

export interface SchemeTriggerAlert {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeNameHindi: string;
  triggerReason: string;
  triggerReasonHindi: string;
  daysRemaining?: number;
  deadlineDate?: string;
  type: 'life_event' | 'deadline';
  badgeColor: 'emerald' | 'amber' | 'rose' | 'trust';
}

/**
 * Evaluates stored user profile against life event milestones & deadline schedules
 * to generate personalized proactive alerts.
 */
export function evaluateLifeEventTriggers(profile: StoredProfile | null): SchemeTriggerAlert[] {
  if (!profile) return [];

  const alerts: SchemeTriggerAlert[] = [];

  // 1. Girl Child / Sukanya Samriddhi Trigger
  if (profile.gender?.toLowerCase() === 'female' && profile.has_aadhaar) {
    alerts.push({
      id: 'alert-sukanya-girl-child',
      schemeId: 'sukanya-samriddhi',
      schemeName: 'Sukanya Samriddhi Yojana',
      schemeNameHindi: 'सुकन्या समृद्धि योजना',
      triggerReason: 'Girl child eligible for 8.2% high-yield tax-free savings',
      triggerReasonHindi: 'बालिका 8.2% उच्च ब्याज कर-मुक्त बचत के लिए पात्र है',
      type: 'life_event',
      badgeColor: 'emerald',
    });
  }

  // 2. Street Vendor Milestone Trigger
  if (profile.occupation?.toLowerCase().includes('vendor') || profile.has_udyam) {
    alerts.push({
      id: 'alert-svanidhi-vendor',
      schemeId: 'pm-svanidhi',
      schemeName: 'PM SVANidhi 2024 Tranche 2',
      schemeNameHindi: 'पीएम स्वनिधि 2024 दूसरी किस्त',
      triggerReason: 'Vendor status detected — unlock 0% interest ₹20,000 credit enhancement',
      triggerReasonHindi: 'विक्रेता स्थिति का पता चला — 0% ब्याज ₹20,000 क्रेडिट अनलॉक करें',
      daysRemaining: 18,
      deadlineDate: '2026-09-15',
      type: 'deadline',
      badgeColor: 'amber',
    });
  }

  // 3. Low Income / BPL Food Security Trigger
  if (profile.income !== null && profile.income !== undefined && profile.income <= 120000) {
    alerts.push({
      id: 'alert-anna-yojana-bpl',
      schemeId: 'anna-yojana',
      schemeName: 'Antyodaya Anna Yojana (AAY)',
      schemeNameHindi: 'अंत्योदय अन्न योजना (AAY)',
      triggerReason: 'Income qualified for monthly 35kg subsidized food grain quota',
      triggerReasonHindi: 'आय मासिक 35 किग्रा रियायती अनाज कोटा के लिए योग्य है',
      type: 'life_event',
      badgeColor: 'trust',
    });
  }

  // 4. Ayushman Bharat Healthcare Coverage Check
  if (profile.has_ration_card) {
    alerts.push({
      id: 'alert-ayushman-health',
      schemeId: 'ayushman-bharat',
      schemeName: 'Ayushman Bharat Card Renewal',
      schemeNameHindi: 'आयुष्मान भारत कार्ड नवीनीकरण',
      triggerReason: 'Annual family ₹5 Lakh health insurance e-card generated',
      triggerReasonHindi: 'वार्षिक पारिवारिक ₹5 लाख स्वास्थ्य बीमा ई-कार्ड जनरेट हुआ',
      daysRemaining: 7,
      deadlineDate: '2026-08-31',
      type: 'deadline',
      badgeColor: 'rose',
    });
  }

  return alerts;
}
