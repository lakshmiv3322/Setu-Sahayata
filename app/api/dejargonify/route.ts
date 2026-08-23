import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The JargonDocument shape we need to return — mirrors lib/types.ts exactly.
interface JargonDocumentResponse {
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

const DEJARGONIFY_PROMPT = `You are an expert at explaining complex Indian government documents in plain language to ordinary citizens who may have little education. Your job is to make government legalese understandable.

Given the document text below, return a JSON object with EXACTLY this structure (no markdown, no code fences, raw JSON only):

{
  "id": "doc-<timestamp>",
  "title": "Short descriptive title in English",
  "titleHindi": "Short descriptive title in Hindi",
  "source": "Issuing ministry or department in English (infer from document, or use 'Government of India')",
  "sourceHindi": "Issuing ministry in Hindi",
  "legalText": ["Original clause 1 verbatim (max 200 chars each)", "..."],
  "legalTextHindi": ["Hindi translation of clause 1", "..."],
  "summary": [
    "Plain English bullet 1 — what this actually means for an ordinary citizen",
    "Plain English bullet 2",
    "Plain English bullet 3"
  ],
  "summaryHindi": [
    "Simple Hindi bullet 1 — avoid legal terms",
    "Simple Hindi bullet 2",
    "Simple Hindi bullet 3"
  ],
  "nextSteps": [
    "Concrete action the citizen should take — step 1",
    "Step 2",
    "Step 3",
    "Step 4 (optional)"
  ],
  "nextStepsHindi": [
    "Hindi step 1",
    "Hindi step 2",
    "Hindi step 3",
    "Hindi step 4 (optional)"
  ]
}

Rules:
- summary[] must be in plain English, as if explaining to a 10-year-old. No legal terms.
- summaryHindi[] must be in simple Hindi (avoid Sanskrit-heavy or bureaucratic Hindi).
- nextSteps[] must be specific and actionable — what documents to gather, where to go, what to do.
- legalText[] should include 3-5 key clauses from the document (truncated if very long).
- If a section cannot be inferred, use an empty array [].
- Return ONLY valid JSON. No markdown. No explanation outside the JSON.`;

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please add GEMINI_API_KEY to your environment variables.' },
      { status: 503 }
    );
  }

  let text: string | null = null;
  let fileData: { base64: string; mimeType: string } | null = null;

  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    // File upload (PDF or image)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const pastedText = formData.get('text') as string | null;

    if (pastedText && pastedText.trim()) {
      text = pastedText.trim();
    } else if (file) {
      const mimeType = file.type || 'application/octet-stream';
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      fileData = { base64, mimeType };
    } else {
      return NextResponse.json({ error: 'Provide either a file or pasted text.' }, { status: 400 });
    }
  } else {
    // JSON body with text field
    try {
      const body = await req.json();
      text = body.text?.trim() ?? null;
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: 'text field is required.' }, { status: 400 });
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use vision-capable model if we have file data
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let result;
    if (fileData) {
      // Image/PDF — pass as inline base64 data
      result = await model.generateContent([
        DEJARGONIFY_PROMPT + '\n\nDocument:',
        {
          inlineData: {
            data: fileData.base64,
            mimeType: fileData.mimeType,
          },
        },
      ]);
    } else {
      result = await model.generateContent(
        DEJARGONIFY_PROMPT + '\n\nDocument:\n' + text
      );
    }

    const raw = result.response.text().trim();

    // Strip any accidental markdown code fences the model may have added
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let parsed: JargonDocumentResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[/api/dejargonify] Model returned non-JSON:', cleaned.slice(0, 300));
      return NextResponse.json(
        { error: 'Could not parse AI response. Try again or use shorter text.' },
        { status: 502 }
      );
    }

    // Attach a stable id if the model didn't
    parsed.id = parsed.id || `doc-${Date.now()}`;

    // Ensure required arrays are at least empty
    const safe: JargonDocumentResponse = {
      id: parsed.id,
      title: parsed.title || 'Government Document',
      titleHindi: parsed.titleHindi || 'सरकारी दस्तावेज़',
      source: parsed.source || 'Government of India',
      sourceHindi: parsed.sourceHindi || 'भारत सरकार',
      legalText: Array.isArray(parsed.legalText) ? parsed.legalText : [],
      legalTextHindi: Array.isArray(parsed.legalTextHindi) ? parsed.legalTextHindi : [],
      summary: Array.isArray(parsed.summary) ? parsed.summary : [],
      summaryHindi: Array.isArray(parsed.summaryHindi) ? parsed.summaryHindi : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      nextStepsHindi: Array.isArray(parsed.nextStepsHindi) ? parsed.nextStepsHindi : [],
    };

    return NextResponse.json(safe);
  } catch (err) {
    console.error('[/api/dejargonify] Error:', err);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 502 }
    );
  }
}
