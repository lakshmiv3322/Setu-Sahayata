export type Language = 'en' | 'hi';

export interface UserProfile {
  name: string;
  nameHindi: string;
  age: number;
  gender: 'Female' | 'Male';
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
