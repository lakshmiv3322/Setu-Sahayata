'use client';

import type { ApplicationField } from '@/lib/types';

interface PrintableApplicationKitProps {
  trackingId: string;
  schemeName: string;
  schemeNameHindi: string;
  fields: ApplicationField[];
  isHindi: boolean;
  generatedAt: string;
}

const REQUIRED_DOCUMENTS_EN = [
  'Original Aadhaar Card (+ 1 photocopy)',
  'Ration Card or BPL Certificate (+ 1 photocopy)',
  'Vendor Certificate / Urban Local Body recommendation letter',
  'Udyam Registration Certificate (if applicable)',
  '2 passport-size photographs',
  'Bank passbook (showing IFSC code and account number)',
];

const REQUIRED_DOCUMENTS_HI = [
  'असली आधार कार्ड (+ 1 फोटोकॉपी)',
  'राशन कार्ड या BPL प्रमाण पत्र (+ 1 फोटोकॉपी)',
  'वेंडर प्रमाण पत्र / नगर पालिका सिफारिश पत्र',
  'उद्यम पंजीकरण प्रमाण पत्र (यदि लागू हो)',
  '2 पासपोर्ट साइज़ फोटोग्राफ',
  'बैंक पासबुक (IFSC कोड और खाता नंबर)',
];

export function PrintableApplicationKit({
  trackingId,
  schemeName,
  schemeNameHindi,
  fields,
  isHindi,
  generatedAt,
}: PrintableApplicationKitProps) {
  const docs = isHindi ? REQUIRED_DOCUMENTS_HI : REQUIRED_DOCUMENTS_EN;

  return (
    <div
      id="printable-application-kit"
      style={{
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        padding: '24px',
        maxWidth: '700px',
        margin: '0 auto',
      }}
      className="hidden print:block"
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>
              {isHindi ? 'सेतु सहायता' : 'Setu Sahayata'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              {isHindi ? 'नागरिक सशक्तिकरण पोर्टल' : 'Unified Citizen Empowerment Portal'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {isHindi ? 'तैयारी आईडी:' : 'Preparation ID:'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', letterSpacing: '1px' }}>
              {trackingId}
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{generatedAt}</div>
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '15px', fontWeight: 'bold', color: '#1e3a5f' }}>
          {isHindi ? 'आवेदन किट:' : 'Application Kit:'} {isHindi ? schemeNameHindi : schemeName}
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#f97316', fontWeight: '600', background: '#fff7ed', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', border: '1px solid #fed7aa' }}>
          {isHindi
            ? '⚠️ यह आवेदन मसौदा है — आधिकारिक जमा के लिए CSC/आधिकारिक पोर्टल का उपयोग करें'
            : '⚠️ This is a preparation draft — submit officially via CSC or official portal'}
        </div>
      </div>

      {/* Application Fields Table */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isHindi ? 'आवेदन विवरण' : 'Application Details'}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <tbody>
            {fields.map((field, i) => (
              <tr key={field.id} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', width: '40%', color: '#374151', fontWeight: '600' }}>
                  {isHindi ? field.labelHindi : field.label}
                </td>
                <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', color: '#111827' }}>
                  {isHindi ? (field.valueHindi || '—') : (field.value || '—')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Documents Checklist */}
      <div style={{ marginBottom: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
          {isHindi ? 'आवश्यक दस्तावेज़ सूची (साथ ले जाएं)' : 'Required Documents Checklist (bring originals)'}
        </div>
        {docs.map((doc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '5px', fontSize: '12px' }}>
            <span style={{ marginTop: '1px', fontSize: '10px', border: '1px solid #9ca3af', width: '14px', height: '14px', display: 'inline-block', borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ color: '#1f2937' }}>{doc}</span>
          </div>
        ))}
      </div>

      {/* Declaration */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', fontSize: '11px', color: '#6b7280' }}>
        <p style={{ marginBottom: '4px' }}>
          {isHindi
            ? 'घोषणा: मैं घोषित करता/करती हूं कि उपरोक्त जानकारी मेरी जानकारी के अनुसार सत्य और सही है।'
            : 'Declaration: I declare that the information provided is true and correct to the best of my knowledge.'}
        </p>
        <div style={{ display: 'flex', gap: '40px', marginTop: '24px' }}>
          <div>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', minWidth: '160px', color: '#111827' }}>
              {isHindi ? 'हस्ताक्षर' : 'Signature'}
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', minWidth: '160px', color: '#111827' }}>
              {isHindi ? 'तारीख' : 'Date'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
