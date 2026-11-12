# Installing Citanova on a customer's website

You go there and install it yourself. That is the product: a person turns up, sets it up
in front of them, and checks it works before leaving. Nobody hands a business owner a
snippet and a documentation link.

Written against the code as it stands on 12/11/2026 — if something here disagrees with the
app, the app is right.

**Two halves, and it matters which is which:**

| Half | Where it runs | What it does |
|---|---|---|
| **Console** (this repo, `next-app`) | `localhost:3010` now, Vercel in production | signup, billing, dashboard, settings, the snippet |
| **Backend** (the assistant) | `localhost:3000` now, a server in production | receives widget traffic, calls the model, books, reads calendars |

The console is the shop window. The backend is the receptionist. **A customer can sign up
while the backend is down, and the chat will not answer.** Always check both.

---

## 0. Before the first visit — one-time setup

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

`PUBLIC_API_URL` is **required in production**: `widgetTag()` throws without it, on purpose,
so a private internal address can never end up on a customer's page.

Create the schema once:

```bash
cd "AI assistant/backend"
supabase db reset          # or run supabase/schema.sql in the SQL editor
npm run build && npm start # :3000
```

### 0.2 The console needs its own keys

```bash
cd SAAS/next-app && cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=        # the same project
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_API_URL=                  # where the widget should talk, i.e. the backend
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=             # https://citanova.es — links and the calendar feed
```

`npm run build` fails at page-data collection if the Supabase or Stripe values are empty,
because those clients are built at module scope. Placeholders compile; real values work.

### 0.3 Deploy, or nothing else is real

Locally you are on `:3002` (dev), `:3010` (production build) and `:3000` (backend). A
customer's browser must reach the widget, so production addresses are unavoidable:

1. Console → Vercel, every variable above, `NEXT_PUBLIC_APP_URL` set.
2. Backend → any always-on host. It is stateful only through Supabase.
3. Stripe webhook → `https://<console>/api/stripe/webhook`
   (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).
4. In Cloudflare, set the Vercel records to **DNS only**.

### 0.4 The night before a visit (15 minutes, per customer)

1. **Open their site.** Note the phone number in the header, the opening hours, and the
   price of their most common service. You will quote these live, and being wrong about
   any of them kills the pitch.
2. **Create their account already** — `/signup` with their name, website, email and a
   password you set. Do it before you go, so you are not typing passwords in front of them.
3. **Approve their origin already** — dashboard → Ajustes → *Tu web* → `https://their-site.es`.
4. **Fill their services and hours in with them**, not for them, on the day. It takes ten
   minutes and it is the difference between "a bot" and "our reception".
5. Print one page: what it does, what it costs, who sees the conversations. No deck.

---

## 1. On the day: the install itself

You need nothing on their machine. The whole installation is **one `<script>` tag on their
website** — the file is served from your domain.

**Dashboard → "Pega esto en tu web"** gives you their tag, already filled with their key:

```html
<script src="https://api.citanova.es/api/widget/widget.js"
        data-site-key="bsd_local_4f9c2a7e1b6d8350"
        data-api-url="https://api.citanova.es"
        data-title="La Pizzería"></script>
```

It goes **just before `</body>`**, on every page where someone might want to book.

### Who actually edits the file

| Their setup | What you do |
|---|---|
| They have a web person or agency | Ask for ten minutes on a screen share. Email them the tag. This is routine and they are used to it — **do not take responsibility for code you cannot see**. |
| WordPress | *Appearance → Theme File Editor → footer.php*, or an "Insert Headers and Footers" plugin → Footer code |
| Shopify | *Online Store → Themes → Edit code → `theme.liquid`*, before `</body>` |
| Squarespace | *Settings → Advanced → Code Injection → Footer* |
| Wix | *Settings → Custom Code → Add code → Body, end → All pages* |
| No idea who built it | Ask "who built your website?" and get a name. Do not hand-edit a site you cannot undo. |

### Rules that actually break things

- **Plain `<script>`, never `type="module"`.** `widget.js` finds its own address through
  `document.currentScript`; in a module that is `undefined` and the chat never renders.
- The widget runs in a **shadow root**, so their CSS cannot break it and it cannot leak
  styles into their site.
- `data-site-key` identifies them; `data-api-url` is where it posts.
- **Their origin must be approved first** (step 2) or the chat will refuse every visitor.

### The one thing you do before leaving

Open their site in an **incognito window**, not the CMS preview, and watch the bubble
appear. Ask it a real question out loud:

> "¿Tenéis mesa para cuatro esta noche?"

Book it, in front of them, and say the reference aloud. **If you leave without seeing the
bubble on their live domain, you have not installed anything** — and no amount of goodwill
will cover it.

If their site is a mess and editing it is risky, do this instead and it still lands: put
the assistant on a page of **their own domain** (`demo.sunegocio.es`), leave it a week, and
install it properly once they have said yes. A working demo beats a broken homepage.

---

## 2. Why their domain is approved before anything else

