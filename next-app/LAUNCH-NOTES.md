# Launch notes

## Before going live
1. Fill every placeholder: `grep -rn "FILL IN" app lib` (main ones live in `lib/site.ts`).
2. Set env vars: `NEXT_PUBLIC_APP_URL` (real https domain), `NEXT_PUBLIC_GA_ID` (GA4 id).
   The cookie banner only appears when `NEXT_PUBLIC_GA_ID` is set (no optional cookies = nothing to consent to).
3. Have a Spanish lawyer review privacy, terms, cookies, legal notice, then set `LEGAL_REVIEWED = true` in `lib/site.ts`.
4. Stripe: set checkout `success_url` to `<domain>/thank-you`.
5. Merge `next.config.security-headers.ts` into your next.config.
6. Brand: "YourAI" is a placeholder. Rename in `lib/site.ts`, `app/opengraph-image.tsx`, the icons, and the landing metadata title.

## Legal items outside the code
- Data processing agreement (Art. 28 GDPR) for each clinic: patient chats can contain health data.
- Records of processing, and consider a DPIA (health data + AI).
- EU AI Act Art. 50: the chat widget must tell patients they're talking to an AI (applies since 2 Aug 2026). Check the widget does.
- Sub-processor contracts/transfer mechanisms (OpenAI, Supabase, Stripe, Google).

## DDoS / abuse (can't be solved in app code)
- Host behind Vercel or Cloudflare (DDoS mitigation + WAF); enable bot protection.
- Rate-limit /api/auth/login, /api/signup, /api/stripe/checkout and the chat endpoint (WAF rules, or Upstash Ratelimit). In-memory limits don't work on serverless.
- Cap AI usage per practice (you already have monthly_message_cap) and set spend limits at OpenAI.

## Not applicable / deferred
- Alt text, image compression: the app has no <img> yet. Use next/image + alt when you add images.
- Sticky mobile CTA only on / and /pricing; not on login, signup or dashboard.
- Per-field custom error messages need form logic changes; today: native validation + red field state + existing alert boxes.
