# YourAI – setup (in order)
1. `npm install`, copy `.env.example` to `.env.local`, fill it in.
2. Supabase: run `supabase/schema.sql` in the SQL editor. Enable email auth.
3. Stripe: create 2 recurring Prices -> put IDs in env. Webhook: `https://yourai.com/api/stripe/webhook`
   (events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted).
4. Resend: verify your domain; add its DNS records in Cloudflare.
5. Vercel: import the repo, add env vars, add domains `yourai.com` and `app.yourai.com` to the same project.
   In Cloudflare set the Vercel records to "DNS only".
6. Put YOUR existing assistant logic (prompt + tools) into `lib/assistant.ts`. Each tool gets `tenantId`.
7. Test: sign up -> Subscribe (Stripe test mode) -> dashboard shows your widget snippet.

## Still to build
Login/signup pages, assistant settings form, document upload (Supabase Storage), conversations view,
Google Calendar OAuth, Stripe billing portal, usage charts, GDPR (privacy policy, DPA, export/delete, retention job, EU region).
