/**
 * Verhoeff Algorithm for Aadhaar Checksum Validation
 * Official algorithm used by UIDAI for 12-digit Aadhaar validation.
 */

// Multiplication table d
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 1, 2, 3, 4],
  [6, 5, 9, 8, 7, 1, 2, 3, 4, 0],
  [7, 6, 5, 9, 8, 2, 3, 4, 0, 1],
  [8, 7, 6, 5, 9, 3, 4, 0, 1, 2],
  [9, 8, 7, 6, 5, 4, 0, 1, 2, 3],
];

// Permutation table p
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Validates a 12-digit numeric string using the Verhoeff checksum.
 */
export function validateVerhoeffAadhaar(aadhaarStr: string): boolean {
  // Strip spaces, dashes, or 'X' masking
  const digitsOnly = aadhaarStr.replace(/[\s-]/g, '');

  // If masked (e.g. XXXX-XXXX-1234), format is valid if 12 chars & ends in 4 digits
  if (/^X{4}-?X{4}-?\d{4}$/i.test(aadhaarStr) || /^X{8}\d{4}$/i.test(digitsOnly)) {
    return true;
  }

  // Must be exactly 12 numeric digits
  if (!/^\d{12}$/.test(digitsOnly)) return false;

  // Cannot start with 0 or 1
  if (digitsOnly.startsWith('0') || digitsOnly.startsWith('1')) return false;

  let c = 0;
  const invertedArray = digitsOnly.split('').reverse().map(Number);

  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }

  return c === 0;
}

export interface FieldValidationResult {
  field: string;
  fieldLabel: string;
  fieldLabelHindi: string;
  value: string;
  status: 'verified' | 'unverified' | 'invalid' | 'conflict';
  message?: string;
  messageHindi?: string;
}

export interface ValidationSummary {
  results: FieldValidationResult[];
  overallStatus: 'verified' | 'warnings' | 'conflicts';
  hasConflicts: boolean;
}

/**
 * Validates extracted document fields against format rules & stored user profile.
 */
export function validateExtractedDocument(
  extracted: {
    name?: string | null;
    aadhaarNumber?: string | null;
    rationCardNumber?: string | null;
    udyamNumber?: string | null;
    income?: number | null;
    age?: number | null;
    gender?: string | null;
  },
  storedProfile?: {
    name?: string | null;
    age?: number | null;
    income?: number | null;
  } | null
): ValidationSummary {
  const results: FieldValidationResult[] = [];

  // 1. Aadhaar Check
  if (extracted.aadhaarNumber) {
    const isValid = validateVerhoeffAadhaar(extracted.aadhaarNumber);
    results.push({
      field: 'aadhaarNumber',
      fieldLabel: 'Aadhaar Number',
      fieldLabelHindi: 'आधार नंबर',
      value: extracted.aadhaarNumber,
      status: isValid ? 'verified' : 'invalid',
      message: isValid ? 'Valid 12-digit Aadhaar format' : 'Invalid Aadhaar checksum format',
      messageHindi: isValid ? 'वैध 12-अंकीय आधार प्रारूप' : 'अमान्य आधार प्रारूप',
    });
  }

  // 2. Udyam Registration Check
  if (extracted.udyamNumber) {
    const isUdyamValid = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i.test(extracted.udyamNumber.trim());
    results.push({
      field: 'udyamNumber',
      fieldLabel: 'Udyam Registration',
      fieldLabelHindi: 'उद्यम पंजीकरण',
      value: extracted.udyamNumber,
      status: isUdyamValid ? 'verified' : 'unverified',
      message: isUdyamValid ? 'Valid Udyam Registration format' : 'Format does not match standard UDYAM pattern',
      messageHindi: isUdyamValid ? 'वैध उद्यम पंजीकरण प्रारूप' : 'मानक उद्यम प्रारूप से मेल नहीं खाता',
    });
  }

  // 3. Name Cross-Consistency Check
  if (extracted.name) {
    let status: 'verified' | 'conflict' | 'unverified' = 'verified';
    let msg = 'Extracted from official document';
    let msgHi = 'आधिकारिक दस्तावेज़ से निकाला गया';

    if (storedProfile?.name) {
      const pName = storedProfile.name.toLowerCase().trim();
      const eName = extracted.name.toLowerCase().trim();
      // Simple substring or equality match check
      const isMatch = pName.includes(eName) || eName.includes(pName);
      if (!isMatch) {
        status = 'conflict';
        msg = `Document name "${extracted.name}" differs from account name "${storedProfile.name}"`;
        msgHi = `दस्तावेज़ नाम "${extracted.name}" खाते के नाम "${storedProfile.name}" से भिन्न है`;
      }
    }

    results.push({
      field: 'name',
      fieldLabel: 'Name',
      fieldLabelHindi: 'नाम',
      value: extracted.name,
      status,
      message: msg,
      messageHindi: msgHi,
    });
  }

  // 4. Age / Income sanity check
  if (extracted.income !== undefined && extracted.income !== null) {
    const isValidIncome = extracted.income >= 0 && extracted.income <= 10000000;
    results.push({
      field: 'income',
      fieldLabel: 'Annual Income',
      fieldLabelHindi: 'वार्षिक आय',
      value: `₹${extracted.income.toLocaleString('en-IN')}`,
      status: isValidIncome ? 'verified' : 'invalid',
      message: isValidIncome ? 'Income verified within valid limits' : 'Unusual income value',
      messageHindi: isValidIncome ? 'वैध सीमाओं के भीतर आय सत्यापित' : 'असामान्य आय मान',
    });
  }

  const hasConflicts = results.some((r) => r.status === 'conflict' || r.status === 'invalid');
  const hasUnverified = results.some((r) => r.status === 'unverified');

  return {
    results,
    overallStatus: hasConflicts ? 'conflicts' : hasUnverified ? 'warnings' : 'verified',
    hasConflicts,
  };
}
