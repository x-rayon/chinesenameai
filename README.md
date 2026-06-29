# ChineseNameAI

ChineseNameAI is a deployable SaaS built with Next.js 15, TypeScript, Tailwind CSS, Supabase Auth/Database, OpenAI or Gemini, Stripe Checkout, and Vercel.

## Features

- Magic-link login with Supabase Auth
- Free generation: 3 Chinese names, maximum 3 free reports per user per day
- Paid one-time $4.99 unlock through Stripe Checkout
- Full paid report: top 10 carefully selected Chinese names, pinyin, English explanations, Chinese meanings, cultural notes, native-style evaluation, style picks, signature prompt, and seal prompt
- User dashboard and report history
- Mobile responsive App Router UI
- SEO metadata and Vercel-ready configuration

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

3. Create a Supabase project, open the SQL editor, and run:

```sql
-- See sql/schema.sql
```

4. Fill `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID=price_your_one-time-price
```

5. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Stripe setup

1. In Stripe, create a one-time product priced at `$4.99`.
2. Copy the Price ID into `STRIPE_PRICE_ID`.
3. For local webhook testing, install the Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

For production, add a webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

Subscribe to `checkout.session.completed`.

## Test checklist

```bash
npm run typecheck
npm run build
```

Manual flow:

1. Sign in with an email magic link.
2. Generate a free report from `/generate`.
3. Confirm `/dashboard` shows the report.
4. Generate 3 free reports in one day, then confirm the fourth request is blocked.
5. Pay from `/pricing` with Stripe test card `4242 4242 4242 4242`.
6. After webhook completion, return to `/generate` and generate a paid full report.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Add every variable from `.env.local.example` in Vercel Project Settings.
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
5. In Supabase Auth settings, add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

6. In Stripe, configure the production webhook endpoint and production Price ID.
7. Deploy.
