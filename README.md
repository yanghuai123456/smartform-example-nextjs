# SmartForm + Next.js (App Router)

Contact form using a Next.js Server Action that forwards to
[SmartForm AI](https://usesmartform.com).

## Setup

1. Get a form ID at https://usesmartform.com/dashboard.
2. Clone, install, configure, run:
   ```bash
   git clone https://github.com/yanghuai123456/smartform-example-nextjs.git
   cd smartform-example-nextjs
   npm install
   cp .env.local.example .env.local
   # edit .env.local → SMARTFORM_FORM_ID=f_your_real_id
   npm run dev
   ```
3. Open http://localhost:3000, submit, check the dashboard.

## How it works

- The form lives in `app/page.tsx` (client component, just for inline status).
- The submit goes through a **Server Action** in `app/actions.ts`, which POSTs the data to SmartForm.
- Why a server action and not a direct browser fetch? It keeps the form_id out of the public bundle
  and lets you add validation, captcha, or field mapping before forwarding.

## The server action

```ts
// app/actions.ts
'use server';
export async function submitContact(formData: FormData) {
  const r = await fetch(`${process.env.SMARTFORM_ENDPOINT}/api/v1/f/${process.env.SMARTFORM_FORM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`SmartForm ${r.status}`);
  return r.json();
}
```

The honeypot field `_gotcha` is included in the form data and SmartForm silently discards any
submission that has it filled.

## Config

`.env.local` (or Vercel project env vars):

```
SMARTFORM_ENDPOINT=https://api.usesmartform.com
SMARTFORM_FORM_ID=f_your_real_id
```

## Deploy

```bash
npx vercel --prod
# Set SMARTFORM_ENDPOINT and SMARTFORM_FORM_ID in the Vercel project settings.
```

## API contract

- `POST {endpoint}/api/v1/f/{form_id}` — JSON or form-data, no API key.
- 200 JSON response: `{ success, message, submission_id, is_spam, intent, next_url }`.
- See https://usesmartform.com/docs for the full reference.

## License

MIT.
