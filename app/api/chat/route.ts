import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { mockSchemes } from '@/lib/mock-data';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Build a compact scheme reference for grounding the model.
// Injected once per request — keeps the system prompt small.
function buildSchemeReference(): string {
  return mockSchemes
    .map(
      (s) =>
        `• ${s.name} (${s.nameHindi}): ${s.benefit}. Eligibility: ${s.eligibilityTags.join(', ')}. ` +
        `Benefit amount: ${s.benefitAmount}. Ministry: ${s.ministry}.`
    )
    .join('\n');
}

const SYSTEM_PROMPT = `You are Setu AI, a friendly and knowledgeable assistant that helps Indian citizens understand government welfare schemes and their eligibility. You work within the Setu Sahayata platform.

IMPORTANT RULES:
1. Only cite benefit amounts, eligibility criteria, and scheme details from the SCHEME REFERENCE below. Do not invent or guess numbers.
2. If you don't know something, say so and suggest the user visit a nearby Jan Seva Kendra.
3. Keep answers concise (3–5 sentences max), plain, and free of legal jargon.
4. If asked in Hindi, respond fully in Hindi. If asked in English, respond in English.
5. For eligibility questions, always remind the user to use the Discover page (upload their Aadhaar or answer 3 questions) for a personalised match.
6. Be warm and respectful. Many users are first-time digital users from rural backgrounds.
7. Never make promises about approvals or timelines — say "typically" or "generally".

SCHEME REFERENCE (authoritative — use only these details):
${buildSchemeReference()}

The platform has these features: Discover (upload documents for eligibility matching), Dashboard (see matched schemes), Apply (auto-fill application), De-Jargonifier (plain-language document summaries).`;

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.' },
      { status: 503 }
    );
  }

  let body: { messages: { role: string; text: string }[]; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { messages = [], language = 'en' } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required.' }, { status: 400 });
  }

  // Last message must be from user
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user' || !lastMessage.text?.trim()) {
    return NextResponse.json({ error: 'Last message must be a non-empty user message.' }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction: SYSTEM_PROMPT + (language === 'hi' ? '\n\nThe user prefers Hindi. Respond in Hindi.' : ''),
    });

    // Convert message history to Gemini chat format
    // Gemini requires alternating user/model turns starting with user
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.text);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[/api/chat] Gemini error:', err);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again in a moment.' },
      { status: 502 }
    );
  }
}
