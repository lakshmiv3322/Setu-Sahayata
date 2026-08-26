import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini-client';
import { mockSchemes } from '@/lib/mock-data';

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
1. Only cite benefit amounts, eligibility criteria, and scheme details from the SCHEME REFERENCE below.
2. Keep answers concise (3–5 sentences max), plain, and free of legal jargon.
3. If asked in Hindi, respond fully in Hindi. If asked in English, respond in English.
4. Be warm and respectful.

SCHEME REFERENCE:
${buildSchemeReference()}`;

export async function POST(req: Request) {
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

  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage?.text || 'Tell me about government schemes';

  try {
    const reply = await generateAIResponse({
      prompt: userText,
      systemInstruction: SYSTEM_PROMPT + (language === 'hi' ? '\n\nThe user prefers Hindi. Respond in Hindi.' : ''),
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[/api/chat] Error:', err);
    return NextResponse.json({
      reply: 'Namaste! 🙏 I am Setu AI. You can discover schemes for vendor credit, health cover, housing, and ration on the Setu Sahayata platform.',
    });
  }
}
