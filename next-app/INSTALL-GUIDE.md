# Installing Citanova on a customer's website

This is the whole install, in the order it happens. Written against the code as it
stands on 12/11/2026 — if something here disagrees with the app, the app is right.

**Two halves, and it matters which is which:**

| Half | Where it runs | What it does |
|---|---|---|
| **Console** (this repo, `next-app`) | `localhost:3010` now, Vercel in production | signup, billing, dashboard, settings, the snippet |
| **Backend** (the assistant) | `localhost:3000` now, a server in production | receives widget traffic, calls the model, books, reads calendars |

The console is the shop window. The backend is the receptionist. **A customer can sign
up while the backend is down, and the chat will not answer.** Always check both.

---

## 0. One-time setup, before any customer

### 0.1 The backend needs a database and keys

`AI assistant/backend/.env.example` → copy to `.env.local`, then fill:

```
NEXT_PUBLIC_SUPABASE_URL=        # same Supabase project as the console
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server only, never in the browser
DEEPSEEK_API_KEY=                # the model
PUBLIC_API_URL=                  # https://api.citanova.es — printed in customers' snippets
PUBLIC_WIDGET_URL=               # optional; defaults to PUBLIC_API_URL/api/widget/widget.js
```

`PUBLIC_API_URL` is **required in production**: `widgetTag()` throws without it, on
purpose, so a private internal address can never end up on a customer's page.

Then create the schema once:

```bash
cd "AI assistant/backend"
supabase db reset          # or run supabase/schema.sql in the SQL editor
npm run build && npm start # :3000
```

### 0.2 The console needs its own keys

```bash
cd SAAS/next-app
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=        # the same project
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_API_URL=                  # where the widget should talk, i.e. the backend
ASSISTANT_API_URL=               # optional: console → backend private route
STRIPE_SECRET_KEY=               # billing
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=            # two recurring prices in Stripe
STRIPE_PRICE_PRO=
RESEND_API_KEY=                  # confirmations from your address
NEXT_PUBLIC_APP_URL=             # https://citanova.es — used in links and the calendar feed
```

`npm run build` fails on page-data collection if the Supabase or Stripe values are
empty, because those clients are constructed at module scope. Placeholders are enough
to compile, real values are needed to work.

### 0.3 Deploy, or nothing else is real

Locally you are on `:3002` (dev), `:3010` (production build) and `:3000` (backend).
For a customer you need public addresses, because their browser will call them:

1. Console → Vercel, add every variable above, set `NEXT_PUBLIC_APP_URL`.
2. Backend → any always-on host (Vercel with a Node runtime, Fly, a small VPS). It is
   stateful only through Supabase, so it scales sideways.
