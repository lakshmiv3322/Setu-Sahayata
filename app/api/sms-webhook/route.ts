import { NextResponse } from 'next/server';
import { mockSchemes } from '@/lib/mock-data';

/**
 * Next.js API route simulating inbound SMS/WhatsApp commands for non-smartphone / offline citizens.
 * Accepts POST JSON: { message: "SCHEME 400001" } or URL query param ?message=SCHEME+400001
 * Returns 160-character compliant SMS response + rich WhatsApp payload.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = (body.message || '').trim().toUpperCase();

    if (!message) {
      return NextResponse.json({ error: 'Message body is required. Example: "SCHEME 400001"' }, { status: 400 });
    }

    if (message.startsWith('SCHEME')) {
      const parts = message.split(' ');
      const pincode = parts[1] || '400001';

      // Pick top 2 top-tier central schemes suitable for low-income citizens
      const topSchemes = mockSchemes.slice(0, 2);
      const scheme1 = topSchemes[0];
      const scheme2 = topSchemes[1];

      // Format strictly ≤ 160 chars for SMS payload
      const smsText = `SETU SAHAYATA (${pincode}): 1.${scheme1.name}-Loans up to ${scheme1.benefitAmount}. 2.${scheme2.name}-${scheme2.benefit}. Visit CSC center to apply. Helpline: 1800-111-222`.slice(0, 160);

      const whatsappText = `🇮🇳 *Setu Sahayata Civic Assistance (Pincode: ${pincode})*\n\n` +
        `Here are top matched welfare schemes for your region:\n\n` +
        `1️⃣ *${scheme1.name}*\n• Ministry: ${scheme1.ministry}\n• Benefit: ${scheme1.benefit}\n• Time to apply: ${scheme1.timeToApply}\n\n` +
        `2️⃣ *${scheme2.name}*\n• Ministry: ${scheme2.ministry}\n• Benefit: ${scheme2.benefit}\n• Time to apply: ${scheme2.timeToApply}\n\n` +
        `📍 *Nearest CSC Assistance Center*: Municipal Office Building, Counter #4.\n` +
        `📄 Bring Aadhaar Card & Ration Card.`;

      return NextResponse.json({
        success: true,
        command: 'SCHEME',
        pincode,
        smsText,
        smsLength: smsText.length,
        whatsappText,
        matchedSchemesCount: topSchemes.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (message.startsWith('STATUS')) {
      const parts = message.split(' ');
      const appId = parts[1] || 'APP-2026-8891';

      const smsText = `SETU STATUS (${appId}): Application is UNDER OFFICIAL REVIEW at Nodal Officer desk. Expected disbursement: 5 business days. Helpline: 1800-111-222`.slice(0, 160);

      return NextResponse.json({
        success: true,
        command: 'STATUS',
        appId,
        smsText,
        smsLength: smsText.length,
      });
    }

    // Default help response
    const helpSms = `SETU SAHAYATA: Send 'SCHEME <pincode>' for local welfare schemes or 'STATUS <app_id>' for application tracking. Call toll-free 1800-111-222 for IVR.`.slice(0, 160);

    return NextResponse.json({
      success: true,
      command: 'HELP',
      smsText: helpSms,
      smsLength: helpSms.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process SMS command.' }, { status: 500 });
  }
}
