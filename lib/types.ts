export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'kn';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  bcp47: string; // BCP-47 language tag for Web Speech API
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', bcp47: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', bcp47: 'hi-IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', bcp47: 'mr-IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
];

export interface UserProfile {
  name: string;
  nameHindi?: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other' | string;
  city: string;
  state: string;
  income: number;
  category: string;
  occupation: string;
  hasAadhaar: boolean;
  hasRationCard: boolean;
  hasUdyam: boolean;
  familySize: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  relation: string;
  income: number;
  occupation: string;
  has_aadhaar: boolean;
  has_ration_card: boolean;
  has_udyam: boolean;
}

export interface MatchExplanation {
  passed: string[];
  failed: string[];
  passedHindi: string[];
  failedHindi: string[];
}

export interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  ministry: string;
  ministryHindi: string;
  benefit: string;
  benefitHindi: string;
  benefitAmount: string;
  matchPercent: number;
  timeToApply: string;
  timeToApplyHindi: string;
  description: string;
  descriptionHindi: string;
  category: 'Finance' | 'Health' | 'Housing' | 'Food' | 'Education' | 'Women';
  icon: string;
  eligibilityTags: string[];
  eligibilityRules?: any[];
  matchExplanation?: MatchExplanation;
  sourceUrl?: string;
  lastVerifiedAt?: string;
}

export interface AssistanceCenter {
  name: string;
  nameHindi: string;
  address: string;
  addressHindi: string;
  distance: string;
  hours: string;
  hoursHindi: string;
  phone: string;
}

export interface JargonDocument {
  id: string;
  title: string;
  titleHindi: string;
  source: string;
  sourceHindi: string;
  legalText: string[];
  legalTextHindi: string[];
  summary: string[];
  summaryHindi: string[];
  nextSteps: string[];
  nextStepsHindi: string[];
}

export interface ApplicationField {
  id: string;
  label: string;
  labelHindi: string;
  value: string;
  valueHindi: string;
  preFilled: boolean;
  type: 'text' | 'select' | 'date' | 'textarea';
  options?: string[];
}