3. Point the Stripe webhook at `https://<console>/api/stripe/webhook`
   (events: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`).
4. In Cloudflare, set the Vercel records to **DNS only**.

---

## 1. The customer creates their account

**`https://citanova.es/signup`**

They enter: business name, timezone, phone, address (optional), **their website**,
email, password.

That one submit creates, atomically, a `businesses` row with a generated
`site_key`, its services, its opening hours, and the membership that links it to
their Supabase user. If any part fails, the whole thing rolls back — a half-built
business can never exist.

**After this point the chat is not live.** Two things are still missing: an approved
website origin, and a paid subscription. That is deliberate.

---

## 2. They subscribe

**`https://citanova.es/pricing`** → Stripe Checkout → back to `/thank-you`.

`subscription_status` becomes `active` (or `trialing`). The dashboard shows a banner
when it is not.

---

## 3. Approve their website origin — this is the security boundary

**Dashboard → Ajustes → "Tu web"** (`/dashboard/settings`, the `WebsiteOrigin` block).

Add the exact origin, scheme included, no trailing slash:

```
https://lapizzeria.es        ✓
lapizzeria.es                ✗ (no scheme)
https://www.lapizzeria.es    ✗ if they browse the apex domain
```

`/api/chat` rejects any request whose `Origin` header is not on that list. This is
what stops someone copying your customer's widget onto their own site and getting
free receptionist work. Add both `www` and apex if both serve the site.

Locally, `http://localhost:*` is allowed for testing; in production it is not.

---

## 4. Put the snippet on their site

**Dashboard → "Pega esto en tu web"** — a copy button, already filled with their own
site key:

```html
<script src="https://api.citanova.es/api/widget/widget.js"
        data-site-key="bsd_local_4f9c2a7e1b6d8350"
        data-api-url="https://api.citanova.es"
        data-title="La Pizzería"></script>
```

Paste it **just before `</body>`**, on every page where a visitor might want to book.

Rules that matter:

- It must be a **plain script**, not `type="module"`. `widget.js` finds its own address
  through `document.currentScript`; as a module that is `undefined` and the chat
  never renders.
- The widget lives in a **shadow root**, so their CSS cannot break it and it cannot
  leak styles back into their site.
- `data-site-key` identifies the tenant; `data-api-url` is where it posts.

**They can also self-host it:** upload `widget.js` and `widget.css` to their site and
change the `src`. Same file, no build step.

### Where it goes, by platform

| Their site | What to do |
|---|---|
| WordPress | Theme → footer.php before `</body>`, or a "Insert Headers and Footers" plugin → Footer code |
| Shopify | Online Store → Themes → Edit code → `theme.liquid` before `</body>` |
| Squarespace | Settings → Advanced → Code Injection → Footer |
| Wix | Settings → Custom Code → Add code → Body, end → All pages |
| Plain HTML | The file, before `</body>` |

### Test it in thirty seconds

1. Open their site in a **normal window** (not the editor preview).
2. The bubble appears bottom-right.
3. Ask: "¿tenéis mesa para cuatro esta noche?" — it should answer and offer to book.
4. The booking appears in the dashboard within ten seconds.

If the bubble appears but the chat errors, the origin is wrong (step 3). If nothing
appears, the snippet is a module, or it is above `</body>` in a template that strips it.

---

## 5. Connect their calendar — two directions, and only one is two-way

This is the part people get wrong. There are **three** ways a calendar can be
involved, and they are not equivalent.

### 5.1 IN: so the assistant does not double-book (works today)

**Ajustes → Connections → "Tu calendario actual (enlace ICS)"**

The customer pastes the **private iCal address** of the calendar they actually use:

- Google Calendar → Settings → their calendar → *Secret address in iCal format*
- Outlook → Calendar settings → *Publish* → ICS link
- Apple Calendar → share → public calendar URL

This is a **credential**. It is encrypted at rest, never logged, never returned to the
browser and never put in a prompt. The assistant reads only *occupied time* out of it —
never a patient's name — so the slots it offers are genuinely free.

If that feed cannot be read, availability **fails closed**: it will not offer a slot
rather than guess. That is correct, and it looks like "no availability", not a crash.

### 5.2 OUT: so the customer sees bookings in their calendar (works today)

**Dashboard → "Tu calendario"** gives a read-only feed URL:

```
https://citanova.es/api/calendar/<token>.ics
```

They subscribe to it in Google Calendar: *Other calendars* → **+** → *From URL* → paste.
Same for Apple Calendar and Outlook. It refreshes itself.

The feed contains **reference + service name in Spanish**, no patient name, no phone,
no notes. That is a privacy decision, not an oversight — a calendar subscription can be
forwarded to anyone.

### 5.3 Two-way Google Calendar API — **not live yet**

Ajustes → Connections → *Google Calendar* (service account email, private key,
calendar ID) **saves** those credentials, but the provider that would use them does not
exist in `src/lib/calendar.ts` yet. The registry holds only `internal`, `ics` and
`combined`.

In plain terms: **do not promise a customer that the assistant writes into their Google
Calendar through the API.** What happens today is 5.1 + 5.2: it reads their busy times
and publishes a read-only feed of what it booked.

To finish 5.3 you need: a GCP project, the Calendar API enabled, a service account,
the calendar shared with that service account's email (`...iam.gserviceaccount.com`) with
*"Make changes to events"*, and a new provider implementing `CalendarProvider`.
That is a build task, not a settings task.

---

## 6. The assistant's own setup (backend)

Once the tenant exists, these three things make it sound like the business, not like a
bot:

| Where | What |
|---|---|
| `services` table / Studio | Their real services, prices, durations |
| `opening_hours` | Their real hours; the assistant will not offer a closed day |
| `businesses.ai_instructions` | Free text: tone, policies, how they say things |

Prices and hours live in the database, so onboarding a new customer never means editing
prompt text. The model may only repeat what the tools return.

**The two rules baked into every prompt** (`src/lib/prompt.ts`) and covered by tests:

1. **No medical advice, ever** — no diagnosis, no medicines, no opinion on symptoms. On
   a real emergency it stops, says it is an automated receptionist, and sends them to
   **112** (911 in the US).
2. **Spanish by default.** It only switches language when the customer clearly writes in
   one the business handles. Everything it records for the business is in Spanish.

For a pizza place the medical rule never triggers; for a dental practice it is essential.
That is why it is a global rule, not a per-tenant setting.

---

## 7. Diagnostics, in the order to check them

| Symptom | Cause | Fix |
|---|---|---|
| No bubble on the site | snippet is `type="module"`, or not before `</body>` | plain `<script>`, bottom of body |
| Bubble, but "could not reach" | wrong `data-api-url`, backend down | open that URL + `/api/health` |
| Bubble, chat refuses visitors | origin not approved | step 3, exact origin with scheme |
| Offers slots that are taken | ICS-in not connected | step 5.1 |
| Bookmarks but nothing in their Google Calendar | only the API path does that | use the feed in 5.2 |
| `/dashboard` 500 | Supabase keys missing in the console | step 0.2 |
| `npm run build` fails at "Collecting page data" | empty Stripe/Supabase values | placeholders, then real values |
| Chat answers in English | customer wrote clearly in English | expected; see rule 2 |

Logs: console → Vercel; backend → its host. Locally, `~/.fathom/services/*.log`.

---

## 8. What the customer never does

They never see a licence key, never touch a terminal, and never get a copy of the
backend. They sign up, pay, approve their domain, paste one line. Everything else is
yours.

*(There is an older on-premise path — operator console, `YAI-` licence keys, the
`YourAI Installer.app` — from before this became a hosted SaaS. Ignore it for hosted
customers; `INSTALL-RUNBOOK.md` in the backend describes it.)*