**Dashboard → Ajustes → "Tu web"** — exact origin, with scheme, no trailing slash:

```
https://lapizzeria.es        ✓
lapizzeria.es                ✗ (no scheme)
https://www.lapizzeria.es    ✗ if visitors arrive on the apex
```

`/api/chat` rejects any request whose `Origin` is not on that list. This is what stops
someone copying your customer's tag onto their own site and getting free reception work.
Add both apex and `www` if both serve the site. `http://localhost:*` works in development
only, never in production.

---

## 3. The calendar — three paths, only two work today

This is the part people get wrong, and the one you must be honest about on the visit.

### 3.1 IN: so it never double-books (works today)

**Ajustes → Connections → "Tu calendario actual (enlace ICS)"**

Ask for the **private iCal address** of the calendar they actually use:

- Google Calendar → Settings → their calendar → *Secret address in iCal format*
- Outlook → Calendar settings → *Publish* → ICS link
- Apple Calendar → share → public calendar URL

It is a **credential**: encrypted at rest, never logged, never returned to a browser, never
put in a prompt. Only *occupied time* is read out of it — never a customer's name — so the
slots offered are genuinely free.

If the feed cannot be read, availability **fails closed**: it offers nothing rather than
guessing. That is correct, and it looks like "no availability", not a crash.

### 3.2 OUT: so they see bookings in their own calendar (works today)

**Dashboard → "Tu calendario"** gives a read-only feed:

```
https://citanova.es/api/calendar/<token>.ics
```

Subscribe to it in Google Calendar: *Other calendars* → **+** → *From URL* → paste. Same for
Apple Calendar and Outlook. It refreshes itself. **Do this for them, on their laptop, before
you leave** — it is the moment the product becomes visible in the tool they already open
every morning.

The feed carries **reference + service name in Spanish**, no customer name, no phone, no
notes. That is a privacy decision: a calendar subscription can be forwarded to anyone.

### 3.3 Two-way Google Calendar API — **not live yet**

Ajustes → Connections → *Google Calendar* (service account email, private key, calendar ID)
**saves** the credentials, but the provider that would use them does not exist in
`src/lib/calendar.ts`. The registry holds only `internal`, `ics` and `combined`.

**So do not promise that the assistant writes into their Google Calendar through the API.**
Today it reads their busy times and publishes a read-only feed of what it booked. Say that
plainly on the visit; a manager who finds out later feels misled. Completing 3.3 needs a GCP
project, the Calendar API enabled, the calendar shared with the service account, and a new
`CalendarProvider` — a build task, not a settings task.

---

## 4. Make it sound like them

| Where | What |
|---|---|
| `services` table / Studio | Their real services, prices, durations |
| `opening_hours` | Their real hours — it will never offer a closed day |
| `businesses.ai_instructions` | Tone, policies, how they say things |

Prices and hours live in the database, so onboarding never means editing prompt text; the
model may only repeat what the tools return.

Two rules are baked into every prompt (`src/lib/prompt.ts`) and covered by tests:

1. **No medical advice, ever.** No diagnosis, no medicines, no opinion on symptoms. On a
   real emergency it stops, says it is an automated receptionist, and sends them to **112**
   (911 in the US).
2. **Spanish by default.** It switches only when the customer clearly writes in a language
   the business handles. Everything it records for the business is in Spanish.

For a pizza place rule 1 never triggers; for a dental practice it is essential. That is why
it is global, not per-tenant.

---

## 5. Diagnostics, in the order to check them

| Symptom | Cause | Fix |
|---|---|---|
| No bubble on the site | snippet is `type="module"`, or not before `</body>` | plain `<script>`, bottom of body |
| Bubble, but "could not reach" | wrong `data-api-url`, or backend down | open that URL + `/api/health` |
| Bubble, chat refuses visitors | origin not approved | step 2, exact origin with scheme |
| Offers slots that are taken | ICS-in not connected | 3.1 |
| Books, but nothing in their calendar | only the API path does that | use the feed, 3.2 |
| `/dashboard` 500 | Supabase keys missing in the console | 0.2 |
| Build fails at "Collecting page data" | empty Stripe/Supabase values | placeholders, then real values |
| Answers in English | customer clearly wrote in English | expected, rule 2 |

Logs: console → Vercel; backend → its host. Locally, `~/.fathom/services/*.log`.

---

## 6. After you leave

1. Check their dashboard that evening: one conversation, one booking means it worked on the
   real site.
2. Write down what it got wrong. That list is your roadmap and worth more than any plan.
3. The honest gap to close before you sell many: **two-way Google Calendar**. Until it
   ships, their bookings live in your diary plus a read-only feed, not inside their practice
   software. Say so at the visit.

---

## 7. The old on-premise path

`AI assistant/INSTALL-RUNBOOK.md` describes an earlier design: operator console, `YAI-` licence
keys, `YourAI Installer.app`, a per-machine install. It still exists in the repo. **Ignore it
for hosted customers** — the model now is: you install, they subscribe, nothing runs on their
machines.
