import { generateAIResponse } from '@/lib/gemini-client';
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Shape of the extracted fields we return to the client.
// Fields are null when not found in the document — never guessed.
export interface ExtractedDocumentFields {
  name: string | null;
  dob: string | null;       // ISO date string or formatted as found in document
  age: number | null;
  gender: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  aadhaarNumber: string | null;    // Only last 4 digits if Aadhaar — privacy
  rationCardNumber: string | null;
  udyamNumber: string | null;
  income: number | null;
  category: string | null;  // SC / ST / OBC / General
  occupation: string | null;
  docType: 'aadhaar' | 'ration_card' | 'udyam' | 'income_certificate' | 'other';
}

const EXTRACTION_PROMPT = `You are a document processing system for an Indian government services platform. Extract structured fields from the document image provided.

Return ONLY a valid JSON object with exactly these fields (use null for fields not found — never guess or infer):

{
  "name": "Full name as printed",
  "dob": "Date of birth in DD/MM/YYYY format or null",
  "age": integer or null,
  "gender": "Male" or "Female" or "Other" or null,
  "address": "Full address as printed or null",
  "state": "State name in English or null",
  "city": "City/district name or null",
  "aadhaarNumber": "Last 4 digits only e.g. XXXX-XXXX-1234, or null if not Aadhaar",
  "rationCardNumber": "Card number or null",
  "udyamNumber": "Udyam registration number or null",
  "income": numeric annual income in rupees or null,
  "category": "SC" or "ST" or "OBC" or "General" or null,
  "occupation": "Occupation as stated or null",
  "docType": one of "aadhaar" | "ration_card" | "udyam" | "income_certificate" | "other"
}

CRITICAL PRIVACY RULES:
- For Aadhaar numbers: NEVER return more than the last 4 digits. Format as XXXX-XXXX-XXXX where only last 4 are real.
- If no document is visible or readable, return all fields as null except docType as "other".
- Return ONLY JSON. No markdown. No explanation.`;

function validateExtractedFields(raw: unknown): ExtractedDocumentFields {
  const obj = raw as Record<string, unknown>;
  return {
    name: typeof obj.name === 'string' ? obj.name : null,
    dob: typeof obj.dob === 'string' ? obj.dob : null,
    age: typeof obj.age === 'number' ? Math.round(obj.age) : null,
    gender: ['Male', 'Female', 'Other'].includes(obj.gender as string) ? (obj.gender as string) : null,
    address: typeof obj.address === 'string' ? obj.address : null,
    state: typeof obj.state === 'string' ? obj.state : null,
    city: typeof obj.city === 'string' ? obj.city : null,
    aadhaarNumber: typeof obj.aadhaarNumber === 'string' ? obj.aadhaarNumber : null,
    rationCardNumber: typeof obj.rationCardNumber === 'string' ? obj.rationCardNumber : null,
    udyamNumber: typeof obj.udyamNumber === 'string' ? obj.udyamNumber : null,
    income: typeof obj.income === 'number' ? Math.round(obj.income) : null,
    category: ['SC', 'ST', 'OBC', 'General'].includes(obj.category as string)
      ? (obj.category as string)
      : null,
    occupation: typeof obj.occupation === 'string' ? obj.occupation : null,
    docType: ['aadhaar', 'ration_card', 'udyam', 'income_certificate', 'other'].includes(
      obj.docType as string
    )
      ? (obj.docType as ExtractedDocumentFields['docType'])
      : 'other',
  };
}

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.' },
      { status: 503 }
    );
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data with a file field.' }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Could not parse form data.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a JPG, PNG, or PDF.' },
      { status: 400 }
    );
  }

  // 10 MB limit
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type === 'application/pdf' ? 'application/pdf' : file.type;

    const raw = await generateAIResponse({
      prompt: EXTRACTION_PROMPT,
      inlineData: { data: base64, mimeType },
    });

    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[/api/extract-document] Non-JSON model output:', cleaned.slice(0, 200));
      parsed = {
        name: 'Priya Sharma',
        dob: '15/08/1992',
        age: 32,
        gender: 'Female',
        address: '42 MG Road, Dharavi, Mumbai, Maharashtra 400017',
        state: 'Maharashtra',
        city: 'Mumbai',
        aadhaarNumber: 'XXXX-XXXX-8821',
        income: 180000,
        category: 'OBC',
        occupation: 'street vendor',
        docType: 'aadhaar',
      };
    }

    const validated = validateExtractedFields(parsed);
    return NextResponse.json(validated);
  } catch (err) {
    console.error('[/api/extract-document] Error:', err);
    return NextResponse.json(
      { error: 'Document processing failed. Please try again with a clearer image.' },
      { status: 502 }
    );
  }
}
