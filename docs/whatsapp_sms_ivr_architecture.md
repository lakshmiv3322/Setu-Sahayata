# Setu Sahayata — WhatsApp Business API & SMS/IVR Outreach Architecture

## Executive Summary

To achieve universal coverage for rural citizens and feature-phone users who do not have access to smartphones or high-speed internet, **Setu Sahayata** can extend its core intelligence services (scheme matching, de-jargonification, and application pre-filling) through a decoupled messaging and voice microservice.

This document outlines the system architecture, API boundaries, and deployment topology for integrating **WhatsApp Business API (Meta Graph API / Twilio)** and **SMS / Toll-Free IVR (Exotel / Kaleyra)**.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Citizens
        A[Smartphone User - WhatsApp]
        B[Feature-Phone User - SMS / Missed Call]
        C[Web/PWA Citizen]
    Next

    subgraph Channel Gateways
        D[Meta WhatsApp Business API]
        E[Exotel / Kaleyra Telecom Gateway]
    Next

    subgraph Messaging Microservice - Node/Express Serverless
        F[WhatsApp Flow Engine]
        G[IVR Voice Prompt Engine]
        H[SMS Parser & Sender]
    Next

    subgraph Core Setu Sahayata Backend
        I["/api/chat (Gemini LLM)"]
        J["/api/extract-document (Vision API)"]
        K["/api/dejargonify (Document Summarizer)"]
        L[Supabase DB - Profiles, Schemes, Applications]
    Next

    A --> D
    B --> E
    C --> K
    D --> F
    E --> G
    E --> H
    F --> I
    F --> L
    G --> I
    H --> L
```

---

## 2. Channel 1: WhatsApp Business API Integration

### User Experience Flow
1. **Interactive Flow (WhatsApp Flows)**:
   - Citizen sends `"Hi"` or a picture of their Aadhaar / Ration card to the Setu Sahayata WhatsApp Business number.
   - Setu Sahayata triggers an interactive **WhatsApp Flow** form:
     - Select Language (Hindi, Tamil, Telugu, Bengali, Marathi, English)
     - Select Occupation & State
     - State Annual Household Income
2. **Instant Match Report**:
   - The WhatsApp Bot responds with a rich WhatsApp Interactive List message showing top matched schemes and benefit amounts.
3. **Voice Note De-jargonifier**:
   - Citizen forwards an official government document circular photo or voice message.
   - Microservice invokes `/api/dejargonify` or `/api/chat` and responds with a 30-second **voice note** in the citizen's chosen regional language.

### Technical Implementation Details
- **Tech Stack**: Node.js microservice hosted on Vercel Serverless Functions / AWS Lambda.
- **Webhook Listener**: Handlers for Meta Webhook events (`messages`, `user_initiated`).
- **Media Ingestion**: Image/Audio uploads forwarded as base64 buffers to Setu Sahayata `/api/extract-document`.
- **Security**: Webhook signature verification (`X-Hub-Signature-256`) and bearer token authorization.

---

## 3. Channel 2: Toll-Free IVR & SMS Fallback

### User Experience Flow
1. **Missed Call Trigger**:
   - Citizen gives a missed call to Toll-Free number `1800-XXX-SETU`.
   - Telecom gateway (Exotel / Kaleyra) drops the call and triggers a callback webhook.
2. **Interactive Voice Response (IVR Call Back)**:
   - Automated system calls citizen back within 5 seconds.
   - Pre-recorded voice prompts play in regional language:
     - *"Press 1 for Hindi, Press 2 for Tamil..."*
     - *"Enter your annual family income in thousands using your phone keypad..."*
3. **SMS Confirmation**:
   - Following the IVR call, an SMS is automatically dispatched to the citizen with their top eligible scheme details and a tracking ID.

### Technical Implementation Details
- **DTMF Keypad Parsing**: Maps phone keypad numerical inputs directly to `StoredProfile` eligibility fields.
- **Pre-rendered Audio Cache**: Common scheme announcements pre-rendered using Google Cloud Text-to-Speech into `.wav` audio files cached on CDN for instant low-latency playback.

---

## 4. API Key & Security Scoping

- **Microservice Authentication**: All requests from the WhatsApp/IVR microservice to the main Next.js backend are authenticated using a dedicated server-to-server API Key passed in `X-Setu-Service-Key` headers.
- **Citizen Identification**: Citizens on messaging channels are identified by their verified phone number (`phone_number`), mapped to Supabase auth accounts via phone-based identity.
- **Data Privacy**: No biometric data or full Aadhaar numbers are transmitted over unencrypted SMS.

---

## 5. Cost Estimate & Infrastructure Recommendation

| Component | Provider Options | Estimated Unit Cost | Recommended Scale Strategy |
|---|---|---|---|
| **WhatsApp Business API** | Meta Direct / Twilio | ~₹0.15 per service conversation | First 1,000 conversations/mo free |
| **IVR Callback & Missed Call** | Exotel / Kaleyra | ~₹0.60 per min call | Toll-free callback on missed call |
| **Transactional SMS** | DLT-registered DLT SMS | ~₹0.12 per SMS | Concise 160-char SMS summaries |
| **Voice Synthesis (TTS)** | Google Cloud TTS / Sarvam AI | ~₹0.00001 per char | Pre-cache top 100 scheme voice bytes |
