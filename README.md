# Next.js contact form — Formspree alternative with AI spam filtering

Contact form using a Next.js Server Action that forwards to
[SmartForm AI](https://usesmartform.com).

## What you're POSTing

The endpoint accepts a standard HTML form POST or JSON via AJAX. Two
kinds of fields:

**Your form fields** — `name`, `email`, `message`, whatever you
want. Every non-reserved field lands in your dashboard as a column in
the submissions table.

**Reserved fields** — names starting with `_` are interpreted by
the API, not stored:

| Field | Purpose |
|---|---|
| ``_gotcha`` | **Honeypot.** Keep it empty. Hidden from humans via CSS; bots fill it automatically. Any non-empty value silently drops the submission. Add this to every form. |
| ``_hp_email`` / ``_website`` / ``_url`` / ``_phone`` | Honeypot aliases for `_gotcha` (WordPress / WPForms / Contact Form 7 migrations). Same drop semantics. |
| ``_next`` | Same-origin URL to redirect to after a successful submission. Browser POST results in a 302 here. AJAX calls (with `Accept: application/json`) get the same value back as `next_url` in the JSON response. Only http(s) and in-site paths allowed. |
| ``_subject`` | Override the AI-generated email subject line. Max 200 chars; control characters stripped. |
| `X-Gotcha` header | Same as `_gotcha` for JSON requests where you can't add a hidden form field. |

Field names are Formspree-compatible — migrating from
`formspree.io/f/{form_id}` requires no renaming.

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


## FAQ

### Is there a free tier?

Yes. AI spam filtering is enabled by default on every plan. AI intent
classification and high-value lead detection require a paid plan (Pro
or Business) — the dashboard enforces this and returns HTTP 402 if
you try to enable them on a free workspace.

### Do I need an API key?

No. The form posts directly to a public endpoint using only an 8-char
form ID, which is non-enumerable. The example also includes a hidden
`_gotcha` honeypot field so naive bots cannot submit.

### Does it work with the Next.js App Router?
Yes. The example uses a Next.js Server Action to forward the submission, so the form ID stays server-side and never ships in the client bundle.

## Related examples
[Nuxt contact form](https://github.com/yanghuai123456/smartform-example-nuxt) | [SvelteKit contact form](https://github.com/yanghuai123456/smartform-example-sveltekit) | [Gatsby contact form](https://github.com/yanghuai123456/smartform-example-gatsby)


## License

MIT.

