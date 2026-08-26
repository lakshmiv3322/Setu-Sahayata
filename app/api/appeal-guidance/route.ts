import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please add GEMINI_API_KEY.' },
      { status: 503 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  let body: { schemeName: string; schemeId: string; failedCriteria: string[]; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { schemeName, schemeId, failedCriteria = [] } = body;
  if (!schemeId || !schemeName) {
    return NextResponse.json({ error: 'schemeId and schemeName are required.' }, { status: 400 });
  }

  // 1. Persistent Rate Limiting Check via Supabase `appeal_rate_limits` table (Serverless & Edge safe)
  const oneDayAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  try {
    const { data: existingLimit } = await supabase
      .from('appeal_rate_limits')
      .select('requested_at')
      .eq('user_id', user.id)
      .eq('scheme_id', schemeId)
      .gte('requested_at', oneDayAgo)
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingLimit) {
      const lastCalled = new Date(existingLimit.requested_at).getTime();
      const hoursLeft = Math.ceil((RATE_LIMIT_WINDOW_MS - (Date.now() - lastCalled)) / (1000 * 60 * 60));
      return NextResponse.json(
        {
          error: `Rate limit reached. You can request guidance for ${schemeName} again in ${hoursLeft} hour(s).`,
          rateLimited: true,
        },
        { status: 429 }
      );
    }
  } catch (err) {
    console.warn('[/api/appeal-guidance] Rate limit check warning:', err);
    // Non-blocking fallback if table is not yet provisioned
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a legal aid assistant for Indian government welfare schemes (CPGRAMS Grievance Redress Portal).
Citizen applied for/matched scheme "${schemeName}" but failed these criteria:
${failedCriteria.map((c) => `- ${c}`).join('\n')}

Generate a JSON object with:
{
  "explanation": "Plain 2-sentence English explanation of why the criteria failed and what document/action fixes it.",
  "explanationHindi": "Simple 2-sentence Hindi explanation.",
  "appealLetter": "Formal Grievance letter to Public Grievance Officer / CPGRAMS requesting review, with placeholders like [Date], [Address].",
  "appealLetterHindi": "Hindi formal Grievance letter to CPGRAMS.",
  "cpgramsUrl": "https://pgportal.gov.in"
}
Return raw JSON only.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    const parsed = JSON.parse(cleaned);

    // 2. Record persistent timestamp for rate-limit enforcement across serverless instances
    try {
      await supabase.from('appeal_rate_limits').insert({
        user_id: user.id,
        scheme_id: schemeId,
        requested_at: new Date().toISOString(),
      });
    } catch (insertErr) {
      console.warn('[/api/appeal-guidance] Could not persist rate limit record:', insertErr);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/appeal-guidance] Error:', err);
    return NextResponse.json(
      { error: 'Could not generate appeal guidance. Please try again.' },
      { status: 502 }
    );
  }
}
