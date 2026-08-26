import { generateAIResponse } from '@/lib/gemini-client';
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

    const raw = await generateAIResponse({ prompt });
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        explanation: `Your application for ${schemeName} requires documentation update. Uploading a valid Udyam or Ration Card clears this requirement.`,
        explanationHindi: `${schemeName} के लिए आपके आवेदन में दस्तावेज़ अपडेट की आवश्यकता है। एक वैध उद्यम या राशन कार्ड अपलोड करने से यह आवश्यकता पूरी हो जाती है।`,
        appealLetter: `To,\nThe Public Grievance Officer,\nSubject: Appeal regarding ${schemeName} Application\n\nRespected Sir/Madam,\nI request a formal review of my application for ${schemeName}. My profile credentials meet the prescribed income and residency norms.\n\nSincerely,\n[Citizen Name]`,
        appealLetterHindi: `सेवा में,\nलोक शिकायत अधिकारी,\nविषय: ${schemeName} आवेदन के संबंध में अपील\n\nमहोदय,\nमैं ${schemeName} के लिए अपने आवेदन की समीक्षा का अनुरोध करता हूं।\n\nभवदीय,\n[नागरिक का नाम]`,
        cpgramsUrl: 'https://pgportal.gov.in',
      };
    }

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
    return NextResponse.json({
      explanation: `Your application for ${schemeName} requires documentation update.`,
      explanationHindi: `${schemeName} के लिए आपके आवेदन में दस्तावेज़ अपडेट की आवश्यकता है।`,
      appealLetter: `To,\nThe Public Grievance Officer,\nSubject: Appeal regarding ${schemeName} Application\n\nRespected Sir/Madam,\nI request a formal review of my application for ${schemeName}.\n\nSincerely,\n[Citizen Name]`,
      appealLetterHindi: `सेवा में,\nलोक शिकायत अधिकारी,\nविषय: ${schemeName} आवेदन के संबंध में अपील\n\nमहोदय,\nमैं ${schemeName} के लिए अपने आवेदन की समीक्षा का अनुरोध करता हूं।\n\nभवदीय,\n[नागरिक का नाम]`,
      cpgramsUrl: 'https://pgportal.gov.in',
    });
  }
}
